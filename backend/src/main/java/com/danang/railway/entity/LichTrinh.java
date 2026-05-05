package com.danang.railway.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "LICH_TRINH")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class LichTrinh {

    @Id
    @Column(name = "ma_lich_trinh", length = 20)
    private String maLichTrinh;

    @Column(name = "ma_chuyen_tau", length = 20, nullable = false)
    private String maChuyenTau;

    @Column(name = "ma_ray", length = 20)
    private String maRay;

    @Column(name = "ma_nguoi_cap_nhat", length = 20)
    private String maNguoiCapNhat;

    @Column(name = "ma_su_co_anh_huong", length = 20)
    private String maSuCoAnhHuong;

    @Column(name = "gio_den_du_kien")
    private LocalDateTime gioDenDuKien;

    @Column(name = "gio_di_du_kien")
    private LocalDateTime gioDiDuKien;

    @Column(name = "gio_den_thuc_te")
    private LocalDateTime gioDenThucTe;

    @Column(name = "gio_di_thuc_te")
    private LocalDateTime gioDiThucTe;

    @Column(name = "so_phut_tre", nullable = false)
    private Integer soPhutTre = 0;

    @Column(name = "trang_thai", length = 20, nullable = false)
    private String trangThai = "CHO_XAC_NHAN";

    @Column(name = "phuong_an_xu_ly", length = 20)
    private String phuongAnXuLy;
    
    @Column(name = "ghi_chu", length = 500)
    private String ghiChu;

    @Column(name = "ngay_tao", nullable = false, updatable = false)
    private LocalDateTime ngayTao;

    @Column(name = "ngay_cap_nhat")
    private LocalDateTime ngayCapNhat;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_chuyen_tau", insertable = false, updatable = false)
    private ChuyenTau chuyenTau;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_ray", insertable = false, updatable = false)
    @JsonIgnore
    private DuongRay duongRay;

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
