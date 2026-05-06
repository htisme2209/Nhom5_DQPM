# Hoàn thiện Tính năng Nhật ký Hệ thống (System Logs)

## 📋 Mục tiêu
Hoàn thiện tính năng nhật ký hệ thống sao cho khi các actor (người dùng) khác thực hiện các thao tác, chúng sẽ được ghi lại trên nhật ký này để quản trị viên quản lý.

## ✅ Hoàn thành

### Backend Implementation

#### 1. Service Layer: `NhatKyService.java`
**Vị trí**: `backend/src/main/java/com/danang/railway/service/`

**Chức năng**:
- ✅ Ghi nhật ký chi tiết: `ghiNhatKy(hanhDong, doiTuong, maDoiTuong, noiDungCu, noiDungMoi)`
- ✅ Ghi nhật ký đơn giản: `ghiNhatKyDonGian(hanhDong, doiTuong, maDoiTuong)`
- ✅ Lấy danh sách phân trang: `layDanhSachNhatKy(page, size)`
- ✅ Lọc theo tài khoản: `layNhatKyTheoTaiKhoan(maTaiKhoan)`
- ✅ Lọc theo đối tượng: `layNhatKyTheoDoiTuong(doiTuong)`
- ✅ Tự động capture user từ SecurityContext
- ✅ Tự động capture IP address (với support proxy headers)

#### 2. REST Controller: `NhatKyController.java`
**Vị trí**: `backend/src/main/java/com/danang/railway/controller/`

**API Endpoints**:
- ✅ `GET /api/nhat-ky?page=0&size=50` - Lấy danh sách nhật ký phân trang
- ✅ `GET /api/nhat-ky/tai-khoan/{maTaiKhoan}` - Lấy nhật ký của một tài khoản
- ✅ `GET /api/nhat-ky/doi-tuong/{doiTuong}` - Lấy nhật ký theo loại đối tượng

#### 3. AOP Aspect: `NhatKyAspect.java`
**Vị trí**: `backend/src/main/java/com/danang/railway/aspect/`

**Tính năng**:
- ✅ Tự động ghi log cho các hoạt động chính:
  - Tạo/cập nhật/xóa lịch trình
  - Ghi nhận/tiếp nhận sự cố
  - Phê duyệt kế hoạch
  - Tạo/cập nhật tài khoản
- ✅ Không cần sửa code business logic
- ✅ Sử dụng Reflection để extract field values

#### 4. AOP Configuration: `AopConfig.java`
**Vị trí**: `backend/src/main/java/com/danang/railway/config/`

**Chức năng**:
- ✅ Kích hoạt `@EnableAspectJAutoProxy` để hỗ trợ AspectJ

#### 5. Enhanced Controllers

**AdminController.java**:
- ✅ Ghi log khi tạo tài khoản
- ✅ Ghi log khi cập nhật tài khoản (lưu giá trị cũ & mới)

**AuthController.java**:
- ✅ Ghi log DANG_NHAP khi đăng nhập thành công
- ✅ Ghi log DANG_NHAP_THAT_BAI khi đăng nhập thất bại
- ✅ Ghi log DANG_NHAP_TAI_KHOAN_BI_KHOA khi tài khoản bị khóa

#### 6. Utility Class: `LogUtil.java`
**Vị trí**: `backend/src/main/java/com/danang/railway/util/`

**Chức năng**:
- ✅ `toJson(Object)` - Convert object thành JSON string an toàn
- ✅ `getFieldValue(Object, fieldName)` - Lấy giá trị field bằng Reflection

#### 7. Documentation: `README_NHAT_KY.md`
**Vị trị**: `backend/src/main/resources/`

**Nội dung**:
- ✅ Tổng quan tính năng
- ✅ Kiến trúc chi tiết
- ✅ Hướng dẫn sử dụng backend
- ✅ Danh sách các loại hành động & đối tượng
- ✅ Lưu ý kỹ thuật

### Frontend Implementation

#### 1. API Service Enhancement: `api.js`
**Vị trị**: `frontend/src/services/`

**Cập nhật**:
- ✅ `getAll(page = 0, size = 50)` - Lấy danh sách phân trang
- ✅ `getByTaiKhoan(maTaiKhoan)` - Lấy theo tài khoản
- ✅ `getByDoiTuong(doiTuong)` - Lấy theo đối tượng

#### 2. UI Page: `NhatKyPage.jsx`
**Vị trị**: `frontend/src/pages/admin/`

**Giao diện 1 - Nhật ký Hoạt động**:
- ✅ Danh sách nhật ký với hiển thị:
  - Mã tài khoản
  - Hành động (với icon & màu)
  - Đối tượng (với icon)
  - IP address
  - Thời gian
- ✅ Bộ lọc theo loại hành động
- ✅ Phân trang (nút số trang & Previous/Next)
- ✅ Click vào hàng để xem chi tiết:
  - Hiển thị nội dung cũ vs nới
  - Định dạng dễ đọc
- ✅ Trạng thái rỗng khi không có dữ liệu

