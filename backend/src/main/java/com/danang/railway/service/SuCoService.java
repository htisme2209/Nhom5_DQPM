package com.danang.railway.service;

import com.danang.railway.entity.*;
import com.danang.railway.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class SuCoService {

    private final SuCoRepository suCoRepo;
    private final DuongRayRepository duongRayRepo;
    private final LichTrinhRepository lichTrinhRepo;
    private final NhatKyRepository nhatKyRepo;
    private final QuyTacNghiepVuRepository quyTacRepo;
    private final BoGhiRepository boGhiRepo;
    private final SlaWorkerService slaWorkerService;

    private int getRuleValue(String maQuyTac, int defaultValue) {
        return quyTacRepo.findById(maQuyTac)
                .map(qt -> {
                    try {
                        return Integer.parseInt(qt.getGiaTri());
                    } catch (Exception e) {
                        return defaultValue;
                    }
                })
                .orElse(defaultValue);
    }

    /**
     * UC-09: Ghi nhận sự cố (Nhân viên Nhà ga)
     * Chỉ lưu báo cáo — KHÔNG phong tỏa ray, KHÔNG gắn thẻ lịch trình.
     * Điều hành sẽ tiếp nhận và đánh giá ở bước tiếp theo.
     */
    @Transactional
    public SuCo ghiNhanSuCo(SuCo suCo, String maTaiKhoan, String diaChiIp) {
        // Sinh maSuCo tập trung ở backend
        if (suCo.getMaSuCo() == null || suCo.getMaSuCo().isBlank()) {
            suCo.setMaSuCo("SC-" + System.currentTimeMillis());
        }
        suCo.setNgayTao(LocalDateTime.now());
        suCo.setMaNguoiGhiNhan(maTaiKhoan);
        suCo.setTrangThaiXuLy("CHO_TIEP_NHAN");
        // Đặt lại maLichTrinh nếu trống
        if (suCo.getMaLichTrinh() != null && suCo.getMaLichTrinh().isBlank()) {
            suCo.setMaLichTrinh(null);
        }

        SuCo savedSuCo = suCoRepo.save(suCo);

        // Ghi nhật ký
        ghiNhatKy(maTaiKhoan, "GHI_NHAN_SU_CO", "SU_CO", savedSuCo.getMaSuCo(),
                null, "Báo cáo sự cố: " + suCo.getLoaiSuCo() + " tại ray " + suCo.getMaRay(),
                diaChiIp);

        return savedSuCo;
    }

    /**
     * UC-09/UC-06: Tiếp nhận và đánh giá sự cố (Nhân viên Điều hành)
     * Đây là bước quan trọng nhất: NVĐH xác nhận mức độ, quyết định phong tỏa,
     * hệ thống tự động quét lịch trình bị ảnh hưởng.
     */
    @Transactional
    public SuCo tiepNhanVaDanhGia(String maSuCo, String mucDoChinhThuc,
                                   boolean coPhongToaRay, String loaiPhongToa,
                                   String maTaiKhoan, String diaChiIp, Integer thoiGianXuLyUocTinh) {
        SuCo suCo = suCoRepo.findById(maSuCo)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sự cố: " + maSuCo));

        if (!"CHO_TIEP_NHAN".equals(suCo.getTrangThaiXuLy())) {
            throw new RuntimeException("Sự cố không ở trạng thái chờ tiếp nhận (hiện tại: " + suCo.getTrangThaiXuLy() + ")");
        }

        // Cập nhật thông tin tiếp nhận
        suCo.setMucDo(mucDoChinhThuc);
        suCo.setTrangThaiXuLy("DANG_XU_LY");
        suCo.setTrangThaiSLA("NORMAL");
        if (thoiGianXuLyUocTinh != null) {
            suCo.setThoiGianXuLyUocTinh(thoiGianXuLyUocTinh);
        }
        suCoRepo.save(suCo);

        // Phong tỏa ray nếu NVĐH quyết định
        if (coPhongToaRay && suCo.getMaRay() != null) {
            DuongRay ray = duongRayRepo.findById(suCo.getMaRay())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy đường ray"));

            String trangThaiCu = ray.getTrangThai();
            String trangThaiMoi = loaiPhongToa != null ? loaiPhongToa : "PHONG_TOA_TAM";
            ray.setTrangThai(trangThaiMoi);

            if ("PHONG_TOA_TAM".equals(trangThaiMoi)) {
                // Ưu tiên thời gian do Điều hành nhập, nếu trống thì tính mặc định
                Integer phut = suCo.getThoiGianXuLyUocTinh() != null ? suCo.getThoiGianXuLyUocTinh() : tinhThoiGianXuLyUocTinh(mucDoChinhThuc);
                ray.setThoiGianXuLyUocTinh(phut);

                // ── Phương án 2: ghi cửa sổ thời gian phong tỏa cụ thể ────────
                LocalDateTime batDau = suCo.getNgayXayRa() != null ? suCo.getNgayXayRa() : LocalDateTime.now();
                LocalDateTime ketThuc = phut != null ? batDau.plusMinutes(phut) : batDau.plusHours(2);
                ray.setThoiGianBatDauPhongToa(batDau);
                ray.setThoiGianKetThucPhongToa(ketThuc);
            } else if ("PHONG_TOA_CUNG".equals(trangThaiMoi)) {
                // Phong tỏa cứng: từ lúc xảy ra đến cuối ngày hôm sau
                LocalDateTime batDau = suCo.getNgayXayRa() != null ? suCo.getNgayXayRa() : LocalDateTime.now();
                LocalDateTime ketThuc = batDau.plusDays(1).withHour(23).withMinute(59);
                ray.setThoiGianBatDauPhongToa(batDau);
                ray.setThoiGianKetThucPhongToa(ketThuc);
            }
            duongRayRepo.save(ray);

            ghiNhatKy(maTaiKhoan, "PHONG_TOA_RAY", "DUONG_RAY", suCo.getMaRay(),
                    "Trạng thái: " + trangThaiCu,
                    "Trạng thái: " + trangThaiMoi + " — Tiếp nhận sự cố " + maSuCo,
                    diaChiIp);

            // Quét và gắn thẻ lịch trình bị ảnh hưởng do phong tỏa ray
            ganTheLichTrinhBiAnhHuong(suCo, ray, maTaiKhoan, diaChiIp);
        } else if (suCo.getMaLichTrinh() != null && !suCo.getMaLichTrinh().isBlank()) {
            // Không phong tỏa ray, nhưng có lỗi từ 1 tàu cụ thể (trễ/hỏng nhẹ)
            // Quét và gắn thẻ lịch trình bị ảnh hưởng dây chuyền
            ganTheLichTrinhBoiLichTrinhTre(suCo, mucDoChinhThuc, maTaiKhoan, diaChiIp);
        }

        // Ghi nhật ký tiếp nhận
        ghiNhatKy(maTaiKhoan, "TIEP_NHAN_SU_CO", "SU_CO", maSuCo,
                "Mức độ ban đầu: " + suCo.getMucDo(),
                "Tiếp nhận — Mức độ chính thức: " + mucDoChinhThuc
                        + ", Phong tỏa: " + (coPhongToaRay ? loaiPhongToa : "Không"),
                diaChiIp);

        // ═══ SLA: Tính hạn chót phương án ═══
        SuCo suCoSaved = suCoRepo.findById(maSuCo).orElseThrow();
        try {
            LocalDateTime hanChot = slaWorkerService.tinhHanChotPhuongAn(suCoSaved);
            suCoSaved.setHanChotPhuongAn(hanChot);
            suCoRepo.save(suCoSaved);
            log.info("SLA: Hạn chót phương án cho sự cố {} = {}", maSuCo, hanChot);
        } catch (Exception e) {
            log.warn("Không tính được hạn chót SLA cho sự cố {}: {}", maSuCo, e.getMessage());
        }

        return suCoSaved;
    }


    /**
     * Tính thời gian xử lý ước tính dựa trên mức độ
     */
    private Integer tinhThoiGianXuLyUocTinh(String mucDo) {
        switch (mucDo) {
            case "THAP":
                return 30; // 30 phút
            case "TRUNG_BINH":
                return 60; // 1 giờ
            case "CAO":
                return 120; // 2 giờ
            case "KHAN_CAP":
                return null; // Không xác định
            default:
                return 60;
        }
    }


    /**
     * Quét và gắn thẻ các lịch trình bị ảnh hưởng bởi phong tỏa ray.
     *
     * Cửa sổ chiếm ray (track window) theo vai trò — khớp với scheduleOptimizer.js:
     *   XUAT_PHAT  : [gioDi − 30p,  gioDi + 15p]
     *   DIEM_CUOI  : [gioDen − 1p,  gioDen + 30p]
     *   TRUNG_GIAN : [gioDen − 1p,  gioDi + 15p]
     *
     * Lịch trình bị ảnh hưởng khi window của nó GIAO với [thoiDiemBatDau, thoiDiemKetThuc].
     */
    private void ganTheLichTrinhBiAnhHuong(SuCo suCo, DuongRay ray, String maTaiKhoan, String diaChiIp) {
        LocalDateTime thoiDiemBatDau = suCo.getNgayXayRa();
        LocalDateTime thoiDiemKetThuc = tinhThoiDiemKetThucAnhHuong(suCo, ray);

        // ⚠️ Chỉ lọc lịch trình trong ngày xảy ra sự cố — tránh ảnh hưởng sai sang ngày khác
        String ngaySuCo = thoiDiemBatDau.toLocalDate().toString(); // "yyyy-MM-dd"
        List<LichTrinh> tatCaLichTrinh = lichTrinhRepo.findByNgayChayChuyenTauAndMaRay(ngaySuCo, ray.getMaRay());

        for (LichTrinh lt : tatCaLichTrinh) {
            LocalDateTime gioDen = lt.getGioDenDuKien();
            LocalDateTime gioDi  = lt.getGioDiDuKien();

            // Tính track window theo vai trò tàu (giống scheduleOptimizer.js)
            LocalDateTime winStart, winEnd;
            if (gioDen == null && gioDi != null) {
                // XUAT_PHAT: không có giờ đến
                winStart = gioDi.minusMinutes(30);
                winEnd   = gioDi.plusMinutes(15);
            } else if (gioDi == null && gioDen != null) {
                // DIEM_CUOI: không có giờ đi
                winStart = gioDen.minusMinutes(1);
                winEnd   = gioDen.plusMinutes(30); // (rời ray 15p + đệm 15p)
            } else if (gioDen != null && gioDi != null) {
                // TRUNG_GIAN: có cả hai
                winStart = gioDen.minusMinutes(1);
                winEnd   = gioDi.plusMinutes(15);
            } else {
                continue; // Thiếu dữ liệu giờ — bỏ qua
            }

            // Kiểm tra overlap: [winStart, winEnd] ∩ [batDau, ketThuc] ≠ ∅
            boolean overlap = !winEnd.isBefore(thoiDiemBatDau) && !winStart.isAfter(thoiDiemKetThuc);

            if (overlap && lt.getMaSuCoAnhHuong() == null) {
                lt.setMaSuCoAnhHuong(suCo.getMaSuCo());
                lt.setPhuongAnXuLy("CHO_RAY");
                lichTrinhRepo.save(lt);

                ghiNhatKy(maTaiKhoan, "GAN_THE_SU_CO", "LICH_TRINH", lt.getMaLichTrinh(),
                        "Không có sự cố",
                        "Bị ảnh hưởng bởi sự cố " + suCo.getMaSuCo() + " (phong tỏa " +
                        thoiDiemBatDau + " → " + thoiDiemKetThuc + "), phương án: CHO_RAY",
                        diaChiIp);
            }
        }
    }

    /**
     * Quét các lịch trình bị ảnh hưởng liên đới bởi 1 chuyến tàu bị sự cố (không phong tỏa toàn bộ ray)
     */
    private void ganTheLichTrinhBoiLichTrinhTre(SuCo suCo, String mucDo, String maTaiKhoan, String diaChiIp) {
        LichTrinh sourceLt = lichTrinhRepo.findById(suCo.getMaLichTrinh()).orElse(null);
        if (sourceLt == null || sourceLt.getMaRay() == null) return;

        // Ước tính tàu chiếm ray thêm bao lâu
        Integer phutXuLy = tinhThoiGianXuLyUocTinh(mucDo);
        if (phutXuLy == null) phutXuLy = 120; // 2 tiếng mặc định

        LocalDateTime thoiDiemBatDau = suCo.getNgayXayRa();
        LocalDateTime thoiDiemKetThuc = thoiDiemBatDau.plusMinutes(phutXuLy);
        
        LocalDateTime gioDiGoc = sourceLt.getGioDiDuKien();
        if (gioDiGoc == null && sourceLt.getGioDenDuKien() != null) gioDiGoc = sourceLt.getGioDenDuKien().plusMinutes(30);
        if (gioDiGoc != null && thoiDiemKetThuc.isBefore(gioDiGoc)) {
            thoiDiemKetThuc = gioDiGoc.plusMinutes(phutXuLy);
        }

        // ⚠️ Chỉ lọc lịch trình trong ngày xảy ra sự cố — tránh ảnh hưởng sai sang ngày khác
        String ngaySuCo = thoiDiemBatDau.toLocalDate().toString();
        List<LichTrinh> tatCaLichTrinh = lichTrinhRepo.findByNgayChayChuyenTauAndMaRay(ngaySuCo, sourceLt.getMaRay());

        for (LichTrinh lt : tatCaLichTrinh) {
            LocalDateTime den = lt.getGioDenDuKien();
            LocalDateTime di = lt.getGioDiDuKien();

            if (den == null && di != null) den = di.minusMinutes(30);
            if (di == null && den != null) di = den.plusMinutes(30);

            if (den != null && di != null) {
                // Kiểm tra xem lịch trình có nằm trong dải thời gian tàu sự cố chiếm dụng hay không
                boolean biAnhHuong = !di.isBefore(thoiDiemBatDau) && !den.isAfter(thoiDiemKetThuc);
                
                if (biAnhHuong && lt.getMaSuCoAnhHuong() == null) {
                    lt.setMaSuCoAnhHuong(suCo.getMaSuCo());
                    lt.setPhuongAnXuLy("CHO_RAY");
                    lichTrinhRepo.save(lt);

                    String isSource = lt.getMaLichTrinh().equals(sourceLt.getMaLichTrinh()) ? "Nguồn sự cố" : "Bị kẹt dây chuyền";
                    String maChuyen = sourceLt.getChuyenTau() != null ? sourceLt.getChuyenTau().getMaChuyenTau() : sourceLt.getMaLichTrinh();
                    
                    ghiNhatKy(maTaiKhoan, "GAN_THE_SU_CO", "LICH_TRINH", lt.getMaLichTrinh(),
                            "Không có sự cố",
                            isSource + " (" + suCo.getMaSuCo() + ") từ chuyến " + maChuyen + ", phương án: CHO_RAY",
                            diaChiIp);
                }
            }
        }
    }

    /**
     * Tính thời điểm kết thúc ảnh hưởng của sự cố.
     * Ưu tiên: thoiGianXuLyUocTinh trên suCo (người dùng nhập)
     *         → thoiGianXuLyUocTinh trên ray (đã ghi khi tiếp nhận)
     *         → theo mức độ sự cố → fallback 2 giờ.
     */
    private LocalDateTime tinhThoiDiemKetThucAnhHuong(SuCo suCo, DuongRay ray) {
        LocalDateTime batDau = suCo.getNgayXayRa() != null ? suCo.getNgayXayRa() : LocalDateTime.now();

        // Sử dụng trạng thái thực sự trên ray để quyết định (đã được cập nhật trong tiepNhanVaDanhGia)
        if ("PHONG_TOA_CUNG".equals(ray.getTrangThai())) {
            return batDau.plusDays(1).withHour(23).withMinute(59);
        }

        // Ưu tiên 1: người dùng nhập khi tiếp nhận
        if (suCo.getThoiGianXuLyUocTinh() != null) {
            return batDau.plusMinutes(suCo.getThoiGianXuLyUocTinh());
        }

        // Ưu tiên 2: đã ghi lên ray
        if (ray.getThoiGianXuLyUocTinh() != null) {
            return batDau.plusMinutes(ray.getThoiGianXuLyUocTinh());
        }

        // Ưu tiên 3: theo mức độ
        Integer phut = tinhThoiGianXuLyUocTinh(suCo.getMucDo() != null ? suCo.getMucDo() : "TRUNG_BINH");
        return phut != null ? batDau.plusMinutes(phut) : batDau.plusHours(2);
    }

    /**
     * UC-06: Xử lý phương án cho lịch trình bị ảnh hưởng
     */
    @Transactional
    public void xuLyPhuongAnLichTrinh(String maLichTrinh, String phuongAn, 
                                      String maRayMoi, String maTaiKhoan, String diaChiIp) {
        LichTrinh lichTrinh = lichTrinhRepo.findById(maLichTrinh)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch trình"));

        String phuongAnCu = lichTrinh.getPhuongAnXuLy();
        String maRayCu = lichTrinh.getMaRay();

        switch (phuongAn) {
            case "CHO_RAY":
                // Giữ nguyên, không làm gì
                lichTrinh.setPhuongAnXuLy("CHO_RAY");
                break;

            case "DOI_RAY":
                if (maRayMoi == null) {
                    throw new RuntimeException("Phải chỉ định đường ray mới");
                }
                
                // ═══ RÀNG BUỘC VẬT LÝ: Kiểm tra bộ ghi kết nối ═══
                kiemTraRangBuocVatLy(lichTrinh, maRayMoi);
                
                // Kiểm tra xung đột thời gian
                kiemTraXungDotRay(lichTrinh, maRayMoi);
                
                lichTrinh.setMaRay(maRayMoi);
                lichTrinh.setPhuongAnXuLy("DOI_RAY");
                break;

            case "HUY_CHUYEN":
                lichTrinh.setTrangThai("HUY_CHUYEN");
                lichTrinh.setPhuongAnXuLy("HUY_CHUYEN");
                break;

            default:
                throw new RuntimeException("Phương án không hợp lệ");
        }

        lichTrinhRepo.save(lichTrinh);

        // Ghi nhật ký
        ghiNhatKy(maTaiKhoan, "XU_LY_SU_CO", "LICH_TRINH", maLichTrinh,
                "Phương án: " + phuongAnCu + ", Ray: " + maRayCu,
                "Phương án: " + phuongAn + ", Ray: " + (maRayMoi != null ? maRayMoi : maRayCu),
                diaChiIp);

        // Tự động kiểm tra giải phóng ray nếu đã xử lý hết
        if ("DOI_RAY".equals(phuongAn) || "HUY_CHUYEN".equals(phuongAn)) {
            kiemTraTuDongGiaiPhongRay(lichTrinh, maTaiKhoan, diaChiIp);
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // TÍNH NĂNG 1: RÀNG BUỘC VẬT LÝ (Physical Constraint Check)
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * Kiểm tra ràng buộc vật lý khi đổi ray.
     * 1. Xác định bộ ghi khả dụng giữa ray hiện tại và ray mới
     * 2. Tính khoảng cách thực tế (Δd) giữa tàu và bộ ghi
     * 3. Kiểm tra Δd >= d_safe (khoảng cách an toàn)
     * 4. Kiểm tra thời gian tác nghiệp đủ hay không
     */
    private void kiemTraRangBuocVatLy(LichTrinh lichTrinh, String maRayMoi) {
        String maRayCu = lichTrinh.getMaRay();
        if (maRayCu == null) return; // Không có ray hiện tại → bỏ qua

        // 1. Tìm bộ ghi kết nối giữa ray hiện tại và ray mới
        List<BoGhi> boGhiKhaDung = boGhiRepo.findAvailableByRayConnection(maRayCu, maRayMoi);

        if (boGhiKhaDung.isEmpty()) {
            // Kiểm tra có bộ ghi nào tồn tại (dù không sẵn sàng)
            List<BoGhi> boGhiTonTai = boGhiRepo.findByRayConnection(maRayCu, maRayMoi);
            if (boGhiTonTai.isEmpty()) {
                throw new RuntimeException(
                    "Không tồn tại bộ ghi chuyển ray giữa " + maRayCu + " và " + maRayMoi +
                    ". Hai đường ray này không có kết nối vật lý.");
            } else {
                throw new RuntimeException(
                    "Bộ ghi giữa " + maRayCu + " và " + maRayMoi +
                    " hiện đang bảo trì hoặc không sẵn sàng (" +
                    boGhiTonTai.get(0).getMaBoGhi() + ": " + boGhiTonTai.get(0).getTrangThai() + ").");
            }
        }

        // 2. Chọn bộ ghi phù hợp nhất (gần tàu nhất nhưng vẫn đủ an toàn)
        BoGhi boGhiChon = boGhiKhaDung.get(0); // Lấy bộ ghi đầu tiên khả dụng

        // 3. Ước tính vị trí hiện tại của tàu (dùng vị trí Km trên tuyến)
        double viTriTau = uocTinhViTriTau(lichTrinh);
        double viTriBoGhi = boGhiChon.getViTriKm();
        double khoangCach = Math.abs(viTriBoGhi - viTriTau);

        // Lấy khoảng cách an toàn từ quy tắc nghiệp vụ (mặc định 0.5 km)
        double dSafe = getRuleValue("QT-DIST-SAFE", 500) / 1000.0; // convert m → km

        if (khoangCach < dSafe) {
            throw new RuntimeException(String.format(
                "Tàu đã vượt quá điểm ghi chuyển làn hoặc quá gần bộ ghi %s. " +
                "Khoảng cách: %.2f km, yêu cầu tối thiểu: %.2f km. " +
                "Không thể bẻ ghi an toàn.",
                boGhiChon.getMaBoGhi(), khoangCach, dSafe));
        }

        // 4. Kiểm tra thời gian tác nghiệp
        int thoiGianTacNghiep = boGhiChon.getThoiGianTacNghiep(); // phút

        // Ước tính tốc độ tàu (km/h) — lấy từ quy tắc hoặc mặc định 40 km/h trong ga
        double tocDoTau = getRuleValue("QT-SPEED-GA", 40); // km/h
        double thoiGianDenBoGhi = (khoangCach / tocDoTau) * 60; // phút

        if (thoiGianDenBoGhi < thoiGianTacNghiep) {
            throw new RuntimeException(String.format(
                "Không đủ thời gian tác nghiệp ghi %s. " +
                "Tàu sẽ đến bộ ghi trong %.1f phút, nhưng cần %d phút để bẻ ghi và kiểm tra an toàn.",
                boGhiChon.getMaBoGhi(), thoiGianDenBoGhi, thoiGianTacNghiep));
        }

        log.info("✅ Ràng buộc vật lý OK: Bộ ghi {} — khoảng cách {}km (>= {}km), " +
                "thời gian tác nghiệp {}p (>= {}p)",
                boGhiChon.getMaBoGhi(), khoangCach, dSafe, thoiGianDenBoGhi, thoiGianTacNghiep);
    }

    /**
     * Ước tính vị trí hiện tại của tàu (Km) dựa trên trạng thái lịch trình.
     * Nếu tàu chưa đến → lấy vị trí ban đầu (đầu ray).
     * Nếu tàu đã đến → lấy vị trí đường ray (km trung tâm ga).
     */
    private double uocTinhViTriTau(LichTrinh lichTrinh) {
        DuongRay ray = duongRayRepo.findById(lichTrinh.getMaRay()).orElse(null);
        if (ray == null) return 791.0; // Mặc định vị trí ga Đà Nẵng ≈ 791 km

        // Ước tính dựa trên trạng thái: nếu đã đến ga → tàu đang trên ray
        if (lichTrinh.getGioDenThucTe() != null) {
            // Tàu đang ở trong ga → vị trí ≈ giữa ray
            return 791.0 + (ray.getSoRay() * 0.05); // offset nhỏ theo số ray
        }

        // Tàu chưa đến → ước tính dựa trên giờ và hướng
        ChuyenTau ct = lichTrinh.getChuyenTau();
        if (ct != null && "XUAT_PHAT".equals(ct.getVaiTroTaiDaNang())) {
            return 791.0; // Đang trong ga chờ xuất phát
        }

        // Tàu đang tiến vào ga → vị trí tương đối ngoài ga
        return 790.5; // ≈ 500m trước ga
    }

    /**
     * Lấy danh sách bộ ghi khả dụng giữa 2 ray (cho frontend hiển thị)
     */
    public List<Map<String, Object>> getBoGhiKhaDung(String maRayCu, String maRayMoi) {
        List<BoGhi> boGhiList = boGhiRepo.findByRayConnection(maRayCu, maRayMoi);
        List<Map<String, Object>> result = new java.util.ArrayList<>();

        for (BoGhi bg : boGhiList) {
            Map<String, Object> item = new HashMap<>();
            item.put("maBoGhi", bg.getMaBoGhi());
            item.put("rayBatDau", bg.getRayBatDau());
            item.put("rayKetNoi", bg.getRayKetNoi());
            item.put("viTriKm", bg.getViTriKm());
            item.put("thoiGianTacNghiep", bg.getThoiGianTacNghiep());
            item.put("trangThai", bg.getTrangThai());
            item.put("khaDung", "SAN_SANG".equals(bg.getTrangThai()));
            result.add(item);
        }

        return result;
    }

    // ══════════════════════════════════════════════════════════════════════════
    // TÍNH NĂNG 2: SLA ESCALATION — BQL Override
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * BQL override phương án xử lý khi sự cố đã ESCALATED.
     * Chỉ BQL mới có quyền gọi khi trangThaiSLA = ESCALATED.
     */
    @Transactional
    public void bqlOverridePhuongAn(String maLichTrinh, String phuongAn,
                                     String maRayMoi, String maTaiKhoan, String diaChiIp) {
        LichTrinh lichTrinh = lichTrinhRepo.findById(maLichTrinh)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch trình"));

        // Kiểm tra sự cố có ESCALATED không
        if (lichTrinh.getMaSuCoAnhHuong() != null) {
            SuCo suCo = suCoRepo.findById(lichTrinh.getMaSuCoAnhHuong()).orElse(null);
            if (suCo != null) {
                suCo.setMaNguoiPheDuyetCuoi(maTaiKhoan);
                suCoRepo.save(suCo);
            }
        }

        // Ghi nhật ký BQL override
        ghiNhatKy(maTaiKhoan, "BQL_OVERRIDE", "LICH_TRINH", maLichTrinh,
                "Phương án cũ: " + lichTrinh.getPhuongAnXuLy(),
                "BQL Override → " + phuongAn + (maRayMoi != null ? " (ray " + maRayMoi + ")" : ""),
                diaChiIp);

        // Thực hiện phương án (bỏ qua ràng buộc vật lý cho BQL)
        String phuongAnCu = lichTrinh.getPhuongAnXuLy();
        String maRayCu = lichTrinh.getMaRay();

        switch (phuongAn) {
            case "DOI_RAY":
                if (maRayMoi == null) throw new RuntimeException("Phải chỉ định đường ray mới");
                kiemTraXungDotRay(lichTrinh, maRayMoi); // Vẫn kiểm tra xung đột thời gian
                lichTrinh.setMaRay(maRayMoi);
                lichTrinh.setPhuongAnXuLy("DOI_RAY");
                break;
            case "HUY_CHUYEN":
                lichTrinh.setTrangThai("HUY_CHUYEN");
                lichTrinh.setPhuongAnXuLy("HUY_CHUYEN");
                break;
            default:
                throw new RuntimeException("Phương án không hợp lệ cho override");
        }

        lichTrinhRepo.save(lichTrinh);

        if ("DOI_RAY".equals(phuongAn) || "HUY_CHUYEN".equals(phuongAn)) {
            kiemTraTuDongGiaiPhongRay(lichTrinh, maTaiKhoan, diaChiIp);
        }
    }

    private void kiemTraXungDotRay(LichTrinh lichTrinh, String maRayMoi) {
        // Lấy ngày chạy từ ChuyenTau
        ChuyenTau chuyenTau = lichTrinh.getChuyenTau();
        if (chuyenTau == null || chuyenTau.getNgayChay() == null) {
            throw new RuntimeException("Không thể xác định ngày chạy của lịch trình");
        }
        
        java.time.LocalDate ngayChay = chuyenTau.getNgayChay().contains("T") 
                ? LocalDateTime.parse(chuyenTau.getNgayChay()).toLocalDate() 
                : java.time.LocalDate.parse(chuyenTau.getNgayChay());
        
        // Tìm các lịch trình khác cùng ray trong cùng ngày
        List<LichTrinh> lichTrinhCungRay = lichTrinhRepo.findByMaRay(maRayMoi);

        for (LichTrinh lt : lichTrinhCungRay) {
            if (!lt.getMaLichTrinh().equals(lichTrinh.getMaLichTrinh())) {
                // Kiểm tra cùng ngày
                ChuyenTau ctKhac = lt.getChuyenTau();
                if (ctKhac != null && ctKhac.getNgayChay() != null) {
                    java.time.LocalDate ngayChayKhac = ctKhac.getNgayChay().contains("T")
                            ? LocalDateTime.parse(ctKhac.getNgayChay()).toLocalDate()
                            : java.time.LocalDate.parse(ctKhac.getNgayChay());
                    
                    // Chỉ kiểm tra nếu cùng ngày
                    if (ngayChay.equals(ngayChayKhac)) {
                        // Kiểm tra giao nhau cửa sổ thời gian
                        if (kiemTraGiaoNhauThoiGian(lichTrinh, lt)) {
                            throw new RuntimeException("Xung đột lịch trình với chuyến " + 
                                    lt.getMaChuyenTau() + " trên ray " + maRayMoi);
                        }
                    }
                }
            }
        }
    }

    private LocalDateTime[] getTrackWindow(LichTrinh lt) {
        LocalDateTime den = lt.getGioDenDuKien();
        LocalDateTime di = lt.getGioDiDuKien();
        int soPhutTre = lt.getSoPhutTre() != null ? lt.getSoPhutTre() : 0;
        
        if (den == null && di != null) { // XUAT_PHAT
            return new LocalDateTime[] { di.minusMinutes(30), di.plusMinutes(15 + soPhutTre) };
        }
        if (di == null && den != null) { // DIEM_CUOI
            return new LocalDateTime[] { den.minusMinutes(1), den.plusMinutes(30 + soPhutTre) };
        }
        if (den != null && di != null) { // TRUNG_GIAN
            return new LocalDateTime[] { den.minusMinutes(1), di.plusMinutes(15 + soPhutTre) };
        }
        return null;
    }

    /**
     * Kiểm tra giao nhau cửa sổ thời gian
     * Dựa trên vai trò chuyến tàu (tính toán track window giống scheduleOptimizer)
     */
    private boolean kiemTraGiaoNhauThoiGian(LichTrinh lt1, LichTrinh lt2) {
        LocalDateTime[] win1 = getTrackWindow(lt1);
        LocalDateTime[] win2 = getTrackWindow(lt2);
        
        if (win1 == null || win2 == null) return false;
        
        LocalDateTime start1 = win1[0];
        LocalDateTime end1 = win1[1];
        
        LocalDateTime start2 = win2[0];
        LocalDateTime end2 = win2[1];
        
        return start1.isBefore(end2) && start2.isBefore(end1);
    }

    /**
     * Giải phóng đường ray (chỉ BQL mới được phép với PHONG_TOA_CUNG)
     */
    @Transactional
    public void giaiPhongDuongRay(String maRay, String maSuCo, String maTaiKhoan,
                                   String quyenTruyCap, String diaChiIp) {

        // Kiểm tra tất cả lịch trình bị ảnh hưởng đã được xử lý
        List<LichTrinh> lichTrinhChuaXuLy = lichTrinhRepo.findByMaSuCoAnhHuongAndPhuongAnXuLy(
                maSuCo, "CHO_RAY");
        if (!lichTrinhChuaXuLy.isEmpty()) {
            throw new RuntimeException("Còn " + lichTrinhChuaXuLy.size() +
                    " lịch trình chưa được xử lý phương án");
        }

        String trangThaiCu = "N/A";

        // Chỉ giải phóng ray nếu sự cố có gắn ray
        if (maRay != null && !maRay.isBlank()) {
            DuongRay ray = duongRayRepo.findById(maRay)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy đường ray: " + maRay));

            trangThaiCu = ray.getTrangThai();

            // Kiểm tra quyền với phong tỏa cứng
            if ("PHONG_TOA_CUNG".equals(trangThaiCu) && !"BAN_QUAN_LY".equals(quyenTruyCap)) {
                throw new RuntimeException("Chỉ Ban Quản lý mới có quyền giải phóng phong tỏa cứng");
            }

            ray.setTrangThai("SAN_SANG");
            ray.setThoiGianXuLyUocTinh(null);
            ray.setThoiGianPhongToaUocTinh(null);
            // ── Phương án 2: xóa cửa sổ phong tỏa khi giải phóng ────────
            ray.setThoiGianBatDauPhongToa(null);
            ray.setThoiGianKetThucPhongToa(null);
            duongRayRepo.save(ray);
        }

        // Cập nhật trạng thái sự cố -> DA_XU_LY
        SuCo suCo = suCoRepo.findById(maSuCo)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sự cố: " + maSuCo));
        suCo.setTrangThaiXuLy("DA_XU_LY");
        suCo.setNgayXuLy(LocalDateTime.now());
        suCoRepo.save(suCo);

        // Ghi nhật ký
        ghiNhatKy(maTaiKhoan, "GIAI_PHONG_RAY", "SU_CO", maSuCo,
                "Trạng thái ray: " + trangThaiCu,
                "Sự cố " + maSuCo + " đã xử lý xong" + (maRay != null ? ", ray " + maRay + " → SAN_SANG" : " (không có ray)"),
                diaChiIp);
    }

    /**
     * Tự động kiểm tra và giải phóng đường ray PHONG_TOA_TAM
     * Được gọi sau mỗi lần xử lý lịch trình (HUY_CHUYEN / DOI_RAY)
     * Điều kiện: không còn lịch trình nào ở trạng thái CHO_RAY và ray là PHONG_TOA_TAM
     */
    private void kiemTraTuDongGiaiPhongRay(LichTrinh lichTrinh, String maTaiKhoan, String diaChiIp) {
        String maSuCo = lichTrinh.getMaSuCoAnhHuong();
        if (maSuCo == null) return;

        SuCo suCo = suCoRepo.findById(maSuCo).orElse(null);
        if (suCo == null) return;

        // Không tự động giải phóng nếu sự cố đã xử lý xong hoặc chưa bắt đầu
        if ("DA_XU_LY".equals(suCo.getTrangThaiXuLy())) return;

        // Kiểm tra còn lịch trình CHO_RAY không
        List<LichTrinh> conChuaXuLy = lichTrinhRepo.findByMaSuCoAnhHuongAndPhuongAnXuLy(maSuCo, "CHO_RAY");
        if (!conChuaXuLy.isEmpty()) return; // Còn lịch trình chưa xử lý — chưa giải phóng

        // Lấy đường ray của sự cố
        if (suCo.getMaRay() == null) return;
        DuongRay ray = duongRayRepo.findById(suCo.getMaRay()).orElse(null);
        if (ray == null) return;

        // Chỉ tự động giải phóng PHONG_TOA_TAM — PHONG_TOA_CUNG cần BQL thao tác thủ công
        if (!"PHONG_TOA_TAM".equals(ray.getTrangThai())) return;

        String trangThaiCu = ray.getTrangThai();

        // Giải phóng ray
        ray.setTrangThai("SAN_SANG");
        ray.setThoiGianXuLyUocTinh(null);
        ray.setThoiGianPhongToaUocTinh(null);
        // ── Phương án 2: xóa cửa sổ phong tỏa ───────────────────────────
        ray.setThoiGianBatDauPhongToa(null);
        ray.setThoiGianKetThucPhongToa(null);
        duongRayRepo.save(ray);

        // Đánh dấu sự cố là DA_XU_LY
        suCo.setTrangThaiXuLy("DA_XU_LY");
        suCo.setNgayXuLy(LocalDateTime.now());
        suCoRepo.save(suCo);

        // Ghi nhật ký tự động
        ghiNhatKy(maTaiKhoan,
                "TU_DONG_GIAI_PHONG_RAY",
                "DUONG_RAY",
                suCo.getMaRay(),
                "Trạng thái: " + trangThaiCu,
                "Trạng thái: SAN_SANG — Tự động giải phóng sau khi xử lý hết lịch trình bị ảnh hưởng bởi sự cố " + maSuCo,
                diaChiIp);
    }

    /**
     * Ghi nhật ký hệ thống
     */
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

    /**
     * Lấy danh sách lịch trình bị ảnh hưởng bởi sự cố (bao gồm tĩnh và động)
     */
    public List<LichTrinh> layLichTrinhBiAnhHuong(String maSuCo) {
        // 1. Luôn lấy những lịch trình đã được gắn thẻ trực tiếp (do liên đới, trễ, hoặc đã gắn thẻ lúc tiếp nhận)
        List<LichTrinh> tagged = new java.util.ArrayList<>(lichTrinhRepo.findByMaSuCoAnhHuong(maSuCo));

        // 2. Tính toán động: Nếu sự cố đang phong tỏa ray, quét tất cả lịch trình trên ray đó
        SuCo suCo = suCoRepo.findById(maSuCo).orElse(null);
        if (suCo != null && suCo.getMaRay() != null) {
            DuongRay ray = duongRayRepo.findById(suCo.getMaRay()).orElse(null);
            if (ray != null && ("PHONG_TOA_TAM".equals(ray.getTrangThai()) || "PHONG_TOA_CUNG".equals(ray.getTrangThai()))) {
                
                LocalDateTime batDau = suCo.getNgayXayRa() != null ? suCo.getNgayXayRa() : LocalDateTime.now();
                LocalDateTime ketThuc = tinhThoiDiemKetThucAnhHuong(suCo, ray);
                String ngaySuCo = batDau.toLocalDate().toString();
                
                List<LichTrinh> lichTrinhTrenRay = lichTrinhRepo.findByNgayChayChuyenTauAndMaRay(ngaySuCo, ray.getMaRay());
                
                for (LichTrinh lt : lichTrinhTrenRay) {
                    // Bỏ qua nếu đã có trong danh sách tagged
                    boolean alreadyAdded = tagged.stream().anyMatch(t -> t.getMaLichTrinh().equals(lt.getMaLichTrinh()));
                    if (alreadyAdded) continue;

                    LocalDateTime gioDen = lt.getGioDenDuKien();
                    LocalDateTime gioDi  = lt.getGioDiDuKien();
                    LocalDateTime winStart, winEnd;

                    if (gioDen == null && gioDi != null) {
                        winStart = gioDi.minusMinutes(30);
                        winEnd   = gioDi.plusMinutes(15);
                    } else if (gioDi == null && gioDen != null) {
                        winStart = gioDen.minusMinutes(1);
                        winEnd   = gioDen.plusMinutes(30);
                    } else if (gioDen != null && gioDi != null) {
                        winStart = gioDen.minusMinutes(1);
                        winEnd   = gioDi.plusMinutes(15);
                    } else {
                        continue;
                    }

                    if (!winEnd.isBefore(batDau) && !winStart.isAfter(ketThuc)) {
                        tagged.add(lt);
                    }
                }
            }
        }
        return tagged;
    }

    /**
     * Kiểm tra điều kiện vận hành khẩn cấp
     */
    public boolean kiemTraVanHanhKhanCap(SuCo suCo) {
        // Nếu loại sự cố là MẤT LIÊN LẠC > 10 phút
        if ("MAT_LIEN_LAC".equals(suCo.getLoaiSuCo())) {
            long phutTre = java.time.Duration.between(
                    suCo.getNgayXayRa(), LocalDateTime.now()).toMinutes();
            return phutTre > 10;
        }
        return false;
    }

    /**
     * UC-06: Xử lý trễ chuyến
     * Cập nhật số phút trễ và tính toán lại lịch trình
     */
    @Transactional
    public void xuLyTreChuyen(String maLichTrinh, int soPhutTre, String lyDo, 
                              String maTaiKhoan, String diaChiIp) {
        LichTrinh lichTrinh = lichTrinhRepo.findById(maLichTrinh)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch trình"));
        
        int soPhutTreCu = lichTrinh.getSoPhutTre() != null ? lichTrinh.getSoPhutTre() : 0;
        
        // Cập nhật số phút trễ
        lichTrinh.setSoPhutTre(soPhutTre);
        
        // Tính toán lại giờ đến/đi dự kiến
        if (lichTrinh.getGioDenDuKien() != null && soPhutTre > soPhutTreCu) {
            int chenh = soPhutTre - soPhutTreCu;
            lichTrinh.setGioDenDuKien(lichTrinh.getGioDenDuKien().plusMinutes(chenh));
        }
        if (lichTrinh.getGioDiDuKien() != null && soPhutTre > soPhutTreCu) {
            int chenh = soPhutTre - soPhutTreCu;
            lichTrinh.setGioDiDuKien(lichTrinh.getGioDiDuKien().plusMinutes(chenh));
        }
        
        // Cập nhật trạng thái
        int delayThreshold = getRuleValue("QT-05", 15);
        if (soPhutTre >= delayThreshold) {
            lichTrinh.setTrangThai("TRE_NGHIEM_TRONG");
        } else if (soPhutTre > 0) {
            lichTrinh.setTrangThai("TRE");
        }
        
        // Lưu ghi chú lý do
        if (lyDo != null && !lyDo.trim().isEmpty()) {
            String ghiChuCu = lichTrinh.getGhiChu() != null ? lichTrinh.getGhiChu() : "";
            lichTrinh.setGhiChu(ghiChuCu + "\n[Trễ " + soPhutTre + "p] " + lyDo);
        }
        
        lichTrinhRepo.save(lichTrinh);
        
        // Tính toán ảnh hưởng đến các chuyến kế tiếp
        if (soPhutTre > soPhutTreCu) {
            tinhToanAnhHuongChuyenKeTiep(lichTrinh, soPhutTre - soPhutTreCu);
        }
        
        // Ghi nhật ký
        ghiNhatKy(maTaiKhoan, "XU_LY_TRE_CHUYEN", "LICH_TRINH", maLichTrinh,
                "Số phút trễ: " + soPhutTreCu,
                "Số phút trễ: " + soPhutTre + ", Lý do: " + lyDo,
                diaChiIp);
    }

    /**
     * Tính toán ảnh hưởng domino đến các chuyến kế tiếp
     */
    private void tinhToanAnhHuongChuyenKeTiep(LichTrinh lichTrinhGoc, int soPhutTreBoSung) {
        // Tìm các chuyến tàu cùng đường ray sau thời điểm này
        if (lichTrinhGoc.getMaRay() == null || lichTrinhGoc.getGioDiDuKien() == null) {
            return;
        }
        
        List<LichTrinh> lichTrinhSau = lichTrinhRepo.findByMaRay(lichTrinhGoc.getMaRay());
        
        for (LichTrinh lt : lichTrinhSau) {
            if (lt.getGioDenDuKien() != null && 
                lt.getGioDenDuKien().isAfter(lichTrinhGoc.getGioDiDuKien())) {
                
                // Kiểm tra xem có bị ảnh hưởng không
                long khoangCachPhut = java.time.Duration.between(
                        lichTrinhGoc.getGioDiDuKien(), 
                        lt.getGioDenDuKien()
                ).toMinutes();
                
                int influenceThreshold = getRuleValue("QT-05", 15) * 2; // Gấp đôi ngưỡng cảnh báo
                if (khoangCachPhut < influenceThreshold) {
                    int soPhutTreHienTai = lt.getSoPhutTre() != null ? lt.getSoPhutTre() : 0;
                    int soPhutTreMoi = soPhutTreHienTai + (soPhutTreBoSung / 2); // Giảm dần
                    
                    lt.setSoPhutTre(soPhutTreMoi);
                    if (lt.getGioDenDuKien() != null) {
                        lt.setGioDenDuKien(lt.getGioDenDuKien().plusMinutes(soPhutTreBoSung / 2));
                    }
                    if (lt.getGioDiDuKien() != null) {
                        lt.setGioDiDuKien(lt.getGioDiDuKien().plusMinutes(soPhutTreBoSung / 2));
                    }
                    
                    lichTrinhRepo.save(lt);
                }
            }
        }
    }

    /**
     * Kiểm tra ngưỡng 20 phút - Yêu cầu thu hồi lệnh
     */
    public boolean kiemTraNguong20Phut(LichTrinh lichTrinh) {
        int threshold = getRuleValue("QT-05", 15);
        if (lichTrinh.getSoPhutTre() != null && lichTrinh.getSoPhutTre() >= threshold) {
            // Kiểm tra xem tàu đã xuất phát chưa
            if (lichTrinh.getGioDiThucTe() == null) {
                return true; // Cần thu hồi lệnh
            }
        }
        return false;
    }

    /**
     * Thu hồi lệnh và giải phóng ray (Ngưỡng 20 phút)
     */
    @Transactional
    public void thuHoiLenhGiaiPhongRay(String maLichTrinh, String lyDo, 
                                       String maTaiKhoan, String diaChiIp) {
        LichTrinh lichTrinh = lichTrinhRepo.findById(maLichTrinh)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch trình"));
        
        String trangThaiCu = lichTrinh.getTrangThai();
        String maRayCu = lichTrinh.getMaRay();
        
        // Giải phóng ray
        if (lichTrinh.getMaRay() != null) {
            DuongRay ray = duongRayRepo.findById(lichTrinh.getMaRay())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy đường ray"));
            
            ray.setTrangThai("SAN_SANG");
            duongRayRepo.save(ray);
        }
        
        // Hủy lịch trình
        lichTrinh.setTrangThai("HUY_CHUYEN");
        lichTrinh.setPhuongAnXuLy("HUY_CHUYEN");
        
        // Lưu lý do
        String ghiChuCu = lichTrinh.getGhiChu() != null ? lichTrinh.getGhiChu() : "";
        lichTrinh.setGhiChu(ghiChuCu + "\n[Thu hồi lệnh] " + lyDo);
        
        lichTrinhRepo.save(lichTrinh);
        
        // Ghi nhật ký
        ghiNhatKy(maTaiKhoan, "THU_HOI_LENH", "LICH_TRINH", maLichTrinh,
                "Trạng thái: " + trangThaiCu + ", Ray: " + maRayCu,
                "Trạng thái: HUY_CHUYEN, Lý do: " + lyDo,
                diaChiIp);
    }

    /**
     * Lấy danh sách sự cố của người ghi nhận (NVNH xem báo cáo của mình)
     */
    public List<SuCo> layBaoCaoCuaToi(String maTaiKhoan) {
        return suCoRepo.findByMaNguoiGhiNhanOrderByNgayTaoDesc(maTaiKhoan);
    }

    /**
     * Tìm sự cố theo mã
     */
    public SuCo timSuCoTheoMa(String maSuCo) {
        return suCoRepo.findById(maSuCo)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sự cố: " + maSuCo));
    }

    /**
     * Lưu sự cố
     */
    public SuCo luuSuCo(SuCo suCo) {
        return suCoRepo.save(suCo);
    }

    /**
     * UC-06: Điều chỉnh giờ lịch trình (tàu không cần đổi ray, chỉ trễ giờ)
     * NVĐH nhập giờ đến/đi mới, hệ thống tính số phút trễ và ghi nhận.
     */
    @Transactional
    public void dieuChinhGioLichTrinh(String maLichTrinh,
                                      String gioDenDuKienMoi,
                                      String gioDiDuKienMoi,
                                      String maTaiKhoan,
                                      String diaChiIp) {

        LichTrinh lt = lichTrinhRepo.findById(maLichTrinh)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch trình: " + maLichTrinh));

        StringBuilder logCu  = new StringBuilder();
        StringBuilder logMoi = new StringBuilder();

        // Cập nhật giờ đến
        if (gioDenDuKienMoi != null && !gioDenDuKienMoi.isBlank()) {
            LocalDateTime gioMoi = LocalDateTime.parse(gioDenDuKienMoi);
            logCu.append("GioDen: ").append(lt.getGioDenDuKien());
            lt.setGioDenDuKien(gioMoi);
            logMoi.append("GioDen: ").append(gioMoi);
        }

        // Cập nhật giờ đi
        if (gioDiDuKienMoi != null && !gioDiDuKienMoi.isBlank()) {
            LocalDateTime gioMoi = LocalDateTime.parse(gioDiDuKienMoi);
            if (logCu.length() > 0) { logCu.append(", "); logMoi.append(", "); }
            logCu.append("GioDi: ").append(lt.getGioDiDuKien());
            lt.setGioDiDuKien(gioMoi);
            logMoi.append("GioDi: ").append(gioMoi);
        }

        // Tính số phút trễ dựa trên giờ đến thực tế nếu có
        if (lt.getGioDenThucTe() != null && lt.getGioDenDuKien() != null) {
            long phutTre = java.time.Duration.between(lt.getGioDenDuKien(), lt.getGioDenThucTe()).toMinutes();
            lt.setSoPhutTre((int) Math.max(0, phutTre));
        }

        // Đánh dấu phương án xử lý
        lt.setPhuongAnXuLy("DIEU_CHINH_GIO");
        lt.setNgayCapNhat(LocalDateTime.now());
        lt.setMaNguoiCapNhat(maTaiKhoan);

        lichTrinhRepo.save(lt);

        // Ghi nhật ký
        ghiNhatKy(maTaiKhoan, "DIEU_CHINH_GIO", "LICH_TRINH", maLichTrinh,
                logCu.toString(), "DIEU_CHINH_GIO — " + logMoi.toString(), diaChiIp);
    }
}
