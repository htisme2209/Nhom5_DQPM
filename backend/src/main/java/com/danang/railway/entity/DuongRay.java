package com.danang.railway.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "DUONG_RAY")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class DuongRay {

    @Id
    @Column(name = "ma_ray", length = 20)
    private String maRay;

    @Column(name = "ma_ga", length = 20, nullable = false)
    private String maGa;

    @Column(name = "so_ray", nullable = false, unique = true)
    private Integer soRay;

    @Column(name = "chieu_dai_ray", precision = 7, scale = 2, nullable = false)
    private BigDecimal chieuDaiRay;

    @Column(name = "trang_thai", length = 20, nullable = false)
    private String trangThai = "SAN_SANG";

    @Column(name = "ghi_chu", length = 500)
    private String ghiChu;

    @Column(name = "ngay_tao", nullable = false)
    private LocalDateTime ngayTao;

    @Column(name = "ngay_cap_nhat")
    private LocalDateTime ngayCapNhat;

    @Column(name = "thoi_gian_xu_ly_uoc_tinh")
    private Integer thoiGianXuLyUocTinh;

    @Column(name = "thoi_gian_phong_toa_uoc_tinh")
    private Integer thoiGianPhongToaUocTinh;

    /**
     * Phương án 2: Cửa sổ thời gian phong tỏa thực tế.
     * Chỉ set khi ray bị phong tỏa (trangThai = PHONG_TOA_TAM / PHONG_TOA_CUNG).
     * Set về NULL khi giải phóng (trangThai = SAN_SANG).
     * Frontend dùng 2 field này thay vì trangThai để kiểm tra "có đang phong tỏa không".
     */
    @Column(name = "thoi_gian_bat_dau_phong_toa")
    private LocalDateTime thoiGianBatDauPhongToa;

    @Column(name = "thoi_gian_ket_thuc_phong_toa")
    private LocalDateTime thoiGianKetThucPhongToa;

    @PrePersist
    protected void onCreate() {
        ngayTao = LocalDateTime.now();
        ngayCapNhat = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        ngayCapNhat = LocalDateTime.now();
    }
}
