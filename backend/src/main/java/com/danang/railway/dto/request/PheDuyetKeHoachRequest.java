package com.danang.railway.dto.request;

import lombok.Data;

@Data
public class PheDuyetKeHoachRequest {
    private String trangThai; // DA_PHE_DUYET hoặc TU_CHOI
    private String maNguoiDuyet;
    private String yKienDuyet;
}
