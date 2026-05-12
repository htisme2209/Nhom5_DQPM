import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import AppLayout from './components/AppLayout';

// Điều hành pages
import DieuHanhDashboard from './pages/dieuhanh/DieuHanhDashboard';
import LichTrinhPage from './pages/dieuhanh/LichTrinhPage';
import KeHoachPage from './pages/dieuhanh/KeHoachPage';
import XuLySuCoPage from './pages/dieuhanh/XuLySuCoPage';
import MoPhongLichTrinhPage from './pages/dieuhanh/MoPhongLichTrinhPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import TaiKhoanPage from './pages/admin/TaiKhoanPage';
import HaTangPage from './pages/admin/HaTangPage';
import NhatKyPage from './pages/admin/NhatKyPage';
import QuyTacHethongPage from './pages/admin/QuyTacHethongPage';

// Nhà ga pages
import NhaGaDashboard from './pages/nhaga/NhaGaDashboard';
import GhiNhanSuCoPage from './pages/nhaga/GhiNhanSuCoPage';
import XacNhanTauPage from './pages/nhaga/XacNhanTauPage';

// Quản lý pages
import QuanLyDashboard from './pages/quanly/QuanLyDashboard';
import ChiDaoPage from './pages/quanly/ChiDaoPage';
import BaoCaoPage from './pages/quanly/BaoCaoPage';
import XuatBaoCaoPage from './pages/quanly/XuatBaoCaoPage';

import PlaceholderPage from './pages/PlaceholderPage';
import './index.css';
import DieuPhoiRayPage from './pages/dieuhanh/DieuPhoiRayPage';

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.quyenTruyCap)) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* ===== Điều hành routes ===== */}
      <Route path="/dieu-hanh" element={
        <ProtectedRoute allowedRoles={['NHAN_VIEN_DIEU_HANH']}>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route index element={<DieuHanhDashboard />} />
        <Route path="lich-trinh" element={<LichTrinhPage />} />
        <Route path="duong-ray" element={<DieuPhoiRayPage />} />
        <Route path="xu-ly-su-co" element={<XuLySuCoPage />} />
        <Route path="ke-hoach" element={<KeHoachPage />} />
        <Route path="mo-phong" element={<MoPhongLichTrinhPage />} />
        <Route path="chi-dao" element={<ChiDaoPage />} />
      </Route>

      {/* ===== Admin routes ===== */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['QUAN_TRI_VIEN']}>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="tai-khoan" element={<TaiKhoanPage />} />
        <Route path="ha-tang" element={<HaTangPage />} />
        <Route path="nhat-ky" element={<NhatKyPage />} />
        <Route path="quy-tac" element={<QuyTacHethongPage />} />
      </Route>

      {/* ===== Nhà ga routes ===== */}
      <Route path="/nha-ga" element={
        <ProtectedRoute allowedRoles={['NHAN_VIEN_NHA_GA']}>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route index element={<NhaGaDashboard />} />
        <Route path="xac-nhan-tau" element={<XacNhanTauPage />} />
        <Route path="ghi-nhan-su-co" element={<GhiNhanSuCoPage />} />
        <Route path="chi-dao" element={<ChiDaoPage />} />
      </Route>

      {/* ===== Quản lý routes ===== */}
      <Route path="/quan-ly" element={
        <ProtectedRoute allowedRoles={['BAN_QUAN_LY']}>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route index element={<QuanLyDashboard />} />
        <Route path="phe-duyet" element={<KeHoachPage />} />
        <Route path="chi-dao" element={<ChiDaoPage />} />
        <Route path="bao-cao" element={<BaoCaoPage />} />
        <Route path="nhan-su" element={<TaiKhoanPage />} />
        <Route path="xuat-bao-cao" element={<XuatBaoCaoPage />} />
      </Route>

      {/* Default route */}
      <Route path="/" element={
        user ? <Navigate to={
          user.quyenTruyCap === 'QUAN_TRI_VIEN' ? '/admin' :
            user.quyenTruyCap === 'NHAN_VIEN_DIEU_HANH' ? '/dieu-hanh' :
              user.quyenTruyCap === 'NHAN_VIEN_NHA_GA' ? '/nha-ga' :
                user.quyenTruyCap === 'BAN_QUAN_LY' ? '/quan-ly' : '/login'
        } replace /> : <Navigate to="/login" replace />
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
