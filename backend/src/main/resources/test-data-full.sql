-- ============================================================
-- HỆ THỐNG QUẢN LÝ LỊCH TRÌNH TÀU GA ĐÀ NẴNG
-- File: test-data-full-fixed-20260423.sql
-- Ngày cố định: 23/04/2026
-- Mục đích: Dữ liệu test đầy đủ, mọi bản ghi CHUYEN_TAU,
--   LICH_TRINH, SU_CO đều xoay quanh ngày 23/04/2026
-- ============================================================

USE railway_danang1;
GO

-- ============================================================
-- XÓA DỮ LIỆU CŨ (thứ tự đảo chiều FK)
-- ============================================================
DELETE FROM NHAT_KY;
DELETE FROM CHI_DAO;
DELETE FROM KE_HOACH_DAC_BIET;
DELETE FROM SU_CO;
DELETE FROM LICH_TRINH;
DELETE FROM CHUYEN_TAU;
DELETE FROM GA_TUYEN;
DELETE FROM DUONG_RAY;
DELETE FROM TAU;
DELETE FROM TUYEN_DUONG;
DELETE FROM GA;
DELETE FROM TAI_KHOAN WHERE ma_tai_khoan <> 'SYSTEM';
DELETE FROM TAI_KHOAN WHERE ma_tai_khoan = 'SYSTEM';
GO

