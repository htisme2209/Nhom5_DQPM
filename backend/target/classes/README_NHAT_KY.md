# Tính năng Nhật ký Hệ thống (System Logs)

## Tổng quan
Tính năng Nhật ký Hệ thống ghi lại toàn bộ các hoạt động của người dùng trong hệ thống, bao gồm:
- Đăng nhập / Đăng xuất
- Thêm, cập nhật, xóa dữ liệu
- Phê duyệt, tiếp nhận sự cố
- Ghi nhận sự cố
- v.v.

Các quản trị viên có thể xem chi tiết toàn bộ nhật ký tại page "Admin → Nhật ký Hệ thống".

## Kiến trúc

### Backend Components

#### 1. Entity: `NhatKy.java`
Bảng lưu trữ nhật ký:
- `maNhatKy`: Mã duy nhất của bản ghi nhật ký
- `maTaiKhoan`: Người thực hiện hành động
- `hanhDong`: Loại hành động (THEM, CAP_NHAT, XOA, PHE_DUYET, v.v.)
- `doiTuong`: Loại đối tượng bị tác động (TAI_KHOAN, LICH_TRINH, CHUYEN_TAU, v.v.)
- `maDoiTuong`: Mã của đối tượng
- `noiDungCu`: Dữ liệu cũ (khi cập nhật/xóa)
- `noiDungMoi`: Dữ liệu mới (khi thêm/cập nhật)
- `diaChiIp`: IP address của người dùng
- `thoiGian`: Thời gian thực hiện hành động

#### 2. Repository: `NhatKyRepository.java`
Giao tiếp với database:
```java
List<NhatKy> findByMaTaiKhoan(String maTaiKhoan);
Page<NhatKy> findAllByOrderByThoiGianDesc(Pageable pageable);
List<NhatKy> findByDoiTuong(String doiTuong);
```

#### 3. Service: `NhatKyService.java`
Các method chính:
```java
// Ghi nhật ký chi tiết
void ghiNhatKy(String hanhDong, String doiTuong, String maDoiTuong, 
               String noiDungCu, String noiDungMoi);

// Ghi nhật ký đơn giản
void ghiNhatKyDonGian(String hanhDong, String doiTuong, String maDoiTuong);

// Lấy danh sách nhật ký (phân trang)
Page<NhatKy> layDanhSachNhatKy(int page, int size);

// Lấy nhật ký theo tài khoản
List<NhatKy> layNhatKyTheoTaiKhoan(String maTaiKhoan);

// Lấy nhật ký theo đối tượng
List<NhatKy> layNhatKyTheoDoiTuong(String doiTuong);
```

#### 4. Controller: `NhatKyController.java`
REST API endpoints:
```
GET /api/nhat-ky?page=0&size=50           # Lấy danh sách nhật ký
GET /api/nhat-ky/tai-khoan/{maTaiKhoan}   # Lấy nhật ký theo tài khoản
GET /api/nhat-ky/doi-tuong/{doiTuong}     # Lấy nhật ký theo đối tượng
```

#### 5. Aspect: `NhatKyAspect.java`
AOP Aspect tự động ghi log cho các hoạt động chính:
- `taoLichTrinh()` → Ghi log khi tạo lịch trình
- `capNhatLichTrinh()` → Ghi log khi cập nhật lịch trình
- `xoaLichTrinh()` → Ghi log khi xóa lịch trình
- `ghiNhanSuCo()` → Ghi log khi ghi nhận sự cố
- `tiepNhanSuCo()` → Ghi log khi tiếp nhận sự cố
- `pheDuyetKeHoach()` → Ghi log khi phê duyệt kế hoạch
- `taoTaiKhoan()` → Ghi log khi tạo tài khoản
- `capNhatTaiKhoan()` → Ghi log khi cập nhật tài khoản

### Frontend Components

#### 1. API Service: `nhatKyAPI` (trong `api.js`)
```javascript
export const nhatKyAPI = {
  getAll: (page = 0, size = 50) => api.get('/nhat-ky', { params: { page, size } }),
  getByTaiKhoan: (maTaiKhoan) => api.get(`/nhat-ky/tai-khoan/${maTaiKhoan}`),
  getByDoiTuong: (doiTuong) => api.get(`/nhat-ky/doi-tuong/${doiTuong}`),
};
```

