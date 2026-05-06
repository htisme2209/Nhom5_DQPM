package com.danang.railway.service;

import com.danang.railway.entity.*;
import com.danang.railway.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Worker Service quét SLA mỗi 1 phút.
 *
 * Cơ chế cảnh báo:
 *   - NORMAL        : hanChot còn > 15 phút
 *   - YELLOW_ALERT  : hanChot còn ≤ 15 phút (T−15)
 *   - RED_ALERT     : hanChot còn ≤ 5 phút  (T−5)
 *   - ESCALATED     : đã quá hanChot → chuyển quyền BQL
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SlaWorkerService {

    private final SuCoRepository suCoRepo;
    private final LichTrinhRepository lichTrinhRepo;
    private final NhatKyRepository nhatKyRepo;

    private static final String SYSTEM_ACCOUNT = "SYSTEM";
    private static final int YELLOW_THRESHOLD_MINUTES = 15;
    private static final int RED_THRESHOLD_MINUTES = 5;

    /**
     * Quét SLA mỗi 60 giây
     */
    @Scheduled(fixedRate = 60_000)
    @Transactional
    public void kiemTraSLA() {
        List<SuCo> suCoDangXuLy = suCoRepo.findDangXuLyCoHanChot();

        if (suCoDangXuLy.isEmpty()) return;

        LocalDateTime now = LocalDateTime.now();

        for (SuCo suCo : suCoDangXuLy) {
            if (suCo.getHanChotPhuongAn() == null) continue;

            // Đã escalated rồi thì không cần kiểm tra nữa
            if ("ESCALATED".equals(suCo.getTrangThaiSLA())) continue;

            long phutConLai = ChronoUnit.MINUTES.between(now, suCo.getHanChotPhuongAn());
            String trangThaiCu = suCo.getTrangThaiSLA() != null ? suCo.getTrangThaiSLA() : "NORMAL";
            String trangThaiMoi;

            // Xác định trạng thái SLA mới
            if (phutConLai <= 0) {
                // ═══ QUÁ HẠN → ESCALATED ═══
                trangThaiMoi = "ESCALATED";
            } else if (phutConLai <= RED_THRESHOLD_MINUTES) {
                trangThaiMoi = "RED_ALERT";
            } else if (phutConLai <= YELLOW_THRESHOLD_MINUTES) {
                trangThaiMoi = "YELLOW_ALERT";
            } else {
                trangThaiMoi = "NORMAL";
            }

            // Chỉ cập nhật khi trạng thái thay đổi (tránh ghi log liên tục)
            if (!trangThaiMoi.equals(trangThaiCu)) {
                suCo.setTrangThaiSLA(trangThaiMoi);
                suCoRepo.save(suCo);

                // Ghi nhật ký
                if ("ESCALATED".equals(trangThaiMoi)) {
                    xuLyEscalation(suCo);
                } else {
                    log.warn("SLA {} → {} cho sự cố {} (còn {}p)",
                            trangThaiCu, trangThaiMoi, suCo.getMaSuCo(), phutConLai);
                    ghiNhatKy(SYSTEM_ACCOUNT,
                            "SLA_" + trangThaiMoi,
                            "SU_CO",
                            suCo.getMaSuCo(),
                            "SLA: " + trangThaiCu,
                            "SLA: " + trangThaiMoi + " — còn " + phutConLai + " phút trước hạn chót",
                            "SYSTEM");
                }
            }
        }
    }

    /**
     * Xử lý leo thang khi sự cố quá hạn SLA
     */
    private void xuLyEscalation(SuCo suCo) {
        log.error("═══ SLA ESCALATION ═══ Sự cố {} đã quá hạn chót phương án! Chuyển quyền BQL.",
                suCo.getMaSuCo());

        // 1. Ghi nhật ký VI_PHAM_SLA (cho KPI)
        ghiNhatKy(SYSTEM_ACCOUNT,
                "VI_PHAM_SLA",
                "SU_CO",
                suCo.getMaSuCo(),
                "SLA: RED_ALERT",
                "SLA: ESCALATED — Quá hạn chót " + suCo.getHanChotPhuongAn()
                        + ". NVĐH phụ trách: " + suCo.getMaNguoiGhiNhan()
                        + ". Chuyển quyền xử lý cho Ban Quản lý.",
                "SYSTEM");

        // 2. Ghi nhật ký cảnh báo khẩn cho BQL
        ghiNhatKy(SYSTEM_ACCOUNT,
                "CANH_BAO_KHAN_BQL",
                "SU_CO",
                suCo.getMaSuCo(),
                null,
                "⚠️ KHẨN CẤP: Sự cố " + suCo.getMaSuCo() + " đã quá hạn SLA. "
                        + "Ban Quản lý cần can thiệp trực tiếp. "
                        + "Loại: " + suCo.getLoaiSuCo() + ", Mức độ: " + suCo.getMucDo()
                        + ", Ray: " + suCo.getMaRay(),
                "SYSTEM");
    }

    /**
     * Tính hạn chót phương án khi tiếp nhận sự cố.
     * Công thức: min(giờ đến của tàu liên quan) - 30 phút
     */
    public LocalDateTime tinhHanChotPhuongAn(SuCo suCo) {
        List<LichTrinh> lichTrinhAnhHuong = lichTrinhRepo.findByMaSuCoAnhHuong(suCo.getMaSuCo());

        if (lichTrinhAnhHuong.isEmpty()) {
            // Nếu chưa có LT bị ảnh hưởng, dùng mặc định: ngayXayRa + thoiGianUocTinh
            int phutUocTinh = suCo.getThoiGianXuLyUocTinh() != null ? suCo.getThoiGianXuLyUocTinh() : 60;
            return suCo.getNgayXayRa().plusMinutes(phutUocTinh);
        }

        // Tìm giờ đến sớm nhất trong các lịch trình bị ảnh hưởng
        LocalDateTime minGioDen = null;
        for (LichTrinh lt : lichTrinhAnhHuong) {
            LocalDateTime gioDen = lt.getGioDenDuKien();
            if (gioDen == null) gioDen = lt.getGioDiDuKien(); // fallback
            if (gioDen != null && (minGioDen == null || gioDen.isBefore(minGioDen))) {
                minGioDen = gioDen;
            }
        }

        if (minGioDen == null) {
            int phutUocTinh = suCo.getThoiGianXuLyUocTinh() != null ? suCo.getThoiGianXuLyUocTinh() : 60;
            return suCo.getNgayXayRa().plusMinutes(phutUocTinh);
        }

        // HanChot = min(GioDenCuaTauLienQuan) - 30 phút
        return minGioDen.minusMinutes(30);
    }

    /**
     * API: Lấy thông tin SLA của sự cố (cho frontend polling)
     */
    public SlaInfo getSlaInfo(String maSuCo) {
        SuCo suCo = suCoRepo.findById(maSuCo).orElse(null);
        if (suCo == null || suCo.getHanChotPhuongAn() == null) {
            return new SlaInfo("NORMAL", null, null);
        }

        LocalDateTime now = LocalDateTime.now();
        long phutConLai = ChronoUnit.MINUTES.between(now, suCo.getHanChotPhuongAn());
        long giayConLai = ChronoUnit.SECONDS.between(now, suCo.getHanChotPhuongAn());

        return new SlaInfo(
                suCo.getTrangThaiSLA() != null ? suCo.getTrangThaiSLA() : "NORMAL",
                suCo.getHanChotPhuongAn(),
                giayConLai
        );
    }

    public record SlaInfo(String trangThaiSLA, LocalDateTime hanChot, Long giayConLai) {}

    private void ghiNhatKy(String maTaiKhoan, String hanhDong, String doiTuong,
                           String maDoiTuong, String noiDungCu, String noiDungMoi, String diaChiIp) {
        NhatKy nhatKy = NhatKy.builder()
                .maNhatKy("NK-" + System.currentTimeMillis())
                .maTaiKhoan(maTaiKhoan)
                .hanhDong(hanhDong)
                .doiTuong(doiTuong)
                .maDoiTuong(maDoiTuong)
                .noiDungCu(noiDungCu)
                .noiDungMoi(noiDungMoi)
                .diaChiIp(diaChiIp)
                .thoiGian(LocalDateTime.now())
                .build();
        nhatKyRepo.save(nhatKy);
    }
}
