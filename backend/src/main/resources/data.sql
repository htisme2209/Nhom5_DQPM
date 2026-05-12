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

ALTER TABLE KE_HOACH_DAC_BIET
ALTER COLUMN tieu_de NVARCHAR(300) NOT NULL;

ALTER TABLE KE_HOACH_DAC_BIET
ALTER COLUMN noi_dung NVARCHAR(2000) NOT NULL;

ALTER TABLE KE_HOACH_DAC_BIET
ALTER COLUMN muc_do_uu_tien NVARCHAR(20) NOT NULL;

ALTER TABLE KE_HOACH_DAC_BIET
ALTER COLUMN trang_thai NVARCHAR(20) NOT NULL;

ALTER TABLE KE_HOACH_DAC_BIET
ALTER COLUMN y_kien_duyet NVARCHAR(1000);

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
('CT-SE2-TG', 'SE1', 'TU-BN', 'TRUNG_GIAN', '10:00', '10:20', CONVERT(VARCHAR(10), DATEADD(day, 1, GETDATE()), 120), 'HOAT_DONG', GETDATE(), GETDATE());

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
('LT-CASE-8', 'CT-SE1-TG', 'RAY-02', 'NVDH-001', 'SC-RED-TRAIN', DATEADD(MINUTE,650,@t), DATEADD(MINUTE,670,@t), NULL, NULL, 20, 'TRE', 'CHO_RAY', N'Test đổi ray khẩn cấp RED', GETDATE(), GETDATE());

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
('SC-RED-TRAIN', 'LT-CASE-8', 'NVNG-001', 'RAY-02', 'SU_CO_KY_THUAT', N'Lỗi động cơ, cần kéo tàu', 'CAO', 'DANG_XU_LY', DATEADD(MINUTE, -20, GETDATE()), NULL, DATEADD(MINUTE, -20, GETDATE()), DATEADD(MINUTE, 2, GETDATE()), 'RED_ALERT', NULL);

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
