package com.danang.railway.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "KE_HOACH_DAC_BIET")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class KeHoachDacBiet {

    @Id
    @Column(name = "ma_ke_hoach", length = 20)
    private String maKeHoach;

    @Column(name = "ma_nguoi_gui", length = 20, nullable = false)
    private String maNguoiGui;

    @Column(name = "ma_nguoi_duyet", length = 20)
    private String maNguoiDuyet;

    @Column(name = "ma_lich_trinh", length = 20)
    private String maLichTrinh;

    @Column(name = "tieu_de", columnDefinition = "NVARCHAR(300)", nullable = false)
    private String tieuDe;

    @Column(name = "noi_dung", columnDefinition = "NVARCHAR(2000)", nullable = false)
    private String noiDung;

    @Column(name = "muc_do_uu_tien", length = 20, nullable = false)
    private String mucDoUuTien = "BINH_THUONG";

    @Column(name = "trang_thai", length = 20, nullable = false)
    private String trangThai = "CHO_PHE_DUYET";

    @Column(name = "y_kien_duyet", columnDefinition = "NVARCHAR(1000)")
    private String yKienDuyet;

    @Column(name = "ngay_gui", nullable = false)
    private LocalDateTime ngayGui;

    @Column(name = "ngay_duyet")
    private LocalDateTime ngayDuyet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_nguoi_gui", insertable = false, updatable = false)
    @JsonIgnore
    private TaiKhoan nguoiGui;

    @PrePersist
    protected void onCreate() {
        ngayGui = LocalDateTime.now();
    }
}
