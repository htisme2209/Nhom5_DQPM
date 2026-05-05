package com.danang.railway.service;

import com.danang.railway.dto.XacNhanTauRequest;
import com.danang.railway.entity.ChuyenTau;
import com.danang.railway.entity.LichTrinh;
import com.danang.railway.entity.SuCo;
import com.danang.railway.repository.ChuyenTauRepository;
import com.danang.railway.repository.LichTrinhRepository;
import com.danang.railway.repository.SuCoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

/**
 * Service xử lý xác nhận tàu của nhân viên nhà ga
 * UC-10: Xác nhận tàu
 *
 * Logic theo vai trò:
 *  - XUAT_PHAT  : Chỉ bước 1 = Xuất phát → ghi gioDiThucTe → DA_ROI_GA
 *  - DIEM_CUOI  : Chỉ bước 1 = Vào ga    → ghi gioDenThucTe → DA_ROI_GA (kết thúc)
 *  - TRUNG_GIAN : Bước 1 = Vào ga → DUNG_TAI_GA, Bước 2 = Xuất phát → DA_ROI_GA
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class XacNhanTauService {

    private final LichTrinhRepository lichTrinhRepository;
    private final ChuyenTauRepository chuyenTauRepository;
    private final SuCoRepository suCoRepository;
    private static final int NGUONG_MAT_LIEN_LAC_PHUT = 10;
    private static final String MA_TAI_KHOAN_HE_THONG = "SYSTEM";

    // ─── DTO phẳng trả về FE, kèm vaiTroTaiDaNang ───────────────────────────
    public static class LichTrinhXacNhanDTO {
        public String maLichTrinh;
        public String maChuyenTau;
        public String maRay;
        public String trangThai;
        public String vaiTroTaiDaNang;
        public LocalDateTime gioDenDuKien;
        public LocalDateTime gioDiDuKien;
        public LocalDateTime gioDenThucTe;
        public LocalDateTime gioDiThucTe;
        public Integer soPhutTre;
        public String ghiChu;
    }

    // ─── Lấy danh sách chờ xác nhận ─────────────────────────────────────────

    public List<LichTrinhXacNhanDTO> getDanhSachChoXacNhan() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfDay = now.toLocalDate().atStartOfDay();
        LocalDateTime endOfDay   = startOfDay.plusDays(1);

        List<LichTrinh> lichTrinhs = lichTrinhRepository.findByNgayChayBetweenAndTrangThaiIn(
                startOfDay, endOfDay,
                List.of("CHO_XAC_NHAN", "DA_XAC_NHAN", "DUNG_TAI_GA")
        );

        List<LichTrinhXacNhanDTO> result = new ArrayList<>();
        for (LichTrinh lt : lichTrinhs) {
            result.add(toDTO(lt));
        }
        return result;
    }

    // ─── Xác nhận tàu ────────────────────────────────────────────────────────

    @Transactional
    public Map<String, Object> xacNhanTau(XacNhanTauRequest request) {
        log.info("Xác nhận tàu: {} - action: {}", request.getMaLichTrinh(), request.getTrangThai());

        if (request.getDaKiemTraAnToan() == null || !request.getDaKiemTraAnToan()) {
            throw new RuntimeException("Chưa xác nhận kiểm tra an toàn kỹ thuật");
        }

        LichTrinh lichTrinh = lichTrinhRepository.findById(request.getMaLichTrinh())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch trình"));

        ChuyenTau chuyenTau = chuyenTauRepository.findById(lichTrinh.getMaChuyenTau())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chuyến tàu"));
        String vaiTro = chuyenTau.getVaiTroTaiDaNang();
        String action = request.getTrangThai();

        LocalDateTime now = LocalDateTime.now();
        int soPhutTre = 0;

        switch (vaiTro) {
            case "XUAT_PHAT" -> {
                // Tàu xuất phát: chỉ có bước ghi nhận giờ xuất phát thực tế
                if (!"XUAT_PHAT".equals(action)) {
                    throw new RuntimeException("Tàu xuất phát chỉ cần xác nhận giờ xuất phát, không có bước vào ga.");
                }
                lichTrinh.setGioDiThucTe(now);
                lichTrinh.setTrangThai("DA_ROI_GA");
                if (lichTrinh.getGioDiDuKien() != null) {
                    soPhutTre = (int) Math.max(0, ChronoUnit.MINUTES.between(lichTrinh.getGioDiDuKien(), now));
                    lichTrinh.setSoPhutTre(soPhutTre);
                }
                log.info("XUAT_PHAT {} xuất phát lúc {}, trễ {}p", lichTrinh.getMaChuyenTau(), now, soPhutTre);
            }
            case "DIEM_CUOI" -> {
                // Tàu điểm cuối: chỉ có bước ghi nhận giờ đến thực tế, kết thúc hành trình
                if (!"VAO_GA".equals(action)) {
                    throw new RuntimeException("Tàu điểm cuối chỉ cần xác nhận giờ đến, không có bước xuất phát.");
                }
                lichTrinh.setGioDenThucTe(now);
                lichTrinh.setTrangThai("DA_ROI_GA"); // Kết thúc – không cần bước xuất phát
                if (lichTrinh.getGioDenDuKien() != null) {
                    soPhutTre = (int) Math.max(0, ChronoUnit.MINUTES.between(lichTrinh.getGioDenDuKien(), now));
                    lichTrinh.setSoPhutTre(soPhutTre);
                }
                log.info("DIEM_CUOI {} đến ga lúc {}, trễ {}p", lichTrinh.getMaChuyenTau(), now, soPhutTre);
            }
            default -> {
                // TRUNG_GIAN: 2 bước
                if ("VAO_GA".equals(action)) {
                    if ("DUNG_TAI_GA".equals(lichTrinh.getTrangThai())) {
                        throw new RuntimeException("Tàu đã vào ga rồi. Vui lòng bấm Xuất phát.");
                    }
                    lichTrinh.setGioDenThucTe(now);
                    lichTrinh.setTrangThai("DUNG_TAI_GA");
                    if (lichTrinh.getGioDenDuKien() != null) {
                        soPhutTre = (int) Math.max(0, ChronoUnit.MINUTES.between(lichTrinh.getGioDenDuKien(), now));
                        lichTrinh.setSoPhutTre(soPhutTre);
                    }
                    log.info("TRUNG_GIAN {} vào ga lúc {}, trễ {}p", lichTrinh.getMaChuyenTau(), now, soPhutTre);
                } else if ("XUAT_PHAT".equals(action)) {
                    if (!"DUNG_TAI_GA".equals(lichTrinh.getTrangThai())) {
                        throw new RuntimeException("Vui lòng xác nhận tàu vào ga trước khi xác nhận xuất phát.");
                    }
                    lichTrinh.setGioDiThucTe(now);
                    lichTrinh.setTrangThai("DA_ROI_GA");
                    if (lichTrinh.getSoPhutTre() == null || lichTrinh.getSoPhutTre() == 0) {
                        if (lichTrinh.getGioDiDuKien() != null) {
                            soPhutTre = (int) Math.max(0, ChronoUnit.MINUTES.between(lichTrinh.getGioDiDuKien(), now));
                            lichTrinh.setSoPhutTre(soPhutTre);
                        }
                    } else {
                        soPhutTre = lichTrinh.getSoPhutTre();
                    }
                    log.info("TRUNG_GIAN {} xuất phát lúc {}, trễ {}p", lichTrinh.getMaChuyenTau(), now, soPhutTre);
                }
            }
        }

        if (request.getGhiChu() != null && !request.getGhiChu().trim().isEmpty()) {
            lichTrinh.setGhiChu(request.getGhiChu());
        }
        lichTrinh.setNgayCapNhat(now);
        lichTrinhRepository.save(lichTrinh);

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Xác nhận thành công");
        result.put("lichTrinh", lichTrinh);
        result.put("soPhutTre", soPhutTre);
        if (soPhutTre > 0) {
            result.put("warning", String.format("Tàu trễ %d phút so với dự kiến", soPhutTre));
        }
        return result;
    }

    // ─── Hủy xác nhận ────────────────────────────────────────────────────────

    @Transactional
    public void huyXacNhan(String maLichTrinh) {
        log.info("Hủy xác nhận tàu: {}", maLichTrinh);
        LichTrinh lichTrinh = lichTrinhRepository.findById(maLichTrinh)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch trình"));
        lichTrinh.setTrangThai("CHO_XAC_NHAN");
        lichTrinh.setGioDenThucTe(null);
        lichTrinh.setGioDiThucTe(null);
        lichTrinh.setSoPhutTre(0);
        lichTrinh.setNgayCapNhat(LocalDateTime.now());
        lichTrinhRepository.save(lichTrinh);
    }

    // ─── Kiểm tra mất liên lạc ───────────────────────────────────────────────

    @Transactional
    public Map<String, Object> kiemTraVaTaoSuCoMatLienLac() {
        log.info("Kiểm tra tàu quá hạn (mất liên lạc)");
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfDay = now.toLocalDate().atStartOfDay();
        LocalDateTime endOfDay   = startOfDay.plusDays(1);

        List<LichTrinh> lichTrinhs = lichTrinhRepository.findByNgayChayBetweenAndTrangThaiIn(
                startOfDay, endOfDay, List.of("CHO_XAC_NHAN", "DA_XAC_NHAN")
        );

        int soLuongQuaHan = 0;
        int soLuongTaoSuCo = 0;

        for (LichTrinh lt : lichTrinhs) {
            if (lt.getGioDenDuKien() != null) {
                long phutChenh = ChronoUnit.MINUTES.between(lt.getGioDenDuKien(), now);
                if (phutChenh >= NGUONG_MAT_LIEN_LAC_PHUT) {
                    soLuongQuaHan++;
                    boolean daTonTaiSuCo = suCoRepository.existsByMaLichTrinhAndLoaiSuCo(lt.getMaLichTrinh(), "MAT_LIEN_LAC");
                    if (!daTonTaiSuCo) {
                        SuCo suCo = new SuCo();
                        suCo.setMaSuCo("SC-MLL-" + System.currentTimeMillis());
                        suCo.setMaLichTrinh(lt.getMaLichTrinh());
                        suCo.setMaRay(lt.getMaRay());
                        suCo.setLoaiSuCo("MAT_LIEN_LAC");
                        suCo.setMoTa(String.format(
                                "Tàu %s đã quá %d phút so với giờ đến dự kiến (%s) mà chưa có xác nhận từ nhà ga",
                                lt.getMaChuyenTau(), (int) phutChenh, lt.getGioDenDuKien()
                        ));
                        suCo.setMucDo("KHAN_CAP");
                        suCo.setTrangThaiXuLy("CHUA_XU_LY");
                        suCo.setNgayXayRa(now);
                        suCo.setNgayTao(now);
                        suCo.setMaNguoiGhiNhan(MA_TAI_KHOAN_HE_THONG);
                        suCoRepository.save(suCo);
                        soLuongTaoSuCo++;
                        log.warn("Tạo sự cố mất liên lạc cho tàu {}: quá {}p", lt.getMaChuyenTau(), (int) phutChenh);
                    }
                }
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("soLuongQuaHan", soLuongQuaHan);
        result.put("soLuongTaoSuCo", soLuongTaoSuCo);
        result.put("message", String.format("Phát hiện %d tàu quá hạn, đã tạo %d sự cố mất liên lạc mới", soLuongQuaHan, soLuongTaoSuCo));
        return result;
    }

    // ─── Helper ───────────────────────────────────────────────────────────────

    private LichTrinhXacNhanDTO toDTO(LichTrinh lt) {
        LichTrinhXacNhanDTO dto = new LichTrinhXacNhanDTO();
        dto.maLichTrinh  = lt.getMaLichTrinh();
        dto.maChuyenTau  = lt.getMaChuyenTau();
        dto.maRay        = lt.getMaRay();
        dto.trangThai    = lt.getTrangThai();
        dto.gioDenDuKien = lt.getGioDenDuKien();
        dto.gioDiDuKien  = lt.getGioDiDuKien();
        dto.gioDenThucTe = lt.getGioDenThucTe();
        dto.gioDiThucTe  = lt.getGioDiThucTe();
        dto.soPhutTre    = lt.getSoPhutTre();
        dto.ghiChu       = lt.getGhiChu();
        chuyenTauRepository.findById(lt.getMaChuyenTau())
                .ifPresent(ct -> dto.vaiTroTaiDaNang = ct.getVaiTroTaiDaNang());
        return dto;
    }
}
