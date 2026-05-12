-- ============================================
-- HỆ THỐNG QUẢN LÝ LỊCH TRÌNH TÀU GA ĐÀ NẴNG
-- Script dữ liệu mẫu - SQL Server
-- Bộ dữ liệu tối giản: Mỗi trường hợp 1 record để dễ test
-- ============================================

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'railway_danang')
    CREATE DATABASE railway_danang;
GO
USE railway_danang;
GO

-- ============================================
-- 1. TÀI KHOẢN (mật khẩu: 123456 - BCrypt)
-- Mỗi vai trò 1 tài khoản để test phân quyền
-- ============================================
INSERT INTO TAI_KHOAN (ma_tai_khoan, quyen_truy_cap, ho_ten, email, so_dien_thoai, mat_khau, gioi_tinh, ngay_sinh, trang_thai, ngay_tao, ngay_cap_nhat) VALUES
('QTV-001', 'QUAN_TRI_VIEN', N'Admin Hệ Thống', 'admin@dsvn.vn', '0901000001', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'NAM', '1985-01-01', 'HOAT_DONG', GETDATE(), GETDATE()),
('NVDH-001', 'NHAN_VIEN_DIEU_HANH', N'Điều Hành 1', 'dh1@dsvn.vn', '0902000001', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'NAM', '1990-01-01', 'HOAT_DONG', GETDATE(), GETDATE()),
('NVNG-001', 'NHAN_VIEN_NHA_GA', N'Nhà Ga 1', 'ng1@dsvn.vn', '0903000001', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'NU', '1995-01-01', 'HOAT_DONG', GETDATE(), GETDATE()),
('BQL-001', 'BAN_QUAN_LY', N'Ban Quản Lý', 'bql1@dsvn.vn', '0904000001', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'NAM', '1980-01-01', 'HOAT_DONG', GETDATE(), GETDATE());

-- ============================================
-- 2. GA & TUYẾN ĐƯỜNG
-- ============================================
INSERT INTO GA (ma_ga, ten_ga, dia_chi, thu_tu_tren_tuyen, trang_thai, ngay_tao) VALUES
('GA-HN', N'Ga Hà Nội', N'Hà Nội', 1, 'HOAT_DONG', GETDATE()),
('GA-HUE', N'Ga Huế', N'Huế', 2, 'HOAT_DONG', GETDATE()),
('GA-DN', N'Ga Đà Nẵng', N'Đà Nẵng', 3, 'HOAT_DONG', GETDATE()),
('GA-SGN', N'Ga Sài Gòn', N'TP.HCM', 4, 'HOAT_DONG', GETDATE());

INSERT INTO TUYEN_DUONG (ma_tuyen, ten_tuyen, ma_ga_dau, ma_ga_cuoi, khoang_cach_km, trang_thai, ngay_tao) VALUES
('TU-BN', N'Bắc - Nam', 'GA-HN', 'GA-SGN', 1726.00, 'HOAT_DONG', GETDATE()),
('TU-DN-HUE', N'Đà Nẵng - Huế', 'GA-DN', 'GA-HUE', 103.00, 'HOAT_DONG', GETDATE());

INSERT INTO GA_TUYEN (ma_ga, ma_tuyen, thu_tu_tren_tuyen, khoang_cach_tu_dau_km, thoi_gian_dung_phut, ngay_tao) VALUES
('GA-HN', 'TU-BN', 1, 0, 0, GETDATE()),
('GA-HUE', 'TU-BN', 2, 688, 15, GETDATE()),
('GA-DN', 'TU-BN', 3, 791, 20, GETDATE()),
('GA-SGN', 'TU-BN', 4, 1726, 0, GETDATE()),
('GA-DN', 'TU-DN-HUE', 1, 0, 0, GETDATE()),
('GA-HUE', 'TU-DN-HUE', 2, 103, 0, GETDATE());

-- ============================================
-- 3. TÀU
-- ============================================
INSERT INTO TAU (ma_tau, ten_tau, loai_tau, so_toa, suc_chua_hanh_khach, trang_thai, ngay_tao, ngay_cap_nhat) VALUES
('SE1', N'Tàu Khách SE1', 'TAU_NHANH', 10, 500, 'HOAT_DONG', GETDATE(), GETDATE()),
('HH1', N'Tàu Hàng HH1', 'TAU_HANG', 20, 0, 'HOAT_DONG', GETDATE(), GETDATE());

-- ============================================
-- 4. ĐƯỜNG RAY (Ga Đà Nẵng)
-- 6 trạng thái để test mọi trường hợp
-- ============================================
INSERT INTO DUONG_RAY (ma_ray, ma_ga, so_ray, chieu_dai_ray, trang_thai, ghi_chu, ngay_tao, thoi_gian_bat_dau_phong_toa, thoi_gian_ket_thuc_phong_toa) VALUES
('RAY-01', 'GA-DN', 1, 400.00, 'SAN_SANG',   N'Trống, có thể xếp tàu', GETDATE(), NULL, NULL),
('RAY-02', 'GA-DN', 2, 400.00, 'DANG_SU_DUNG',N'Đang có tàu dừng', GETDATE(), NULL, NULL),
('RAY-03', 'GA-DN', 3, 400.00, 'BAO_TRI',    N'Đang bảo trì định kỳ', GETDATE(), NULL, NULL),
('RAY-04', 'GA-DN', 4, 400.00, 'PHONG_TOA_CUNG',  N'Phong tỏa cứng do sự cố nghiêm trọng', GETDATE(), GETDATE(), DATEADD(HOUR, 24, GETDATE())),
('RAY-05', 'GA-DN', 5, 400.00, 'PHONG_TOA_TAM',  N'Phong tỏa tạm thời, có thể tự giải phóng', GETDATE(), DATEADD(HOUR, -1, GETDATE()), DATEADD(HOUR, 2, GETDATE())),
('RAY-06', 'GA-DN', 6, 400.00, 'SAN_SANG',   N'Trống, ray dự phòng', GETDATE(), NULL, NULL);

