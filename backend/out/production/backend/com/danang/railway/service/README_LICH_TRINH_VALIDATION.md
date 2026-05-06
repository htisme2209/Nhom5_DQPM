# Validation Rules - Lịch Trình Tàu

## Tổng quan
Service `LichTrinhService` áp dụng các quy tắc validation nghiêm ngặt khi tạo/cập nhật lịch trình để đảm bảo an toàn và tính khả thi trong vận hành.

## Các Quy Tắc Validation

### 1. Không Cho Phép Tạo Lịch Trình Trong Quá Khứ
**Mục đích**: Đảm bảo tính logic và tránh nhầm lẫn trong hệ thống

**Quy tắc**:
- `gio_den_du_kien` phải > thời điểm hiện tại
- `gio_di_du_kien` phải > thời điểm hiện tại

**Thông báo lỗi**:
```
Không thể tạo lịch trình trong quá khứ. 
Giờ đến dự kiến (XXX) phải sau thời điểm hiện tại (YYY)
```

**Ví dụ**:
- ❌ Hiện tại: 14:00, tạo lịch trình giờ đến 13:00 → BỊ TỪ CHỐI
- ✅ Hiện tại: 14:00, tạo lịch trình giờ đến 15:00 → CHẤP NHẬN

---

### 2. Phải Tạo Trước Ít Nhất 24 Giờ
**Mục đích**: Đảm bảo có đủ thời gian chuẩn bị, điều phối và thông báo

**Quy tắc**:
- Lịch trình thông thường phải được tạo/xác nhận trước ít nhất 24 giờ
- Tính từ thời điểm hiện tại đến giờ chạy sớm nhất (đến hoặc đi)
- Nếu < 24 giờ → yêu cầu chuyển sang luồng xử lý sự cố

**Thông báo lỗi**:
```
Lịch trình thông thường phải được tạo trước ít nhất 24 giờ. 
Hiện tại chỉ còn X giờ đến giờ chạy (YYY). 
Vui lòng chuyển sang luồng xử lý sự cố nếu cần tạo lịch trình gấp.
```

**Ví dụ**:
- ❌ Hiện tại: 14:00 ngày 1, tạo lịch trình 10:00 ngày 2 (20 giờ) → BỊ TỪ CHỐI
- ✅ Hiện tại: 14:00 ngày 1, tạo lịch trình 15:00 ngày 2 (25 giờ) → CHẤP NHẬN

**Lưu ý**:
- Quy tắc này chỉ áp dụng cho lịch trình thông thường
- Lịch trình khẩn cấp/sự cố có luồng xử lý riêng

---

### 3. Khoảng Cách 10 Phút Giữa Các Tàu Xuất Phát
**Mục đích**: Đảm bảo an toàn, tránh quá tải hệ thống ga

**Quy tắc**:
- Các tàu xuất phát phải cách nhau ít nhất 10 phút
- Áp dụng cho TẤT CẢ các tàu (dù khác ray hay cùng ray)
- Kiểm tra dựa trên `gio_di_du_kien`

**Thông báo lỗi**:
```
Khoảng cách giữa các tàu xuất phát phải ít nhất 10 phút. 
Tàu XXX đã có lịch xuất phát lúc YYY (cách Z phút). 
Vui lòng chọn thời gian khác.
```

**Ví dụ**:
- ❌ Tàu A xuất phát 10:00, tạo tàu B xuất phát 10:05 (5 phút) → BỊ TỪ CHỐI
- ❌ Tàu A xuất phát 10:00, tạo tàu B xuất phát 10:08 (8 phút) → BỊ TỪ CHỐI
- ✅ Tàu A xuất phát 10:00, tạo tàu B xuất phát 10:10 (10 phút) → CHẤP NHẬN
- ✅ Tàu A xuất phát 10:00, tạo tàu B xuất phát 10:15 (15 phút) → CHẤP NHẬN

**Lưu ý**:
- Quy tắc áp dụng cho cả tàu trên ray khác nhau
- Đảm bảo hệ thống ga không bị quá tải
- Cho phép nhân viên có thời gian xử lý giữa các chuyến