**Giao diện 2 - Quản lý Nhân sự**:
- ✅ Danh sách tất cả người dùng
- ✅ Tìm kiếm theo tên/email/mã tài khoản
- ✅ Lọc theo vai trò
- ✅ Hiển thị trạng thái (Hoạt động/Khóa)

#### 3. Navigation Update: `AppLayout.jsx`
**Vị trị**: `frontend/src/components/`

**Cập nhật**:
- ✅ Thêm link "Nhật ký hệ thống" trong sidebar
- ✅ Chỉ hiển thị cho admin (QUAN_TRI_VIEN)
- ✅ Điều hướng đến `/admin/nhat-ky`

## 🎯 Các loại hoạt động ghi log

### Authentication (Xác thực)
| Mã | Mô tả |
|---|---|
| DANG_NHAP | Đăng nhập thành công |
| DANG_NHAP_THAT_BAI | Đăng nhập thất bại |
| DANG_NHAP_TAI_KHOAN_BI_KHOA | Đăng nhập tài khoản bị khóa |

### Data Operations (Thao tác dữ liệu)
| Mã | Mô tả |
|---|---|
| THEM | Thêm mới |
| CAP_NHAT | Cập nhật |
| XOA | Xóa |

### Business Operations (Thao tác kinh doanh)
| Mã | Mô tả |
|---|---|
| PHE_DUYET | Phê duyệt |
| GHI_NHAN_SU_CO | Ghi nhận sự cố |
| TIEP_NHAN_SU_CO | Tiếp nhận sự cố |

## 📊 Các loại đối tượng (Entity)

| Mã | Mô tả |
|---|---|
| TAI_KHOAN | Tài khoản người dùng |
| LICH_TRINH | Lịch trình tàu |
| CHUYEN_TAU | Chuyến tàu |
| GA | Ga tàu |
| RAY | Đường ray |
| SU_CO | Sự cố/Tai nạn |
| KE_HOACH | Kế hoạch đặc biệt |

## 🔧 Cách sử dụng

### Backend: Ghi nhật ký

#### Phương pháp 1: Ghi log đơn giản (Khuyến nghị)
```java
@Autowired
private NhatKyService nhatKyService;

// Trong method xử lý
nhatKyService.ghiNhatKyDonGian("THEM", "TA_KHOAN", "TK-001");
```

#### Phương pháp 2: Ghi log chi tiết với thay đổi
```java
nhatKyService.ghiNhatKy(
    "CAP_NHAT",
    "TAI_KHOAN",
    "TK-001",
    "Cũ|Giá trị|Cũ",      // noiDungCu (dữ liệu cũ)
    "Mới|Giá trị|Mới"      // noiDungMoi (dữ liệu mới)
);
```

#### Phương pháp 3: Tự động (AOP)
```java
// Đặt @After trên method, log sẽ tự động được ghi
public void taoLichTrinh(LichTrinh lichTrinh) {
    // ... logic
}
```

### Frontend: Xem nhật ký
1. Đăng nhập với tài khoản admin
2. Click vào "Nhật ký hệ thống" trong sidebar
3. Xem danh sách hoạt động:
   - Chọn bộ lọc hành động
   - Phân trang
   - Click vào hàng để xem chi tiết

## 🔐 Bảo mật & Hiệu năng

- ✅ Chỉ admin (QUAN_TRI_VIEN) có quyền xem nhật ký
- ✅ Tự động capture IP address từ request
- ✅ Lấy thông tin user từ SecurityContext (tránh forgery)
- ✅ Phân trang để tránh load quá nhiều dữ liệu
- ✅ Log được lưu vĩnh viễn trong database (phục vụ audit trail)

## 📈 Metrics & Thống kê

Dữ liệu nhật ký có thể được sử dụng để:
- ✅ Kiểm tra hoạt động của từng người dùng
- ✅ Audit trail cho tuân thủ quy định
- ✅ Phát hiện hoạt động bất thường
- ✅ Phục hồi dữ liệu từ lịch sử
- ✅ Phân tích hành vi người dùng

## 🚀 Các bước tiếp theo (tùy chọn)

1. **Export nhật ký**: Thêm chức năng xuất CSV/Excel
2. **Thống kê**: Thêm dashboard thống kê hoạt động
3. **Alert**: Thêm cảnh báo real-time cho quản trị viên
4. **Archive**: Lưu trữ nhật ký cũ (retention policy)
5. **Search nâng cao**: Tìm kiếm theo ngày, hành động, người dùng

## 📝 Tài liệu & Tham khảo

- Backend docs: `/backend/src/main/resources/README_NHAT_KY.md`
- Frontend code: `/frontend/src/pages/admin/NhatKyPage.jsx`
- Service implementation: `/backend/src/main/java/com/danang/railway/service/NhatKyService.java`

---

**Ngày hoàn thành**: 2024
**Trạng thái**: ✅ Hoàn thiện
**Kiểm tra**: Cần build backend & test frontend để xác nhận hoạt động
