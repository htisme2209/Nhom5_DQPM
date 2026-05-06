package com.danang.railway.repository;

import com.danang.railway.entity.SuCo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SuCoRepository extends JpaRepository<SuCo, String> {
    List<SuCo> findByTrangThaiXuLy(String trangThai);
    List<SuCo> findByMaRay(String maRay);
    List<SuCo> findByMaLichTrinh(String maLichTrinh);
    List<SuCo> findByMaNguoiGhiNhan(String maNguoiGhiNhan);
    List<SuCo> findByMaNguoiGhiNhanOrderByNgayTaoDesc(String maNguoiGhiNhan);

    // UC-10: Kiểm tra sự cố mất liên lạc đã tồn tại
    boolean existsByMaLichTrinhAndLoaiSuCo(String maLichTrinh, String loaiSuCo);

    // SLA: Tìm sự cố đang xử lý chưa hoàn thành (để worker quét)
    @Query("SELECT s FROM SuCo s WHERE s.trangThaiXuLy = 'DANG_XU_LY' AND s.hanChotPhuongAn IS NOT NULL")
    List<SuCo> findDangXuLyCoHanChot();

    // SLA: Tìm sự cố theo trạng thái SLA
    List<SuCo> findByTrangThaiSLA(String trangThaiSLA);

    // SLA: Tìm sự cố đang xử lý hoặc chờ tiếp nhận (chưa hoàn thành)
    @Query("SELECT s FROM SuCo s WHERE s.trangThaiXuLy IN ('CHO_TIEP_NHAN', 'DANG_XU_LY')")
    List<SuCo> findChuaHoanThanh();
}

