package com.danang.railway.service;

import com.danang.railway.entity.LichTrinh;
import com.danang.railway.exception.BusinessRuleException;
import com.danang.railway.repository.LichTrinhRepository;
import com.danang.railway.repository.QuyTacNghiepVuRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Service xử lý logic nghiệp vụ lịch trình tàu
 * Bao gồm các validation rules quan trọng
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LichTrinhService {

    private final LichTrinhRepository lichTrinhRepository;
    private final QuyTacNghiepVuRepository quyTacRepository;

    private int getRuleValue(String maQuyTac, int defaultValue) {
        return quyTacRepository.findById(maQuyTac)
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
     * Tạo lịch trình mới với đầy đủ validation
     */
    @Transactional
    public LichTrinh taoLichTrinh(LichTrinh lichTrinh) {
        log.info("Tạo lịch trình mới: {}", lichTrinh.getMaChuyenTau());
        
        LocalDateTime now = LocalDateTime.now();
        
        // Validation 1: Không được tạo lịch trình trong quá khứ
        kiemTraKhongChoPhepQuaKhu(lichTrinh, now);
        
        // Validation 2: Phải tạo trước ít nhất 24 giờ
        kiemTraTaoTruoc24Gio(lichTrinh, now);
        
        // Validation 3: Đảm bảo khoảng cách 10 phút giữa các tàu
        kiemTraKhoangCachGiuaCacTau(lichTrinh);
        
        // Tạo mã lịch trình nếu chưa có
        if (lichTrinh.getMaLichTrinh() == null || lichTrinh.getMaLichTrinh().isEmpty()) {
            lichTrinh.setMaLichTrinh("LT-" + System.currentTimeMillis());
        }
        
        // Set trạng thái mặc định — lịch trình đã chọn ray khi tạo nên mặc định là DA_XAC_NHAN
        if (lichTrinh.getTrangThai() == null) {
            lichTrinh.setTrangThai("DA_XAC_NHAN");
        }
        
        // Set thời gian tạo
        lichTrinh.setNgayTao(now);
        lichTrinh.setNgayCapNhat(now);
        
        LichTrinh saved = lichTrinhRepository.save(lichTrinh);
        log.info("Đã tạo lịch trình thành công: {}", saved.getMaLichTrinh());
        
        return saved;
    }

    /**
     * Cập nhật lịch trình với validation
     */
    @Transactional
    public LichTrinh capNhatLichTrinh(String maLichTrinh, LichTrinh lichTrinhMoi) {
        log.info("Cập nhật lịch trình: {}", maLichTrinh);
        
        LichTrinh lichTrinhCu = lichTrinhRepository.findById(maLichTrinh)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch trình: " + maLichTrinh));
        
        LocalDateTime now = LocalDateTime.now();
        
        // Kiểm tra thay đổi thời gian (null-safe: một số loại tàu không có đủ cả 2 trường)
        boolean thayDoiThoiGian =
            !java.util.Objects.equals(lichTrinhCu.getGioDenDuKien(), lichTrinhMoi.getGioDenDuKien()) ||
            !java.util.Objects.equals(lichTrinhCu.getGioDiDuKien(),  lichTrinhMoi.getGioDiDuKien());
        
        if (thayDoiThoiGian) {
            kiemTraKhongChoPhepQuaKhu(lichTrinhMoi, now);
            kiemTraTaoTruoc24Gio(lichTrinhMoi, now);
            kiemTraKhoangCachGiuaCacTau(lichTrinhMoi, maLichTrinh);
        }
        
        // Cập nhật các trường
        lichTrinhMoi.setMaLichTrinh(maLichTrinh);
        lichTrinhMoi.setNgayTao(lichTrinhCu.getNgayTao());
        lichTrinhMoi.setNgayCapNhat(now);
        
        LichTrinh saved = lichTrinhRepository.save(lichTrinhMoi);
        log.info("Đã cập nhật lịch trình thành công: {}", saved.getMaLichTrinh());
        
        return saved;
    }

    /**
     * VALIDATION 1: Không cho phép tạo lịch trình trong quá khứ
     */
    private void kiemTraKhongChoPhepQuaKhu(LichTrinh lichTrinh, LocalDateTime now) {
        if (lichTrinh.getGioDenDuKien() != null && lichTrinh.getGioDenDuKien().isBefore(now)) {
            throw new RuntimeException(String.format(
                    "Không thể tạo lịch trình trong quá khứ. Giờ đến dự kiến (%s) phải sau thời điểm hiện tại (%s)",
                    lichTrinh.getGioDenDuKien(),
                    now
            ));
        }
        
        if (lichTrinh.getGioDiDuKien() != null && lichTrinh.getGioDiDuKien().isBefore(now)) {
            throw new RuntimeException(String.format(
                    "Không thể tạo lịch trình trong quá khứ. Giờ đi dự kiến (%s) phải sau thời điểm hiện tại (%s)",
                    lichTrinh.getGioDiDuKien(),
                    now
            ));
        }
    }

    /**
     * VALIDATION 2: Phải tạo trước ít nhất một khoảng thời gian quy định
     */
    private void kiemTraTaoTruoc24Gio(LichTrinh lichTrinh, LocalDateTime now) {
        int thoiGianTaoTruocGiao = 24; // Fallback mặc định
        
        LocalDateTime gioChaySomNhat = lichTrinh.getGioDenDuKien();
        if (lichTrinh.getGioDiDuKien() != null && 
            (gioChaySomNhat == null || lichTrinh.getGioDiDuKien().isBefore(gioChaySomNhat))) {
            gioChaySomNhat = lichTrinh.getGioDiDuKien();
        }
        
        if (gioChaySomNhat == null) {
            throw new RuntimeException("Phải có ít nhất một trong hai: giờ đến dự kiến hoặc giờ đi dự kiến");
        }
        
        long gioConLai = ChronoUnit.HOURS.between(now, gioChaySomNhat);
        
        if (gioConLai < thoiGianTaoTruocGiao) {
            throw new BusinessRuleException(String.format(
                    "Lịch trình thông thường phải được tạo trước ít nhất %d giờ. " +
                    "Hiện tại chỉ còn %d giờ đến giờ chạy (%s). " +
                    "Vui lòng chuyển sang luồng xử lý sự cố nếu cần tạo lịch trình gấp.",
                    thoiGianTaoTruocGiao,
                    gioConLai,
                    gioChaySomNhat
            ), "ERR_LEAD_TIME_24H");
        }
    }

    /**
     * VALIDATION 3: Đảm bảo các quy tắc về khoảng cách và chiếm dụng ray
     */
    private void kiemTraKhoangCachGiuaCacTau(LichTrinh lichTrinhMoi) {
        kiemTraKhoangCachGiuaCacTau(lichTrinhMoi, null);
    }
    
    private void kiemTraKhoangCachGiuaCacTau(LichTrinh lichTrinhMoi, String maLichTrinhBoQua) {
        // 1. Kiểm tra khoảng cách xuất phát TOÀN MẠNG (QT-10)
        kiemTraKhoangCachXuatPhatToanMang(lichTrinhMoi, maLichTrinhBoQua);
        
        // 2. Kiểm tra xung đột chiếm dụng trên CÙNG MỘT RAY (QT-01, QT-02, QT-03)
        kiemTraXungDotCungRay(lichTrinhMoi, maLichTrinhBoQua);
    }

    private void kiemTraKhoangCachXuatPhatToanMang(LichTrinh lichTrinhMoi, String maLichTrinhBoQua) {
        if (lichTrinhMoi.getGioDiDuKien() == null) return;

        int minGapToanMang = getRuleValue("QT-10", 10);
        LocalDateTime gioDiMoi = lichTrinhMoi.getGioDiDuKien();
        
        List<LichTrinh> ganKe = lichTrinhRepository.findByGioDiDuKienBetween(
                gioDiMoi.minusMinutes(minGapToanMang), 
                gioDiMoi.plusMinutes(minGapToanMang)
        );

        for (LichTrinh lt : ganKe) {
            if (maLichTrinhBoQua != null && lt.getMaLichTrinh().equals(maLichTrinhBoQua)) continue;
            if (lt.getGioDiDuKien() == null) continue;

            long gap = Math.abs(ChronoUnit.MINUTES.between(gioDiMoi, lt.getGioDiDuKien()));
            if (gap < minGapToanMang) {
                throw new BusinessRuleException(String.format(
                        "Khoảng cách xuất phát giữa 2 tàu bất kỳ phải ít nhất %d phút (Quy tắc QT-10). " +
                        "Tàu %s xuất phát lúc %s (cách %d phút).",
                        minGapToanMang, lt.getMaChuyenTau(), lt.getGioDiDuKien().toLocalTime(), gap
                ), "ERR_DEPARTURE_GAP");
            }
        }
    }

    private void kiemTraXungDotCungRay(LichTrinh lichTrinhMoi, String maLichTrinhBoQua) {
        if (lichTrinhMoi.getMaRay() == null) return;

        List<LichTrinh> cungRay = lichTrinhRepository.findByMaRay(lichTrinhMoi.getMaRay());
        TrackWindow wMoi = calculateTrackWindow(lichTrinhMoi);
        if (wMoi == null) return;

        for (LichTrinh lt : cungRay) {
            if (maLichTrinhBoQua != null && lt.getMaLichTrinh().equals(maLichTrinhBoQua)) continue;
            
            TrackWindow wCu = calculateTrackWindow(lt);
            if (wCu == null) continue;

            if (wMoi.overlaps(wCu)) {
                throw new BusinessRuleException(String.format(
                        "Xung đột chiếm dụng ray %s: Tàu %s đã chiếm dụng ray này từ %s đến %s (bao gồm thời gian đệm).",
                        lichTrinhMoi.getMaRay(), lt.getMaChuyenTau(), 
                        wCu.start.toLocalTime(), wCu.end.toLocalTime()
                ), "ERR_TRACK_CONFLICT");
            }
        }
    }

    private TrackWindow calculateTrackWindow(LichTrinh lt) {
        int bufferMin = getRuleValue("QT-01", 15);
        int boardingMin = getRuleValue("QT-02", 30);
        int dwellMin = getRuleValue("QT-03", 20);

        // Giống logic Frontend/Optimizer
        if (lt.getGioDiDuKien() != null && lt.getGioDenDuKien() == null) { // XUAT_PHAT
            return new TrackWindow(lt.getGioDiDuKien().minusMinutes(boardingMin), lt.getGioDiDuKien().plusMinutes(bufferMin));
        } else if (lt.getGioDenDuKien() != null && lt.getGioDiDuKien() == null) { // DIEM_CUOI
            return new TrackWindow(lt.getGioDenDuKien().minusMinutes(1), lt.getGioDenDuKien().plusMinutes(dwellMin + bufferMin));
        } else if (lt.getGioDenDuKien() != null && lt.getGioDiDuKien() != null) { // TRUNG_GIAN
            return new TrackWindow(lt.getGioDenDuKien().minusMinutes(1), lt.getGioDiDuKien().plusMinutes(bufferMin));
        }
        return null;
    }

    private static class TrackWindow {
        LocalDateTime start;
        LocalDateTime end;

        TrackWindow(LocalDateTime s, LocalDateTime e) { this.start = s; this.end = e; }
        boolean overlaps(TrackWindow other) {
            return !(this.end.isBefore(other.start) || this.end.isEqual(other.start) || 
                     other.end.isBefore(this.start) || other.end.isEqual(this.start));
        }
    }
}
