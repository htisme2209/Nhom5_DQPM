import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navConfig = {
  QUAN_TRI_VIEN: {
    title: 'Railway Operations Control',
    items: [
      { path: '/admin', icon: '📊', label: 'Bảng điều khiển', end: true },
      { path: '/admin/tai-khoan', icon: '👥', label: 'Quản lý Nhân sự' },
      { path: '/admin/ha-tang', icon: '🛤️', label: 'Cơ sở Hạ tầng' },
      { path: '/admin/nhat-ky', icon: '📋', label: 'Nhật ký Hệ thống' },
      { path: '/admin/quy-tac', icon: '⚙️', label: 'Quy tắc Nghiệp vụ' },
    ],
  },
  NHAN_VIEN_DIEU_HANH: {
    title: 'Điều hành Đường sắt',
    items: [
      { path: '/dieu-hanh', icon: '📊', label: 'Bảng điều khiển', end: true },
      { path: '/dieu-hanh/lich-trinh', icon: '📅', label: 'Lịch trình' },
      { path: '/dieu-hanh/duong-ray', icon: '🛤️', label: 'Điều phối Ray' },
      { path: '/dieu-hanh/xu-ly-su-co', icon: '🔧', label: 'Xử lý Sự cố' },
      { path: '/dieu-hanh/ke-hoach', icon: '📝', label: 'Kế hoạch' },
      { path: '/dieu-hanh/mo-phong', icon: '📈', label: 'Mô phỏng' },
    ],
  },
  NHAN_VIEN_NHA_GA: {
    title: 'Điều hành Nhà ga',
    items: [
      { path: '/nha-ga', icon: '📊', label: 'Bảng điều khiển', end: true },
      { path: '/nha-ga/xac-nhan-tau', icon: '✅', label: 'Xác nhận Tàu' },

      { path: '/nha-ga/ghi-nhan-su-co', icon: '📝', label: 'Ghi nhận Sự cố' },
      { path: '/nha-ga/chi-dao', icon: '📨', label: 'Chỉ đạo' },
    ],
  },
  BAN_QUAN_LY: {
    title: 'Quản lý Vận hành Đường sắt',
    items: [
      { path: '/quan-ly', icon: '📊', label: 'Bảng điều khiển', end: true },
      { path: '/quan-ly/phe-duyet', icon: '✅', label: 'Phê duyệt' },
      { path: '/quan-ly/chi-dao', icon: '📨', label: 'Chỉ thị' },
      { path: '/quan-ly/bao-cao', icon: '📈', label: 'Phân tích' },
      { path: '/quan-ly/nhan-su', icon: '👥', label: 'Nhân sự' },
    ],
  },
};

export default function AppLayout() {
  const { user, logout, getRoleLabel } = useAuth();
  const navigate = useNavigate();
  const config = navConfig[user?.quyenTruyCap] || navConfig.QUAN_TRI_VIEN;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase();
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-wrapper">
            <div className="logo-icon">🚂</div>
            <div className="logo-text">
              <h2>Kiểm soát Nhà ga</h2>
              <p>Ga Đà Nẵng • A-12</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {config.items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>



        <div className="sidebar-footer">
          {user?.quyenTruyCap === 'QUAN_TRI_VIEN' && (
            <NavLink 
              to="/admin/nhat-ky"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">📋</span>
              <span>Nhật ký hệ thống</span>
            </NavLink>
          )}
          <a className="nav-item" onClick={handleLogout} style={{ cursor: 'pointer' }}>
            <span className="nav-icon">🚪</span>
            <span>Đăng xuất</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">{config.title}</span>
          </div>
          <div className="topbar-right">
            <div className="topbar-search">
              <span>🔍</span>
              <input type="text" placeholder="Tìm kiếm nhanh..." />
            </div>
            <button className="btn-emergency">⚡ Khẩn cấp</button>
            <button className="topbar-icon-btn">
              🔔
              <span className="badge"></span>
            </button>
            <button className="topbar-icon-btn">⚙️</button>
            <div className="topbar-user">
              <div className="user-info">
                <div className="user-name">{user?.hoTen}</div>
                <div className="user-role">{getRoleLabel()}</div>
              </div>
              <div className="user-avatar">{getInitials(user?.hoTen)}</div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
