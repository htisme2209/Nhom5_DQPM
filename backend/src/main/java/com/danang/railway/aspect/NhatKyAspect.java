package com.danang.railway.aspect;

import com.danang.railway.service.NhatKyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;

import java.util.Arrays;

/**
 * AOP Aspect để tự động ghi nhật ký cho các hoạt động chính của hệ thống
 * Theo dõi các thao tác: Thêm, Cập nhật, Xóa, Phê duyệt, etc.
 */
@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class NhatKyAspect {

    private final NhatKyService nhatKyService;

    /**
     * Pointcut để ghi log khi tạo lịch trình mới
     */
    @AfterReturning("execution(* com.danang.railway.service.LichTrinhService.taoLichTrinh(..))")
    public void logTaoLichTrinh(JoinPoint joinPoint) {
        try {
            Object[] args = joinPoint.getArgs();
            if (args.length > 0) {
                Object lichTrinhObj = args[0];
                String maLichTrinh = getFieldValue(lichTrinhObj, "maLichTrinh");
                String maChuyenTau = getFieldValue(lichTrinhObj, "maChuyenTau");
                nhatKyService.ghiNhatKy(
                        "THEM",
                        "LICH_TRINH",
                        maLichTrinh,
                        null,
                        "Tạo lịch trình mới: " + maChuyenTau
                );
            }
        } catch (Exception e) {
            log.warn("Lỗi khi ghi log taoLichTrinh: {}", e.getMessage());
        }
    }

    /**
     * Pointcut để ghi log khi cập nhật lịch trình
     */
    @AfterReturning("execution(* com.danang.railway.service.LichTrinhService.capNhatLichTrinh(..))")
    public void logCapNhatLichTrinh(JoinPoint joinPoint) {
        try {
            Object[] args = joinPoint.getArgs();
            if (args.length > 0) {
                Object lichTrinhObj = args[0];
                String maLichTrinh = getFieldValue(lichTrinhObj, "maLichTrinh");
                nhatKyService.ghiNhatKy(
                        "CAP_NHAT",
                        "LICH_TRINH",
                        maLichTrinh,
                        null,
                        "Cập nhật lịch trình"
                );
            }
        } catch (Exception e) {
            log.warn("Lỗi khi ghi log capNhatLichTrinh: {}", e.getMessage());
        }
    }

    /**
     * Pointcut để ghi log khi xóa lịch trình
     */
    @AfterReturning("execution(* com.danang.railway.service.LichTrinhService.xoaLichTrinh(..))")
    public void logXoaLichTrinh(JoinPoint joinPoint) {
        try {
            Object[] args = joinPoint.getArgs();
            if (args.length > 0 && args[0] instanceof String) {
                String maLichTrinh = (String) args[0];
                nhatKyService.ghiNhatKy(
                        "XOA",
                        "LICH_TRINH",
                        maLichTrinh,
                        null,
                        null
                );
            }
        } catch (Exception e) {
            log.warn("Lỗi khi ghi log xoaLichTrinh: {}", e.getMessage());
        }
    }

    /**
     * Pointcut để ghi log khi ghi nhận sự cố
     */
    @AfterReturning("execution(* com.danang.railway.service.SuCoService.ghiNhanSuCo(..))")
    public void logGhiNhanSuCo(JoinPoint joinPoint) {
        try {
            Object[] args = joinPoint.getArgs();
            if (args.length > 0) {
                Object suCoObj = args[0];
                String maSuCo = getFieldValue(suCoObj, "maSuCo");
                String moTa = getFieldValue(suCoObj, "moTa");
                nhatKyService.ghiNhatKy(
                        "GHI_NHAN_SU_CO",
                        "SU_CO",
                        maSuCo,
                        null,
                        moTa
                );
            }
        } catch (Exception e) {
            log.warn("Lỗi khi ghi log ghiNhanSuCo: {}", e.getMessage());
        }
    }

    /**
     * Pointcut để ghi log khi tiếp nhận sự cố
     */
    @AfterReturning("execution(* com.danang.railway.service.SuCoService.tiepNhanSuCo(..))")
    public void logTiepNhanSuCo(JoinPoint joinPoint) {
        try {
            Object[] args = joinPoint.getArgs();
            if (args.length > 0 && args[0] instanceof String) {
                String maSuCo = (String) args[0];
                nhatKyService.ghiNhatKy(
                        "TIEP_NHAN_SU_CO",
                        "SU_CO",
                        maSuCo,
                        null,
                        "Tiếp nhận sự cố"
                );
            }
        } catch (Exception e) {
            log.warn("Lỗi khi ghi log tiepNhanSuCo: {}", e.getMessage());
        }
    }

    /**
     * Pointcut để ghi log khi phê duyệt kế hoạch
     */
    @AfterReturning("execution(* com.danang.railway.service.KeHoachDacBietService.pheDuyetKeHoach(..))")
    public void logPheDuyetKeHoach(JoinPoint joinPoint) {
        try {
            Object[] args = joinPoint.getArgs();
            if (args.length > 0 && args[0] instanceof String) {
                String maKeHoach = (String) args[0];
                String yKien = args.length > 1 ? String.valueOf(args[1]) : "";
                nhatKyService.ghiNhatKy(
                        "PHE_DUYET",
                        "KE_HOACH",
                        maKeHoach,
                        null,
                        "Phê duyệt kế hoạch: " + yKien
                );
            }
        } catch (Exception e) {
            log.warn("Lỗi khi ghi log pheDuyetKeHoach: {}", e.getMessage());
        }
    }

    /**
     * Pointcut để ghi log khi tạo tài khoản
     */
    @AfterReturning("execution(* com.danang.railway.controller.AdminController.createTaiKhoan(..))")
    public void logTaoTaiKhoan(JoinPoint joinPoint) {
        try {
            Object[] args = joinPoint.getArgs();
            if (args.length > 0) {
                Object taiKhoanObj = args[0];
                String maTaiKhoan = getFieldValue(taiKhoanObj, "maTaiKhoan");
                String hoTen = getFieldValue(taiKhoanObj, "hoTen");
                nhatKyService.ghiNhatKy(
                        "THEM",
                        "TAI_KHOAN",
                        maTaiKhoan,
                        null,
                        "Tạo tài khoản: " + hoTen
                );
            }
        } catch (Exception e) {
            log.warn("Lỗi khi ghi log taoTaiKhoan: {}", e.getMessage());
        }
    }

    /**
     * Pointcut để ghi log khi cập nhật tài khoản
     */
    @AfterReturning("execution(* com.danang.railway.controller.AdminController.updateTaiKhoan(..))")
    public void logCapNhatTaiKhoan(JoinPoint joinPoint) {
        try {
            Object[] args = joinPoint.getArgs();
            if (args.length > 1 && args[1] instanceof Object) {
                Object taiKhoanObj = args[1];
                String hoTen = getFieldValue(taiKhoanObj, "hoTen");
                nhatKyService.ghiNhatKy(
                        "CAP_NHAT",
                        "TAI_KHOAN",
                        String.valueOf(args[0]),
                        null,
                        "Cập nhật tài khoản: " + hoTen
                );
            }
        } catch (Exception e) {
            log.warn("Lỗi khi ghi log capNhatTaiKhoan: {}", e.getMessage());
        }
    }

    /**
     * Helper method để lấy giá trị field từ object
     */
    private String getFieldValue(Object obj, String fieldName) {
        try {
            if (obj == null) return null;
            // Dùng AopUtils để unwrap proxy nếu có
            Class<?> clazz = org.springframework.aop.support.AopUtils.getTargetClass(obj);
            // Dùng ReflectionUtils của Spring để tìm field (hỗ trợ cả superclass)
            java.lang.reflect.Field field = org.springframework.util.ReflectionUtils.findField(clazz, fieldName);
            if (field != null) {
                org.springframework.util.ReflectionUtils.makeAccessible(field);
                Object value = org.springframework.util.ReflectionUtils.getField(field, obj);
                return value != null ? value.toString() : null;
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }
}
