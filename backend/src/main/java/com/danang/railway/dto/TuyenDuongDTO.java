package com.danang.railway.dto;

import com.danang.railway.entity.TuyenDuong;
import lombok.Data;

import java.util.List;

@Data
public class TuyenDuongDTO {
    private TuyenDuong tuyenDuong;
    private List<String> danhSachGaGiua; // Danh sách mã ga trung gian
}
