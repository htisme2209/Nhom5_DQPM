package com.danang.railway.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Bảng bộ ghi (Switch/Turnout) — mô hình hóa điểm chuyển ray trong ga.
 * Mỗi bộ ghi kết nối 2 đường ray và có vị trí Km cùng thời gian tác nghiệp.
 */
@Entity
@Table(name = "BO_GHI")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BoGhi {

    @Id
    @Column(name = "ma_bo_ghi", length = 30)
    private String maBoGhi; // VD: BG_N1_R1_R2

    @Column(name = "ray_bat_dau", length = 20, nullable = false)
    private String rayBatDau; // Ray hiện tại

    @Column(name = "ray_ket_noi", length = 20, nullable = false)
    private String rayKetNoi; // Ray có thể chuyển sang

    @Column(name = "vi_tri_km", nullable = false)
    private Double viTriKm; // Vị trí chính xác trên tuyến (VD: 791.500)

    @Column(name = "thoi_gian_tac_nghiep", nullable = false)
    private Integer thoiGianTacNghiep; // T (phút) cần để bẻ ghi và kiểm tra an toàn

    @Column(name = "trang_thai", length = 20, nullable = false)
    private String trangThai = "SAN_SANG"; // SAN_SANG, DANG_SU_DUNG, BAO_TRI

    @Column(name = "ghi_chu", length = 500)
    private String ghiChu;
}
