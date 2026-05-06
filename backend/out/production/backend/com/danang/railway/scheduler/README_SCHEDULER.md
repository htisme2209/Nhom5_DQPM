# Scheduled Jobs - Tự động kiểm tra Mất liên lạc

## Tổng quan
Hệ thống tự động kiểm tra và tạo sự cố "Mất liên lạc" cho các tàu quá 10 phút chưa xác nhận.

## MatLienLacScheduler

### Cấu hình
- **Tần suất**: Chạy mỗi 2 phút (120000 ms)
- **Delay ban đầu**: 1 phút sau khi khởi động (60000 ms)
- **Annotation**: `@Scheduled(fixedRate = 120000, initialDelay = 60000)`

### Luồng hoạt động

1. **Mỗi 2 phút**, scheduler tự động chạy
2. Gọi `xacNhanTauService.kiemTraVaTaoSuCoMatLienLac()`
3. Service kiểm tra:
   - Lấy tất cả lịch trình trong ngày
   - Trạng thái: CHO_XAC_NHAN hoặc DA_XAC_NHAN
   - Giờ đến dự kiến < hiện tại - 10 phút
4. Với mỗi lịch trình quá hạn:
   - Kiểm tra đã có sự cố MAT_LIEN_LAC chưa
   - Nếu chưa → Tạo sự cố mới
   - Gắn thẻ sự cố cho lịch trình
5. Log kết quả

### Log mẫu

```
2024-01-15 10:00:00 INFO  - === Bắt đầu kiểm tra mất liên lạc ===
2024-01-15 10:00:01 WARN  - ⚠️ Đã tạo 2 sự cố mất liên lạc mới
2024-01-15 10:00:01 INFO  - === Kết thúc kiểm tra mất liên lạc ===
```

### Sự cố được tạo

```java
SuCo {
    maSuCo: "SC-MLL-1705305600000",
    maLichTrinh: "LT-001",
    maRay: "RAY-01",
    loaiSuCo: "MAT_LIEN_LAC",
    moTa: "Tàu SE1 đã quá 12 phút so với giờ đến dự kiến (10:30) mà chưa có xác nhận từ nhà ga",
    mucDo: "KHAN_CAP",
    trangThaiXuLy: "CHUA_XU_LY",
    kichHoatPhongToa: false
}
```

## Frontend Polling (Backup)

Ngoài scheduled job backend, frontend cũng có polling:

### XacNhanTauPage.jsx
- **Tần suất**: Mỗi 2 phút
- **Delay ban đầu**: 1 phút
- **Method**: `xacNhanTauAPI.kiemTraQuaHan()`

### Lý do có 2 cơ chế:
1. **Backend scheduler**: Chạy ngay cả khi không có user online
2. **Frontend polling**: Backup, đảm bảo khi user đang xem trang

## Enable Scheduling

Đã thêm `@EnableScheduling` vào `RailwayManagementApplication.java`:

```java
@SpringBootApplication
@EnableScheduling
public class RailwayManagementApplication {
    // ...
}
```

## Test

### Test thủ công:
1. Tạo lịch trình với giờ đến dự kiến = 15 phút trước
2. Trạng thái = CHO_XAC_NHAN
3. Đợi 2 phút
4. Kiểm tra bảng SU_CO → Phải có sự cố mới
5. Kiểm tra LICH_TRINH → ma_su_co_anh_huong được gắn

### Test bằng API:
```bash
GET http://localhost:8080/api/xac-nhan-tau/kiem-tra-qua-han
```

### SQL test:
```sql
-- Tạo lịch trình quá hạn
INSERT INTO LICH_TRINH VALUES (
    'LT-TEST-MLL', 'CT-SE1-BN', 'RAY-01', 'NVDH-001', NULL,
    DATEADD(MINUTE, -15, GETDATE()), -- 15 phút trước
    DATEADD(MINUTE, -15, GETDATE()) + CAST('00:20:00' AS DATETIME),
    NULL, NULL, 0, 'CHO_XAC_NHAN', NULL,
    GETDATE(), GETDATE()
);

-- Đợi 2 phút hoặc gọi API

-- Kiểm tra sự cố được tạo
SELECT * FROM SU_CO WHERE loai_su_co = 'MAT_LIEN_LAC' ORDER BY ngay_tao DESC;

-- Kiểm tra lịch trình được gắn thẻ
SELECT * FROM LICH_TRINH WHERE ma_lich_trinh = 'LT-TEST-MLL';
```

## Cấu hình nâng cao

Có thể thay đổi tần suất trong `application.properties`:

```properties
# Tần suất kiểm tra mất liên lạc (ms)
scheduler.mat-lien-lac.rate=120000

# Delay ban đầu (ms)
scheduler.mat-lien-lac.initial-delay=60000

# Ngưỡng phút (phút)
scheduler.mat-lien-lac.threshold=10
```

Sau đó update code:

```java
@Scheduled(
    fixedRateString = "${scheduler.mat-lien-lac.rate}",
    initialDelayString = "${scheduler.mat-lien-lac.initial-delay}"
)
```

## Monitoring

### Log levels:
- **INFO**: Kiểm tra bình thường, không có vấn đề
- **WARN**: Phát hiện và tạo sự cố mới
- **ERROR**: Lỗi khi chạy scheduler

### Metrics cần theo dõi:
- Số lần chạy scheduler
- Số sự cố được tạo
- Thời gian xử lý trung bình
- Số lỗi

## Lưu ý

1. **Không tạo duplicate**: Kiểm tra `existsByMaLichTrinhAndLoaiSuCo` trước khi tạo
2. **Performance**: Query có index trên `trang_thai` và `gio_den_du_kien`
3. **Transaction**: Method có `@Transactional` để đảm bảo consistency
4. **Error handling**: Try-catch để không crash scheduler
5. **Timezone**: Sử dụng `LocalDateTime.now()` - đảm bảo server timezone đúng

## Tắt scheduler (nếu cần)

Trong `application.properties`:

```properties
spring.task.scheduling.enabled=false
```

Hoặc comment `@EnableScheduling` trong main class.
