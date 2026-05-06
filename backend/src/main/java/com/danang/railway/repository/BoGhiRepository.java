package com.danang.railway.repository;

import com.danang.railway.entity.BoGhi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BoGhiRepository extends JpaRepository<BoGhi, String> {

    /**
     * Tìm bộ ghi kết nối giữa 2 ray (cả 2 chiều)
     */
    @Query("SELECT b FROM BoGhi b WHERE " +
           "(b.rayBatDau = :ray1 AND b.rayKetNoi = :ray2) OR " +
           "(b.rayBatDau = :ray2 AND b.rayKetNoi = :ray1)")
    List<BoGhi> findByRayConnection(@Param("ray1") String ray1, @Param("ray2") String ray2);

    /**
     * Tìm tất cả bộ ghi liên quan đến một ray
     */
    List<BoGhi> findByRayBatDauOrRayKetNoi(String rayBatDau, String rayKetNoi);

    /**
     * Tìm bộ ghi sẵn sàng giữa 2 ray
     */
    @Query("SELECT b FROM BoGhi b WHERE b.trangThai = 'SAN_SANG' AND " +
           "((b.rayBatDau = :ray1 AND b.rayKetNoi = :ray2) OR " +
           " (b.rayBatDau = :ray2 AND b.rayKetNoi = :ray1))")
    List<BoGhi> findAvailableByRayConnection(@Param("ray1") String ray1, @Param("ray2") String ray2);
}
