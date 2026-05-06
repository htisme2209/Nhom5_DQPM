package com.danang.railway.controller;

import com.danang.railway.dto.ApiResponse;
import com.danang.railway.entity.LichTrinh;
import com.danang.railway.entity.SuCo;
import com.danang.railway.repository.TaiKhoanRepository;
import com.danang.railway.service.SuCoService;
import com.danang.railway.service.SlaWorkerService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/su-co")
@RequiredArgsConstructor
public class SuCoController {

    private final SuCoService suCoService;
    private final TaiKhoanRepository taiKhoanRepo;
    private final SlaWorkerService slaWorkerService;

    /**
     * UC-09: Ghi nhận sự cố (Nhân viên Nhà ga)
     * Chỉ lưu báo cáo, không phong tỏa ray.
     */
    @PostMapping("/ghi-nhan")
    public ResponseEntity<ApiResponse<SuCo>> ghiNhanSuCo(
            @RequestBody SuCo suCo,
            Authentication authentication,
            HttpServletRequest request) {

        try {
            if (authentication == null) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Chưa đăng nhập"));
            }
            String maTaiKhoan = authentication.getName();
            var user = taiKhoanRepo.findById(maTaiKhoan)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));

            if (!"NHAN_VIEN_NHA_GA".equals(user.getQuyenTruyCap()) &&
                !"NHAN_VIEN_DIEU_HANH".equals(user.getQuyenTruyCap())) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Không có quyền ghi nhận sự cố"));
            }

            SuCo result = suCoService.ghiNhanSuCo(suCo, maTaiKhoan, request.getRemoteAddr());
            return ResponseEntity.ok(ApiResponse.ok("Gửi báo cáo sự cố thành công", result));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * UC-09/UC-06: Tiếp nhận và đánh giá sự cố (Nhân viên Điều hành)
     * NVĐH xác nhận mức độ, quyết định phong tỏa ray, hệ thống tự quét lịch trình.
     */
    @PostMapping("/{maSuCo}/tiep-nhan")
    public ResponseEntity<ApiResponse<SuCo>> tiepNhanSuCo(
            @PathVariable String maSuCo,
            @RequestBody Map<String, Object> requestBody,
            Authentication authentication,
            HttpServletRequest request) {

        try {
            String maTaiKhoan = authentication.getName();
            var user = taiKhoanRepo.findById(maTaiKhoan)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));

            if (!"NHAN_VIEN_DIEU_HANH".equals(user.getQuyenTruyCap())) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Chỉ Nhân viên Điều hành mới có quyền tiếp nhận sự cố"));
            }

            String mucDo = (String) requestBody.get("mucDo");
            boolean coPhongToaRay = Boolean.TRUE.equals(requestBody.get("coPhongToaRay"));
            String loaiPhongToa = (String) requestBody.get("loaiPhongToa");
            
            Integer thoiGianXuLyUocTinh = null;
            if (requestBody.containsKey("thoiGianXuLyUocTinh") && requestBody.get("thoiGianXuLyUocTinh") != null) {
                try {
                    thoiGianXuLyUocTinh = Integer.parseInt(requestBody.get("thoiGianXuLyUocTinh").toString());
                } catch (NumberFormatException ignored) {}
            }

            SuCo result = suCoService.tiepNhanVaDanhGia(
                    maSuCo, mucDo, coPhongToaRay, loaiPhongToa,
                    maTaiKhoan, request.getRemoteAddr(), thoiGianXuLyUocTinh);

            return ResponseEntity.ok(ApiResponse.ok("Tiếp nhận sự cố thành công", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * NVNH xem danh sách báo cáo của mình
     */
    @GetMapping("/cua-toi")
    public ResponseEntity<ApiResponse<List<SuCo>>> layBaoCaoCuaToi(
            Authentication authentication) {

        try {
            String maTaiKhoan = authentication.getName();
            List<SuCo> list = suCoService.layBaoCaoCuaToi(maTaiKhoan);
            return ResponseEntity.ok(ApiResponse.ok(list));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * UC-06: Lấy danh sách lịch trình bị ảnh hưởng bởi sự cố
     */
    @GetMapping("/{maSuCo}/lich-trinh-anh-huong")
    public ResponseEntity<ApiResponse<List<LichTrinh>>> layLichTrinhBiAnhHuong(
            @PathVariable String maSuCo) {
        
        try {
            List<LichTrinh> lichTrinhList = suCoService.layLichTrinhBiAnhHuong(maSuCo);
            return ResponseEntity.ok(ApiResponse.ok(lichTrinhList));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Lỗi khi lấy danh sách lịch trình: " + e.getMessage()));
        }
    }

    /**
     * UC-06: Xử lý phương án cho lịch trình bị ảnh hưởng
     * - NHAN_VIEN_NHA_GA: chỉ được HUY_CHUYEN
     * - NHAN_VIEN_DIEU_HANH: được HUY_CHUYEN và DOI_RAY
     */
    @PutMapping("/xu-ly-phuong-an")
    public ResponseEntity<ApiResponse<String>> xuLyPhuongAn(
            @RequestBody Map<String, String> request,
            Authentication authentication,
            HttpServletRequest httpRequest) {
        
        try {
            String maTaiKhoan = authentication.getName();
            var user = taiKhoanRepo.findById(maTaiKhoan)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));
            
            String diaChiIp = httpRequest.getRemoteAddr();
            String quyen = user.getQuyenTruyCap();
            String phuongAn = request.get("phuongAn");
            String maLichTrinh = request.get("maLichTrinh");
            String maRayMoi = request.get("maRayMoi");

            // Kiểm tra quyền
            boolean laNhaGa = "NHAN_VIEN_NHA_GA".equals(quyen);
            boolean laDieuHanh = "NHAN_VIEN_DIEU_HANH".equals(quyen);

            if (!laNhaGa && !laDieuHanh) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Không có quyền xử lý phương án"));
            }

            // Nhà ga chỉ được hủy chuyến, không được đổi ray
            if (laNhaGa && !"HUY_CHUYEN".equals(phuongAn)) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Nhà ga chỉ được phép hủy chuyến. Việc đổi ray do Nhân viên Điều hành thực hiện."));
            }
            
            suCoService.xuLyPhuongAnLichTrinh(maLichTrinh, phuongAn, maRayMoi, 
                    user.getMaTaiKhoan(), diaChiIp);
            
            return ResponseEntity.ok(ApiResponse.ok("Xử lý phương án thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Lỗi khi xử lý phương án: " + e.getMessage()));
        }
    }

    /**
     * Giải phóng đường ray (NVĐH cho PHONG_TOA_TAM, BQL cho PHONG_TOA_CUNG)
     */
    @PutMapping("/giai-phong-ray")
    public ResponseEntity<ApiResponse<String>> giaiPhongRay(
            @RequestBody Map<String, String> request,
            Authentication authentication,
            HttpServletRequest httpRequest) {
        
        try {
            String maTaiKhoan = authentication.getName();
            var user = taiKhoanRepo.findById(maTaiKhoan)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));
            
            String diaChiIp = httpRequest.getRemoteAddr();
            
            String maRay = request.get("maRay");
            String maSuCo = request.get("maSuCo");
            
            suCoService.giaiPhongDuongRay(maRay, maSuCo, user.getMaTaiKhoan(), 
                    user.getQuyenTruyCap(), diaChiIp);
            
            return ResponseEntity.ok(ApiResponse.ok("Giải phóng đường ray thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Lỗi khi giải phóng ray: " + e.getMessage()));
        }
    }

    /**
     * Kiểm tra điều kiện vận hành khẩn cấp
     */
    @GetMapping("/{maSuCo}/kiem-tra-khan-cap")
    public ResponseEntity<ApiResponse<Boolean>> kiemTraKhanCap(
            @PathVariable String maSuCo) {
        
        try {
            // Lấy thông tin sự cố và kiểm tra
            // Logic sẽ được implement trong service
            return ResponseEntity.ok(ApiResponse.ok(false));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Lỗi khi kiểm tra: " + e.getMessage()));
        }
    }

    /**
     * UC-06: Xử lý trễ chuyến
     */
    @PostMapping("/xu-ly-tre-chuyen")
    public ResponseEntity<ApiResponse<String>> xuLyTreChuyen(
            @RequestBody Map<String, Object> request,
            Authentication authentication,
            HttpServletRequest httpRequest) {
        
        try {
            String maTaiKhoan = authentication.getName();
            var user = taiKhoanRepo.findById(maTaiKhoan)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));
            
            String diaChiIp = httpRequest.getRemoteAddr();
            
            // Kiểm tra quyền
            if (!"NHAN_VIEN_DIEU_HANH".equals(user.getQuyenTruyCap())) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Chỉ Nhân viên Điều hành mới có quyền xử lý trễ chuyến"));
            }
            
            String maLichTrinh = (String) request.get("maLichTrinh");
            int soPhutTre = (Integer) request.get("soPhutTre");
            String lyDo = (String) request.get("lyDo");
            
            suCoService.xuLyTreChuyen(maLichTrinh, soPhutTre, lyDo, 
                    user.getMaTaiKhoan(), diaChiIp);
            
            return ResponseEntity.ok(ApiResponse.ok("Xử lý trễ chuyến thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Lỗi khi xử lý trễ chuyến: " + e.getMessage()));
        }
    }

    /**
     * Thu hồi lệnh và giải phóng ray (Ngưỡng 20 phút)
     */
    @PostMapping("/thu-hoi-lenh")
    public ResponseEntity<ApiResponse<String>> thuHoiLenh(
            @RequestBody Map<String, String> request,
            Authentication authentication,
            HttpServletRequest httpRequest) {
        
        try {
            String maTaiKhoan = authentication.getName();
            var user = taiKhoanRepo.findById(maTaiKhoan)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));
            
            String diaChiIp = httpRequest.getRemoteAddr();
            
            // Kiểm tra quyền
            if (!"NHAN_VIEN_DIEU_HANH".equals(user.getQuyenTruyCap())) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Chỉ Nhân viên Điều hành mới có quyền thu hồi lệnh"));
            }
            
            String maLichTrinh = request.get("maLichTrinh");
            String lyDo = request.get("lyDo");
            
            suCoService.thuHoiLenhGiaiPhongRay(maLichTrinh, lyDo, 
                    user.getMaTaiKhoan(), diaChiIp);
            
            return ResponseEntity.ok(ApiResponse.ok("Thu hồi lệnh thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Lỗi khi thu hồi lệnh: " + e.getMessage()));
        }
    }


    /**
     * UC-06: Điều chỉnh giờ lịch trình bị ảnh hưởng (không cần đổi ray)
     * NVĐH cập nhật giờ đến/đi mới, ghi nhận phuong_an = DIEU_CHINH_GIO
     */
    @PutMapping("/dieu-chinh-gio")
    public ResponseEntity<ApiResponse<String>> dieuChinhGioLichTrinh(
            @RequestBody Map<String, Object> request,
            Authentication authentication,
            HttpServletRequest httpRequest) {

        try {
            String maTaiKhoan = authentication.getName();
            var user = taiKhoanRepo.findById(maTaiKhoan)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));

            if (!"NHAN_VIEN_DIEU_HANH".equals(user.getQuyenTruyCap())) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Chỉ Nhân viên Điều hành mới có quyền điều chỉnh giờ"));
            }

            String maLichTrinh = (String) request.get("maLichTrinh");
            String gioDenMoi   = (String) request.get("gioDenDuKienMoi");
            String gioDiMoi    = (String) request.get("gioDiDuKienMoi");

            suCoService.dieuChinhGioLichTrinh(maLichTrinh, gioDenMoi, gioDiMoi,
                    user.getMaTaiKhoan(), httpRequest.getRemoteAddr());

            return ResponseEntity.ok(ApiResponse.ok("Điều chỉnh giờ lịch trình thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Lỗi khi điều chỉnh giờ: " + e.getMessage()));
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // SLA & Escalation APIs
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * Lấy thông tin SLA của sự cố (frontend polling)
     */
    @GetMapping("/{maSuCo}/sla")
    public ResponseEntity<ApiResponse<SlaWorkerService.SlaInfo>> getSlaInfo(
            @PathVariable String maSuCo) {
        try {
            SlaWorkerService.SlaInfo info = slaWorkerService.getSlaInfo(maSuCo);
            return ResponseEntity.ok(ApiResponse.ok(info));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * BQL override phương án xử lý khi ESCALATED
     */
    @PutMapping("/bql-override")
    public ResponseEntity<ApiResponse<String>> bqlOverride(
            @RequestBody Map<String, String> request,
            Authentication authentication,
            HttpServletRequest httpRequest) {

        try {
            String maTaiKhoan = authentication.getName();
            var user = taiKhoanRepo.findById(maTaiKhoan)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));

            if (!"BAN_QUAN_LY".equals(user.getQuyenTruyCap())) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Chỉ Ban Quản lý mới có quyền override phương án"));
            }

            String maLichTrinh = request.get("maLichTrinh");
            String phuongAn = request.get("phuongAn");
            String maRayMoi = request.get("maRayMoi");

            suCoService.bqlOverridePhuongAn(maLichTrinh, phuongAn, maRayMoi,
                    user.getMaTaiKhoan(), httpRequest.getRemoteAddr());

            return ResponseEntity.ok(ApiResponse.ok("BQL override thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Lỗi: " + e.getMessage()));
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Bộ Ghi (Switch) APIs
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * Lấy danh sách bộ ghi khả dụng giữa 2 ray
     */
    @GetMapping("/bo-ghi")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getBoGhiKhaDung(
            @RequestParam String maRayCu,
            @RequestParam String maRayMoi) {
        try {
            List<Map<String, Object>> result = suCoService.getBoGhiKhaDung(maRayCu, maRayMoi);
            return ResponseEntity.ok(ApiResponse.ok(result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
