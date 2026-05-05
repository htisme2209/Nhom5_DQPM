package com.danang.railway.controller;

import com.danang.railway.dto.ApiResponse;
import com.danang.railway.entity.*;
import com.danang.railway.dto.TuyenDuongDTO;
import com.danang.railway.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AdminController {

    private final TaiKhoanRepository taiKhoanRepo;
    private final GaRepository gaRepo;
    private final TuyenDuongRepository tuyenDuongRepo;
    private final GaTuyenRepository gaTuyenRepo;
    private final PasswordEncoder passwordEncoder;

    // === TÀI KHOẢN ===
    @GetMapping("/tai-khoan")
    public ResponseEntity<ApiResponse<List<TaiKhoan>>> getAllTaiKhoan() {
        return ResponseEntity.ok(ApiResponse.ok(taiKhoanRepo.findAll()));
    }

    @GetMapping("/tai-khoan/{id}")
    public ResponseEntity<ApiResponse<TaiKhoan>> getTaiKhoanById(@PathVariable String id) {
        return taiKhoanRepo.findById(id)
                .map(tk -> ResponseEntity.ok(ApiResponse.ok(tk)))
                .orElse(ResponseEntity.badRequest().body(ApiResponse.error("Không tìm thấy tài khoản")));
    }

    @PostMapping("/tai-khoan")
    public ResponseEntity<ApiResponse<TaiKhoan>> createTaiKhoan(@RequestBody TaiKhoan taiKhoan) {
        if (taiKhoanRepo.existsByEmail(taiKhoan.getEmail())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Email đã được sử dụng"));
        }
        taiKhoan.setMatKhau(passwordEncoder.encode(taiKhoan.getMatKhau()));
        if (taiKhoan.getMaTaiKhoan() == null || taiKhoan.getMaTaiKhoan().isEmpty()) {
            taiKhoan.setMaTaiKhoan("TK-" + System.currentTimeMillis());
        }
        return ResponseEntity.ok(ApiResponse.ok("Tạo tài khoản thành công", taiKhoanRepo.save(taiKhoan)));
    }

    @PutMapping("/tai-khoan/{id}")
    public ResponseEntity<ApiResponse<TaiKhoan>> updateTaiKhoan(@PathVariable String id, @RequestBody TaiKhoan taiKhoan) {
        TaiKhoan existing = taiKhoanRepo.findById(id).orElse(null);
        if (existing == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Không tìm thấy tài khoản"));
        }
        if (taiKhoan.getHoTen() != null) existing.setHoTen(taiKhoan.getHoTen());
        if (taiKhoan.getEmail() != null) existing.setEmail(taiKhoan.getEmail());
        if (taiKhoan.getQuyenTruyCap() != null) existing.setQuyenTruyCap(taiKhoan.getQuyenTruyCap());
        if (taiKhoan.getTrangThai() != null) existing.setTrangThai(taiKhoan.getTrangThai());
        if (taiKhoan.getSoDienThoai() != null) existing.setSoDienThoai(taiKhoan.getSoDienThoai());
        if (taiKhoan.getMatKhau() != null && !taiKhoan.getMatKhau().isEmpty()) {
            existing.setMatKhau(passwordEncoder.encode(taiKhoan.getMatKhau()));
        }
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật tài khoản thành công", taiKhoanRepo.save(existing)));
    }

    // === GA ===
    @GetMapping("/ga")
    public ResponseEntity<ApiResponse<List<Ga>>> getAllGa() {
        return ResponseEntity.ok(ApiResponse.ok(gaRepo.findAll()));
    }

    @PostMapping("/ga")
    public ResponseEntity<ApiResponse<Ga>> createGa(@RequestBody Ga ga) {
        return ResponseEntity.ok(ApiResponse.ok("Tạo ga thành công", gaRepo.save(ga)));
    }

    @PutMapping("/ga/{id}")
    public ResponseEntity<ApiResponse<Ga>> updateGa(@PathVariable String id, @RequestBody Ga ga) {
        ga.setMaGa(id);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật ga thành công", gaRepo.save(ga)));
    }

    // === TUYẾN ĐƯỜNG ===
    @GetMapping("/tuyen-duong")
    public ResponseEntity<ApiResponse<List<TuyenDuong>>> getAllTuyenDuong() {
        return ResponseEntity.ok(ApiResponse.ok(tuyenDuongRepo.findAll()));
    }

    @PostMapping("/tuyen-duong")
    public ResponseEntity<ApiResponse<TuyenDuong>> createTuyenDuong(@RequestBody TuyenDuongDTO dto) {
        if (dto.getTuyenDuong().getMaTuyen() == null || dto.getTuyenDuong().getMaTuyen().isEmpty()) {
            dto.getTuyenDuong().setMaTuyen("TD-" + System.currentTimeMillis());
        }
        TuyenDuong savedTuyen = tuyenDuongRepo.save(dto.getTuyenDuong());
        
        // Lưu ga trung gian
        if (dto.getDanhSachGaGiua() != null) {
            int index = 1;
            for (String maGa : dto.getDanhSachGaGiua()) {
                GaTuyen gt = new GaTuyen();
                gt.setMaTuyen(savedTuyen.getMaTuyen());
                gt.setMaGa(maGa);
                gt.setThuTuTrenTuyen(index++);
                gt.setThoiGianDungPhut(15); // Default stop time
                gt.setKhoangCachTuDauKm(java.math.BigDecimal.valueOf(50.0 * index)); // Fake distance for middle stations
                gaTuyenRepo.save(gt);
            }
        }
        
        return ResponseEntity.ok(ApiResponse.ok("Tạo tuyến đường thành công", savedTuyen));
    }

    // === GA TUYẾN ===
    @GetMapping("/ga-tuyen/{maTuyen}")
    public ResponseEntity<ApiResponse<List<GaTuyen>>> getGaTuyen(@PathVariable String maTuyen) {
        return ResponseEntity.ok(ApiResponse.ok(gaTuyenRepo.findByMaTuyenOrderByThuTuTrenTuyenAsc(maTuyen)));
    }
}
