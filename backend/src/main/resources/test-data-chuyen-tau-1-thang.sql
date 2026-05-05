-- ============================================
-- DỮ LIỆU CHUYẾN TÀU CHO 1 THÁNG TỚI
-- Từ 21/04/2026 đến 20/05/2026
-- Schema: ma_chuyen_tau (PK), gio_den_du_kien, gio_di_du_kien,
--         ma_tau (FK), ma_tuyen (FK), ngay_cap_nhat, ngay_chay,
--         ngay_tao, trang_thai, vai_tro_tai_da_nang
-- ============================================

USE railway_danang1;
GO

-- Xóa dữ liệu cũ
DELETE FROM CHUYEN_TAU WHERE ngay_chay >= '2026-04-21' AND ngay_chay <= '2026-05-20';
GO

-- ============================================
-- CHUYẾN TÀU HÀNG NGÀY (30 ngày × 6 tàu = 180 chuyến)
-- ============================================

DECLARE @StartDate DATE = '2026-05-21';
DECLARE @EndDate DATE = '2026-06-20';
DECLARE @CurrentDate DATE = @StartDate;

WHILE @CurrentDate <= @EndDate
BEGIN
    -- SE1: HN→SG (Trung gian)
    INSERT INTO CHUYEN_TAU (ma_chuyen_tau, ma_tau, ma_tuyen, vai_tro_tai_da_nang, gio_den_du_kien, gio_di_du_kien, ngay_chay, trang_thai, ngay_tao)
    VALUES ('SE1', 'TAU-001', 'TUYEN-HN-SG', 'TRUNG_GIAN', '08:30:00', '08:45:00', @CurrentDate, 'HOAT_DONG', GETDATE());

    -- SE2: SG→HN (Trung gian)
    INSERT INTO CHUYEN_TAU (ma_chuyen_tau, ma_tau, ma_tuyen, vai_tro_tai_da_nang, gio_den_du_kien, gio_di_du_kien, ngay_chay, trang_thai, ngay_tao)
    VALUES ('SE2', 'TAU-002', 'TUYEN-SG-HN', 'TRUNG_GIAN', '14:20:00', '14:35:00', @CurrentDate, 'HOAT_DONG', GETDATE());

    -- SE3: HN→SG (Trung gian)
    INSERT INTO CHUYEN_TAU (ma_chuyen_tau, ma_tau, ma_tuyen, vai_tro_tai_da_nang, gio_den_du_kien, gio_di_du_kien, ngay_chay, trang_thai, ngay_tao)
    VALUES ('SE3', 'TAU-003', 'TUYEN-HN-SG', 'TRUNG_GIAN', '19:00:00', '19:15:00', @CurrentDate, 'HOAT_DONG', GETDATE());

    -- SE4: SG→HN (Trung gian)
    INSERT INTO CHUYEN_TAU (ma_chuyen_tau, ma_tau, ma_tuyen, vai_tro_tai_da_nang, gio_den_du_kien, gio_di_du_kien, ngay_chay, trang_thai, ngay_tao)
    VALUES ('SE4', 'TAU-004', 'TUYEN-SG-HN', 'TRUNG_GIAN', '22:30:00', '22:45:00', @CurrentDate, 'HOAT_DONG', GETDATE());

    -- SE5: HN→DN (Điểm cuối)
    INSERT INTO CHUYEN_TAU (ma_chuyen_tau, ma_tau, ma_tuyen, vai_tro_tai_da_nang, gio_den_du_kien, gio_di_du_kien, ngay_chay, trang_thai, ngay_tao)
    VALUES ('SE5', 'TAU-005', 'TUYEN-HN-DN', 'DIEM_CUOI', '06:00:00', '06:15:00', @CurrentDate, 'HOAT_DONG', GETDATE());

    -- SE6: DN→HN (Xuất phát)
    INSERT INTO CHUYEN_TAU (ma_chuyen_tau, ma_tau, ma_tuyen, vai_tro_tai_da_nang, gio_den_du_kien, gio_di_du_kien, ngay_chay, trang_thai, ngay_tao)
    VALUES ('SE6', 'TAU-006', 'TUYEN-DN-HN', 'XUAT_PHAT', '20:00:00', '20:30:00', @CurrentDate, 'HOAT_DONG', GETDATE());

    SET @CurrentDate = DATEADD(DAY, 1, @CurrentDate);
