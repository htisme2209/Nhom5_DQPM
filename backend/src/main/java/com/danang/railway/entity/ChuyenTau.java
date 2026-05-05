package com.danang.railway.entity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "CHUYEN_TAU")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ChuyenTau {

    @Id
    @Column(name = "ma_chuyen_tau", length = 20)
    private String maChuyenTau;

    @Column(name = "ma_tau", length = 20, nullable = false)
    private String maTau;

    @Column(name = "ma_tuyen", length = 20, nullable = false)
    private String maTuyen;

    @Column(name = "vai_tro_tai_da_nang", length = 20, nullable = false)
    private String vaiTroTaiDaNang;

    @Column(name = "gio_den_du_kien")
    private LocalTime gioDenDuKien;

    @Column(name = "gio_di_du_kien")
    private LocalTime gioDiDuKien;

    @Column(name = "ngay_chay", length = 30, nullable = false)
    private String ngayChay;

    @Column(name = "trang_thai", length = 20, nullable = false)
    private String trangThai = "HOAT_DONG";

    @Column(name = "ngay_tao", nullable = false)
    private LocalDateTime ngayTao;

    @Column(name = "ngay_cap_nhat")
    private LocalDateTime ngayCapNhat;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_tau", insertable = false, updatable = false)
    private Tau tau;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_tuyen", insertable = false, updatable = false)
    @JsonIgnore
    private TuyenDuong tuyenDuong;

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
