-- ============================================
-- HỆ THỐNG QUẢN LÝ LỊCH TRÌNH TÀU GA ĐÀ NẴNG
-- Script dữ liệu mẫu - SQL Server
-- Cập nhật: phù hợp entity mới nhất
-- ============================================

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'railway_danang')
    CREATE DATABASE railway_danang;
GO
USE railway_danang;
GO

-- ============================================
-- 1. TÀI KHOẢN (mật khẩu: 123456 - BCrypt)
-- Bao quát: 4 vai trò, đủ trạng thái, cả nam/nữ
-- ============================================
INSERT INTO TAI_KHOAN (ma_tai_khoan, quyen_truy_cap, ho_ten, email, so_dien_thoai, mat_khau, gioi_tinh, ngay_sinh, trang_thai, ngay_tao, ngay_cap_nhat) VALUES
('SYSTEM', 'QUAN_TRI_VIEN', N'Hệ Thống Tự Động', 'system@dsvn.vn', '0000000000', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'NAM', '2000-01-01', 'HOAT_DONG', GETDATE(), GETDATE()),
('QTV-001', 'QUAN_TRI_VIEN', N'Nguyễn Văn Admin', 'admin@dsvn.vn', '0901000001', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'NAM', '1985-03-15', 'HOAT_DONG', GETDATE(), GETDATE()),
('QTV-002', 'QUAN_TRI_VIEN', N'Trần Thị Bích Ngọc', 'ngoc.admin@dsvn.vn', '0901000002', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'NU', '1988-07-22', 'HOAT_DONG', GETDATE(), GETDATE()),
('NVDH-001', 'NHAN_VIEN_DIEU_HANH', N'Lê Minh Tuấn', 'tuan.dh@dsvn.vn', '0902000001', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'NAM', '1990-01-10', 'HOAT_DONG', GETDATE(), GETDATE()),
('NVDH-002', 'NHAN_VIEN_DIEU_HANH', N'Phạm Thị Hồng', 'hong.dh@dsvn.vn', '0902000002', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'NU', '1992-05-18', 'HOAT_DONG', GETDATE(), GETDATE()),
('NVDH-003', 'NHAN_VIEN_DIEU_HANH', N'Hoàng Đức Anh', 'anh.dh@dsvn.vn', '0902000003', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'NAM', '1991-11-03', 'HOAT_DONG', GETDATE(), GETDATE()),
('NVDH-004', 'NHAN_VIEN_DIEU_HANH', N'Võ Thị Mai', 'mai.dh@dsvn.vn', '0902000004', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'NU', '1993-08-25', 'KHOA', GETDATE(), GETDATE()),
('NVNG-001', 'NHAN_VIEN_NHA_GA', N'Nguyễn Hữu Thành', 'thanh.ng@dsvn.vn', '0903000001', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'NAM', '1994-04-12', 'HOAT_DONG', GETDATE(), GETDATE()),
('NVNG-002', 'NHAN_VIEN_NHA_GA', N'Đặng Thị Lan', 'lan.ng@dsvn.vn', '0903000002', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'NU', '1995-09-30', 'HOAT_DONG', GETDATE(), GETDATE()),
('NVNG-003', 'NHAN_VIEN_NHA_GA', N'Bùi Văn Hùng', 'hung.ng@dsvn.vn', '0903000003', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'NAM', '1993-02-14', 'HOAT_DONG', GETDATE(), GETDATE()),
('NVNG-004', 'NHAN_VIEN_NHA_GA', N'Trịnh Thị Hạnh', 'hanh.ng@dsvn.vn', '0903000004', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'NU', '1996-12-05', 'CHO_XAC_NHAN', GETDATE(), GETDATE()),
('BQL-001', 'BAN_QUAN_LY', N'Trương Quang Vinh', 'vinh.bql@dsvn.vn', '0904000001', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'NAM', '1980-06-20', 'HOAT_DONG', GETDATE(), GETDATE()),
('BQL-002', 'BAN_QUAN_LY', N'Lý Thị Phương', 'phuong.bql@dsvn.vn', '0904000002', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'NU', '1982-10-08', 'HOAT_DONG', GETDATE(), GETDATE()),
('BQL-003', 'BAN_QUAN_LY', N'Đỗ Hữu Nghĩa', 'nghia.bql@dsvn.vn', '0904000003', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'NAM', '1978-01-15', 'HOAT_DONG', GETDATE(), GETDATE()),
('NVDH-005', 'NHAN_VIEN_DIEU_HANH', N'Trần Quốc Bảo', 'bao.dh@dsvn.vn', '0902000005', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'NAM', '1989-06-15', 'HOAT_DONG', GETDATE(), GETDATE()),
('NVNG-005', 'NHAN_VIEN_NHA_GA', N'Lê Thị Ngọc Ánh', 'anh.ng@dsvn.vn', '0903000005', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'NU', '1997-03-20', 'KHOA', GETDATE(), GETDATE());

-- ============================================
-- 2. GA
-- ============================================
INSERT INTO GA (ma_ga, ten_ga, dia_chi, thu_tu_tren_tuyen, trang_thai, ngay_tao) VALUES
('GA-HN', N'Ga Hà Nội', N'120 Lê Duẩn, Hoàn Kiếm, Hà Nội', 1, 'HOAT_DONG', GETDATE()),
('GA-TH', N'Ga Thanh Hóa', N'TP Thanh Hóa, Thanh Hóa', 2, 'HOAT_DONG', GETDATE()),
('GA-VINH', N'Ga Vinh', N'TP Vinh, Nghệ An', 3, 'HOAT_DONG', GETDATE()),
('GA-DONG_HA', N'Ga Đông Hà', N'TP Đông Hà, Quảng Trị', 4, 'HOAT_DONG', GETDATE()),
('GA-HUE', N'Ga Huế', N'2 Bùi Thị Xuân, TP Huế', 5, 'HOAT_DONG', GETDATE()),
('GA-DN', N'Ga Đà Nẵng', N'791 Hải Phòng, Thanh Khê, Đà Nẵng', 6, 'HOAT_DONG', GETDATE()),
('GA-TAM_KY', N'Ga Tam Kỳ', N'TP Tam Kỳ, Quảng Nam', 7, 'HOAT_DONG', GETDATE()),
('GA-QN', N'Ga Quảng Ngãi', N'TP Quảng Ngãi', 8, 'HOAT_DONG', GETDATE()),
('GA-DT', N'Ga Diêu Trì', N'Tuy Phước, Bình Định', 9, 'HOAT_DONG', GETDATE()),
('GA-NTR', N'Ga Nha Trang', N'17 Thái Nguyên, Nha Trang', 10, 'HOAT_DONG', GETDATE()),
('GA-SGN', N'Ga Sài Gòn', N'1 Nguyễn Thông, Q.3, TP.HCM', 11, 'HOAT_DONG', GETDATE()),
('GA-PY', N'Ga Phú Yên', N'TP Tuy Hòa, Phú Yên', 12, 'TAM_NGUNG', GETDATE());