END;
GO

-- ============================================
-- CHUYẾN TÀU CHẴN LẺ (15 ngày × 2 tàu)
-- ============================================

SET @CurrentDate = @StartDate;

WHILE @CurrentDate <= @EndDate
BEGIN
    DECLARE @DayOfMonth INT = DAY(@CurrentDate);
    
    -- Ngày chẵn
    IF @DayOfMonth % 2 = 0
    BEGIN
        INSERT INTO CHUYEN_TAU (ma_chuyen_tau, ma_tau, ma_tuyen, vai_tro_tai_da_nang, gio_den_du_kien, gio_di_du_kien, ngay_chay, trang_thai, ngay_tao)
        VALUES ('TN1', 'TAU-007', 'TUYEN-HUE-DN', 'DIEM_CUOI', '10:30:00', '10:45:00', @CurrentDate, 'HOAT_DONG', GETDATE());

        INSERT INTO CHUYEN_TAU (ma_chuyen_tau, ma_tau, ma_tuyen, vai_tro_tai_da_nang, gio_den_du_kien, gio_di_du_kien, ngay_chay, trang_thai, ngay_tao)
        VALUES ('TN2', 'TAU-008', 'TUYEN-DN-NTR', 'XUAT_PHAT', '15:30:00', '16:00:00', @CurrentDate, 'HOAT_DONG', GETDATE());
    END
    
    -- Ngày lẻ
    IF @DayOfMonth % 2 = 1
    BEGIN
        INSERT INTO CHUYEN_TAU (ma_chuyen_tau, ma_tau, ma_tuyen, vai_tro_tai_da_nang, gio_den_du_kien, gio_di_du_kien, ngay_chay, trang_thai, ngay_tao)
        VALUES ('TN3', 'TAU-009', 'TUYEN-NTR-DN', 'DIEM_CUOI', '11:00:00', '11:15:00', @CurrentDate, 'HOAT_DONG', GETDATE());

        INSERT INTO CHUYEN_TAU (ma_chuyen_tau, ma_tau, ma_tuyen, vai_tro_tai_da_nang, gio_den_du_kien, gio_di_du_kien, ngay_chay, trang_thai, ngay_tao)
        VALUES ('TN4', 'TAU-010', 'TUYEN-DN-HUE', 'XUAT_PHAT', '16:30:00', '17:00:00', @CurrentDate, 'HOAT_DONG', GETDATE());
    END

    SET @CurrentDate = DATEADD(DAY, 1, @CurrentDate);
END;
GO

-- ============================================
-- CHUYẾN TÀU CUỐI TUẦN (Thứ 7 & Chủ nhật)
-- ============================================

SET @CurrentDate = @StartDate;

