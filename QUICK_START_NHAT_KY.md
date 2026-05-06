# 🔍 Hướng dẫn Nhanh: Nhật ký Hệ thống

## Cho Quản trị viên (Admin)

### 1. Truy cập Nhật ký
- Đăng nhập với tài khoản admin
- Tìm menu **"Nhật ký hệ thống"** ở sidebar bên trái
- Click vào để mở trang nhật ký

### 2. Xem Danh sách Hoạt động
Trang hiển thị tất cả các thao tác trong hệ thống:
- **Mã TK**: Người thực hiện hành động
- **Hành động**: Loại thao tác (Đăng nhập, Thêm, Cập nhật, etc.)
- **Đối tượng**: Loại dữ liệu bị tác động (Tài khoản, Lịch trình, etc.)
- **IP**: Địa chỉ IP của người dùng
- **Thời gian**: Khi thao tác được thực hiện

### 3. Lọc Nhật ký
**Bộ lọc Hành động**:
- Chọn loại hành động từ dropdown
- Danh sách sẽ cập nhật tự động

**Các loại hành động**:
| Icon | Hành động | Ý nghĩa |
|------|----------|--------|
| 🔐 | Đăng nhập | Người dùng đăng nhập hệ thống |
| ✅ | Thêm mới | Tạo dữ liệu mới |
| ✏️ | Cập nhật | Sửa thông tin |
| ❌ | Xóa | Xóa dữ liệu |
| 👍 | Phê duyệt | Phê duyệt yêu cầu |
| ⚠️ | Ghi nhận sự cố | Báo cáo sự cố |
| 📥 | Tiếp nhận sự cố | Xử lý sự cố |

### 4. Xem Chi tiết
- Click vào bất kỳ dòng nào để xem chi tiết
- Sẽ hiển thị:
  - **Dữ liệu cũ**: Giá trị trước khi thay đổi
  - **Dữ liệu mới**: Giá trị sau khi thay đổi

### 5. Phân trang
- Sử dụng nút số trang ở dưới danh sách
- **<** và **>** để chuyển trang
- Mỗi trang hiển thị 50 dòng

### 6. Tab Quản lý Nhân sự
- Xem danh sách tất cả nhân sự
- Tìm kiếm theo tên, email, hoặc mã tài khoản
- Lọc theo vai trò (Admin, Quản lý, Điều hành, Nhà ga)
- Xem trạng thái (✅ Hoạt động / ⛔ Khóa)

---

## Cho Lập trình viên

### Backend: Thêm Ghi Log vào Một Method

#### Cách 1: Tự động (AOP) - Dễ nhất ✨
Nếu method của bạn đã được cover bởi Aspect, không cần làm gì:
```java
// Trong LichTrinhService.java
public LichTrinh taoLichTrinh(LichTrinh lichTrinh) {
    LichTrinh saved = lichTrinhRepo.save(lichTrinh);
    // Log sẽ tự động được ghi bởi NhatKyAspect
    return saved;
}
```

#### Cách 2: Ghi log đơn giản - Nhanh nhất ⚡
```java
@Autowired
private NhatKyService nhatKyService;

public void ghiNhanSuCo(SuCo suCo) {
    SuCo saved = suCoRepo.save(suCo);
    
    // Ghi log - 1 dòng
    nhatKyService.ghiNhatKyDonGian("GHI_NHAN_SU_CO", "SU_CO", saved.getMaSuCo());
}
```

#### Cách 3: Ghi log chi tiết - Đầy đủ nhất 📊
```java
public void updateTaiKhoan(String id, TaiKhoan updated) {
    TaiKhoan old = taiKhoanRepo.findById(id).get();
    TaiKhoan result = taiKhoanRepo.save(updated);
    
    // Ghi log với trước/sau
    nhatKyService.ghiNhatKy(
        "CAP_NHAT",              // Loại hành động
        "TAI_KHOAN",             // Loại đối tượng
        id,                      // Mã đối tượng
        old.getHoTen() + "|" + old.getQuyenTruyCap(),     // Dữ liệu cũ
        result.getHoTen() + "|" + result.getQuyenTruyCap() // Dữ liệu mới
    );
}
```

### Frontend: Lấy Dữ liệu Nhật ký

