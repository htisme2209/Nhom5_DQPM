package com.danang.railway.controller;

import com.danang.railway.dto.ApiResponse;
import com.danang.railway.entity.QuyTacNghiepVu;
import com.danang.railway.repository.QuyTacNghiepVuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/quy-tac")
@RequiredArgsConstructor
public class QuyTacNghiepVuController {

    private final QuyTacNghiepVuRepository quyTacRepo;

    @GetMapping
    public ResponseEntity<ApiResponse<List<QuyTacNghiepVu>>> getAllQuyTac() {
        return ResponseEntity.ok(ApiResponse.ok(quyTacRepo.findAll()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<QuyTacNghiepVu>> updateQuyTac(
            @PathVariable String id, @RequestBody QuyTacNghiepVu updatedQuyTac) {
        
        return quyTacRepo.findById(id).map(quyTac -> {
            quyTac.setGiaTri(updatedQuyTac.getGiaTri());
            quyTac.setCapNhatLanCuoi(LocalDateTime.now());
            return ResponseEntity.ok(ApiResponse.ok("Cập nhật quy tắc thành công", quyTacRepo.save(quyTac)));
        }).orElse(ResponseEntity.badRequest().body(ApiResponse.error("Không tìm thấy quy tắc nghiệp vụ")));
    }
}