---

## Luồng Xử Lý

### Tạo Lịch Trình Mới
```
1. Kiểm tra không phải quá khứ
2. Kiểm tra tạo trước 24 giờ
3. Kiểm tra khoảng cách 10 phút
4. Tạo mã lịch trình tự động
5. Set trạng thái mặc định: CHO_XAC_NHAN
6. Lưu vào database
```

### Cập Nhật Lịch Trình
```
1. Kiểm tra lịch trình tồn tại
2. Nếu thay đổi thời gian:
   - Kiểm tra không phải quá khứ
   - Kiểm tra tạo trước 24 giờ
   - Kiểm tra khoảng cách 10 phút (bỏ qua chính nó)
3. Cập nhật vào database
```

---

## API Endpoints

### POST /api/lich-trinh
Tạo lịch trình mới với validation đầy đủ

**Request Body**:
```json
{
  "maChuyenTau": "SE1",
  "maRay": "RAY-1",
  "gioDenDuKien": "2026-04-10T10:00:00",
  "gioDiDuKien": "2026-04-10T10:30:00"
}
```

**Response Success**:
```json
{
  "success": true,
  "message": "Tạo lịch trình thành công",
  "data": { ... }
}
```

**Response Error**:
```json
{
  "success": false,
  "message": "Lịch trình thông thường phải được tạo trước ít nhất 24 giờ...",
  "data": null
}
```

### PUT /api/lich-trinh/{id}
Cập nhật lịch trình với validation

---

## Xử Lý Ngoại Lệ

### Trường Hợp Khẩn Cấp
Nếu cần tạo lịch trình trong vòng < 24 giờ:
1. Sử dụng luồng xử lý sự cố
2. Tạo sự cố loại "LICH_TRINH_KHAN_CAP"
3. Điều hành viên phê duyệt đặc biệt
4. Ghi nhận vào nhật ký hệ thống

### Điều Chỉnh Khẩn Cấp
Nếu cần điều chỉnh lịch trình đã tạo:
1. Kiểm tra còn > 24 giờ → cho phép cập nhật bình thường
2. Nếu < 24 giờ → yêu cầu quyền đặc biệt hoặc tạo sự cố

---

## Cấu Hình

Các hằng số có thể điều chỉnh trong `LichTrinhService.java`:

```java
private static final int THOI_GIAN_TAO_TRUOC_TOI_THIEU_GIO = 24; // 24 giờ
private static final int KHOANG_CACH_GIUA_CAC_TAU_PHUT = 10;     // 10 phút
```

---

## Testing

### Test Cases Cần Kiểm Tra

1. **Quá khứ**:
   - Tạo lịch trình giờ đến < hiện tại
   - Tạo lịch trình giờ đi < hiện tại

2. **24 giờ**:
   - Tạo lịch trình còn 23 giờ
   - Tạo lịch trình còn 24 giờ
   - Tạo lịch trình còn 25 giờ

3. **10 phút**:
   - Tạo tàu cách 5 phút
   - Tạo tàu cách 10 phút
   - Tạo tàu cách 15 phút
   - Tạo tàu khác ray cách 8 phút

4. **Cập nhật**:
   - Cập nhật không đổi thời gian
   - Cập nhật đổi thời gian hợp lệ
   - Cập nhật đổi thời gian vi phạm

---

## Lưu Ý Quan Trọng

⚠️ **Các validation này rất quan trọng cho an toàn vận hành**
- Không nên bỏ qua hoặc vô hiệu hóa
- Nếu cần ngoại lệ, phải có quy trình phê duyệt riêng
- Ghi log đầy đủ mọi trường hợp vi phạm

✅ **Best Practices**:
- Luôn test kỹ trước khi deploy
- Monitor các trường hợp bị từ chối
- Cung cấp thông báo lỗi rõ ràng cho người dùng
- Có luồng xử lý thay thế cho trường hợp khẩn cấp
