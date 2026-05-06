package com.danang.railway.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "NHAT_KY")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class NhatKy {

    @Id
    @Column(name = "ma_nhat_ky", length = 20)
    private String maNhatKy;

    @Column(name = "ma_tai_khoan", length = 20)
    private String maTaiKhoan;

    @Column(name = "hanh_dong", length = 200, nullable = false)
    private String hanhDong;

    @Column(name = "doi_tuong", length = 100, nullable = false)
    private String doiTuong;

    @Column(name = "ma_doi_tuong", length = 50)
    private String maDoiTuong;

    @Column(name = "noi_dung_cu", length = 2000)
    private String noiDungCu;

    @Column(name = "noi_dung_moi", length = 2000)
    private String noiDungMoi;

    @Column(name = "dia_chi_ip", length = 45, nullable = false)
    private String diaChiIp;

    @Column(name = "thoi_gian", nullable = false)
    private LocalDateTime thoiGian;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_tai_khoan", insertable = false, updatable = false)
    @JsonIgnore
    private TaiKhoan taiKhoan;

    @PrePersist
    protected void onCreate() {
        thoiGian = LocalDateTime.now();
    }
}