-- ============================================
-- 3. TUYẾN ĐƯỜNG
-- ============================================
INSERT INTO TUYEN_DUONG (ma_tuyen, ten_tuyen, ma_ga_dau, ma_ga_cuoi, khoang_cach_km, trang_thai, ngay_tao) VALUES
('TU-BN', N'Bắc - Nam (Hà Nội - Sài Gòn)', 'GA-HN', 'GA-SGN', 1726.00, 'HOAT_DONG', GETDATE()),
('TU-DN-HUE', N'Đà Nẵng - Huế', 'GA-DN', 'GA-HUE', 103.00, 'HOAT_DONG', GETDATE()),
('TU-DN-QN', N'Đà Nẵng - Quảng Ngãi', 'GA-DN', 'GA-QN', 130.00, 'HOAT_DONG', GETDATE()),
('TU-DN-SGN', N'Đà Nẵng - Sài Gòn', 'GA-DN', 'GA-SGN', 935.00, 'HOAT_DONG', GETDATE()),
('TU-HN-DN', N'Hà Nội - Đà Nẵng', 'GA-HN', 'GA-DN', 791.00, 'HOAT_DONG', GETDATE()),
('TU-DN-NTR', N'Đà Nẵng - Nha Trang', 'GA-DN', 'GA-NTR', 524.00, 'TAM_NGUNG', GETDATE());

-- ============================================
-- 4. GA_TUYEN
-- ============================================
INSERT INTO GA_TUYEN (ma_ga, ma_tuyen, thu_tu_tren_tuyen, khoang_cach_tu_dau_km, thoi_gian_dung_phut, ngay_tao) VALUES
('GA-HN', 'TU-BN', 1, 0, 0, GETDATE()),
('GA-TH', 'TU-BN', 2, 175, 10, GETDATE()),
('GA-VINH', 'TU-BN', 3, 319, 15, GETDATE()),
('GA-DONG_HA', 'TU-BN', 4, 558, 10, GETDATE()),
('GA-HUE', 'TU-BN', 5, 688, 15, GETDATE()),
('GA-DN', 'TU-BN', 6, 791, 20, GETDATE()),
('GA-TAM_KY', 'TU-BN', 7, 865, 5, GETDATE()),
('GA-QN', 'TU-BN', 8, 921, 10, GETDATE()),
('GA-DT', 'TU-BN', 9, 1065, 10, GETDATE()),
('GA-NTR', 'TU-BN', 10, 1315, 15, GETDATE()),
('GA-SGN', 'TU-BN', 11, 1726, 0, GETDATE()),
('GA-DN', 'TU-DN-HUE', 1, 0, 0, GETDATE()),
('GA-HUE', 'TU-DN-HUE', 2, 103, 0, GETDATE()),
('GA-DN', 'TU-DN-QN', 1, 0, 0, GETDATE()),
('GA-TAM_KY', 'TU-DN-QN', 2, 65, 5, GETDATE()),
('GA-QN', 'TU-DN-QN', 3, 130, 0, GETDATE());

-- ============================================
-- 5. TÀU
-- ============================================
INSERT INTO TAU (ma_tau, ten_tau, loai_tau, so_toa, suc_chua_hanh_khach, trang_thai, ngay_tao, ngay_cap_nhat) VALUES
('SE1', N'Tàu SE1 Thống Nhất', 'TAU_NHANH', 14, 756, 'HOAT_DONG', GETDATE(), GETDATE()),
('SE2', N'Tàu SE2 Thống Nhất', 'TAU_NHANH', 14, 756, 'HOAT_DONG', GETDATE(), GETDATE()),
('SE3', N'Tàu SE3 Bắc Nam', 'TAU_NHANH', 13, 702, 'HOAT_DONG', GETDATE(), GETDATE()),
('SE4', N'Tàu SE4 Bắc Nam', 'TAU_NHANH', 13, 702, 'HOAT_DONG', GETDATE(), GETDATE()),
('SE5', N'Tàu SE5 Express', 'TAU_NHANH', 12, 648, 'HOAT_DONG', GETDATE(), GETDATE()),
('SE6', N'Tàu SE6 Express', 'TAU_NHANH', 12, 648, 'HOAT_DONG', GETDATE(), GETDATE()),
('SE7', N'Tàu SE7 Cao Tốc', 'TAU_NHANH', 10, 540, 'HOAT_DONG', GETDATE(), GETDATE()),
('SE8', N'Tàu SE8 Cao Tốc', 'TAU_NHANH', 10, 540, 'HOAT_DONG', GETDATE(), GETDATE()),
('TN1', N'Tàu TN1 Đà Nẵng - Huế', 'TAU_KHACH', 8, 432, 'HOAT_DONG', GETDATE(), GETDATE()),
('TN2', N'Tàu TN2 Đà Nẵng - Huế', 'TAU_KHACH', 8, 432, 'HOAT_DONG', GETDATE(), GETDATE()),
('QN1', N'Tàu QN1 Đà Nẵng - Quảng Ngãi', 'TAU_KHACH', 6, 324, 'HOAT_DONG', GETDATE(), GETDATE()),
('QN2', N'Tàu QN2 Đà Nẵng - Quảng Ngãi', 'TAU_KHACH', 6, 324, 'HOAT_DONG', GETDATE(), GETDATE()),
('HD1', N'Tàu hàng HD1', 'TAU_HANG', 20, 0, 'HOAT_DONG', GETDATE(), GETDATE()),
('HD2', N'Tàu hàng HD2', 'TAU_HANG', 25, 0, 'HOAT_DONG', GETDATE(), GETDATE()),
('DN1', N'Tàu nội đô DN1', 'TAU_KHACH', 4, 216, 'BAO_TRI', GETDATE(), GETDATE()),
('SE9', N'Tàu SE9 Đặc biệt', 'TAU_NHANH', 15, 810, 'NGUNG_HOAT_DONG', GETDATE(), GETDATE());