```javascript
import { nhatKyAPI } from '../services/api';

// Lấy danh sách (phân trang)
const data = await nhatKyAPI.getAll(0, 50);

// Lấy nhật ký của một người
const logs = await nhatKyAPI.getByTaiKhoan('TK-001');

// Lấy nhật ký theo loại đối tượng
const accountLogs = await nhatKyAPI.getByDoiTuong('TAI_KHOAN');
```

### Thêm Aspect Mới

Nếu muốn ghi log tự động cho một method mới:

```java
// Thêm vào NhatKyAspect.java
@After("execution(* com.danang.railway.service.MyService.myMethod(..))")
public void logMyMethod(JoinPoint joinPoint) {
    // Lấy tham số
    Object[] args = joinPoint.getArgs();
    MyEntity entity = (MyEntity) args[0];
    
    // Ghi log
    nhatKyService.ghiNhatKyDonGian("HANH_DONG", "DOI_TUONG", entity.getId());
}
```

---

## 📊 Ví dụ Thực tế

### Scenario 1: Admin Tạo Tài khoản Mới
1. Admin vào Admin → Quản lý Tài khoản
2. Click "Thêm Tài khoản"
3. Nhập thông tin: Tên = "Nguyễn Văn A", Vai trò = "NHAN_VIEN_DIEU_HANH"
4. Click "Lưu"
5. **Nhật ký tự động ghi**:
   - Mã TK: admin-001
   - Hành động: ✅ Thêm mới
   - Đối tượng: 👤 Tài khoản
   - Nội dung: "Tạo tài khoản: Nguyễn Văn A (NHAN_VIEN_DIEU_HANH)"
   - IP: 192.168.1.100
   - Thời gian: 2024-01-15 14:30:25

### Scenario 2: Nhân viên Đăng nhập
1. Nhân viên điều hành đăng nhập
2. Nhập email & mật khẩu
3. Click "Đăng nhập"
4. **Nhật ký tự động ghi**:
   - Mã TK: nv-dh-001
   - Hành động: 🔐 Đăng nhập
   - Đối tượng: 👤 Tài khoản
   - IP: 192.168.1.105
   - Thời gian: 2024-01-15 08:15:42

### Scenario 3: Admin Cập nhật Tài khoản
1. Admin chỉnh sửa tài khoản (Tên → "Nguyễn Văn B", Trạng thái → "KHOA")
2. Click "Lưu"
3. **Nhật ký tự động ghi**:
   - Mã TK: admin-001
   - Hành động: ✏️ Cập nhật
   - Đối tượng: 👤 Tài khoản
   - Dữ liệu cũ: "Nguyễn Văn A|HOAT_DONG"
   - Dữ liệu mới: "Nguyễn Văn B|KHOA"
   - IP: 192.168.1.100
   - Thời gian: 2024-01-15 15:45:10

---

## 🔒 Quyền Truy cập

| Vai trò | Quyền |
|---------|-------|
| Admin | ✅ Xem toàn bộ nhật ký |
| Quản lý | ❌ Không có quyền |
| Điều hành | ❌ Không có quyền |
| Nhà ga | ❌ Không có quyền |

---

## ⚠️ Lưu ý Quan trọng

1. **Dữ liệu Nhật ký là bất biến** - Không thể xóa hay chỉnh sửa
2. **Phục hồi từ nhật ký** - Admin có thể xem dữ liệu cũ để phục hồi nếu cần
3. **IP Address** - Tự động capture từ request (hữu ích để tracking)
4. **Dung lượng** - Nhật ký sẽ phát triển theo thời gian, cân nhắc backup định kỳ

---

## ❓ Câu hỏi Thường gặp

**Q: Làm sao để xóa nhật ký?**
A: Nhật ký không được phép xóa vì mục đích audit trail. Liên hệ quản trị viên hệ thống nếu cần.

**Q: Có thể xem nhật ký của người khác không?**
A: Không, mỗi người chỉ có thể thấy IP của mình trong nhật ký. Admin có quyền xem toàn bộ.

**Q: Nhật ký được lưu bao lâu?**
A: Vĩnh viễn trong database. Hãy backup định kỳ.

**Q: Làm sao để ghi log một thao tác mới?**
A: Liên hệ team phát triển để thêm Aspect hoặc gọi `nhatKyService.ghiNhatKyDonGian()`.

---

## 📞 Hỗ trợ
Nếu có bất kỳ câu hỏi nào, vui lòng liên hệ với team phát triển.
