package com.danang.railway.controller;

import com.danang.railway.dto.*;
import com.danang.railway.entity.TaiKhoan;
import com.danang.railway.repository.TaiKhoanRepository;
import com.danang.railway.security.JwtUtils;
import com.danang.railway.service.NhatKyService;
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
    private final NhatKyService nhatKyService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@RequestBody LoginRequest request) {

        TaiKhoan user = taiKhoanRepository.findByEmail(request.getEmail())
                .orElse(null);
        
       if (user == null) {
        nhatKyService.ghiNhatKyDonGian("DANG_NHAP_THAT_BAI", "TAI_KHOAN", "SYSTEM"); 
        return ResponseEntity.badRequest().body(ApiResponse.error("Tên đăng nhập hoặc mật khẩu không đúng"));
        }
       if (!passwordEncoder.matches(request.getMatKhau(), user.getMatKhau())) {
        // Lúc này đã có đối tượng user, hãy dùng maTaiKhoan hợp lệ (ví dụ: QTV-001)[cite: 4]
        nhatKyService.ghiNhatKyDonGian("DANG_NHAP_SAI_MAT_KHAU", "TAI_KHOAN", user.getMaTaiKhoan());
        return ResponseEntity.badRequest().body(ApiResponse.error("Tên đăng nhập hoặc mật khẩu không đúng"));
        }
        if ("KHOA".equals(user.getTrangThai())) {
            nhatKyService.ghiNhatKyDonGian("DANG_NHAP_TAI_KHOAN_BI_KHOA", "TAI_KHOAN", user.getMaTaiKhoan());
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

        // Đặt SecurityContext tạm thời để NhatKyService nhận diện được người dùng vừa đăng nhập
        org.springframework.security.authentication.UsernamePasswordAuthenticationToken auth = 
            new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                user.getMaTaiKhoan(), null,
                java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + user.getQuyenTruyCap()))
        );
        org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(auth);

        // Ghi log đăng nhập thành công
        nhatKyService.ghiNhatKyDonGian("DANG_NHAP", "TAI_KHOAN", user.getMaTaiKhoan());

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