-- ============================================
-- 6. ĐƯỜNG RAY (Ga Đà Nẵng - 5 ray)
-- Thêm: thoi_gian_xu_ly_uoc_tinh, thoi_gian_phong_toa_uoc_tinh
-- ============================================
INSERT INTO DUONG_RAY (ma_ray, ma_ga, so_ray, chieu_dai_ray, trang_thai, ghi_chu, ngay_tao, ngay_cap_nhat, thoi_gian_xu_ly_uoc_tinh, thoi_gian_phong_toa_uoc_tinh, thoi_gian_bat_dau_phong_toa, thoi_gian_ket_thuc_phong_toa) VALUES
('RAY-01', 'GA-DN', 1, 450.00, 'SAN_SANG',   N'Đường ray chính - Trục Bắc',            GETDATE(), GETDATE(), NULL, NULL, NULL, NULL),
('RAY-02', 'GA-DN', 2, 420.00, 'SAN_SANG',   N'Đường ray chính - Trục Nam',            GETDATE(), GETDATE(), NULL, NULL, NULL, NULL),
('RAY-03', 'GA-DN', 3, 380.00, 'SAN_SANG',   N'Đường ray phụ - hàng hóa',             GETDATE(), GETDATE(), NULL, NULL, NULL, NULL),
('RAY-04', 'GA-DN', 4, 350.00, 'SAN_SANG',   N'Đường ray nhánh 1',                    GETDATE(), GETDATE(), NULL, NULL, NULL, NULL),
('RAY-05', 'GA-DN', 5, 300.00, 'BAO_TRI',    N'Đường ray nhánh 2 - Đang bảo trì',     GETDATE(), GETDATE(), 120,  480, NULL, NULL),
('RAY-06', 'GA-DN', 6, 280.00, 'PHONG_TOA',  N'Đường ray 6 - Đang phong tỏa do sự cố', GETDATE(), GETDATE(), 60,  240, NULL, NULL);


