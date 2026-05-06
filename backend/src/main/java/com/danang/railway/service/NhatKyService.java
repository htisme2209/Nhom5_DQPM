package com.danang.railway.service;

import com.danang.railway.entity.NhatKy;
import com.danang.railway.repository.NhatKyRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Service quản lý nhật ký hệ thống
 * Ghi lại tất cả các hoạt động của người dùng
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NhatKyService {

    private final NhatKyRepository nhatKyRepository;

    /**
     * Ghi nhật ký cho các hoạt động của người dùng
     * @param hanhDong: Loại hành động (DANG_NHAP, THEM, CAP_NHAT, XOA, PHE_DUYET, etc.)
     * @param doiTuong: Đối tượng bị thay đổi (LICH_TRINH, CHUYEN_TAU, GA, RAY, TAI_KHOAN, etc.)
     * @param maDoiTuong: Mã của đối tượng
     * @param noiDungCu: Nội dung cũ (khi cập nhật/xóa)
     * @param noiDungMoi: Nội dung mới (khi thêm/cập nhật)
     */
    @Transactional
    public void ghiNhatKy(String hanhDong, String doiTuong, String maDoiTuong, 
                          String noiDungCu, String noiDungMoi) {
        try {
            // Lấy thông tin người dùng hiện tại từ Security Context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String maTaiKhoan = null;
            if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getName())) {
                maTaiKhoan = authentication.getName();
            }

            // Lấy IP address từ request
            String diaChiIp = getClientIp();

            // Tạo mã nhật ký
            String maNhatKy = "NK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

            // Tạo entity
            NhatKy nhatKy = NhatKy.builder()
                    .maNhatKy(maNhatKy)
                    .maTaiKhoan(maTaiKhoan)
                    .hanhDong(hanhDong)
                    .doiTuong(doiTuong)
                    .maDoiTuong(maDoiTuong)
                    .noiDungCu(noiDungCu)
                    .noiDungMoi(noiDungMoi)
                    .diaChiIp(diaChiIp)
                    .thoiGian(LocalDateTime.now())
                    .build();

            nhatKyRepository.save(nhatKy);
            log.info("Ghi nhật ký: {} - {} {} - {}", maTaiKhoan, hanhDong, doiTuong, maDoiTuong);
        } catch (Exception e) {
            log.error("Lỗi khi ghi nhật ký: {}", e.getMessage(), e);
            // Không throw exception để không ảnh hưởng đến hoạt động chính của hệ thống
        }
    }

    /**
     * Ghi nhật ký đơn giản (chỉ hành động và đối tượng)
     */
    @Transactional
    public void ghiNhatKyDonGian(String hanhDong, String doiTuong, String maDoiTuong) {
        ghiNhatKy(hanhDong, doiTuong, maDoiTuong, null, null);
    }

    /**
     * Lấy danh sách nhật ký (phân trang)
     */
    public Page<NhatKy> layDanhSachNhatKy(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return nhatKyRepository.findAllByOrderByThoiGianDesc(pageable);
    }

    /**
     * Lấy nhật ký theo tài khoản
     */
    public List<NhatKy> layNhatKyTheoTaiKhoan(String maTaiKhoan) {
        return nhatKyRepository.findByMaTaiKhoan(maTaiKhoan);
    }

    /**
     * Lấy nhật ký theo đối tượng
     */
    public List<NhatKy> layNhatKyTheoDoiTuong(String doiTuong) {
        return nhatKyRepository.findByDoiTuong(doiTuong);
    }

    /**
     * Lấy IP address từ request
     */
    private String getClientIp() {
        try {
            ServletRequestAttributes attributes = 
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            
            if (attributes == null) {
                return "UNKNOWN";
            }

            HttpServletRequest request = attributes.getRequest();
            String ip = request.getHeader("X-Forwarded-For");
            
            if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                ip = request.getHeader("Proxy-Client-IP");
            }
            if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                ip = request.getHeader("WL-Proxy-Client-IP");
            }
            if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                ip = request.getRemoteAddr();
            }

            // Xử lý danh sách IP (lấy IP đầu tiên)
            if (ip != null && ip.contains(",")) {
                ip = ip.split(",")[0].trim();
            }

            return ip;
        } catch (Exception e) {
            log.warn("Không thể lấy IP: {}", e.getMessage());
            return "UNKNOWN";
        }
    }
}
