package com.danang.railway.controller;

import com.danang.railway.dto.ApiResponse;
import com.danang.railway.entity.NhatKy;
import com.danang.railway.service.NhatKyService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nhat-ky")
@RequiredArgsConstructor
public class NhatKyController {

    private final NhatKyService nhatKyService;

    /**
     * Lấy danh sách nhật ký (phân trang)
     * GET /api/nhat-ky?page=0&size=20
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<NhatKy>>> getDanhSachNhatKy(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Page<NhatKy> data = nhatKyService.layDanhSachNhatKy(page, size);
        return ResponseEntity.ok(ApiResponse.ok("Lấy danh sách nhật ký thành công", data));
    }

    /**
     * Lấy nhật ký theo tài khoản
     * GET /api/nhat-ky/tai-khoan/{maTaiKhoan}
     */
    @GetMapping("/tai-khoan/{maTaiKhoan}")
    public ResponseEntity<ApiResponse<List<NhatKy>>> getNhatKyTheoTaiKhoan(
            @PathVariable String maTaiKhoan) {
        List<NhatKy> data = nhatKyService.layNhatKyTheoTaiKhoan(maTaiKhoan);
        return ResponseEntity.ok(ApiResponse.ok("Lấy nhật ký theo tài khoản thành công", data));
    }

    /**
     * Lấy nhật ký theo đối tượng (LICH_TRINH, CHUYEN_TAU, GA, etc.)
     * GET /api/nhat-ky/doi-tuong/{doiTuong}
     */
    @GetMapping("/doi-tuong/{doiTuong}")
    public ResponseEntity<ApiResponse<List<NhatKy>>> getNhatKyTheoDoiTuong(
            @PathVariable String doiTuong) {
        List<NhatKy> data = nhatKyService.layNhatKyTheoDoiTuong(doiTuong);
        return ResponseEntity.ok(ApiResponse.ok("Lấy nhật ký theo đối tượng thành công", data));
    }
}