-- ============================================
-- 7. CHUYẾN TÀU
-- Bao quát: TRUNG_GIAN, XUAT_PHAT, DIEM_CUOI
-- ngayChay: HANG_NGAY, THU_2_DEN_THU_6, CUOI_TUAN, NGAY_LE
-- trangThai: HOAT_DONG, TAM_NGUNG, HUY
-- ============================================
INSERT INTO CHUYEN_TAU (ma_chuyen_tau, ma_tau, ma_tuyen, vai_tro_tai_da_nang, gio_den_du_kien, gio_di_du_kien, ngay_chay, trang_thai, ngay_tao, ngay_cap_nhat) VALUES
-- Trung gian qua Đà Nẵng
('CT-SE1-BN', 'SE1', 'TU-BN', 'TRUNG_GIAN', '10:45', '11:05', 'HANG_NGAY', 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-SE2-BN', 'SE2', 'TU-BN', 'TRUNG_GIAN', '14:30', '14:50', 'HANG_NGAY', 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-SE3-BN', 'SE3', 'TU-BN', 'TRUNG_GIAN', '03:20', '03:40', 'HANG_NGAY', 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-SE4-BN', 'SE4', 'TU-BN', 'TRUNG_GIAN', '17:15', '17:35', 'HANG_NGAY', 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-SE5-BN', 'SE5', 'TU-BN', 'TRUNG_GIAN', '06:30', '06:50', 'HANG_NGAY', 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-SE6-BN', 'SE6', 'TU-BN', 'TRUNG_GIAN', '20:00', '20:20', 'HANG_NGAY', 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-SE7-BN', 'SE7', 'TU-BN', 'TRUNG_GIAN', '08:15', '08:30', 'THU_2_DEN_THU_6', 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-SE8-BN', 'SE8', 'TU-BN', 'TRUNG_GIAN', '22:45', '23:05', 'HANG_NGAY', 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-HD1-BN', 'HD1', 'TU-BN', 'TRUNG_GIAN', '02:00', '02:30', 'THU_2_DEN_THU_6', 'HOAT_DONG', GETDATE(), GETDATE()),
-- Xuất phát từ Đà Nẵng
('CT-TN1-XP', 'TN1', 'TU-DN-HUE', 'XUAT_PHAT', NULL, '06:00', 'HANG_NGAY', 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-TN2-XP', 'TN2', 'TU-DN-HUE', 'XUAT_PHAT', NULL, '13:30', 'HANG_NGAY', 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-QN1-XP', 'QN1', 'TU-DN-QN', 'XUAT_PHAT', NULL, '07:00', 'HANG_NGAY', 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-QN2-XP', 'QN2', 'TU-DN-QN', 'XUAT_PHAT', NULL, '15:00', 'HANG_NGAY', 'HOAT_DONG', GETDATE(), GETDATE()),
-- Điểm cuối tại Đà Nẵng
('CT-TN1-DC', 'TN1', 'TU-DN-HUE', 'DIEM_CUOI', '09:30', NULL, 'HANG_NGAY', 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-TN2-DC', 'TN2', 'TU-DN-HUE', 'DIEM_CUOI', '16:45', NULL, 'HANG_NGAY', 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-QN1-DC', 'QN1', 'TU-DN-QN', 'DIEM_CUOI', '12:00', NULL, 'HANG_NGAY', 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-QN2-DC', 'QN2', 'TU-DN-QN', 'DIEM_CUOI', '19:30', NULL, 'HANG_NGAY', 'HOAT_DONG', GETDATE(), GETDATE()),
('CT-HD2-DC', 'HD2', 'TU-BN', 'DIEM_CUOI', '04:00', NULL, 'HANG_NGAY', 'HOAT_DONG', GETDATE(), GETDATE()),
-- Tạm ngưng & hủy
('CT-SE9-BN', 'SE9', 'TU-BN', 'TRUNG_GIAN', '12:00', '12:20', 'NGAY_LE', 'TAM_NGUNG', GETDATE(), GETDATE()),
('CT-DN1-XP', 'DN1', 'TU-DN-QN', 'XUAT_PHAT', NULL, '16:30', 'CUOI_TUAN', 'HUY', GETDATE(), GETDATE()),
-- Cuối tuần
('CT-SE5-CT', 'SE5', 'TU-BN', 'TRUNG_GIAN', '09:00', '09:20', 'CUOI_TUAN', 'HOAT_DONG', GETDATE(), GETDATE());

-- ============================================
-- 8. LỊCH TRÌNH
-- Thêm: ma_su_co_anh_huong, phuong_an_xu_ly, ghi_chu
-- Bao quát tất cả trạng thái: CHO_XAC_NHAN, DA_XAC_NHAN, DUNG_TAI_GA, DA_ROI_GA, TRE, HUY
-- ============================================
DECLARE @today DATE = CAST(GETDATE() AS DATE);
DECLARE @t DATETIME = CAST(@today AS DATETIME);

INSERT INTO LICH_TRINH (ma_lich_trinh, ma_chuyen_tau, ma_ray, ma_nguoi_cap_nhat, ma_su_co_anh_huong, gio_den_du_kien, gio_di_du_kien, gio_den_thuc_te, gio_di_thuc_te, so_phut_tre, trang_thai, phuong_an_xu_ly, ghi_chu, ngay_tao, ngay_cap_nhat) VALUES
-- DA_ROI_GA - đúng giờ
('LT-001', 'CT-SE5-BN', 'RAY-01', 'NVDH-001', NULL, DATEADD(MINUTE,390,@t), DATEADD(MINUTE,410,@t), DATEADD(MINUTE,390,@t), DATEADD(MINUTE,410,@t), 0, 'DA_ROI_GA', NULL, N'Đúng giờ hoàn toàn', GETDATE(), GETDATE()),
-- DA_ROI_GA - sáng sớm
('LT-002', 'CT-SE3-BN', 'RAY-03', 'NVDH-003', NULL, DATEADD(MINUTE,200,@t), DATEADD(MINUTE,220,@t), DATEADD(MINUTE,200,@t), DATEADD(MINUTE,220,@t), 0, 'DA_ROI_GA', NULL, N'Chạy sớm 3h20', GETDATE(), GETDATE()),
-- DA_ROI_GA - tàu hàng đêm
('LT-003', 'CT-HD1-BN', 'RAY-05', 'NVDH-001', NULL, DATEADD(MINUTE,120,@t), DATEADD(MINUTE,150,@t), DATEADD(MINUTE,120,@t), DATEADD(MINUTE,155,@t), 5, 'DA_ROI_GA', NULL, N'Trễ 5 phút do chuyển hàng', GETDATE(), GETDATE()),
-- DA_ROI_GA - xuất phát
('LT-004', 'CT-TN1-XP', 'RAY-01', 'NVDH-002', NULL, NULL, DATEADD(MINUTE,360,@t), NULL, DATEADD(MINUTE,360,@t), 0, 'DA_ROI_GA', NULL, N'Xuất phát đúng giờ 6h00', GETDATE(), GETDATE()),
-- DA_ROI_GA - xuất phát QN
('LT-005', 'CT-QN1-XP', 'RAY-02', 'NVDH-001', NULL, NULL, DATEADD(MINUTE,420,@t), NULL, DATEADD(MINUTE,420,@t), 0, 'DA_ROI_GA', NULL, NULL, GETDATE(), GETDATE()),
-- DUNG_TAI_GA - trễ 12 phút, có sự cố ảnh hưởng
('LT-006', 'CT-TN1-DC', 'RAY-04', 'NVDH-003', 'SC-001', DATEADD(MINUTE,570,@t), NULL, DATEADD(MINUTE,582,@t), NULL, 12, 'DUNG_TAI_GA', N'DOI_RAY', N'Trễ do tín hiệu kém đoạn Lăng Cô', GETDATE(), GETDATE()),
-- DUNG_TAI_GA - tàu hàng trễ, có sự cố
('LT-007', 'CT-HD2-DC', 'RAY-05', 'NVDH-003', 'SC-002', DATEADD(MINUTE,240,@t), NULL, DATEADD(MINUTE,250,@t), NULL, 10, 'DUNG_TAI_GA', N'DOI_RAY', N'Ghi chuyển hướng ray 5 bị kẹt', GETDATE(), GETDATE()),
-- DA_XAC_NHAN - sáng
('LT-008', 'CT-SE7-BN', 'RAY-02', 'NVDH-002', NULL, DATEADD(MINUTE,495,@t), DATEADD(MINUTE,510,@t), NULL, NULL, 0, 'DA_XAC_NHAN', NULL, N'Chờ vào ga lúc 8h15', GETDATE(), GETDATE()),
-- DA_XAC_NHAN - trưa
('LT-009', 'CT-SE1-BN', 'RAY-01', 'NVDH-001', NULL, DATEADD(MINUTE,645,@t), DATEADD(MINUTE,665,@t), NULL, NULL, 0, 'DA_XAC_NHAN', NULL, NULL, GETDATE(), GETDATE()),
-- DA_XAC_NHAN - chiều
('LT-010', 'CT-SE2-BN', 'RAY-02', 'NVDH-001', NULL, DATEADD(MINUTE,870,@t), DATEADD(MINUTE,890,@t), NULL, NULL, 0, 'DA_XAC_NHAN', NULL, NULL, GETDATE(), GETDATE()),
-- DA_XAC_NHAN - điểm cuối
('LT-011', 'CT-QN1-DC', 'RAY-04', 'NVDH-003', NULL, DATEADD(MINUTE,720,@t), NULL, NULL, NULL, 0, 'DA_XAC_NHAN', NULL, N'Dự kiến về lúc 12h', GETDATE(), GETDATE()),
-- CHO_XAC_NHAN - chưa phân ray
('LT-012', 'CT-TN2-XP', 'RAY-03', 'NVDH-002', NULL, NULL, DATEADD(MINUTE,810,@t), NULL, NULL, 0, 'CHO_XAC_NHAN', NULL, N'Chờ xác nhận ray và nhân sự', GETDATE(), GETDATE()),
-- CHO_XAC_NHAN - chiều
('LT-013', 'CT-SE4-BN', 'RAY-01', 'NVDH-002', NULL, DATEADD(MINUTE,1035,@t), DATEADD(MINUTE,1055,@t), NULL, NULL, 0, 'CHO_XAC_NHAN', NULL, NULL, GETDATE(), GETDATE()),
-- CHO_XAC_NHAN - xuất phát chiều
('LT-014', 'CT-QN2-XP', 'RAY-03', 'NVDH-002', NULL, NULL, DATEADD(MINUTE,900,@t), NULL, NULL, 0, 'CHO_XAC_NHAN', NULL, NULL, GETDATE(), GETDATE()),
-- CHO_XAC_NHAN - điểm cuối chiều
('LT-015', 'CT-TN2-DC', 'RAY-04', 'NVDH-003', NULL, DATEADD(MINUTE,1005,@t), NULL, NULL, NULL, 0, 'CHO_XAC_NHAN', NULL, NULL, GETDATE(), GETDATE()),
-- CHO_XAC_NHAN - tối
('LT-016', 'CT-SE6-BN', 'RAY-02', 'NVDH-001', NULL, DATEADD(MINUTE,1200,@t), DATEADD(MINUTE,1220,@t), NULL, NULL, 0, 'CHO_XAC_NHAN', NULL, NULL, GETDATE(), GETDATE()),
-- CHO_XAC_NHAN - khuya
('LT-017', 'CT-SE8-BN', 'RAY-01', 'NVDH-001', NULL, DATEADD(MINUTE,1365,@t), DATEADD(MINUTE,1385,@t), NULL, NULL, 0, 'CHO_XAC_NHAN', NULL, NULL, GETDATE(), GETDATE()),
-- CHO_XAC_NHAN - điểm cuối tối
('LT-018', 'CT-QN2-DC', 'RAY-04', 'NVDH-002', NULL, DATEADD(MINUTE,1170,@t), NULL, NULL, NULL, 0, 'CHO_XAC_NHAN', NULL, NULL, GETDATE(), GETDATE()),
-- TRE - trễ nặng 45 phút, có phương án xử lý
('LT-019', 'CT-SE1-BN', 'RAY-01', 'NVDH-005', 'SC-003', DATEADD(MINUTE,645,@t), DATEADD(MINUTE,665,@t), DATEADD(MINUTE,690,@t), NULL, 45, 'TRE', N'DIEU_CHINH_GIO', N'Trễ nặng do sự cố kỹ thuật tại Huế, đã điều chỉnh giờ rời ga', GETDATE(), GETDATE()),
-- TRE - trễ nhẹ
('LT-020', 'CT-SE2-BN', 'RAY-02', 'NVDH-001', NULL, DATEADD(MINUTE,870,@t), DATEADD(MINUTE,890,@t), DATEADD(MINUTE,878,@t), NULL, 8, 'TRE', NULL, N'Trễ 8 phút do chờ giao cắt', GETDATE(), GETDATE()),
-- HUY
('LT-021', 'CT-DN1-XP', 'RAY-06', 'NVDH-004', NULL, NULL, DATEADD(MINUTE,990,@t), NULL, NULL, 0, 'HUY', NULL, N'Hủy do tàu DN1 đang bảo trì', GETDATE(), GETDATE()),
-- HUY do sự cố
('LT-022', 'CT-SE9-BN', 'RAY-06', 'NVDH-005', 'SC-005', DATEADD(MINUTE,720,@t), DATEADD(MINUTE,740,@t), NULL, NULL, 0, 'HUY', N'HUY_CHUYEN', N'Hủy do ray 6 phong tỏa', GETDATE(), GETDATE()),
-- DA_ROI_GA - trễ nhẹ có ghi chú
('LT-023', 'CT-SE5-CT', 'RAY-01', 'NVDH-001', NULL, DATEADD(MINUTE,540,@t), DATEADD(MINUTE,560,@t), DATEADD(MINUTE,543,@t), DATEADD(MINUTE,563,@t), 3, 'DA_ROI_GA', NULL, N'Cuối tuần - trễ 3 phút do đông khách', GETDATE(), GETDATE()),
-- DUNG_TAI_GA - chờ xử lý, có phương án
('LT-024', 'CT-SE4-BN', 'RAY-03', 'NVDH-003', 'SC-004', DATEADD(MINUTE,1035,@t), DATEADD(MINUTE,1055,@t), DATEADD(MINUTE,1060,@t), NULL, 25, 'DUNG_TAI_GA', N'CHO_LENH', N'Đang chờ lệnh điều hành do xung đột ray', GETDATE(), GETDATE());

-- ============================================
-- 9. SỰ CỐ
-- Bao quát: loại, mức độ, trạng thái, có/không phong tỏa
-- ============================================
INSERT INTO SU_CO (ma_su_co, ma_lich_trinh, ma_nguoi_ghi_nhan, ma_ray, kich_hoat_phong_toa, loai_su_co, mo_ta, muc_do, trang_thai_xu_ly, ngay_xay_ra, ngay_xu_ly, ngay_tao) VALUES
('SC-001', 'LT-006', 'NVNG-001', 'RAY-04', 0, 'TRE_TAU', N'Tàu TN1 trễ 12 phút do tín hiệu kém đoạn Lăng Cô - Đà Nẵng', 'THAP', 'DA_XU_LY', DATEADD(MINUTE,570,@t), DATEADD(MINUTE,595,@t), GETDATE()),
('SC-002', 'LT-007', 'NVNG-002', 'RAY-05', 1, 'SU_CO_KY_THUAT', N'Hệ thống ghi chuyển hướng đường ray 5 bị kẹt', 'TRUNG_BINH', 'DANG_XU_LY', DATEADD(MINUTE,240,@t), NULL, GETDATE()),
('SC-003', 'LT-019', 'NVNG-001', NULL, 0, 'SU_CO_KY_THUAT', N'Hỏng phanh tàu SE1 tại ga Huế, phải sửa chữa khẩn cấp', 'CAO', 'DA_XU_LY', DATEADD(MINUTE,600,@t), DATEADD(MINUTE,680,@t), GETDATE()),
('SC-004', 'LT-024', 'NVNG-003', 'RAY-03', 0, 'XUNG_DOT_RAY', N'Xung đột lịch trình trên ray 3 giữa SE4 và TN2', 'TRUNG_BINH', 'DANG_XU_LY', DATEADD(MINUTE,1050,@t), NULL, GETDATE()),
('SC-005', 'LT-022', 'NVNG-001', 'RAY-06', 1, 'SU_CO_HA_TANG', N'Sụt lún đường ray 6, phong tỏa toàn bộ', 'NGHIEM_TRONG', 'CHUA_XU_LY', DATEADD(MINUTE,700,@t), NULL, GETDATE()),
('SC-006', 'LT-003', 'NVNG-002', NULL, 0, 'KHAC', N'Hành khách để quên hành lý nghi ngờ tại sân ga khu A', 'CAO', 'DA_XU_LY', DATEADD(MINUTE,480,@t), DATEADD(MINUTE,525,@t), GETDATE()),
('SC-007', 'LT-020', 'NVNG-003', NULL, 0, 'TRE_TAU', N'Tàu SE2 chờ giao cắt đường bộ tại km 785', 'THAP', 'DA_XU_LY', DATEADD(MINUTE,870,@t), DATEADD(MINUTE,878,@t), GETDATE()),
('SC-008', 'LT-001', 'NVNG-001', 'RAY-01', 0, 'THOI_TIET', N'Mưa lớn gây giảm tầm nhìn khu vực ray 1 lúc sáng sớm', 'THAP', 'DA_XU_LY', DATEADD(MINUTE,380,@t), DATEADD(MINUTE,400,@t), GETDATE());

-- ============================================
-- 10. KẾ HOẠCH ĐẶC BIỆT
-- Bao quát: tất cả trạng thái, mức ưu tiên, có/không liên kết lịch trình
-- ============================================
INSERT INTO KE_HOACH_DAC_BIET (ma_ke_hoach, ma_nguoi_gui, ma_nguoi_duyet, ma_lich_trinh, tieu_de, noi_dung, muc_do_uu_tien, trang_thai, y_kien_duyet, ngay_gui, ngay_duyet) VALUES
('KH-001', 'NVDH-001', 'BQL-001', NULL, N'Kế hoạch tăng chuyến dịp 30/4 - 1/5', N'Đề xuất tăng 4 chuyến tàu phục vụ lễ 30/4-1/5. Dự kiến bổ sung 2 chuyến TN và 2 chuyến QN trong 3 ngày.', 'CAO', 'DA_PHE_DUYET', N'Đồng ý, chuẩn bị nhân sự và đầu máy.', DATEADD(DAY,-5,GETDATE()), DATEADD(DAY,-3,GETDATE())),
('KH-002', 'NVDH-002', NULL, NULL, N'Bảo trì định kỳ đường ray 5', N'Đề xuất phong tỏa đường ray 5 để bảo trì trong 8 giờ (22:00 - 06:00).', 'BINH_THUONG', 'CHO_PHE_DUYET', NULL, DATEADD(DAY,-1,GETDATE()), NULL),
('KH-003', 'NVDH-003', 'BQL-002', NULL, N'Điều chỉnh lịch trình ngày lễ 2/9', N'Điều chỉnh giờ chạy tàu phù hợp với lượng khách tăng đột biến trong dịp lễ 2/9.', 'CAO', 'TU_CHOI', N'Cần bổ sung phương án dự phòng và ước tính chi phí.', DATEADD(DAY,-10,GETDATE()), DATEADD(DAY,-8,GETDATE())),
('KH-004', 'NVDH-001', NULL, NULL, N'Triển khai tuyến nội đô thử nghiệm', N'Đề xuất chạy thử tuyến nội đô Đà Nẵng - Tam Kỳ tần suất 30 phút/chuyến.', 'KHAN_CAP', 'CHO_PHE_DUYET', NULL, GETDATE(), NULL),
('KH-005', 'NVDH-005', 'BQL-001', 'LT-022', N'Khắc phục sụt lún đường ray 6', N'Đề xuất kế hoạch sửa chữa khẩn cấp ray 6 do sụt lún, dự kiến 3 ngày.', 'KHAN_CAP', 'DA_PHE_DUYET', N'Phê duyệt khẩn. Ưu tiên cao nhất.', DATEADD(HOUR,-5,GETDATE()), DATEADD(HOUR,-4,GETDATE())),
('KH-006', 'NVDH-002', 'BQL-003', NULL, N'Tăng thời gian đệm giữa các chuyến', N'Đề xuất tăng thời gian đệm giữa các chuyến từ 10 phút lên 15 phút để giảm xung đột.', 'BINH_THUONG', 'DA_PHE_DUYET', N'Đồng ý, áp dụng từ tuần sau.', DATEADD(DAY,-15,GETDATE()), DATEADD(DAY,-14,GETDATE())),
('KH-007', 'NVDH-003', NULL, 'LT-024', N'Giải quyết xung đột ray 3', N'Đề xuất phương án đổi ray cho SE4 sang ray 4 để tránh xung đột với TN2.', 'CAO', 'CHO_PHE_DUYET', NULL, GETDATE(), NULL),
('KH-008', 'NVDH-001', 'BQL-002', NULL, N'Lắp đặt hệ thống cảnh báo tự động', N'Đề xuất lắp hệ thống cảnh báo tự động tại các đường ngang km 780-790.', 'BINH_THUONG', 'TU_CHOI', N'Ngân sách chưa được phê duyệt cho quý này.', DATEADD(DAY,-20,GETDATE()), DATEADD(DAY,-18,GETDATE()));

-- ============================================
-- 11. CHỈ ĐẠO
-- Bao quát: DA_GUI, DA_DOC, nhiều mức ưu tiên
-- ============================================
INSERT INTO CHI_DAO (ma_chi_dao, ma_nguoi_gui, ma_nguoi_nhan, tieu_de, noi_dung, muc_do_uu_tien, trang_thai, ngay_gui, ngay_doc) VALUES
('CD-001', 'BQL-001', 'NVDH-001', N'Giảm tốc độ khu vực ray 4-6', N'Phát hiện nhiệt độ cực cao trên các đoạn ray 4-6. Tất cả đoàn tàu giới hạn 30km/h.', 'KHAN_CAP', 'DA_DOC', DATEADD(HOUR,-2,GETDATE()), DATEADD(HOUR,-1,GETDATE())),
('CD-002', 'BQL-001', 'NVDH-002', N'Quy trình bàn giao ca v4.2', N'Các yêu cầu ghi chép mới cho việc bàn giao ca có hiệu lực ngay lập tức.', 'BINH_THUONG', 'DA_GUI', DATEADD(HOUR,-5,GETDATE()), NULL),
('CD-003', 'BQL-002', 'NVDH-003', N'Kiểm tra an toàn đường ray sau mưa', N'Do mưa lớn đêm qua, yêu cầu kiểm tra toàn bộ đường ray trước khi cho tàu chạy sáng nay.', 'CAO', 'DA_DOC', DATEADD(HOUR,-8,GETDATE()), DATEADD(HOUR,-7,GETDATE())),
('CD-004', 'BQL-001', 'NVDH-005', N'Phong tỏa ray 6 ngay lập tức', N'Dừng tất cả hoạt động trên ray 6 do sụt lún. Chuyển tàu sang ray khác.', 'KHAN_CAP', 'DA_DOC', DATEADD(HOUR,-4,GETDATE()), DATEADD(HOUR,-3,GETDATE())),
('CD-005', 'BQL-003', 'NVDH-001', N'Báo cáo tình hình chuyến tàu cuối tuần', N'Yêu cầu gửi báo cáo tổng hợp tình hình vận hành cuối tuần trước 8h thứ Hai.', 'BINH_THUONG', 'DA_GUI', DATEADD(HOUR,-10,GETDATE()), NULL),
('CD-006', 'BQL-002', 'NVDH-002', N'Ưu tiên phân ray cho tàu khách', N'Trong giờ cao điểm (6h-9h, 16h-19h), ưu tiên ray 1-2 cho tàu khách.', 'CAO', 'DA_DOC', DATEADD(DAY,-2,GETDATE()), DATEADD(DAY,-2,GETDATE()));

-- ============================================
-- 12. NHẬT KÝ
-- Bao quát: nhiều hành động, nhiều đối tượng, nhiều người dùng
-- ============================================
INSERT INTO NHAT_KY (ma_nhat_ky, ma_tai_khoan, hanh_dong, doi_tuong, ma_doi_tuong, noi_dung_cu, noi_dung_moi, dia_chi_ip, thoi_gian) VALUES
('NK-001', 'NVDH-001', 'TAO_LICH_TRINH', 'LICH_TRINH', 'LT-001', NULL, N'Tạo lịch trình SE5 ngày hôm nay', '192.168.1.45', DATEADD(HOUR,-12,GETDATE())),
('NK-002', 'NVDH-001', 'PHAN_BO_RAY', 'LICH_TRINH', 'LT-001', N'RAY: NULL', N'RAY: RAY-01', '192.168.1.45', DATEADD(HOUR,-11,GETDATE())),
('NK-003', 'NVNG-001', 'GHI_NHAN_SU_CO', 'SU_CO', 'SC-001', NULL, N'Ghi nhận trễ tàu TN1 12 phút', '192.168.1.50', DATEADD(HOUR,-7,GETDATE())),
('NK-004', 'NVDH-003', 'SUA_GIO', 'LICH_TRINH', 'LT-006', N'Giờ đến: 09:30', N'Giờ đến thực tế: 09:42 (trễ 12p)', '192.168.1.47', DATEADD(HOUR,-6,GETDATE())),
('NK-005', 'QTV-001', 'CAP_NHAT_TAI_KHOAN', 'TAI_KHOAN', 'NVNG-004', N'Trạng thái: HOAT_DONG', N'Trạng thái: CHO_XAC_NHAN', '192.168.1.1', DATEADD(HOUR,-5,GETDATE())),
('NK-006', 'BQL-001', 'PHE_DUYET', 'KE_HOACH_DAC_BIET', 'KH-001', N'Trạng thái: CHO_PHE_DUYET', N'Trạng thái: DA_PHE_DUYET', '192.168.1.100', DATEADD(DAY,-3,GETDATE())),
('NK-007', 'NVDH-003', 'DOI_RAY', 'LICH_TRINH', 'LT-011', N'RAY: RAY-02', N'RAY: RAY-04', '192.168.1.47', DATEADD(HOUR,-4,GETDATE())),
('NK-008', 'QTV-002', 'THAY_DOI_CAU_HINH', 'CAU_HINH', NULL, N'Thời gian đệm: 10 phút', N'Thời gian đệm: 15 phút', '192.168.1.2', DATEADD(DAY,-1,GETDATE())),
('NK-009', 'NVNG-001', 'GHI_NHAN_SU_CO', 'SU_CO', 'SC-005', NULL, N'Phát hiện sụt lún ray 6, phong tỏa khẩn cấp', '192.168.1.50', DATEADD(HOUR,-4,GETDATE())),
('NK-010', 'NVDH-005', 'HUY_LICH_TRINH', 'LICH_TRINH', 'LT-022', N'Trạng thái: CHO_XAC_NHAN', N'Trạng thái: HUY (ray 6 phong tỏa)', '192.168.1.48', DATEADD(HOUR,-3,GETDATE())),
('NK-011', 'BQL-001', 'PHE_DUYET', 'KE_HOACH_DAC_BIET', 'KH-005', N'Trạng thái: CHO_PHE_DUYET', N'Trạng thái: DA_PHE_DUYET', '192.168.1.100', DATEADD(HOUR,-4,GETDATE())),
('NK-012', 'QTV-001', 'KHOA_TAI_KHOAN', 'TAI_KHOAN', 'NVDH-004', N'Trạng thái: HOAT_DONG', N'Trạng thái: KHOA', '192.168.1.1', DATEADD(DAY,-2,GETDATE())),
('NK-013', 'NVDH-001', 'TAO_LICH_TRINH', 'LICH_TRINH', 'LT-023', NULL, N'Tạo lịch trình cuối tuần SE5', '192.168.1.45', DATEADD(HOUR,-10,GETDATE())),
('NK-014', 'NVNG-002', 'GHI_NHAN_SU_CO', 'SU_CO', 'SC-002', NULL, N'Ghi nhận sự cố kỹ thuật ghi chuyển ray 5', '192.168.1.51', DATEADD(HOUR,-8,GETDATE())),
('NK-015', 'BQL-002', 'TU_CHOI', 'KE_HOACH_DAC_BIET', 'KH-003', N'Trạng thái: CHO_PHE_DUYET', N'Trạng thái: TU_CHOI', '192.168.1.101', DATEADD(DAY,-8,GETDATE()));

PRINT N'✅ Dữ liệu mẫu đã được chèn thành công!';
PRINT N'📊 Tổng kết:';
PRINT N'   - 15 Tài khoản (4 vai trò, 3 trạng thái)';
PRINT N'   - 12 Ga (gồm 1 tạm ngưng)';
PRINT N'   - 6 Tuyến đường (gồm 1 tạm ngưng)';
PRINT N'   - 16 Tàu (gồm bảo trì, ngừng)';
PRINT N'   - 6 Đường ray (gồm bảo trì, phong tỏa)';
PRINT N'   - 22 Chuyến tàu (gồm tạm ngưng, hủy)';
PRINT N'   - 24 Lịch trình (đủ 6 trạng thái + phương án xử lý + ghi chú + sự cố ảnh hưởng)';
PRINT N'   - 8 Sự cố (đủ loại, mức độ, trạng thái)';
PRINT N'   - 8 Kế hoạch đặc biệt (đủ trạng thái + mức ưu tiên)';
PRINT N'   - 6 Chỉ đạo (DA_GUI + DA_DOC)';
PRINT N'   - 15 Nhật ký (nhiều hành động/đối tượng)';
GO

-- === QUY TẮC NGHIỆP VỤ ===
INSERT INTO QUY_TAC_NGHIEP_VU (ma_quy_tac, ten_quy_tac, gia_tri, kieu_du_lieu, mo_ta, nhom_quy_tac, cap_nhat_lan_cuoi) VALUES 
('QT-01', N'Thời gian đệm tối thiểu sau mỗi loại tàu', '15', 'NUMBER', N'Khoảng thời gian đệm (phút) giữa các tàu nhằm đảm bảo an toàn.', N'LỊCH TRÌNH VÀ VẬN HÀNH', CURRENT_TIMESTAMP),
('QT-02', N'Thời gian lên tàu tối thiểu (Tàu xuất phát)', '30', 'NUMBER', N'Thời gian bắt đầu làm thủ tục cho hành khách lên tàu trước giờ khởi hành (phút).', N'LỊCH TRÌNH VÀ VẬN HÀNH', CURRENT_TIMESTAMP),
('QT-03', N'Thời gian dừng đỗ tối thiểu (Tàu điểm cuối)', '20', 'NUMBER', N'Thời gian tàu dừng đón/trả khách tại nhà ga cuối (phút).', N'LỊCH TRÌNH VÀ VẬN HÀNH', CURRENT_TIMESTAMP),
('QT-04', N'Quy trình phê duyệt Kế hoạch Đặc biệt', 'BAN_QUAN_LY', 'TEXT', N'Chức vụ có thẩm quyền phê duyệt các thay đổi lịch trình bất ngờ.', N'PHÊ DUYỆT VÀ TÀI KHOẢN', CURRENT_TIMESTAMP),
('QT-05', N'Ngưỡng cảnh báo trễ tàu', '15', 'NUMBER', N'Thời gian trễ (phút) so với lịch trình để hệ thống kích hoạt cảnh báo.', N'BÁO ĐỘNG VÀ ĐỒNG BỘ', CURRENT_TIMESTAMP),
('QT-06', N'Thời hạn đồng bộ Bảng LED', '5', 'NUMBER', N'Hệ thống tự động đồng bộ Bảng LED điện tử Nhà ga định kỳ (phút/lần).', N'BÁO ĐỘNG VÀ ĐỒNG BỘ', CURRENT_TIMESTAMP),
('QT-07', N'Số ngày tối thiểu để tạo chuyến tàu', '30', 'NUMBER', N'Ràng buộc thời gian tạo chuyến tàu mới phải trước ngày chạy một khoảng thời gian (ngày).', N'LỊCH TRÌNH VÀ VẬN HÀNH', CURRENT_TIMESTAMP);

