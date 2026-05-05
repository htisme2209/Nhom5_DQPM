package com.danang.railway.repository;

import com.danang.railway.entity.QuyTacNghiepVu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuyTacNghiepVuRepository extends JpaRepository<QuyTacNghiepVu, String> {
    List<QuyTacNghiepVu> findByNhomQuyTac(String nhomQuyTac);
}
