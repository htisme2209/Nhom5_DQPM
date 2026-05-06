package com.danang.railway.repository;

import com.danang.railway.entity.LichTrinh;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface LichTrinhRepository extends JpaRepository<LichTrinh, String> {
    List<LichTrinh> findByMaChuyenTau(String maChuyenTau);
    List<LichTrinh> findByMaRay(String maRay);
    List<LichTrinh> findByTrangThai(String trangThai);
    @Query("SELECT lt FROM LichTrinh lt JOIN FETCH lt.chuyenTau ct JOIN FETCH ct.tau")
    List<LichTrinh> findAllWithDetails();
    // ── Lọc theo ngày chạy (join sang ChuyenTau) ──────────────────────────────
    /**
     * Lấy tất cả LichTrinh theo ngayChay của ChuyenTau liên kết.
     * Áp dụng cho mọi loại tàu (XUAT_PHAT / DIEM_CUOI / TRUNG_GIAN)
     * vì ngayChay nằm ở ChuyenTau, không phải LichTrinh.
     */
    @Query("SELECT l FROM LichTrinh l JOIN ChuyenTau c ON l.maChuyenTau = c.maChuyenTau " +
           "WHERE c.ngayChay = :ngayChay")
    List<LichTrinh> findByNgayChayChuyenTau(@Param("ngayChay") String ngayChay);

    /**
     * Lọc thêm theo maRay kết hợp ngayChay.
     */
    @Query("SELECT l FROM LichTrinh l JOIN ChuyenTau c ON l.maChuyenTau = c.maChuyenTau " +
           "WHERE c.ngayChay = :ngayChay AND l.maRay = :maRay")
    List<LichTrinh> findByNgayChayChuyenTauAndMaRay(
            @Param("ngayChay") String ngayChay,
            @Param("maRay") String maRay);

    // ── Queries cũ (giữ lại để các service khác dùng) ─────────────────────────
    @Query("SELECT l FROM LichTrinh l WHERE l.gioDenDuKien >= :start AND l.gioDenDuKien <= :end")
    List<LichTrinh> findByGioDenDuKienBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(l) FROM LichTrinh l WHERE l.soPhutTre > 0 AND l.gioDenDuKien >= :start AND l.gioDenDuKien <= :end")
    long countTreChuyen(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(l) FROM LichTrinh l WHERE l.gioDenDuKien >= :start AND l.gioDenDuKien <= :end")
    long countTotalChuyen(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // Queries cho UC-09 và UC-06
    List<LichTrinh> findByMaSuCoAnhHuong(String maSuCo);
    
    List<LichTrinh> findByMaSuCoAnhHuongAndPhuongAnXuLy(String maSuCo, String phuongAnXuLy);
    
    // Queries cho UC-10: Xác nhận tàu
    @Query("SELECT l FROM LichTrinh l WHERE l.gioDenDuKien >= :start AND l.gioDenDuKien <= :end AND l.trangThai IN :trangThais ORDER BY l.gioDenDuKien ASC")
    List<LichTrinh> findByNgayChayBetweenAndTrangThaiIn(
        @Param("start") LocalDateTime start, 
        @Param("end") LocalDateTime end, 
        @Param("trangThais") List<String> trangThais
    );
    
    // Query cho validation khoảng cách giữa các tàu xuất phát
    @Query("SELECT l FROM LichTrinh l WHERE l.gioDiDuKien >= :start AND l.gioDiDuKien <= :end ORDER BY l.gioDiDuKien ASC")
    List<LichTrinh> findByGioDiDuKienBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