-- ============================================
-- 5. BỘ GHI (Test Ràng buộc vật lý)
-- ============================================
INSERT INTO BO_GHI (ma_bo_ghi, ray_bat_dau, ray_ket_noi, vi_tri_km, thoi_gian_tac_nghiep, trang_thai, ghi_chu) VALUES
('BG-01-02', 'RAY-01', 'RAY-02', 790.800, 3, 'SAN_SANG', N'Nối Ray 1 và 2 - Test đổi ray thành công'),
('BG-01-05', 'RAY-01', 'RAY-05', 790.900, 5, 'BAO_TRI',  N'Nối Ray 1 và 5 - Test đổi ray thất bại do bảo trì'),
('BG-01-06', 'RAY-01', 'RAY-06', 790.850, 4, 'SAN_SANG', N'Nối Ray 1 và 6 - Cho phép chuyển ray an toàn'),
('BG-02-04', 'RAY-02', 'RAY-04', 791.100, 4, 'SAN_SANG', N'Nối Ray 2 và 4 - Test đổi ray'),
('BG-04-06', 'RAY-04', 'RAY-06', 791.200, 3, 'SAN_SANG', N'Nối Ray 4 và 6 - Test đổi ray'),
('BG-05-06', 'RAY-05', 'RAY-06', 791.300, 3, 'SAN_SANG', N'Nối Ray 5 và 6 - Test đổi ray');