#### 2. Page: `NhatKyPage.jsx`
Giao diện hiển thị nhật ký:
- Tabs: "Nhật ký Hoạt động" và "Quản lý Nhân sự"
- Bộ lọc theo loại hành động
- Phân trang
- Chi tiết nhật ký khi click vào một hàng

## Cách sử dụng

### Backend: Ghi nhật ký

#### 1. Ghi log đơn giản (Được khuyến nghị)
```java
@Autowired
private NhatKyService nhatKyService;

// Trong method của service/controller
nhatKyService.ghiNhatKyDonGian("THEM", "TA_KHOAN", "TK-001");
```

#### 2. Ghi log chi tiết
```java
nhatKyService.ghiNhatKy(
    "CAP_NHAT",                          // hanhDong
    "TAI_KHOAN",                         // doiTuong
    "TK-001",                            // maDoiTuong
    "Tuan|NVDH|HOAT_DONG",              // noiDungCu
    "Tuấn Nguyễn|NVDH|HOAT_DONG"        // noiDungMoi
);
```

#### 3. AOP tự động ghi log
```java
// Nếu method được cover bởi Aspect, log sẽ tự động được ghi
public LichTrinh taoLichTrinh(LichTrinh lichTrinh) {
    // ... logic
    return saved; // Log sẽ tự động được ghi
}
```

### Frontend: Xem nhật ký
Truy cập: **Admin → Nhật ký Hệ thống**

## Các loại hành động (hanhDong)

| Mã | Mô tả |
|---|---|
| `DANG_NHAP` | Đăng nhập hệ thống |
| `DANG_NHAP_THAT_BAI` | Đăng nhập thất bại |
| `DANG_NHAP_TAI_KHOAN_BI_KHOA` | Đăng nhập tài khoản bị khóa |
| `THEM` | Thêm mới dữ liệu |
| `CAP_NHAT` | Cập nhật dữ liệu |
| `XOA` | Xóa dữ liệu |
| `PHE_DUYET` | Phê duyệt |
| `GHI_NHAN_SU_CO` | Ghi nhận sự cố |
| `TIEP_NHAN_SU_CO` | Tiếp nhận sự cố |

## Các loại đối tượng (doiTuong)

| Mã | Mô tả |
|---|---|
| `TAI_KHOAN` | Tài khoản |
| `LICH_TRINH` | Lịch trình |
| `CHUYEN_TAU` | Chuyến tàu |
| `GA` | Ga |
| `RAY` | Đường ray |
| `SU_CO` | Sự cố |
| `KE_HOACH` | Kế hoạch |

## Lưu ý

1. **IP Address**: Hệ thống tự động capture IP address của client thông qua các header:
   - `X-Forwarded-For` (proxy)
   - `Proxy-Client-IP` (proxy)
   - `WL-Proxy-Client-IP` (proxy)
   - `Remote-Addr` (direct connection)

2. **User Context**: Hệ thống lấy thông tin người dùng từ `SecurityContext`, do đó cần có authentication đúng.

3. **Performance**: Ghi log được thực hiện bất đồng bộ nếu có lỗi, không ảnh hưởng đến hoạt động chính của hệ thống.

4. **Storage**: Nhật ký được lưu trữ vĩnh viễn trong database, hãy định kỳ backup.

## Mở rộng

Để thêm ghi log tự động cho các hoạt động khác, hãy:

1. Thêm method trong `NhatKyAspect.java`:
```java
@After("execution(* com.danang.railway.service.NewService.method(..))")
public void logMethod(JoinPoint joinPoint) {
    // ... code
}
```

2. Hoặc ghi log thủ công trong các method:
```java
nhatKyService.ghiNhatKyDonGian("HANH_DONG", "DOI_TUONG", "ID");
```

## Liên hệ
Nếu có bất kỳ vấn đề hoặc yêu cầu mở rộng, vui lòng liên hệ với đội phát triển.
