package com.danang.railway.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "SU_CO")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SuCo {

    @Id
    @Column(name = "ma_su_co", length = 20)
    private String maSuCo;

    @Column(name = "ma_lich_trinh", length = 20)
    private String maLichTrinh;

    @Column(name = "ma_nguoi_ghi_nhan", length = 20, nullable = false)
    private String maNguoiGhiNhan;

    @Column(name = "ma_ray", length = 20)
    private String maRay;


    @Column(name = "loai_su_co", length = 20, nullable = false)
    private String loaiSuCo;

    @Column(name = "mo_ta", length = 1000, nullable = false)
    private String moTa;

    @Column(name = "muc_do", length = 20, nullable = false)
    private String mucDo = "TRUNG_BINH";

    // Vòng đời: CHO_TIEP_NHAN → DANG_XU_LY → DA_XU_LY
    @Column(name = "trang_thai_xu_ly", length = 20, nullable = false)
    private String trangThaiXuLy = "CHO_TIEP_NHAN";

    @Column(name = "ngay_xay_ra", nullable = false)
    private LocalDateTime ngayXayRa;

    @Column(name = "ngay_xu_ly")
    private LocalDateTime ngayXuLy;

    @Column(name = "thoi_gian_xu_ly_uoc_tinh")
    private Integer thoiGianXuLyUocTinh;

    @Column(name = "ngay_tao", nullable = false)
    private LocalDateTime ngayTao;

    @PrePersist
    protected void onCreate() {
        ngayTao = LocalDateTime.now();
    }
}
