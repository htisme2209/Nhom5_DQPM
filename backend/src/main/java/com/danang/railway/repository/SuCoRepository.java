package com.danang.railway.repository;

import com.danang.railway.entity.SuCo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SuCoRepository extends JpaRepository<SuCo, String> {
    List<SuCo> findByTrangThaiXuLy(String trangThai);
    List<SuCo> findByMaRay(String maRay);
    List<SuCo> findByMaLichTrinh(String maLichTrinh);
    List<SuCo> findByMaNguoiGhiNhan(String maNguoiGhiNhan);
    List<SuCo> findByMaNguoiGhiNhanOrderByNgayTaoDesc(String maNguoiGhiNhan);

    // UC-10: Kiểm tra sự cố mất liên lạc đã tồn tại
    boolean existsByMaLichTrinhAndLoaiSuCo(String maLichTrinh, String loaiSuCo);
}

