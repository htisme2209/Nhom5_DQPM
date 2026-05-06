import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const lichTrinhAPI = {
  getAll: (params) => api.get('/lich-trinh', { params }),
  getById: (id) => api.get(`/lich-trinh/${id}`),
  create: (data) => api.post('/lich-trinh', data),
  update: (id, data) => api.put(`/lich-trinh/${id}`, data),
  delete: (id) => api.delete(`/lich-trinh/${id}`),
};

export const chuyenTauAPI = {
  getAll: (params) => api.get('/chuyen-tau', { params }),
  getById: (id) => api.get(`/chuyen-tau/${id}`),
  create: (data) => api.post('/chuyen-tau', data),
  update: (id, data) => api.put(`/chuyen-tau/${id}`, data),
  delete: (id) => api.delete(`/chuyen-tau/${id}`),
};

export const tauAPI = {
  getAll: () => api.get('/tau'),
  create: (data) => api.post('/tau', data),
  update: (id, data) => api.put(`/tau/${id}`, data),
  delete: (id) => api.delete(`/tau/${id}`),
};

export const duongRayAPI = {
  getAll: () => api.get('/duong-ray'),
  create: (data) => api.post('/duong-ray', data),
  update: (id, data) => api.put(`/duong-ray/${id}`, data),
};

export const taiKhoanAPI = {
  getAll: () => api.get('/tai-khoan'),
  getById: (id) => api.get(`/tai-khoan/${id}`),
  create: (data) => api.post('/tai-khoan', data),
  update: (id, data) => api.put(`/tai-khoan/${id}`, data),
};

export const suCoAPI = {
  // Chung
  getAll: () => api.get('/su-co'),
  getById: (id) => api.get(`/su-co/${id}`),

  // UC-09: NVNH ghi nhận sự cố (chỉ báo cáo, không phong tỏa)
  ghiNhan: (data) => api.post('/su-co/ghi-nhan', data),

  // NVNH xem báo cáo của mình
  getCuaToi: () => api.get('/su-co/cua-toi'),

  // UC-09/UC-06: NVĐH tiếp nhận & đánh giá (phong tỏa + quét LT)
  tiepNhan: (maSuCo, data) => api.post(`/su-co/${maSuCo}/tiep-nhan`, data),

  // UC-06: Xử lý phương án lịch trình
  getLichTrinhAnhHuong: (maSuCo) => api.get(`/su-co/${maSuCo}/lich-trinh-anh-huong`),
  xuLyPhuongAn: (data) => api.put('/su-co/xu-ly-phuong-an', data),
  giaiPhongRay: (data) => api.put('/su-co/giai-phong-ray', data),
  xuLyTreChuyen: (data) => api.post('/su-co/xu-ly-tre-chuyen', data),
  thuHoiLenh: (data) => api.post('/su-co/thu-hoi-lenh', data),
  capNhatTrangThai: (maSuCo, trangThaiXuLy) => api.put(`/su-co/${maSuCo}`, { trangThaiXuLy }),
  // UC-06: Điều chỉnh giờ lịch trình (không cần đổi ray)
  dieuChinhGio: (data) => api.put('/su-co/dieu-chinh-gio', data),
};


export const keHoachAPI = {
  getAll: (params) => api.get('/ke-hoach', { params }),
  create: (data) => api.post('/ke-hoach', data),
  pheDuyet: (id, data) => api.put(`/ke-hoach/${id}/phe-duyet`, data),
};

export const chiDaoAPI = {
  getAll: () => api.get('/chi-dao'),
  create: (data) => api.post('/chi-dao', data),
  markRead: (id) => api.put(`/chi-dao/${id}/da-doc`),
};

export const gaAPI = {
  getAll: () => api.get('/ga'),
  create: (data) => api.post('/ga', data),
  update: (id, data) => api.put(`/ga/${id}`, data),
  delete: (id) => api.delete(`/ga/${id}`),
};

export const tuyenDuongAPI = {
  getAll: () => api.get('/tuyen-duong'),
  create: (data) => api.post('/tuyen-duong', data),
  update: (id, data) => api.put(`/tuyen-duong/${id}`, data),
  delete: (id) => api.delete(`/tuyen-duong/${id}`),
};

export const nhatKyAPI = {
  getAll: (page = 0, size = 50) => api.get('/nhat-ky', { params: { page, size } }),
  getByTaiKhoan: (maTaiKhoan) => api.get(`/nhat-ky/tai-khoan/${maTaiKhoan}`),
  getByDoiTuong: (doiTuong) => api.get(`/nhat-ky/doi-tuong/${doiTuong}`),
};

export const baoCaoAPI = {
  getThongKe: (params) => api.get('/bao-cao/thong-ke', { params }),
};

export const xacNhanTauAPI = {
  getDanhSachChoXacNhan: () => api.get('/xac-nhan-tau/cho-xac-nhan'),
  xacNhan: (data) => api.post('/xac-nhan-tau/xac-nhan', data),
  huyXacNhan: (maLichTrinh) => api.post(`/xac-nhan-tau/huy-xac-nhan/${maLichTrinh}`),
  kiemTraQuaHan: () => api.get('/xac-nhan-tau/kiem-tra-qua-han'),
};

export const quyTacAPI = {
  getAll: () => api.get('/quy-tac'),
  update: (id, data) => api.put(`/quy-tac/${id}`, data),
};

export default api;