-- ============================================
-- 6. CHUYẾN TÀU
-- Đủ 3 vai trò: TRUNG_GIAN, XUAT_PHAT, DIEM_CUOI
-- ============================================
INSERT INTO CHUYEN_TAU (ma_chuyen_tau, ma_tau, ma_tuyen, vai_tro_tai_da_nang, gio_den_du_kien, gio_di_du_kien, ngay_chay, trang_thai, ngay_tao, ngay_cap_nhat) VALUES
-- Tàu chạy hôm nay
('CT-SE1-TG', 'SE1', 'TU-BN', 'TRUNG_GIAN', '10:00', '10:20', CONVERT(VARCHAR(10), GETDATE(), 120), 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-HH1-XP', 'HH1', 'TU-DN-HUE', 'XUAT_PHAT', NULL, '14:00', CONVERT(VARCHAR(10), GETDATE(), 120), 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-SE1-DC', 'SE1', 'TU-DN-HUE', 'DIEM_CUOI', '18:00', NULL, CONVERT(VARCHAR(10), GETDATE(), 120), 'HOAT_DONG', GETDATE(), GETDATE()),
-- Tàu chạy ngày mai
('CT-SE2-TG', 'SE1', 'TU-BN', 'TRUNG_GIAN', '10:00', '10:20', CONVERT(VARCHAR(10), DATEADD(day, 1, GETDATE()), 120), 'HOAT_DONG', GETDATE(), GETDATE()),
-- Dữ liệu lịch sử 7 ngày qua
('CT-HIS-01', 'SE1', 'TU-BN', 'TRUNG_GIAN', '08:00', '08:20', CONVERT(VARCHAR(10), DATEADD(day, -2, GETDATE()), 120), 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-HIS-02', 'HH1', 'TU-DN-HUE', 'XUAT_PHAT', NULL, '10:00', CONVERT(VARCHAR(10), DATEADD(day, -3, GETDATE()), 120), 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-HIS-03', 'SE1', 'TU-DN-HUE', 'DIEM_CUOI', '15:00', NULL, CONVERT(VARCHAR(10), DATEADD(day, -4, GETDATE()), 120), 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-HIS-04', 'HH1', 'TU-BN', 'TRUNG_GIAN', '09:00', '09:30', CONVERT(VARCHAR(10), DATEADD(day, -5, GETDATE()), 120), 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-HIS-05', 'SE1', 'TU-DN-HUE', 'XUAT_PHAT', NULL, '11:00', CONVERT(VARCHAR(10), DATEADD(day, -6, GETDATE()), 120), 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-HIS-06', 'HH1', 'TU-BN', 'DIEM_CUOI', '20:00', NULL, CONVERT(VARCHAR(10), DATEADD(day, -7, GETDATE()), 120), 'HOAT_DONG', GETDATE(), GETDATE()),
-- 30 generated historical records
('CT-GEN-01', 'SE1', 'TU-BN', 'TRUNG_GIAN', '08:00', '08:20', CONVERT(VARCHAR(10), DATEADD(day, -8, GETDATE()), 120), 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-GEN-02', 'HH1', 'TU-DN-HUE', 'XUAT_PHAT', NULL, '10:00', CONVERT(VARCHAR(10), DATEADD(day, -9, GETDATE()), 120), 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-GEN-03', 'SE1', 'TU-DN-HUE', 'DIEM_CUOI', '15:00', NULL, CONVERT(VARCHAR(10), DATEADD(day, -10, GETDATE()), 120), 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-GEN-04', 'HH1', 'TU-BN', 'TRUNG_GIAN', '09:00', '09:30', CONVERT(VARCHAR(10), DATEADD(day, -11, GETDATE()), 120), 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-GEN-05', 'SE1', 'TU-DN-HUE', 'XUAT_PHAT', NULL, '11:00', CONVERT(VARCHAR(10), DATEADD(day, -12, GETDATE()), 120), 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-GEN-06', 'HH1', 'TU-BN', 'DIEM_CUOI', '20:00', NULL, CONVERT(VARCHAR(10), DATEADD(day, -13, GETDATE()), 120), 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-GEN-07', 'SE1', 'TU-BN', 'TRUNG_GIAN', '08:00', '08:20', CONVERT(VARCHAR(10), DATEADD(day, -14, GETDATE()), 120), 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-GEN-08', 'HH1', 'TU-DN-HUE', 'XUAT_PHAT', NULL, '10:00', CONVERT(VARCHAR(10), DATEADD(day, -15, GETDATE()), 120), 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-GEN-09', 'SE1', 'TU-DN-HUE', 'DIEM_CUOI', '15:00', NULL, CONVERT(VARCHAR(10), DATEADD(day, -16, GETDATE()), 120), 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-GEN-10', 'HH1', 'TU-BN', 'TRUNG_GIAN', '09:00', '09:30', CONVERT(VARCHAR(10), DATEADD(day, -17, GETDATE()), 120), 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-GEN-11', 'SE1', 'TU-DN-HUE', 'XUAT_PHAT', NULL, '11:00', CONVERT(VARCHAR(10), DATEADD(day, -18, GETDATE()), 120), 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-GEN-12', 'HH1', 'TU-BN', 'DIEM_CUOI', '20:00', NULL, CONVERT(VARCHAR(10), DATEADD(day, -19, GETDATE()), 120), 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-GEN-13', 'SE1', 'TU-BN', 'TRUNG_GIAN', '08:00', '08:20', CONVERT(VARCHAR(10), DATEADD(day, -20, GETDATE()), 120), 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-GEN-14', 'HH1', 'TU-DN-HUE', 'XUAT_PHAT', NULL, '10:00', CONVERT(VARCHAR(10), DATEADD(day, -21, GETDATE()), 120), 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-GEN-15', 'SE1', 'TU-DN-HUE', 'DIEM_CUOI', '15:00', NULL, CONVERT(VARCHAR(10), DATEADD(day, -22, GETDATE()), 120), 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-GEN-16', 'HH1', 'TU-BN', 'TRUNG_GIAN', '09:00', '09:30', CONVERT(VARCHAR(10), DATEADD(day, -23, GETDATE()), 120), 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-GEN-17', 'SE1', 'TU-DN-HUE', 'XUAT_PHAT', NULL, '11:00', CONVERT(VARCHAR(10), DATEADD(day, -24, GETDATE()), 120), 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-GEN-18', 'HH1', 'TU-BN', 'DIEM_CUOI', '20:00', NULL, CONVERT(VARCHAR(10), DATEADD(day, -25, GETDATE()), 120), 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-GEN-19', 'SE1', 'TU-BN', 'TRUNG_GIAN', '08:00', '08:20', CONVERT(VARCHAR(10), DATEADD(day, -26, GETDATE()), 120), 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-GEN-20', 'HH1', 'TU-DN-HUE', 'XUAT_PHAT', NULL, '10:00', CONVERT(VARCHAR(10), DATEADD(day, -27, GETDATE()), 120), 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-GEN-21', 'SE1', 'TU-DN-HUE', 'DIEM_CUOI', '15:00', NULL, CONVERT(VARCHAR(10), DATEADD(day, -28, GETDATE()), 120), 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-GEN-22', 'HH1', 'TU-BN', 'TRUNG_GIAN', '09:00', '09:30', CONVERT(VARCHAR(10), DATEADD(day, -29, GETDATE()), 120), 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-GEN-23', 'SE1', 'TU-DN-HUE', 'XUAT_PHAT', NULL, '11:00', CONVERT(VARCHAR(10), DATEADD(day, -30, GETDATE()), 120), 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-GEN-24', 'HH1', 'TU-BN', 'DIEM_CUOI', '20:00', NULL, CONVERT(VARCHAR(10), DATEADD(day, -31, GETDATE()), 120), 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-GEN-25', 'SE1', 'TU-BN', 'TRUNG_GIAN', '08:00', '08:20', CONVERT(VARCHAR(10), DATEADD(day, -32, GETDATE()), 120), 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-GEN-26', 'HH1', 'TU-DN-HUE', 'XUAT_PHAT', NULL, '10:00', CONVERT(VARCHAR(10), DATEADD(day, -33, GETDATE()), 120), 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-GEN-27', 'SE1', 'TU-DN-HUE', 'DIEM_CUOI', '15:00', NULL, CONVERT(VARCHAR(10), DATEADD(day, -34, GETDATE()), 120), 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-GEN-28', 'HH1', 'TU-BN', 'TRUNG_GIAN', '09:00', '09:30', CONVERT(VARCHAR(10), DATEADD(day, -35, GETDATE()), 120), 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-GEN-29', 'SE1', 'TU-DN-HUE', 'XUAT_PHAT', NULL, '11:00', CONVERT(VARCHAR(10), DATEADD(day, -36, GETDATE()), 120), 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-GEN-30', 'HH1', 'TU-BN', 'DIEM_CUOI', '20:00', NULL, CONVERT(VARCHAR(10), DATEADD(day, -37, GETDATE()), 120), 'HOAT_DONG', GETDATE(), GETDATE());

-- ============================================
-- 7. LỊCH TRÌNH
-- 6 Case bao phủ toàn bộ vòng đời
-- ============================================
DECLARE @today DATE = CAST(GETDATE() AS DATE);
DECLARE @t DATETIME = CAST(@today AS DATETIME);

INSERT INTO LICH_TRINH (ma_lich_trinh, ma_chuyen_tau, ma_ray, ma_nguoi_cap_nhat, ma_su_co_anh_huong, gio_den_du_kien, gio_di_du_kien, gio_den_thuc_te, gio_di_thuc_te, so_phut_tre, trang_thai, phuong_an_xu_ly, ghi_chu, ngay_tao, ngay_cap_nhat) VALUES
-- Case 1: Tàu sắp đến, chờ xếp ray (CHO_XAC_NHAN)
('LT-CASE-1', 'CT-SE1-TG', NULL, NULL, NULL, DATEADD(MINUTE,600,@t), DATEADD(MINUTE,620,@t), NULL, NULL, 0, 'CHO_XAC_NHAN', NULL, N'Test xếp ray cho tàu sắp vào ga', GETDATE(), GETDATE()),

-- Case 2: Tàu đang trong ga, chuẩn bị xuất phát (DUNG_TAI_GA)
('LT-CASE-2', 'CT-HH1-XP', 'RAY-02', 'NVDH-001', NULL, NULL, DATEADD(MINUTE,840,@t), NULL, NULL, 0, 'DUNG_TAI_GA', NULL, N'Test xác nhận tàu xuất phát', GETDATE(), GETDATE()),

-- Case 3: Tàu đang chờ xử lý sự cố (TRE + Đã có mã sự cố)
('LT-CASE-3', 'CT-SE1-DC', 'RAY-01', 'NVDH-001', 'SC-ESCALATED', DATEADD(MINUTE,1080,@t), NULL, NULL, NULL, 45, 'TRE', 'CHO_RAY', N'Test BQL Override và Đổi Ray', GETDATE(), GETDATE()),

-- Case 4: Tàu bị hủy do sự cố (HUY)
('LT-CASE-4', 'CT-SE1-TG', 'RAY-04', 'NVDH-001', 'SC-NORMAL', DATEADD(MINUTE,500,@t), DATEADD(MINUTE,520,@t), NULL, NULL, 0, 'HUY', 'HUY_CHUYEN', N'Đã hủy chuyến do ray 4 phong tỏa', GETDATE(), GETDATE()),

-- Case 5: Tàu đã xuất phát thành công (DANG_DI_CHUYEN)
('LT-CASE-5', 'CT-HH1-XP', 'RAY-06', 'NVDH-001', NULL, NULL, DATEADD(MINUTE,300,@t), NULL, DATEADD(MINUTE,305,@t), 5, 'DANG_DI_CHUYEN', NULL, N'Test tàu đã chạy', GETDATE(), GETDATE()),

-- Case 6: Lịch trình cũ hôm qua (DA_HOAN_THANH)
('LT-CASE-6', 'CT-SE1-DC', 'RAY-06', 'NVDH-001', NULL, DATEADD(MINUTE,-1440,@t), NULL, DATEADD(MINUTE,-1430,@t), NULL, 10, 'DA_HOAN_THANH', NULL, N'Test lịch sử', DATEADD(DAY, -1, GETDATE()), DATEADD(DAY, -1, GETDATE())),

-- Case 7: Tàu phụ sắp đến (CHO_XAC_NHAN)
('LT-CASE-7', 'CT-SE2-TG', NULL, NULL, NULL, DATEADD(MINUTE,720,@t), DATEADD(MINUTE,750,@t), NULL, NULL, 0, 'CHO_XAC_NHAN', NULL, N'Test conflict xếp ray', GETDATE(), GETDATE()),

-- Case 8: Tàu đang bị sự cố RED ALERT (TRE)
('LT-CASE-8', 'CT-SE1-TG', 'RAY-02', 'NVDH-001', 'SC-RED-TRAIN', DATEADD(MINUTE,650,@t), DATEADD(MINUTE,670,@t), NULL, NULL, 20, 'TRE', 'CHO_RAY', N'Test đổi ray khẩn cấp RED', GETDATE(), GETDATE()),

-- Dữ liệu thống kê lịch sử 7 ngày
('LT-HIS-01', 'CT-HIS-01', 'RAY-01', 'NVDH-001', NULL, DATEADD(MINUTE,-2880+480,@t), DATEADD(MINUTE,-2880+500,@t), DATEADD(MINUTE,-2880+480,@t), DATEADD(MINUTE,-2880+500,@t), 0, 'DA_HOAN_THANH', NULL, N'Đúng giờ', DATEADD(DAY, -2, GETDATE()), DATEADD(DAY, -2, GETDATE())),
('LT-HIS-02', 'CT-HIS-02', 'RAY-02', 'NVDH-001', 'SC-HIS-01', NULL, DATEADD(MINUTE,-4320+600,@t), NULL, DATEADD(MINUTE,-4320+645,@t), 45, 'DA_HOAN_THANH', 'DOI_RAY', N'Trễ do sự cố', DATEADD(DAY, -3, GETDATE()), DATEADD(DAY, -3, GETDATE())),
('LT-HIS-03', 'CT-HIS-03', 'RAY-03', 'NVDH-001', NULL, DATEADD(MINUTE,-5760+900,@t), NULL, DATEADD(MINUTE,-5760+910,@t), NULL, 10, 'DA_HOAN_THANH', NULL, N'Trễ nhẹ', DATEADD(DAY, -4, GETDATE()), DATEADD(DAY, -4, GETDATE())),
('LT-HIS-04', 'CT-HIS-04', 'RAY-04', 'NVDH-001', 'SC-HIS-02', DATEADD(MINUTE,-7200+540,@t), DATEADD(MINUTE,-7200+570,@t), NULL, NULL, 0, 'HUY', 'HUY_CHUYEN', N'Hủy chuyến', DATEADD(DAY, -5, GETDATE()), DATEADD(DAY, -5, GETDATE())),
('LT-HIS-05', 'CT-HIS-05', 'RAY-05', 'NVDH-001', NULL, NULL, DATEADD(MINUTE,-8640+660,@t), NULL, DATEADD(MINUTE,-8640+660,@t), 0, 'DA_HOAN_THANH', NULL, N'Đúng giờ', DATEADD(DAY, -6, GETDATE()), DATEADD(DAY, -6, GETDATE())),
('LT-HIS-06', 'CT-HIS-06', 'RAY-06', 'NVDH-001', NULL, DATEADD(MINUTE,-10080+1200,@t), NULL, DATEADD(MINUTE,-10080+1205,@t), NULL, 5, 'DA_HOAN_THANH', NULL, N'Trễ nhẹ', DATEADD(DAY, -7, GETDATE()), DATEADD(DAY, -7, GETDATE())),
-- 30 generated historical schedules
('LT-GEN-01', 'CT-GEN-01', 'RAY-01', 'NVDH-001', NULL, DATEADD(MINUTE,-11520+480,@t), DATEADD(MINUTE,-11520+500,@t), DATEADD(MINUTE,-11520+480,@t), DATEADD(MINUTE,-11520+500,@t), 0, 'DA_HOAN_THANH', NULL, N'Đúng giờ', DATEADD(DAY, -8, GETDATE()), DATEADD(DAY, -8, GETDATE())),
('LT-GEN-02', 'CT-GEN-02', 'RAY-02', 'NVDH-001', NULL, NULL, DATEADD(MINUTE,-12960+600,@t), NULL, DATEADD(MINUTE,-12960+615,@t), 15, 'DA_HOAN_THANH', NULL, N'Trễ nhẹ', DATEADD(DAY, -9, GETDATE()), DATEADD(DAY, -9, GETDATE())),
('LT-GEN-03', 'CT-GEN-03', 'RAY-03', 'NVDH-001', NULL, DATEADD(MINUTE,-14400+900,@t), NULL, DATEADD(MINUTE,-14400+900,@t), NULL, 0, 'DA_HOAN_THANH', NULL, N'Đúng giờ', DATEADD(DAY, -10, GETDATE()), DATEADD(DAY, -10, GETDATE())),
('LT-GEN-04', 'CT-GEN-04', 'RAY-04', 'NVDH-001', NULL, DATEADD(MINUTE,-15840+540,@t), DATEADD(MINUTE,-15840+570,@t), NULL, NULL, 0, 'HUY', 'HUY_CHUYEN', N'Hủy chuyến', DATEADD(DAY, -11, GETDATE()), DATEADD(DAY, -11, GETDATE())),
('LT-GEN-05', 'CT-GEN-05', 'RAY-05', 'NVDH-001', NULL, NULL, DATEADD(MINUTE,-17280+660,@t), NULL, DATEADD(MINUTE,-17280+660,@t), 0, 'DA_HOAN_THANH', NULL, N'Đúng giờ', DATEADD(DAY, -12, GETDATE()), DATEADD(DAY, -12, GETDATE())),
('LT-GEN-06', 'CT-GEN-06', 'RAY-06', 'NVDH-001', NULL, DATEADD(MINUTE,-18720+1200,@t), NULL, DATEADD(MINUTE,-18720+1205,@t), NULL, 5, 'DA_HOAN_THANH', NULL, N'Trễ nhẹ', DATEADD(DAY, -13, GETDATE()), DATEADD(DAY, -13, GETDATE())),
('LT-GEN-07', 'CT-GEN-07', 'RAY-01', 'NVDH-001', NULL, DATEADD(MINUTE,-20160+480,@t), DATEADD(MINUTE,-20160+500,@t), DATEADD(MINUTE,-20160+480,@t), DATEADD(MINUTE,-20160+500,@t), 0, 'DA_HOAN_THANH', NULL, N'Đúng giờ', DATEADD(DAY, -14, GETDATE()), DATEADD(DAY, -14, GETDATE())),
('LT-GEN-08', 'CT-GEN-08', 'RAY-02', 'NVDH-001', NULL, NULL, DATEADD(MINUTE,-21600+600,@t), NULL, DATEADD(MINUTE,-21600+615,@t), 15, 'DA_HOAN_THANH', NULL, N'Trễ nhẹ', DATEADD(DAY, -15, GETDATE()), DATEADD(DAY, -15, GETDATE())),
('LT-GEN-09', 'CT-GEN-09', 'RAY-03', 'NVDH-001', NULL, DATEADD(MINUTE,-23040+900,@t), NULL, DATEADD(MINUTE,-23040+900,@t), NULL, 0, 'DA_HOAN_THANH', NULL, N'Đúng giờ', DATEADD(DAY, -16, GETDATE()), DATEADD(DAY, -16, GETDATE())),
('LT-GEN-10', 'CT-GEN-10', 'RAY-04', 'NVDH-001', NULL, DATEADD(MINUTE,-24480+540,@t), DATEADD(MINUTE,-24480+570,@t), NULL, NULL, 0, 'HUY', 'HUY_CHUYEN', N'Hủy chuyến', DATEADD(DAY, -17, GETDATE()), DATEADD(DAY, -17, GETDATE())),
('LT-GEN-11', 'CT-GEN-11', 'RAY-05', 'NVDH-001', NULL, NULL, DATEADD(MINUTE,-25920+660,@t), NULL, DATEADD(MINUTE,-25920+660,@t), 0, 'DA_HOAN_THANH', NULL, N'Đúng giờ', DATEADD(DAY, -18, GETDATE()), DATEADD(DAY, -18, GETDATE())),
('LT-GEN-12', 'CT-GEN-12', 'RAY-06', 'NVDH-001', NULL, DATEADD(MINUTE,-27360+1200,@t), NULL, DATEADD(MINUTE,-27360+1230,@t), NULL, 30, 'DA_HOAN_THANH', NULL, N'Trễ nhẹ', DATEADD(DAY, -19, GETDATE()), DATEADD(DAY, -19, GETDATE())),
('LT-GEN-13', 'CT-GEN-13', 'RAY-01', 'NVDH-001', NULL, DATEADD(MINUTE,-28800+480,@t), DATEADD(MINUTE,-28800+500,@t), DATEADD(MINUTE,-28800+480,@t), DATEADD(MINUTE,-28800+500,@t), 0, 'DA_HOAN_THANH', NULL, N'Đúng giờ', DATEADD(DAY, -20, GETDATE()), DATEADD(DAY, -20, GETDATE())),
('LT-GEN-14', 'CT-GEN-14', 'RAY-02', 'NVDH-001', NULL, NULL, DATEADD(MINUTE,-30240+600,@t), NULL, DATEADD(MINUTE,-30240+615,@t), 15, 'DA_HOAN_THANH', NULL, N'Trễ nhẹ', DATEADD(DAY, -21, GETDATE()), DATEADD(DAY, -21, GETDATE())),
('LT-GEN-15', 'CT-GEN-15', 'RAY-03', 'NVDH-001', NULL, DATEADD(MINUTE,-31680+900,@t), NULL, DATEADD(MINUTE,-31680+900,@t), NULL, 0, 'DA_HOAN_THANH', NULL, N'Đúng giờ', DATEADD(DAY, -22, GETDATE()), DATEADD(DAY, -22, GETDATE())),
('LT-GEN-16', 'CT-GEN-16', 'RAY-04', 'NVDH-001', NULL, DATEADD(MINUTE,-33120+540,@t), DATEADD(MINUTE,-33120+570,@t), NULL, NULL, 0, 'HUY', 'HUY_CHUYEN', N'Hủy chuyến', DATEADD(DAY, -23, GETDATE()), DATEADD(DAY, -23, GETDATE())),
('LT-GEN-17', 'CT-GEN-17', 'RAY-05', 'NVDH-001', NULL, NULL, DATEADD(MINUTE,-34560+660,@t), NULL, DATEADD(MINUTE,-34560+660,@t), 0, 'DA_HOAN_THANH', NULL, N'Đúng giờ', DATEADD(DAY, -24, GETDATE()), DATEADD(DAY, -24, GETDATE())),
('LT-GEN-18', 'CT-GEN-18', 'RAY-06', 'NVDH-001', NULL, DATEADD(MINUTE,-36000+1200,@t), NULL, DATEADD(MINUTE,-36000+1205,@t), NULL, 5, 'DA_HOAN_THANH', NULL, N'Trễ nhẹ', DATEADD(DAY, -25, GETDATE()), DATEADD(DAY, -25, GETDATE())),
('LT-GEN-19', 'CT-GEN-19', 'RAY-01', 'NVDH-001', NULL, DATEADD(MINUTE,-37440+480,@t), DATEADD(MINUTE,-37440+500,@t), DATEADD(MINUTE,-37440+480,@t), DATEADD(MINUTE,-37440+500,@t), 0, 'DA_HOAN_THANH', NULL, N'Đúng giờ', DATEADD(DAY, -26, GETDATE()), DATEADD(DAY, -26, GETDATE())),
('LT-GEN-20', 'CT-GEN-20', 'RAY-02', 'NVDH-001', NULL, NULL, DATEADD(MINUTE,-38880+600,@t), NULL, DATEADD(MINUTE,-38880+615,@t), 15, 'DA_HOAN_THANH', NULL, N'Trễ nhẹ', DATEADD(DAY, -27, GETDATE()), DATEADD(DAY, -27, GETDATE())),
('LT-GEN-21', 'CT-GEN-21', 'RAY-03', 'NVDH-001', NULL, DATEADD(MINUTE,-40320+900,@t), NULL, DATEADD(MINUTE,-40320+900,@t), NULL, 0, 'DA_HOAN_THANH', NULL, N'Đúng giờ', DATEADD(DAY, -28, GETDATE()), DATEADD(DAY, -28, GETDATE())),
('LT-GEN-22', 'CT-GEN-22', 'RAY-04', 'NVDH-001', NULL, DATEADD(MINUTE,-41760+540,@t), DATEADD(MINUTE,-41760+570,@t), NULL, NULL, 0, 'HUY', 'HUY_CHUYEN', N'Hủy chuyến', DATEADD(DAY, -29, GETDATE()), DATEADD(DAY, -29, GETDATE())),
('LT-GEN-23', 'CT-GEN-23', 'RAY-05', 'NVDH-001', NULL, NULL, DATEADD(MINUTE,-43200+660,@t), NULL, DATEADD(MINUTE,-43200+660,@t), 0, 'DA_HOAN_THANH', NULL, N'Đúng giờ', DATEADD(DAY, -30, GETDATE()), DATEADD(DAY, -30, GETDATE())),
('LT-GEN-24', 'CT-GEN-24', 'RAY-06', 'NVDH-001', NULL, DATEADD(MINUTE,-44640+1200,@t), NULL, DATEADD(MINUTE,-44640+1205,@t), NULL, 5, 'DA_HOAN_THANH', NULL, N'Trễ nhẹ', DATEADD(DAY, -31, GETDATE()), DATEADD(DAY, -31, GETDATE())),
('LT-GEN-25', 'CT-GEN-25', 'RAY-01', 'NVDH-001', NULL, DATEADD(MINUTE,-46080+480,@t), DATEADD(MINUTE,-46080+500,@t), DATEADD(MINUTE,-46080+480,@t), DATEADD(MINUTE,-46080+500,@t), 0, 'DA_HOAN_THANH', NULL, N'Đúng giờ', DATEADD(DAY, -32, GETDATE()), DATEADD(DAY, -32, GETDATE())),
('LT-GEN-26', 'CT-GEN-26', 'RAY-02', 'NVDH-001', NULL, NULL, DATEADD(MINUTE,-47520+600,@t), NULL, DATEADD(MINUTE,-47520+645,@t), 45, 'DA_HOAN_THANH', 'DOI_RAY', N'Trễ do sự cố', DATEADD(DAY, -33, GETDATE()), DATEADD(DAY, -33, GETDATE())),
('LT-GEN-27', 'CT-GEN-27', 'RAY-03', 'NVDH-001', NULL, DATEADD(MINUTE,-48960+900,@t), NULL, DATEADD(MINUTE,-48960+910,@t), NULL, 10, 'DA_HOAN_THANH', NULL, N'Trễ nhẹ', DATEADD(DAY, -34, GETDATE()), DATEADD(DAY, -34, GETDATE())),
('LT-GEN-28', 'CT-GEN-28', 'RAY-04', 'NVDH-001', NULL, DATEADD(MINUTE,-50400+540,@t), DATEADD(MINUTE,-50400+570,@t), NULL, NULL, 0, 'HUY', 'HUY_CHUYEN', N'Hủy chuyến', DATEADD(DAY, -35, GETDATE()), DATEADD(DAY, -35, GETDATE())),
('LT-GEN-29', 'CT-GEN-29', 'RAY-05', 'NVDH-001', NULL, NULL, DATEADD(MINUTE,-51840+660,@t), NULL, DATEADD(MINUTE,-51840+660,@t), 0, 'DA_HOAN_THANH', NULL, N'Đúng giờ', DATEADD(DAY, -36, GETDATE()), DATEADD(DAY, -36, GETDATE())),
('LT-GEN-30', 'CT-GEN-30', 'RAY-06', 'NVDH-001', NULL, DATEADD(MINUTE,-53280+1200,@t), NULL, DATEADD(MINUTE,-53280+1205,@t), NULL, 5, 'DA_HOAN_THANH', NULL, N'Trễ nhẹ', DATEADD(DAY, -37, GETDATE()), DATEADD(DAY, -37, GETDATE()));

-- ============================================
-- 8. SỰ CỐ (Test SLA)
-- Đủ 6 trạng thái vòng đời sự cố và SLA
-- ============================================
INSERT INTO SU_CO (ma_su_co, ma_lich_trinh, ma_nguoi_ghi_nhan, ma_ray, loai_su_co, mo_ta, muc_do, trang_thai_xu_ly, ngay_xay_ra, ngay_xu_ly, ngay_tao, han_chot_phuong_an, trang_thai_sla, ma_nguoi_phe_duyet_cuoi) VALUES
-- 1. Chờ tiếp nhận
('SC-NEW', NULL, 'NVNG-001', 'RAY-05', 'SU_CO_KY_THUAT', N'Gãy ghi nhánh ray 5', 'CAO', 'CHO_TIEP_NHAN', GETDATE(), NULL, GETDATE(), NULL, 'NORMAL', NULL),

-- 2. Đang xử lý - SLA NORMAL (Còn nhiều thời gian)
('SC-NORMAL', 'LT-CASE-4', 'NVNG-001', 'RAY-04', 'SU_CO_HA_TANG', N'Sụt lún nhẹ ray 4', 'TRUNG_BINH', 'DANG_XU_LY', DATEADD(MINUTE, -10, GETDATE()), NULL, DATEADD(MINUTE, -10, GETDATE()), DATEADD(MINUTE, 60, GETDATE()), 'NORMAL', NULL),

-- 3. Đang xử lý - SLA YELLOW (Còn <= 15 phút)
('SC-YELLOW', NULL, 'NVNG-001', NULL, 'MAT_LIEN_LAC', N'Mất tín hiệu liên lạc', 'KHAN_CAP', 'DANG_XU_LY', DATEADD(MINUTE, -20, GETDATE()), NULL, DATEADD(MINUTE, -20, GETDATE()), DATEADD(MINUTE, 10, GETDATE()), 'YELLOW_ALERT', NULL),

-- 4. Đang xử lý - SLA RED (Còn <= 5 phút)
('SC-RED', NULL, 'NVNG-001', NULL, 'THOI_TIET', N'Mưa lớn ngập sân ga', 'CAO', 'DANG_XU_LY', DATEADD(MINUTE, -30, GETDATE()), NULL, DATEADD(MINUTE, -30, GETDATE()), DATEADD(MINUTE, 2, GETDATE()), 'RED_ALERT', NULL),

-- 5. Đang xử lý - SLA ESCALATED (Quá hạn -> BQL Override)
('SC-ESCALATED', 'LT-CASE-3', 'NVNG-001', 'RAY-01', 'SU_CO_KY_THUAT', N'Hỏng phanh tàu SE1', 'CAO', 'DANG_XU_LY', DATEADD(MINUTE, -60, GETDATE()), NULL, DATEADD(MINUTE, -60, GETDATE()), DATEADD(MINUTE, -10, GETDATE()), 'ESCALATED', NULL),

-- 6. Đã xử lý thành công
('SC-RESOLVED', NULL, 'NVNG-001', 'RAY-03', 'SU_CO_HA_TANG', N'Đã khắc phục ray 3', 'TRUNG_BINH', 'DA_XU_LY', DATEADD(DAY, -1, GETDATE()), GETDATE(), DATEADD(DAY, -1, GETDATE()), DATEADD(MINUTE, 120, GETDATE()), 'NORMAL', 'BQL-001'),

-- 7. Đang xử lý - Sự cố liên quan đến tàu (RED ALERT)
('SC-RED-TRAIN', 'LT-CASE-8', 'NVNG-001', 'RAY-02', 'SU_CO_KY_THUAT', N'Lỗi động cơ, cần kéo tàu', 'CAO', 'DANG_XU_LY', DATEADD(MINUTE, -20, GETDATE()), NULL, DATEADD(MINUTE, -20, GETDATE()), DATEADD(MINUTE, 2, GETDATE()), 'RED_ALERT', NULL),

-- Dữ liệu sự cố lịch sử
('SC-HIS-01', 'LT-HIS-02', 'NVNG-001', 'RAY-02', 'SU_CO_KY_THUAT', N'Hỏng máy', 'TRUNG_BINH', 'DA_XU_LY', DATEADD(DAY, -3, GETDATE()), DATEADD(DAY, -3, GETDATE()), DATEADD(DAY, -3, GETDATE()), NULL, 'NORMAL', 'BQL-001'),
('SC-HIS-02', 'LT-HIS-04', 'NVNG-001', 'RAY-04', 'SU_CO_HA_TANG', N'Sạt lở ray', 'KHAN_CAP', 'DA_XU_LY', DATEADD(DAY, -5, GETDATE()), DATEADD(DAY, -5, GETDATE()), DATEADD(DAY, -5, GETDATE()), NULL, 'ESCALATED', 'BQL-001');

-- ============================================
-- 9. KẾ HOẠCH ĐẶC BIỆT
-- 3 trạng thái
-- ============================================
INSERT INTO KE_HOACH_DAC_BIET (ma_ke_hoach, ma_nguoi_gui, ma_nguoi_duyet, ma_lich_trinh, tieu_de, noi_dung, muc_do_uu_tien, trang_thai, y_kien_duyet, ngay_gui, ngay_duyet) VALUES
('KH-CHO-DUYET', 'NVDH-001', NULL, NULL, N'Đề xuất bảo trì', N'Cần bảo trì ray 3', 'CAO', 'CHO_PHE_DUYET', NULL, GETDATE(), NULL),
('KH-DA-DUYET', 'NVDH-001', 'BQL-001', NULL, N'Tăng cường chuyến', N'Bổ sung tàu khách', 'BINH_THUONG', 'DA_PHE_DUYET', N'Đồng ý triển khai', DATEADD(DAY, -1, GETDATE()), GETDATE()),
('KH-TU-CHOI', 'NVDH-001', 'BQL-001', NULL, N'Dời ga tạm', N'Đề xuất dời ga', 'THAP', 'TU_CHOI', N'Không hợp lý, thiếu ngân sách', DATEADD(DAY, -2, GETDATE()), GETDATE());

-- ============================================
-- 10. CHỈ ĐẠO
-- 2 trạng thái
-- ============================================
INSERT INTO CHI_DAO (ma_chi_dao, ma_nguoi_gui, ma_nguoi_nhan, tieu_de, noi_dung, muc_do_uu_tien, trang_thai, ngay_gui, ngay_doc) VALUES
('CD-GUI', 'BQL-001', 'NVDH-001', N'Chú ý an toàn', N'Giảm tốc độ khi vào ga', 'CAO', 'DA_GUI', GETDATE(), NULL),
('CD-DOC', 'BQL-001', 'NVNG-001', N'Họp giao ban', N'Chuẩn bị báo cáo tháng', 'BINH_THUONG', 'DA_DOC', DATEADD(DAY, -1, GETDATE()), GETDATE());

-- ============================================
-- 11. NHẬT KÝ
-- ============================================
INSERT INTO NHAT_KY (ma_nhat_ky, ma_tai_khoan, hanh_dong, doi_tuong, ma_doi_tuong, noi_dung_cu, noi_dung_moi, dia_chi_ip, thoi_gian) VALUES
('NK-01', 'NVDH-001', 'TAO_LICH_TRINH', 'LICH_TRINH', 'LT-CASE-1', NULL, N'Tạo lịch trình mới', '127.0.0.1', GETDATE());

-- ============================================
-- 12. QUY TẮC NGHIỆP VỤ
-- ============================================
INSERT INTO QUY_TAC_NGHIEP_VU (ma_quy_tac, ten_quy_tac, gia_tri, kieu_du_lieu, mo_ta, nhom_quy_tac, cap_nhat_lan_cuoi) VALUES 
('QT-01', N'Thời gian đệm tối thiểu sau mỗi loại tàu', '15', 'NUMBER', N'Khoảng thời gian đệm (phút)', N'LỊCH TRÌNH VÀ VẬN HÀNH', CURRENT_TIMESTAMP),
('QT-04', N'Quy trình phê duyệt Kế hoạch Đặc biệt', 'BAN_QUAN_LY', 'TEXT', N'Chức vụ duyệt', N'PHÊ DUYỆT VÀ TÀI KHOẢN', CURRENT_TIMESTAMP),
('QT-DIST-SAFE', N'Khoảng cách an toàn bộ ghi', '500', 'NUMBER', N'Khoảng cách tối thiểu (m)', N'RÀNG BUỘC VẬT LÝ', CURRENT_TIMESTAMP),
('QT-SPEED-GA', N'Tốc độ tàu trong ga', '40', 'NUMBER', N'Tốc độ trung bình (km/h)', N'RÀNG BUỘC VẬT LÝ', CURRENT_TIMESTAMP);

PRINT N'✅ Dữ liệu mẫu tối giản đã được chèn thành công!';
GO
