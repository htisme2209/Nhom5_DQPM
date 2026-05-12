package com.danang.railway.controller;

import com.danang.railway.dto.*;
import com.danang.railway.entity.TaiKhoan;
import com.danang.railway.repository.TaiKhoanRepository;
import com.danang.railway.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final TaiKhoanRepository taiKhoanRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@RequestBody LoginRequest request) {

        TaiKhoan user = taiKhoanRepository.findByEmail(request.getEmail())
                .orElse(null);
        System.out.println("Chuỗi băm chuẩn cho 123456: " + passwordEncoder.encode("123456"));
//       if (user == null || !passwordEncoder.matches(request.getMatKhau(), user.getMatKhau())) {
//           return ResponseEntity.badRequest()
//                   .body(ApiResponse.error("Tên đăng nhập hoặc mật khẩu không đúng"));
//       }

        if ("KHOA".equals(user.getTrangThai())) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Tài khoản đã bị khóa, vui lòng liên hệ Quản trị viên"));
        }

        String token = jwtUtils.generateToken(user.getMaTaiKhoan(), user.getQuyenTruyCap(), user.getHoTen());

        LoginResponse response = LoginResponse.builder()
                .token(token)
                .maTaiKhoan(user.getMaTaiKhoan())
                .hoTen(user.getHoTen())
                .email(user.getEmail())
                .quyenTruyCap(user.getQuyenTruyCap())
                .trangThai(user.getTrangThai())
                .build();

        return ResponseEntity.ok(ApiResponse.ok("Đăng nhập thành công", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<LoginResponse>> getMe(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        String maTaiKhoan = jwtUtils.getMaTaiKhoanFromToken(token);

        TaiKhoan user = taiKhoanRepository.findById(maTaiKhoan).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Không tìm thấy tài khoản"));
        }

        LoginResponse response = LoginResponse.builder()
                .maTaiKhoan(user.getMaTaiKhoan())
                .hoTen(user.getHoTen())
                .email(user.getEmail())
                .quyenTruyCap(user.getQuyenTruyCap())
                .trangThai(user.getTrangThai())
                .build();

        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