WHILE @CurrentDate <= @EndDate
BEGIN
    DECLARE @DayOfWeek INT = DATEPART(WEEKDAY, @CurrentDate);
    
    IF @DayOfWeek IN (1, 7) -- CN=1, T7=7
    BEGIN
        INSERT INTO CHUYEN_TAU (ma_chuyen_tau, ma_tau, ma_tuyen, vai_tro_tai_da_nang, gio_den_du_kien, gio_di_du_kien, ngay_chay, trang_thai, ngay_tao)
        VALUES ('SE7', 'TAU-011', 'TUYEN-HN-SG', 'TRUNG_GIAN', '05:00:00', '05:15:00', @CurrentDate, 'HOAT_DONG', GETDATE());

        INSERT INTO CHUYEN_TAU (ma_chuyen_tau, ma_tau, ma_tuyen, vai_tro_tai_da_nang, gio_den_du_kien, gio_di_du_kien, ngay_chay, trang_thai, ngay_tao)
        VALUES ('SE8', 'TAU-012', 'TUYEN-SG-HN', 'TRUNG_GIAN', '23:00:00', '23:15:00', @CurrentDate, 'HOAT_DONG', GETDATE());

        INSERT INTO CHUYEN_TAU (ma_chuyen_tau, ma_tau, ma_tuyen, vai_tro_tai_da_nang, gio_den_du_kien, gio_di_du_kien, ngay_chay, trang_thai, ngay_tao)
        VALUES ('DL1', 'TAU-013', 'TUYEN-DN-HA', 'XUAT_PHAT', '09:00:00', '09:30:00', @CurrentDate, 'HOAT_DONG', GETDATE());

        INSERT INTO CHUYEN_TAU (ma_chuyen_tau, ma_tau, ma_tuyen, vai_tro_tai_da_nang, gio_den_du_kien, gio_di_du_kien, ngay_chay, trang_thai, ngay_tao)
        VALUES ('DL2', 'TAU-014', 'TUYEN-HA-DN', 'DIEM_CUOI', '17:30:00', '17:45:00', @CurrentDate, 'HOAT_DONG', GETDATE());
    END

    SET @CurrentDate = DATEADD(DAY, 1, @CurrentDate);
END;
GO

-- ============================================
-- CHUYẾN TÀU ĐẶC BIỆT (Ngày lễ)
-- ============================================

-- 30/04/2026
INSERT INTO CHUYEN_TAU (ma_chuyen_tau, ma_tau, ma_tuyen, vai_tro_tai_da_nang, gio_den_du_kien, gio_di_du_kien, ngay_chay, trang_thai, ngay_tao)
VALUES 
('SE13', 'TAU-019', 'TUYEN-HN-SG', 'TRUNG_GIAN', '12:00:00', '12:15:00', '2026-04-30', 'HOAT_DONG', GETDATE()),
('SE14', 'TAU-020', 'TUYEN-SG-HN', 'TRUNG_GIAN', '16:00:00', '16:15:00', '2026-04-30', 'HOAT_DONG', GETDATE());

-- 01/05/2026
INSERT INTO CHUYEN_TAU (ma_chuyen_tau, ma_tau, ma_tuyen, vai_tro_tai_da_nang, gio_den_du_kien, gio_di_du_kien, ngay_chay, trang_thai, ngay_tao)
VALUES 
('SE9', 'TAU-015', 'TUYEN-HN-SG', 'TRUNG_GIAN', '07:00:00', '07:15:00', '2026-05-01', 'HOAT_DONG', GETDATE()),
('SE10', 'TAU-016', 'TUYEN-SG-HN', 'TRUNG_GIAN', '13:00:00', '13:15:00', '2026-05-01', 'HOAT_DONG', GETDATE()),
('SE11', 'TAU-017', 'TUYEN-HN-DN', 'DIEM_CUOI', '18:00:00', '18:15:00', '2026-05-01', 'HOAT_DONG', GETDATE()),
('SE12', 'TAU-018', 'TUYEN-DN-SG', 'XUAT_PHAT', '21:00:00', '21:30:00', '2026-05-01', 'HOAT_DONG', GETDATE());

GO

-- ============================================
-- THỐNG KÊ
-- ============================================

PRINT '============================================';
PRINT 'THỐNG KÊ DỮ LIỆU CHUYẾN TÀU';
PRINT '============================================';

SELECT 
    COUNT(*) AS [Tổng số chuyến],
    COUNT(DISTINCT ngay_chay) AS [Số ngày],
    MIN(ngay_chay) AS [Từ ngày],
    MAX(ngay_chay) AS [Đến ngày]
FROM CHUYEN_TAU
WHERE ngay_chay >= '2026-04-21' AND ngay_chay <= '2026-05-20';

SELECT 
    vai_tro_tai_da_nang AS [Vai trò],
    COUNT(*) AS [Số lượng]
FROM CHUYEN_TAU
WHERE ngay_chay >= '2026-04-21' AND ngay_chay <= '2026-05-20'
GROUP BY vai_tro_tai_da_nang;

PRINT '✅ Hoàn tất!';
GO