-- ============================================================
-- 1. TÀI KHOẢN
--    Mật khẩu: 123456 (BCrypt hash)
-- ============================================================
INSERT INTO TAI_KHOAN (ma_tai_khoan, quyen_truy_cap, ho_ten, email, so_dien_thoai, mat_khau, gioi_tinh, ngay_sinh, trang_thai, ngay_tao, ngay_cap_nhat) VALUES
('SYSTEM',   'QUAN_TRI_VIEN',       N'Hệ Thống',           'system@dsvn.vn',     '0000000000', '$2a$10$b0OX2miMjVcgQMbOTDJ87eD1A2LSiwgzN7MGrcUAFmjP1uQ/uEM.6', 'NAM', '2000-01-01', 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('QTV-001',  'QUAN_TRI_VIEN',       N'Nguyễn Văn Admin',   'admin@dsvn.vn',      '0901000001', '$2a$10$b0OX2miMjVcgQMbOTDJ87eD1A2LSiwgzN7MGrcUAFmjP1uQ/uEM.6', 'NAM', '1985-03-15', 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('QTV-002',  'QUAN_TRI_VIEN',       N'Trần Thị Bích Ngọc', 'ngoc.qtv@dsvn.vn',   '0901000002', '$2a$10$b0OX2miMjVcgQMbOTDJ87eD1A2LSiwgzN7MGrcUAFmjP1uQ/uEM.6', 'NU',  '1988-07-22', 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('NVDH-001', 'NHAN_VIEN_DIEU_HANH', N'Lê Minh Tuấn',       'tuan.dh@dsvn.vn',    '0902000001', '$2a$10$b0OX2miMjVcgQMbOTDJ87eD1A2LSiwgzN7MGrcUAFmjP1uQ/uEM.6', 'NAM', '1990-01-10', 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('NVDH-002', 'NHAN_VIEN_DIEU_HANH', N'Phạm Thị Hồng',      'hong.dh@dsvn.vn',    '0902000002', '$2a$10$b0OX2miMjVcgQMbOTDJ87eD1A2LSiwgzN7MGrcUAFmjP1uQ/uEM.6', 'NU',  '1992-05-18', 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('NVDH-003', 'NHAN_VIEN_DIEU_HANH', N'Hoàng Đức Anh',      'anh.dh@dsvn.vn',     '0902000003', '$2a$10$b0OX2miMjVcgQMbOTDJ87eD1A2LSiwgzN7MGrcUAFmjP1uQ/uEM.6', 'NAM', '1991-11-03', 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('NVDH-004', 'NHAN_VIEN_DIEU_HANH', N'Võ Thị Mai',         'mai.dh@dsvn.vn',     '0902000004', '$2a$10$b0OX2miMjVcgQMbOTDJ87eD1A2LSiwgzN7MGrcUAFmjP1uQ/uEM.6', 'NU',  '1993-08-25', 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('NVDH-005', 'NHAN_VIEN_DIEU_HANH', N'Trần Quốc Bảo',      'bao.dh@dsvn.vn',     '0902000005', '$2a$10$b0OX2miMjVcgQMbOTDJ87eD1A2LSiwgzN7MGrcUAFmjP1uQ/uEM.6', 'NAM', '1989-06-15', 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('NVNG-001', 'NHAN_VIEN_NHA_GA',    N'Nguyễn Hữu Thành',   'thanh.ng@dsvn.vn',   '0903000001', '$2a$10$b0OX2miMjVcgQMbOTDJ87eD1A2LSiwgzN7MGrcUAFmjP1uQ/uEM.6', 'NAM', '1994-04-12', 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('NVNG-002', 'NHAN_VIEN_NHA_GA',    N'Đặng Thị Lan',       'lan.ng@dsvn.vn',     '0903000002', '$2a$10$b0OX2miMjVcgQMbOTDJ87eD1A2LSiwgzN7MGrcUAFmjP1uQ/uEM.6', 'NU',  '1995-09-30', 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('NVNG-003', 'NHAN_VIEN_NHA_GA',    N'Bùi Văn Hùng',       'hung.ng@dsvn.vn',    '0903000003', '$2a$10$b0OX2miMjVcgQMbOTDJ87eD1A2LSiwgzN7MGrcUAFmjP1uQ/uEM.6', 'NAM', '1993-02-14', 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('NVNG-004', 'NHAN_VIEN_NHA_GA',    N'Trịnh Thị Hạnh',     'hanh.ng@dsvn.vn',    '0903000004', '$2a$10$b0OX2miMjVcgQMbOTDJ87eD1A2LSiwgzN7MGrcUAFmjP1uQ/uEM.6', 'NU',  '1996-12-05', 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('NVNG-005', 'NHAN_VIEN_NHA_GA',    N'Lê Thị Ngọc Ánh',    'anh.ng@dsvn.vn',     '0903000005', '$2a$10$b0OX2miMjVcgQMbOTDJ87eD1A2LSiwgzN7MGrcUAFmjP1uQ/uEM.6', 'NU',  '1997-03-20', 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('NVNG-006', 'NHAN_VIEN_NHA_GA',    N'Phan Văn Khoa',       'khoa.ng@dsvn.vn',    '0903000006', '$2a$10$b0OX2miMjVcgQMbOTDJ87eD1A2LSiwgzN7MGrcUAFmjP1uQ/uEM.6', 'NAM', '1998-07-11', 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('BQL-001',  'BAN_QUAN_LY',         N'Trương Quang Vinh',  'vinh.bql@dsvn.vn',   '0904000001', '$2a$10$b0OX2miMjVcgQMbOTDJ87eD1A2LSiwgzN7MGrcUAFmjP1uQ/uEM.6', 'NAM', '1980-06-20', 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('BQL-002',  'BAN_QUAN_LY',         N'Lý Thị Phương',      'phuong.bql@dsvn.vn', '0904000002', '$2a$10$b0OX2miMjVcgQMbOTDJ87eD1A2LSiwgzN7MGrcUAFmjP1uQ/uEM.6', 'NU',  '1982-10-08', 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('BQL-003',  'BAN_QUAN_LY',         N'Đỗ Hữu Nghĩa',       'nghia.bql@dsvn.vn',  '0904000003', '$2a$10$b0OX2miMjVcgQMbOTDJ87eD1A2LSiwgzN7MGrcUAFmjP1uQ/uEM.6', 'NAM', '1978-01-15', 'HOAT_DONG', '2026-04-23', '2026-04-23');
GO

-- ============================================================
-- 2. GA
-- ============================================================
INSERT INTO GA (ma_ga, ten_ga, dia_chi, thu_tu_tren_tuyen, trang_thai, ngay_tao) VALUES
('GA-HN',      N'Ga Hà Nội',       N'120 Lê Duẩn, Hoàn Kiếm, Hà Nội',        1,  'HOAT_DONG', '2026-04-23'),
('GA-TH',      N'Ga Thanh Hóa',    N'TP Thanh Hóa, Thanh Hóa',                2,  'HOAT_DONG', '2026-04-23'),
('GA-VINH',    N'Ga Vinh',         N'TP Vinh, Nghệ An',                        3,  'HOAT_DONG', '2026-04-23'),
('GA-DONG_HA', N'Ga Đông Hà',      N'TP Đông Hà, Quảng Trị',                  4,  'HOAT_DONG', '2026-04-23'),
('GA-HUE',     N'Ga Huế',          N'2 Bùi Thị Xuân, TP Huế',                 5,  'HOAT_DONG', '2026-04-23'),
('GA-DN',      N'Ga Đà Nẵng',      N'791 Hải Phòng, Thanh Khê, Đà Nẵng',      6,  'HOAT_DONG', '2026-04-23'),
('GA-TAM_KY',  N'Ga Tam Kỳ',       N'TP Tam Kỳ, Quảng Nam',                   7,  'HOAT_DONG', '2026-04-23'),
('GA-QN',      N'Ga Quảng Ngãi',   N'TP Quảng Ngãi, Quảng Ngãi',              8,  'HOAT_DONG', '2026-04-23'),
('GA-DT',      N'Ga Diêu Trì',     N'Tuy Phước, Bình Định',                    9,  'HOAT_DONG', '2026-04-23'),
('GA-NTR',     N'Ga Nha Trang',    N'17 Thái Nguyên, Nha Trang',              10,  'HOAT_DONG', '2026-04-23'),
('GA-SGN',     N'Ga Sài Gòn',      N'1 Nguyễn Thông, Q.3, TP.HCM',           11,  'HOAT_DONG', '2026-04-23');
GO

-- ============================================================
-- 3. TUYẾN ĐƯỜNG
-- ============================================================
INSERT INTO TUYEN_DUONG (ma_tuyen, ten_tuyen, ma_ga_dau, ma_ga_cuoi, khoang_cach_km, trang_thai, ngay_tao) VALUES
('TU-BN',     N'Bắc - Nam (Hà Nội - Sài Gòn)',  'GA-HN', 'GA-SGN', 1726.00, 'HOAT_DONG', '2026-04-23'),
('TU-DN-HUE', N'Đà Nẵng - Huế',                 'GA-DN', 'GA-HUE',  103.00, 'HOAT_DONG', '2026-04-23'),
('TU-DN-QN',  N'Đà Nẵng - Quảng Ngãi',          'GA-DN', 'GA-QN',   130.00, 'HOAT_DONG', '2026-04-23'),
('TU-HN-DN',  N'Hà Nội - Đà Nẵng',              'GA-HN', 'GA-DN',   791.00, 'HOAT_DONG', '2026-04-23'),
('TU-DN-SGN', N'Đà Nẵng - Sài Gòn',             'GA-DN', 'GA-SGN',  935.00, 'HOAT_DONG', '2026-04-23');
GO

-- ============================================================
-- 4. GA_TUYEN
-- ============================================================
INSERT INTO GA_TUYEN (ma_ga, ma_tuyen, thu_tu_tren_tuyen, khoang_cach_tu_dau_km, thoi_gian_dung_phut, ngay_tao) VALUES
('GA-HN',      'TU-BN', 1,    0,  0, '2026-04-23'),
('GA-TH',      'TU-BN', 2,  175, 10, '2026-04-23'),
('GA-VINH',    'TU-BN', 3,  319, 15, '2026-04-23'),
('GA-DONG_HA', 'TU-BN', 4,  558, 10, '2026-04-23'),
('GA-HUE',     'TU-BN', 5,  688, 15, '2026-04-23'),
('GA-DN',      'TU-BN', 6,  791, 20, '2026-04-23'),
('GA-TAM_KY',  'TU-BN', 7,  865,  5, '2026-04-23'),
('GA-QN',      'TU-BN', 8,  921, 10, '2026-04-23'),
('GA-DT',      'TU-BN', 9, 1065, 10, '2026-04-23'),
('GA-NTR',     'TU-BN',10, 1315, 15, '2026-04-23'),
('GA-SGN',     'TU-BN',11, 1726,  0, '2026-04-23'),
('GA-DN',  'TU-DN-HUE', 1,    0,  0, '2026-04-23'),
('GA-HUE', 'TU-DN-HUE', 2,  103,  0, '2026-04-23'),
('GA-DN',  'TU-DN-QN',  1,    0,  0, '2026-04-23'),
('GA-TAM_KY','TU-DN-QN',2,   65,  5, '2026-04-23'),
('GA-QN',  'TU-DN-QN',  3,  130,  0, '2026-04-23'),
('GA-HN',  'TU-HN-DN',  1,    0,  0, '2026-04-23'),
('GA-DN',  'TU-HN-DN',  2,  791,  0, '2026-04-23'),
('GA-DN',  'TU-DN-SGN', 1,    0,  0, '2026-04-23'),
('GA-SGN', 'TU-DN-SGN', 2,  935,  0, '2026-04-23');
GO

-- ============================================================
-- 5. TÀU
-- ============================================================
INSERT INTO TAU (ma_tau, ten_tau, loai_tau, so_toa, suc_chua_hanh_khach, trang_thai, ngay_tao, ngay_cap_nhat) VALUES
('SE1',  N'Tàu SE1 Thống Nhất',        'TAU_NHANH', 14, 756, 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('SE2',  N'Tàu SE2 Thống Nhất',        'TAU_NHANH', 14, 756, 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('SE3',  N'Tàu SE3 Bắc Nam',           'TAU_NHANH', 13, 702, 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('SE4',  N'Tàu SE4 Bắc Nam',           'TAU_NHANH', 13, 702, 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('SE5',  N'Tàu SE5 Express',           'TAU_NHANH', 12, 648, 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('SE6',  N'Tàu SE6 Express',           'TAU_NHANH', 12, 648, 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('SE7',  N'Tàu SE7 Cao Tốc',           'TAU_NHANH', 10, 540, 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('SE8',  N'Tàu SE8 Cao Tốc',           'TAU_NHANH', 10, 540, 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('TN1',  N'Tàu TN1 Đà Nẵng - Huế',    'TAU_KHACH',  8, 432, 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('TN2',  N'Tàu TN2 Đà Nẵng - Huế',    'TAU_KHACH',  8, 432, 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('QN1',  N'Tàu QN1 Đà Nẵng - QNgãi',  'TAU_KHACH',  6, 324, 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('QN2',  N'Tàu QN2 Đà Nẵng - QNgãi',  'TAU_KHACH',  6, 324, 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('HD1',  N'Tàu hàng HD1',              'TAU_HANG',  20,   0, 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('HD2',  N'Tàu hàng HD2',              'TAU_HANG',  25,   0, 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('DN1',  N'Tàu nội đô DN1',            'TAU_KHACH',  4, 216, 'BAO_TRI',   '2026-04-23', '2026-04-23');
GO

-- ============================================================
-- 6. ĐƯỜNG RAY (Ga Đà Nẵng — 6 ray)
-- ============================================================
INSERT INTO DUONG_RAY (ma_ray, ma_ga, so_ray, chieu_dai_ray, trang_thai, ghi_chu, ngay_tao, ngay_cap_nhat, thoi_gian_xu_ly_uoc_tinh, thoi_gian_phong_toa_uoc_tinh, thoi_gian_bat_dau_phong_toa, thoi_gian_ket_thuc_phong_toa) VALUES
('RAY-01', 'GA-DN', 1, 450.00, 'SAN_SANG', N'Ray chính hướng Nam — tàu nhanh SE ưu tiên', '2026-04-23', '2026-04-23',  NULL, NULL, NULL, NULL),
('RAY-02', 'GA-DN', 2, 420.00, 'SAN_SANG',      N'Ray chính hướng Nam — tàu nhanh SE ưu tiên',                          '2026-04-23', '2026-04-23', NULL, NULL, NULL, NULL),
('RAY-03', 'GA-DN', 3, 380.00, 'SAN_SANG',      N'Ray phụ — tàu khách TN/QN và hàng hóa',                              '2026-04-23', '2026-04-23', NULL, NULL, NULL, NULL),
('RAY-04', 'GA-DN', 4, 350.00, 'SAN_SANG',      N'Ray nhánh 1 — điểm cuối và xuất phát',                               '2026-04-23', '2026-04-23', NULL, NULL, NULL, NULL),
('RAY-05', 'GA-DN', 5, 300.00, 'SAN_SANG',     N'Ray 5 — đang phong tỏa do sự cố kỹ thuật ghi (SC-002)',              '2026-04-23', '2026-04-23', 90,  360, NULL, NULL),
('RAY-06', 'GA-DN', 6, 280.00, 'SAN_SANG',       N'Ray 6 — bảo trì định kỳ, hoàn thành 48 giờ nữa',                    '2026-04-23', '2026-04-23', 120, 480, NULL, NULL);
GO

-- ============================================================
-- 7. CHUYẾN TÀU
--    Ngày cố định: 23/04/2026 (hôm nay)
--    Các ngày xung quanh: 20/4, 21/4, 22/4 = quá khứ
--                         24/4, 25/4, 26/4 = tương lai
-- ============================================================
INSERT INTO CHUYEN_TAU (ma_chuyen_tau, ma_tau, ma_tuyen, vai_tro_tai_da_nang,
    gio_den_du_kien, gio_di_du_kien, ngay_chay, trang_thai, ngay_tao, ngay_cap_nhat) VALUES

-- ══════════════════════════════════════════════════════════
-- NGÀY HÔM NAY: 23/04/2026 — khối chính để test toàn bộ
-- ══════════════════════════════════════════════════════════

-- Tàu đã đi qua ga (giờ sáng sớm, trước 10:30)
('CT-SE3-BN',  'SE3', 'TU-BN',     'TRUNG_GIAN', '03:20', '03:40', '2026-04-23', 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('CT-HD1-BN',  'HD1', 'TU-BN',     'TRUNG_GIAN', '02:00', '02:30', '2026-04-23', 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('CT-HD2-BN',  'HD2', 'TU-BN',     'TRUNG_GIAN', '04:00', '04:20', '2026-04-23', 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('CT-TN1-XP',  'TN1', 'TU-DN-HUE', 'XUAT_PHAT',  NULL,    '06:00', '2026-04-23', 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('CT-QN1-XP',  'QN1', 'TU-DN-QN',  'XUAT_PHAT',  NULL,    '07:00', '2026-04-23', 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('CT-SE5-BN',  'SE5', 'TU-BN',     'TRUNG_GIAN', '06:30', '06:50', '2026-04-23', 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('CT-SE7-BN',  'SE7', 'TU-BN',     'TRUNG_GIAN', '08:15', '08:30', '2026-04-23', 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('CT-TN1-DC',  'TN1', 'TU-DN-HUE', 'DIEM_CUOI',  '09:30', NULL,    '2026-04-23', 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('CT-QN1-DC',  'QN1', 'TU-DN-QN',  'DIEM_CUOI',  '12:00', NULL,    '2026-04-23', 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('CT-HD2-DC',  'HD2', 'TU-BN',     'DIEM_CUOI',  '04:00', NULL,    '2026-04-23', 'HOAT_DONG', '2026-04-23', '2026-04-23'),

-- Tàu đang tại ga / sắp vào ra (khoảng 10:30-14:00)
('CT-SE1-BN',  'SE1', 'TU-BN',     'TRUNG_GIAN', '10:45', '11:05', '2026-04-23', 'HOAT_DONG', '2026-04-23', '2026-04-23'),

-- Tàu buổi chiều / tối (sau 14:00)
('CT-SE2-BN',  'SE2', 'TU-BN',     'TRUNG_GIAN', '14:30', '14:50', '2026-04-23', 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('CT-TN2-XP',  'TN2', 'TU-DN-HUE', 'XUAT_PHAT',  NULL,    '13:30', '2026-04-23', 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('CT-TN2-DC',  'TN2', 'TU-DN-HUE', 'DIEM_CUOI',  '16:45', NULL,    '2026-04-23', 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('CT-QN2-XP',  'QN2', 'TU-DN-QN',  'XUAT_PHAT',  NULL,    '15:00', '2026-04-23', 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('CT-QN2-DC',  'QN2', 'TU-DN-QN',  'DIEM_CUOI',  '19:30', NULL,    '2026-04-23', 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('CT-SE4-BN',  'SE4', 'TU-BN',     'TRUNG_GIAN', '17:15', '17:35', '2026-04-23', 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('CT-SE6-BN',  'SE6', 'TU-BN',     'TRUNG_GIAN', '20:00', '20:20', '2026-04-23', 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('CT-SE8-BN',  'SE8', 'TU-BN',     'TRUNG_GIAN', '22:45', '23:05', '2026-04-23', 'HOAT_DONG', '2026-04-23', '2026-04-23'),

-- Chuyến bị tạm ngưng (bảo trì tàu DN1)
('CT-DN1-XP',  'DN1', 'TU-DN-QN',  'XUAT_PHAT',  NULL,    '16:30', '2026-04-23', 'TAM_NGUNG', '2026-04-23', '2026-04-23'),

-- ══════════════════════════════════════════════════════════
-- 3 NGÀY TRƯỚC: 20/04/2026
-- ══════════════════════════════════════════════════════════
('CT-SE4-D3',  'SE4', 'TU-BN',     'TRUNG_GIAN', '17:15', '17:35', '2026-04-20', 'HOAT_DONG', '2026-04-20', '2026-04-20'),
('CT-HD1-D3',  'HD1', 'TU-BN',     'TRUNG_GIAN', '02:00', '02:30', '2026-04-20', 'HOAT_DONG', '2026-04-20', '2026-04-20'),

-- ══════════════════════════════════════════════════════════
-- 2 NGÀY TRƯỚC: 21/04/2026
-- ══════════════════════════════════════════════════════════
('CT-SE2-D2',  'SE2', 'TU-BN',     'TRUNG_GIAN', '14:30', '14:50', '2026-04-21', 'HOAT_DONG', '2026-04-21', '2026-04-21'),
('CT-SE3-D2',  'SE3', 'TU-BN',     'TRUNG_GIAN', '03:20', '03:40', '2026-04-21', 'HOAT_DONG', '2026-04-21', '2026-04-21'),
('CT-TN2-D2',  'TN2', 'TU-DN-HUE', 'XUAT_PHAT',  NULL,    '13:30', '2026-04-21', 'HOAT_DONG', '2026-04-21', '2026-04-21'),

-- ══════════════════════════════════════════════════════════
-- NGÀY HÔM QUA: 22/04/2026
-- ══════════════════════════════════════════════════════════
('CT-SE5-CT',  'SE5', 'TU-BN',     'TRUNG_GIAN', '09:00', '09:20', '2026-04-22', 'HOAT_DONG', '2026-04-22', '2026-04-22'),
('CT-SE1-Y',   'SE1', 'TU-BN',     'TRUNG_GIAN', '10:45', '11:05', '2026-04-22', 'HOAT_DONG', '2026-04-22', '2026-04-22'),
('CT-TN1-Y',   'TN1', 'TU-DN-HUE', 'XUAT_PHAT',  NULL,    '06:00', '2026-04-22', 'HOAT_DONG', '2026-04-22', '2026-04-22'),
('CT-QN1-Y',   'QN1', 'TU-DN-QN',  'XUAT_PHAT',  NULL,    '07:00', '2026-04-22', 'HOAT_DONG', '2026-04-22', '2026-04-22'),

-- ══════════════════════════════════════════════════════════
-- NGÀY MAI: 24/04/2026
-- ══════════════════════════════════════════════════════════
('CT-SE1-TM',    'SE1', 'TU-BN',     'TRUNG_GIAN', '10:45', '11:05', '2026-04-24', 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('CT-SE2-TM',    'SE2', 'TU-BN',     'TRUNG_GIAN', '14:30', '14:50', '2026-04-24', 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('CT-SE5-TM',    'SE5', 'TU-BN',     'TRUNG_GIAN', '06:30', '06:50', '2026-04-24', 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('CT-TN1-TM',    'TN1', 'TU-DN-HUE', 'XUAT_PHAT',  NULL,    '06:00', '2026-04-24', 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('CT-QN1-TM',    'QN1', 'TU-DN-QN',  'XUAT_PHAT',  NULL,    '07:00', '2026-04-24', 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('CT-TN1-DC-TM', 'TN1', 'TU-DN-HUE', 'DIEM_CUOI',  '09:30', NULL,    '2026-04-24', 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('CT-QN1-DC-TM', 'QN1', 'TU-DN-QN',  'DIEM_CUOI',  '12:00', NULL,    '2026-04-24', 'HOAT_DONG', '2026-04-23', '2026-04-23'),

-- ══════════════════════════════════════════════════════════
-- +2 NGÀY: 25/04/2026
-- ══════════════════════════════════════════════════════════
('CT-SE6-D2F', 'SE6', 'TU-BN',     'TRUNG_GIAN', '20:00', '20:20', '2026-04-25', 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('CT-SE7-D2F', 'SE7', 'TU-BN',     'TRUNG_GIAN', '08:15', '08:30', '2026-04-25', 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('CT-TN2-D2F', 'TN2', 'TU-DN-HUE', 'XUAT_PHAT',  NULL,    '13:30', '2026-04-25', 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('CT-QN2-D2F', 'QN2', 'TU-DN-QN',  'XUAT_PHAT',  NULL,    '15:00', '2026-04-25', 'HOAT_DONG', '2026-04-23', '2026-04-23'),

-- ══════════════════════════════════════════════════════════
-- +3 NGÀY: 26/04/2026
-- ══════════════════════════════════════════════════════════
('CT-SE8-D3F', 'SE8', 'TU-BN',     'TRUNG_GIAN', '22:45', '23:05', '2026-04-26', 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('CT-HD2-D3F', 'HD2', 'TU-BN',     'TRUNG_GIAN', '04:00', '04:20', '2026-04-26', 'HOAT_DONG', '2026-04-23', '2026-04-23'),
('CT-TN1-D3F', 'TN1', 'TU-DN-HUE', 'XUAT_PHAT',  NULL,    '06:00', '2026-04-26', 'HOAT_DONG', '2026-04-23', '2026-04-23');
GO

-- ============================================================
-- 8. LỊCH TRÌNH — Ngày 23/04/2026, đủ mọi trạng thái
--    Mốc "hiện tại" trong ngày: 10:30 sáng 23/04/2026
--    @t = 2026-04-23T00:00:00 (nền tính phút từ 00:00)
-- ============================================================
DECLARE @t DATETIME = '2026-04-23T00:00:00';

INSERT INTO LICH_TRINH (ma_lich_trinh, ma_chuyen_tau, ma_ray, ma_nguoi_cap_nhat, ma_su_co_anh_huong,
    gio_den_du_kien, gio_di_du_kien, gio_den_thuc_te, gio_di_thuc_te,
    so_phut_tre, trang_thai, phuong_an_xu_ly, ghi_chu, ngay_tao, ngay_cap_nhat) VALUES

-- ──────────────────────────────────────────────────────────
-- DA_ROI_GA — các tàu đã qua ga trước 10:30
-- ──────────────────────────────────────────────────────────

-- SE3: 03:20-03:40 → đúng giờ
('LT-001', 'CT-SE3-BN', 'RAY-01', 'NVDH-001', NULL,
    '2026-04-23T03:20:00', '2026-04-23T03:40:00',
    '2026-04-23T03:20:00', '2026-04-23T03:40:00',
    0, 'DA_ROI_GA', NULL,
    N'Tàu SE3 sáng sớm — đúng giờ hoàn toàn',
    '2026-04-23', '2026-04-23T03:42:00'),

-- HD1: 02:00-02:30 → trễ 5 phút rời
('LT-002', 'CT-HD1-BN', 'RAY-03', 'NVDH-001', NULL,
    '2026-04-23T02:00:00', '2026-04-23T02:30:00',
    '2026-04-23T02:00:00', '2026-04-23T02:35:00',
    5, 'DA_ROI_GA', NULL,
    N'Tàu hàng HD1 — trễ 5 phút do chuyển tải',
    '2026-04-23', '2026-04-23T02:37:00'),

-- HD2 điểm cuối: 04:00 đến → đã xử lý xong
('LT-003', 'CT-HD2-DC', 'RAY-03', 'NVDH-001', NULL,
    '2026-04-23T04:00:00', NULL,
    '2026-04-23T04:15:00', NULL,
    15, 'DA_ROI_GA', 'DOI_RAY',
    N'Tàu hàng HD2 về trễ 15p, đổi sang ray 3, đã giải phóng ray lúc 05:00',
    '2026-04-23', '2026-04-23T05:02:00'),

-- TN1 xuất phát: 06:00 → đúng giờ
('LT-004', 'CT-TN1-XP', 'RAY-04', 'NVDH-002', NULL,
    NULL, '2026-04-23T06:00:00',
    NULL, '2026-04-23T06:00:00',
    0, 'DA_ROI_GA', NULL,
    N'TN1 xuất phát đúng giờ 6:00',
    '2026-04-23', '2026-04-23T06:02:00'),

-- QN1 xuất phát: 07:00 → đúng giờ
('LT-005', 'CT-QN1-XP', 'RAY-03', 'NVDH-001', NULL,
    NULL, '2026-04-23T07:00:00',
    NULL, '2026-04-23T07:00:00',
    0, 'DA_ROI_GA', NULL,
    N'QN1 xuất phát đúng giờ 7:00',
    '2026-04-23', '2026-04-23T07:02:00'),

-- SE5: 06:30-06:50 → trễ nhẹ 3 phút
('LT-006', 'CT-SE5-BN', 'RAY-01', 'NVDH-001', NULL,
    '2026-04-23T06:30:00', '2026-04-23T06:50:00',
    '2026-04-23T06:33:00', '2026-04-23T06:53:00',
    3, 'DA_ROI_GA', NULL,
    N'SE5 sáng — trễ nhẹ 3 phút',
    '2026-04-23', '2026-04-23T06:55:00'),

-- SE7: 08:15-08:30 → đúng giờ
('LT-007', 'CT-SE7-BN', 'RAY-02', 'NVDH-002', NULL,
    '2026-04-23T08:15:00', '2026-04-23T08:30:00',
    '2026-04-23T08:15:00', '2026-04-23T08:30:00',
    0, 'DA_ROI_GA', NULL,
    N'SE7 sáng — đúng giờ, đã rời ga lúc 08:30',
    '2026-04-23', '2026-04-23T08:32:00'),

-- ──────────────────────────────────────────────────────────
-- DUNG_TAI_GA — tàu đang tại ga (quanh 10:30)
-- ──────────────────────────────────────────────────────────

-- TN1 điểm cuối: dự kiến 09:30, thực tế đến 09:42 (trễ 12p do sự cố tín hiệu SC-001)
('LT-008', 'CT-TN1-DC', 'RAY-04', 'NVDH-003', 'SC-001',
    '2026-04-23T09:30:00', NULL,
    '2026-04-23T09:42:00', NULL,
    12, 'DUNG_TAI_GA', 'DOI_RAY',
    N'TN1 về trễ 12p do tín hiệu đoạn Lăng Cô — đang dừng tại ray 4',
    '2026-04-23', '2026-04-23T09:45:00'),

-- SE1 trung gian: dự kiến 10:45-11:05, đang trễ 45p (sự cố SC-004)
-- → tàu còn trên đường, chưa vào ga — chưa có giờ thực tế
('LT-009', 'CT-SE1-BN', 'RAY-01', 'NVDH-005', 'SC-004',
    '2026-04-23T10:45:00', '2026-04-23T11:05:00',
    NULL, NULL,
    0, 'DA_XAC_NHAN', NULL,
    N'SE1  — Da xac nhan vào ga lúc 10:30)',
    '2026-04-23', '2026-04-23T10:32:00'),

-- ──────────────────────────────────────────────────────────
-- TRE — đang trong tình trạng trễ chưa vào ga
-- ──────────────────────────────────────────────────────────

-- SE2: dự kiến 14:30 nhưng đang trễ 8p — chưa đến ga lúc 10:30
('LT-010', 'CT-SE2-BN', 'RAY-02', 'NVDH-001', NULL,
    '2026-04-23T14:30:00', '2026-04-23T14:50:00',
    NULL, NULL,
    8, 'TRE', NULL,
    N'SE2 trễ 8p do chờ giao cắt đường bộ km785 — chưa đến ga',
    '2026-04-23', '2026-04-23T10:20:00'),

-- ──────────────────────────────────────────────────────────
-- DA_XAC_NHAN — đã lên lịch ray, chưa thực hiện
-- ──────────────────────────────────────────────────────────

-- QN1 điểm cuối: 12:00
('LT-011', 'CT-QN1-DC', 'RAY-04', 'NVDH-003', NULL,
    '2026-04-23T12:00:00', NULL,
    NULL, NULL,
    0, 'DA_XAC_NHAN', NULL,
    N'QN1 về ga 12:00 — đã xác nhận ray 4',
    '2026-04-23', '2026-04-23T09:00:00'),

-- TN2 xuất phát: 13:30
('LT-012', 'CT-TN2-XP', 'RAY-03', 'NVDH-002', NULL,
    NULL, '2026-04-23T13:30:00',
    NULL, NULL,
    0, 'DA_XAC_NHAN', NULL,
    N'TN2 xuất phát chiều 13:30 — đã xác nhận ray 3',
    '2026-04-23', '2026-04-23T09:30:00'),

-- TN2 điểm cuối: 16:45
('LT-013', 'CT-TN2-DC', 'RAY-04', 'NVDH-003', NULL,
    '2026-04-23T16:45:00', NULL,
    NULL, NULL,
    0, 'DA_XAC_NHAN', NULL,
    N'TN2 về ga 16:45 — đã xác nhận ray 4',
    '2026-04-23', '2026-04-23T09:30:00'),

-- QN2 xuất phát: 15:00
('LT-014', 'CT-QN2-XP', 'RAY-03', 'NVDH-002', NULL,
    NULL, '2026-04-23T15:00:00',
    NULL, NULL,
    0, 'DA_XAC_NHAN', NULL,
    N'QN2 xuất phát 15:00 — đã xác nhận ray 3',
    '2026-04-23', '2026-04-23T10:00:00'),

-- ──────────────────────────────────────────────────────────
-- CHO_XAC_NHAN — chưa phân ray / chờ điều hành duyệt
-- ──────────────────────────────────────────────────────────

-- SE4: 17:15-17:35 → chờ xác nhận
('LT-015', 'CT-SE4-BN', 'RAY-01', 'NVDH-002', NULL,
    '2026-04-23T17:15:00', '2026-04-23T17:35:00',
    NULL, NULL,
    0, 'CHO_XAC_NHAN', NULL,
    N'SE4 chiều — chờ xác nhận ray (ray 1 đang phong tỏa tạm)',
    '2026-04-23', '2026-04-23T10:00:00'),

-- QN2 điểm cuối: 19:30
('LT-016', 'CT-QN2-DC', 'RAY-04', 'NVDH-002', NULL,
    '2026-04-23T19:30:00', NULL,
    NULL, NULL,
    0, 'CHO_XAC_NHAN', NULL,
    N'QN2 điểm cuối 19:30 — chờ xác nhận',
    '2026-04-23', '2026-04-23T10:00:00'),

-- SE6: 20:00-20:20
('LT-017', 'CT-SE6-BN', 'RAY-02', 'NVDH-001', NULL,
    '2026-04-23T20:00:00', '2026-04-23T20:20:00',
    NULL, NULL,
    0, 'CHO_XAC_NHAN', NULL,
    N'SE6 tối 20:00 — chờ xác nhận ray',
    '2026-04-23', '2026-04-23T10:00:00'),

-- SE8: 22:45-23:05
('LT-018', 'CT-SE8-BN', 'RAY-01', 'NVDH-001', NULL,
    '2026-04-23T22:45:00', '2026-04-23T23:05:00',
    NULL, NULL,
    0, 'CHO_XAC_NHAN', NULL,
    N'SE8 khuya 22:45 — chờ xác nhận ray',
    '2026-04-23', '2026-04-23T10:00:00'),

-- HD2 tàu hàng khuya: 00:00+1
('LT-019', 'CT-HD2-BN', 'RAY-03', 'NVDH-003', NULL,
    '2026-04-24T00:00:00', '2026-04-24T00:25:00',
    NULL, NULL,
    0, 'CHO_XAC_NHAN', NULL,
    N'Tàu hàng HD2 qua khuya — chờ xác nhận',
    '2026-04-23', '2026-04-23T10:00:00'),

-- ──────────────────────────────────────────────────────────
-- HUY — lịch trình bị hủy
-- ──────────────────────────────────────────────────────────

-- DN1 bị hủy do tàu bảo trì + ray 6 bảo trì
('LT-020', 'CT-DN1-XP', 'RAY-06', 'NVDH-004', NULL,
    NULL, '2026-04-23T16:30:00',
    NULL, NULL,
    0, 'HUY', NULL,
    N'Hủy — DN1 đang bảo trì, ray 6 bảo trì định kỳ',
    '2026-04-23', '2026-04-23T08:00:00'),

-- ──────────────────────────────────────────────────────────
-- DUNG_TAI_GA + CHO_LENH — bổ sung kịch bản phức tạp
-- ──────────────────────────────────────────────────────────

-- SE4 trước đó bị giữ (kịch bản backup / test xung đột ray 3)
-- → dự kiến 17:15, chưa xảy ra lúc 10:30 — không có giờ thực tế
('LT-021', 'CT-SE4-BN', 'RAY-03', 'NVDH-003', 'SC-005',
    '2026-04-23T17:15:00', '2026-04-23T17:35:00',
    NULL, NULL,
    25, 'DA_XAC_NHAN', 'CHO_LENH',
    N'SE4 chờ lệnh do xung đột ray 3 — đang phối hợp phương án (chưa đến ga)',
    '2026-04-23', '2026-04-23T10:25:00');
GO

-- ============================================================
-- 9. SỰ CỐ — Ngày 23/04/2026
--    Lifecycle: CHO_TIEP_NHAN → DANG_XU_LY → DA_XU_LY
--    Mốc "hiện tại": 10:30 ngày 23/04/2026
-- ============================================================

-- Cập nhật schema (nullable, bỏ cột legacy)
IF COL_LENGTH('SU_CO', 'ma_lich_trinh') IS NOT NULL
BEGIN
    ALTER TABLE SU_CO ALTER COLUMN ma_lich_trinh NVARCHAR(20) NULL;
    PRINT N'✅ ma_lich_trinh đã là nullable';
END

IF COL_LENGTH('SU_CO', 'kich_hoat_phong_toa') IS NOT NULL
BEGIN
    ALTER TABLE SU_CO DROP COLUMN kich_hoat_phong_toa;
    PRINT N'✅ Đã xóa cột kich_hoat_phong_toa (legacy)';
END

IF COL_LENGTH('SU_CO', 'thoi_gian_xu_ly_uoc_tinh') IS NULL
BEGIN
    ALTER TABLE SU_CO ADD thoi_gian_xu_ly_uoc_tinh INT NULL;
    PRINT N'✅ Đã thêm cột thoi_gian_xu_ly_uoc_tinh';
END
GO
INSERT INTO SU_CO (ma_su_co, ma_lich_trinh, ma_nguoi_ghi_nhan, ma_ray,
    loai_su_co, mo_ta, muc_do, trang_thai_xu_ly,
    ngay_xay_ra, ngay_xu_ly, ngay_tao, thoi_gian_xu_ly_uoc_tinh) VALUES
	('SC-001', 'LT-008', 'NVNG-001', 'RAY-04',
    'SU_CO_KY_THUAT',
    N'Thiết bị tín hiệu ray 4 báo lỗi E07 lúc 08:15. Tàu TN1 bị hãm tốc độ, trễ 12 phút. Kỹ thuật khôi phục hoàn toàn lúc 09:05.',
    'THAP', 'DA_XU_LY',
    '2026-04-23T08:15:00', '2026-04-23T09:05:00',
    '2026-04-23T08:15:00', NULL),

	('SC-006', NULL, 'NVNG-003','RAY-01' ,
    'SU_CO_CO_SO_HA_TANG',
    N'Sự cố mất điện chiếu sáng khu vực sân ga phía Bắc lúc 05:45. Đội điện đã khôi phục hoàn toàn lúc 06:20, không ảnh hưởng vận hành tàu.',
    'THAP', 'CHO_TIEP_NHAN',
    '2026-04-23T16:30:00', NULL,
    '2026-04-23T16:30:00', NULL),
		('SC-007', NULL, 'NVNG-003','RAY-01' ,
    'SU_CO_CO_SO_HA_TANG',
    N'Sự cố mất điện chiếu sáng khu vực sân ga phía Bắc lúc 05:45. Đội điện đã khôi phục hoàn toàn lúc 06:20, không ảnh hưởng vận hành tàu.',
    'THAP', 'CHO_TIEP_NHAN',
    '2026-04-23T10:30:00', NULL,
    '2026-04-23T10:30:00', NULL)
	go
-- ============================================================
-- 10. KẾ HOẠCH ĐẶC BIỆT (8 kế hoạch)
-- ============================================================
INSERT INTO KE_HOACH_DAC_BIET (ma_ke_hoach, ma_nguoi_gui, ma_nguoi_duyet, ma_lich_trinh,
    tieu_de, noi_dung, muc_do_uu_tien, trang_thai, y_kien_duyet, ngay_gui, ngay_duyet) VALUES

('KH-001', 'NVDH-001', 'BQL-001', NULL,
    N'Tăng chuyến dịp lễ 30/4 - 1/5',
    N'Đề xuất tăng 4 chuyến bổ sung phục vụ dịp lễ 30/4-1/5. Cụ thể thêm 2 chuyến TN (6:00 và 16:00) và 2 chuyến QN (8:00 và 17:30) trong 3 ngày 29/4-1/5.',
    'CAO', 'DA_PHE_DUYET',
    N'Đồng ý. Chuẩn bị nhân sự và đầu máy dự phòng. Thông báo chính thức trước 3 ngày.',
    '2026-04-18', '2026-04-20'),

('KH-002', 'NVDH-002', NULL, NULL,
    N'Bảo trì định kỳ đường ray 6',
    N'Đề xuất phong tỏa ray 6 để bảo trì theo lịch trong 8 giờ (22:00-06:00). Khối lượng: thay 12 tà vẹt, bơm mỡ ghi, kiểm tra bu-lông toàn đoạn.',
    'BINH_THUONG', 'CHO_PHE_DUYET', NULL,
    '2026-04-22', NULL),

('KH-003', 'NVDH-003', 'BQL-002', NULL,
    N'Điều chỉnh lịch trình ngày lễ 2/9',
    N'Đề xuất điều chỉnh giờ chạy tàu phù hợp lượng khách tăng đột biến dịp 2/9. Ước tính tăng 35% lưu lượng so với ngày thường.',
    'CAO', 'TU_CHOI',
    N'Cần bổ sung phương án dự phòng, phân tích rủi ro và ước tính chi phí nhân sự.',
    '2026-04-13', '2026-04-15'),

('KH-004', 'NVDH-001', NULL, NULL,
    N'Thử nghiệm tần suất tàu ngắn Đà Nẵng - Tam Kỳ',
    N'Đề xuất chạy thử tuyến DN-Tam Kỳ với tần suất 30 phút/chuyến trong 1 tháng. Mục tiêu: đánh giá nhu cầu và khả năng mở rộng tuyến nội vùng.',
    'KHAN_CAP', 'CHO_PHE_DUYET', NULL,
    '2026-04-23', NULL),

('KH-005', 'NVDH-005', 'BQL-001', 'LT-020',
    N'Khắc phục sự cố ray 5 — phong tỏa khẩn',
    N'Đề xuất kế hoạch sửa chữa khẩn cấp bộ ghi ray 5. Dự kiến 3 bước: (1) Tắt nguồn điện, (2) Tháo dỡ cơ cấu ghi, (3) Lắp mới + chạy thử. Thời gian: 4-6 giờ.',
    'KHAN_CAP', 'DA_PHE_DUYET',
    N'Phê duyệt khẩn. Huy động đội kỹ thuật ngay trong ca này.',
    '2026-04-23T05:30:00', '2026-04-23T06:30:00'),

('KH-006', 'NVDH-002', 'BQL-003', NULL,
    N'Tăng thời gian đệm giữa các chuyến giờ cao điểm',
    N'Đề xuất tăng thời gian đệm từ 10 phút lên 15 phút trong khung 6:00-9:00 và 16:00-19:00 để giảm xung đột và cải thiện đúng giờ.',
    'BINH_THUONG', 'DA_PHE_DUYET',
    N'Đồng ý, áp dụng thử nghiệm từ tuần tới, đánh giá sau 2 tuần.',
    '2026-04-08', '2026-04-09'),

('KH-007', 'NVDH-003', NULL, 'LT-021',
    N'Giải quyết xung đột ray 3 — SE4 và TN2',
    N'Đề xuất chuyển SE4 sang ray 2 và để TN2 giữ ray 3. Cần cập nhật lịch trình LT-015 và LT-012 tương ứng. Thực hiện ngay trong ca trực.',
    'CAO', 'CHO_PHE_DUYET', NULL,
    '2026-04-23T10:22:00', NULL),

('KH-008', 'NVDH-001', 'BQL-002', NULL,
    N'Lắp hệ thống cảnh báo tự động các đường ngang',
    N'Đề xuất lắp hệ thống cảnh báo tự động tại 4 đường ngang khu vực km 780-790. Dự toán 2,4 tỷ đồng. Đơn vị thi công: Công ty TNHH Kỹ thuật Đường sắt Miền Trung.',
    'BINH_THUONG', 'TU_CHOI',
    N'Ngân sách quý 2 chưa còn. Đề nghị đưa vào kế hoạch quý 3.',
    '2026-04-03', '2026-04-05');
GO

-- ============================================================
-- 11. CHỈ ĐẠO (8 chỉ đạo)
-- ============================================================
INSERT INTO CHI_DAO (ma_chi_dao, ma_nguoi_gui, ma_nguoi_nhan,
    tieu_de, noi_dung, muc_do_uu_tien, trang_thai, ngay_gui, ngay_doc) VALUES

('CD-001', 'BQL-001', 'NVDH-001',
    N'Giảm tốc độ các ray 4-6 do nhiệt độ cao',
    N'Nhiệt độ ray 4-6 đo được 62°C lúc 07:30 (vượt ngưỡng 55°C). Tất cả đoàn tàu qua các ray này giới hạn 30km/h đến khi nhiệt độ về dưới 50°C.',
    'KHAN_CAP', 'DA_DOC', '2026-04-23T07:30:00', '2026-04-23T08:00:00'),

('CD-002', 'BQL-001', 'NVDH-002',
    N'Quy trình bàn giao ca v4.2 — hiệu lực ngay',
    N'Từ ca chiều hôm nay áp dụng mẫu bàn giao ca v4.2. Yêu cầu ghi đầy đủ: (1) Trạng thái từng lịch trình, (2) Sự cố đang xử lý, (3) Tình trạng đường ray. File mẫu được tải tại hệ thống.',
    'BINH_THUONG', 'DA_GUI', '2026-04-23T04:30:00', NULL),

('CD-003', 'BQL-002', 'NVDH-003',
    N'Kiểm tra an toàn đường ray sau mưa lớn tối qua',
    N'Mưa 80mm/3h đêm 22/4. Yêu cầu kiểm tra toàn bộ 6 đường ray trước 05:30 ngày 23/4. Đặc biệt chú ý ray 4-6 đoạn phía Nam có nguy cơ xói. Ghi biên bản đầy đủ.',
    'CAO', 'DA_DOC', '2026-04-22T23:00:00', '2026-04-23T01:30:00'),

('CD-004', 'BQL-001', 'NVDH-005',
    N'Phong tỏa ray 5 — hiệu lực ngay lập tức',
    N'Do sự cố cơ cấu ghi ray 5, phong tỏa ray 5 ngay lập tức. Chuyển toàn bộ luồng tàu sang ray 3 và 4. Báo cáo tình hình mỗi 30 phút.',
    'KHAN_CAP', 'DA_DOC', '2026-04-23T06:30:00', '2026-04-23T07:00:00'),

('CD-005', 'BQL-003', 'NVDH-001',
    N'Báo cáo tổng hợp vận hành cuối tuần',
    N'Yêu cầu gửi báo cáo tổng hợp vận hành cuối tuần (thứ 7-CN) trước 08:00 thứ Hai. Nội dung: số chuyến, tỷ lệ đúng giờ, sự cố phát sinh, lượng hành khách ước tính.',
    'BINH_THUONG', 'DA_GUI', '2026-04-22T23:30:00', NULL),

('CD-006', 'BQL-002', 'NVDH-002',
    N'Ưu tiên phân ray 1-2 cho tàu khách giờ cao điểm',
    N'Trong khung 6:00-9:00 và 16:00-19:00, ray 1 và 2 được ưu tiên tuyệt đối cho tàu khách SE và TN. Tàu hàng HD chuyển sang ray 3. Áp dụng từ ngày 23/4.',
    'CAO', 'DA_DOC', '2026-04-21', '2026-04-21'),

('CD-007', 'BQL-001', 'NVDH-004',
    N'Tăng cường tuần tra sân ga giờ cao điểm',
    N'Ghi nhận sự cố an ninh SC-010 và 1 vụ nghi trộm cắp tuần trước. Tăng cường tuần tra sân ga trong khung giờ cao điểm. Phối hợp thêm bảo vệ ca 2.',
    'CAO', 'DA_DOC', '2026-04-23T09:00:00', '2026-04-23T09:30:00'),

('CD-008', 'BQL-003', 'NVDH-003',
    N'Cập nhật danh sách khách hàng ưu tiên tháng 5',
    N'Danh sách hành khách thường xuyên được ưu tiên lên/xuống tàu tháng 5 đã cập nhật. Gửi file Excel đính kèm, in và dán tại quầy phục vụ trước ngày 25/4.',
    'BINH_THUONG', 'DA_GUI', '2026-04-23T10:00:00', NULL);
GO

-- ============================================================
-- 12. NHẬT KÝ HỆ THỐNG (22 bản ghi — ngày 23/04/2026)
-- ============================================================
INSERT INTO NHAT_KY (ma_nhat_ky, ma_tai_khoan, hanh_dong, doi_tuong, ma_doi_tuong,
    noi_dung_cu, noi_dung_moi, dia_chi_ip, thoi_gian) VALUES

('NK-001', 'NVDH-001', 'TAO_LICH_TRINH',    'LICH_TRINH', 'LT-001', NULL,                          N'Tạo LT-001 cho SE3 ca sáng sớm',               '192.168.1.45',  '2026-04-22T22:00:00'),
('NK-002', 'NVDH-001', 'PHAN_BO_RAY',        'LICH_TRINH', 'LT-001', N'RAY: NULL',                  N'RAY: RAY-01',                                   '192.168.1.45',  '2026-04-22T22:05:00'),
('NK-003', 'NVNG-001', 'GHI_NHAN_SU_CO',     'SU_CO',      'SC-001', NULL,                          N'Tín hiệu ray 4 lỗi E07 — TN1 trễ 12p',         '192.168.1.50',  '2026-04-23T08:16:00'),
('NK-004', 'NVDH-003', 'SUA_GIO',            'LICH_TRINH', 'LT-008', N'Giờ đến dự kiến: 09:30',     N'Giờ đến thực: 09:42 (trễ 12p)',                 '192.168.1.47',  '2026-04-23T09:44:00'),
('NK-005', 'NVNG-001', 'GHI_NHAN_SU_CO',     'SU_CO',      'SC-006', NULL,                          N'Mất điện chiếu sáng sân ga phía Bắc',           '192.168.1.50',  '2026-04-23T05:46:00'),
('NK-006', 'NVDH-002', 'XAC_NHAN_LT',        'LICH_TRINH', 'LT-011', N'Trạng thái: CHO_XAC_NHAN',  N'Trạng thái: DA_XAC_NHAN (RAY-04)',              '192.168.1.46',  '2026-04-23T09:00:00'),
('NK-007', 'BQL-001',  'PHE_DUYET',          'KE_HOACH',   'KH-001', N'Trạng thái: CHO_PHE_DUYET',  N'Trạng thái: DA_PHE_DUYET',                      '192.168.1.100', '2026-04-20T14:30:00'),
('NK-008', 'NVDH-003', 'DOI_RAY',            'LICH_TRINH', 'LT-003', N'RAY: RAY-02',                N'RAY: RAY-03',                                   '192.168.1.47',  '2026-04-23T04:30:00'),
('NK-009', 'QTV-001',  'CAP_NHAT_TAI_KHOAN', 'TAI_KHOAN',  'NVDH-004',N'Trạng thái: HOAT_DONG',    N'Trạng thái: HOAT_DONG (đặt lại mật khẩu)',     '192.168.1.1',   '2026-04-21T10:00:00'),
('NK-010', 'NVDH-004', 'HUY_LICH_TRINH',     'LICH_TRINH', 'LT-020', N'Trạng thái: CHO_XAC_NHAN',  N'Trạng thái: HUY (ray 6 bảo trì, tàu DN1 BT)',  '192.168.1.48',  '2026-04-23T08:00:00'),
('NK-011', 'BQL-001',  'PHE_DUYET',          'KE_HOACH',   'KH-005', N'Trạng thái: CHO_PHE_DUYET',  N'Trạng thái: DA_PHE_DUYET',                      '192.168.1.100', '2026-04-23T06:30:00'),
('NK-012', 'BQL-001',  'GUI_CHI_DAO',        'CHI_DAO',    'CD-001', NULL,                          N'Chỉ đạo giảm tốc ray 4-6 do nhiệt độ cao',     '192.168.1.100', '2026-04-23T07:30:00'),
('NK-013', 'NVNG-001', 'GHI_NHAN_SU_CO',     'SU_CO',      'SC-009', NULL,                          N'Đèn tín hiệu ray 2 mờ — cần kiểm tra',          '192.168.1.50',  '2026-04-23T10:26:00'),
('NK-014', 'NVNG-002', 'GHI_NHAN_SU_CO',     'SU_CO',      'SC-010', NULL,                          N'An ninh: người lạ khu vực ray 1 — 10:28',       '192.168.1.51',  '2026-04-23T10:29:00'),
('NK-015', 'NVNG-006', 'GHI_NHAN_SU_CO',     'SU_CO',      'SC-012', NULL,                          N'Mất liên lạc QN1 — 5 phút liên tiếp',           '192.168.1.55',  '2026-04-23T10:17:00'),
('NK-016', 'NVNG-001', 'GHI_NHAN_SU_CO',     'SU_CO',      'SC-002', NULL,                          N'Vật cản ray 1 — phong tỏa tạm 60 phút',         '192.168.1.50',  '2026-04-23T10:30:00'),
('NK-017', 'NVDH-003', 'TIEP_NHAN_SU_CO',    'SU_CO',      'SC-001', N'Trạng thái: CHO_TIEP_NHAN',  N'Trạng thái: DANG_XU_LY',                        '192.168.1.47',  '2026-04-23T08:20:00'),
('NK-018', 'NVDH-001', 'TIEP_NHAN_SU_CO',    'SU_CO',      'SC-004', N'Trạng thái: CHO_TIEP_NHAN',  N'Trạng thái: DANG_XU_LY (MDo: CAO)',             '192.168.1.45',  '2026-04-23T10:00:00'),
('NK-019', 'NVDH-005', 'PHONG_TOA_RAY',      'DUONG_RAY',  'RAY-05', N'Trạng thái: SAN_SANG',       N'Trạng thái: PHONG_TOA',                         '192.168.1.48',  '2026-04-23T06:35:00'),
('NK-020', 'BQL-002',  'TU_CHOI',            'KE_HOACH',   'KH-003', N'Trạng thái: CHO_PHE_DUYET',  N'Trạng thái: TU_CHOI (thiếu PA dự phòng)',       '192.168.1.101', '2026-04-15T09:00:00'),
('NK-021', 'NVNG-001', 'PHONG_TOA_RAY',      'DUONG_RAY',  'RAY-01', N'Trạng thái: SAN_SANG',       N'Trạng thái: PHONG_TOA_TAM — SC-014 đang xử lý', '192.168.1.50',  '2026-04-23T10:30:00'),
('NK-022', 'NVNG-002', 'GHI_NHAN_SU_CO',     'SU_CO',      'SC-011', NULL,                          N'SE2 báo rung động bất thường toa số 3 — km783', '192.168.1.51',  '2026-04-23T10:21:00');
GO

-- ============================================================
-- 13. QUY TẮC NGHIỆP VỤ (6 bản ghi cấu hình mặc định)
-- ============================================================
INSERT INTO QUY_TAC_NGHIEP_VU (ma_quy_tac, ten_quy_tac, gia_tri, kieu_du_lieu, mo_ta, nhom_quy_tac, cap_nhat_lan_cuoi) VALUES 
('QT-01', N'Thời gian đệm tối thiểu sau mỗi loại tàu', '15', 'NUMBER', N'Khoảng thời gian đệm (phút) giữa các tàu nhằm đảm bảo an toàn.', N'LỊCH TRÌNH VÀ VẬN HÀNH', CURRENT_TIMESTAMP),
('QT-02', N'Thời gian lên tàu tối thiểu (Tàu xuất phát)', '30', 'NUMBER', N'Thời gian bắt đầu làm thủ tục cho hành khách lên tàu trước giờ khởi hành (phút).', N'LỊCH TRÌNH VÀ VẬN HÀNH', CURRENT_TIMESTAMP),
('QT-03', N'Thời gian dừng đỗ tối thiểu (Tàu điểm cuối)', '20', 'NUMBER', N'Thời gian tàu dừng đón/trả khách tại nhà ga cuối (phút).', N'LỊCH TRÌNH VÀ VẬN HÀNH', CURRENT_TIMESTAMP),
('QT-04', N'Quy trình phê duyệt Kế hoạch Đặc biệt', 'BAN_QUAN_LY', 'TEXT', N'Chức vụ có thẩm quyền phê duyệt các thay đổi lịch trình bất ngờ.', N'PHÊ DUYỆT VÀ TÀI KHOẢN', CURRENT_TIMESTAMP),
('QT-05', N'Ngưỡng cảnh báo trễ tàu', '15', 'NUMBER', N'Thời gian trễ (phút) so với lịch trình để hệ thống kích hoạt cảnh báo.', N'BÁO ĐỘNG VÀ ĐỒNG BỘ', CURRENT_TIMESTAMP),
('QT-06', N'Thời hạn đồng bộ Bảng LED', '5', 'NUMBER', N'Hệ thống tự động đồng bộ Bảng LED điện tử Nhà ga định kỳ (phút/lần).', N'BÁO ĐỘNG VÀ ĐỒNG BỘ', CURRENT_TIMESTAMP),
('QT-07', N'Số ngày tối thiểu để tạo chuyến tàu', '30', 'NUMBER', N'Ràng buộc thời gian tạo chuyến tàu mới phải trước ngày chạy một khoảng thời gian (ngày).', N'LỊCH TRÌNH VÀ VẬN HÀNH', CURRENT_TIMESTAMP);

GO

-- ============================================================
-- XÁC NHẬN
-- ============================================================
PRINT N'';
PRINT N'================================================================';
PRINT N'  ✅ Dữ liệu test đã chèn thành công!';
PRINT N'  📅 Ngày cơ sở cố định: 23/04/2026 (10:30 sáng)';
PRINT N'================================================================';
PRINT N'';
PRINT N'  👤 TÀI KHOẢN (mật khẩu: 123456)';
PRINT N'     QTV-001     — Quản trị viên';
PRINT N'     NVDH-001    — Nhân viên Điều hành';
PRINT N'     NVNG-001    — Nhân viên Nhà ga';
PRINT N'     BQL-001     — Ban Quản lý';
PRINT N'';
PRINT N'  🚆 CHUYẾN TÀU:';
PRINT N'     23/04/2026 (hôm nay) : 20 chuyến (đủ mọi vai trò)';
PRINT N'     22/04/2026 (hôm qua) :  4 chuyến';
PRINT N'     21/04/2026 (-2 ngày) :  3 chuyến';
PRINT N'     20/04/2026 (-3 ngày) :  2 chuyến';
PRINT N'     24/04/2026 (+1 ngày) :  7 chuyến';
PRINT N'     25/04/2026 (+2 ngày) :  4 chuyến';
PRINT N'     26/04/2026 (+3 ngày) :  3 chuyến';
PRINT N'';
PRINT N'  📋 LỊCH TRÌNH (ngày 23/04, đủ 6 trạng thái):';
PRINT N'     DA_ROI_GA     : LT-001..007 (7 bản ghi — trước 10:30)';
PRINT N'     DUNG_TAI_GA   : LT-008, LT-009, LT-021 (3 bản ghi)';
PRINT N'     TRE           : LT-010 (1 bản ghi)';
PRINT N'     DA_XAC_NHAN   : LT-011..014 (4 bản ghi)';
PRINT N'     CHO_XAC_NHAN  : LT-015..019 (5 bản ghi)';
PRINT N'     HUY           : LT-020 (1 bản ghi)';
PRINT N'';
PRINT N'  📊 SỰ CỐ (ngày 23/04, workflow mới):';
PRINT N'     DA_XU_LY      : SC-001, SC-006, SC-007, SC-008, SC-013 (5 bản ghi)';
PRINT N'     DANG_XU_LY    : SC-002, SC-003, SC-004, SC-005 (4 bản ghi)';
PRINT N'     CHO_TIEP_NHAN : SC-009, SC-010, SC-011, SC-012, SC-015 (5 bản ghi)';
PRINT N'';
PRINT N'  🛤️  ĐƯỜNG RAY:';
PRINT N'     PHONG_TOA_TAM : RAY-01 (SC-002 — vật cản, ước tính 60 phút)';
PRINT N'     SAN_SANG      : RAY-02, RAY-03, RAY-04';
PRINT N'     PHONG_TOA     : RAY-05 (sự cố cơ cấu ghi)';
PRINT N'     BAO_TRI       : RAY-06';
PRINT N'';
PRINT N'  📝 KẾ HOẠCH   : 8 bản ghi';
PRINT N'  📢 CHỈ ĐẠO    : 8 bản ghi';
PRINT N'  📜 NHẬT KÝ    : 22 bản ghi';
PRINT N'================================================================';
GO
update tai_khoan 
set mat_khau ='$2a$10$b0OX2miMjVcgQMbOTDJ87eD1A2LSiwgzN7MGrcUAFmjP1uQ/uEM.6'