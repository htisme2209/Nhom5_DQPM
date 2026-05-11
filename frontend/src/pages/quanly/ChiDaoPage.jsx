import { useState, useEffect } from 'react';
import { chiDaoAPI, taiKhoanAPI } from '../../services/api';
import Modal from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';

export default function ChiDaoPage() {
  const { user } = useAuth();
  const [chiDao, setChiDao] = useState([]);
  const [nhanVien, setNhanVien] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const [form, setForm] = useState({
    maChiDao: '', maNguoiNhan: '', tieuDe: '', noiDung: '',
    mucDoUuTien: 'TRUNG_BINH'
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cdRes, nvRes] = await Promise.all([chiDaoAPI.getAll(), taiKhoanAPI.getAll()]);
      const sortedCd = (cdRes.data?.data || cdRes.data || []).sort((a, b) => new Date(b.ngayTao || 0) - new Date(a.ngayTao || 0));
      setChiDao(sortedCd);
      setNhanVien(nvRes.data?.data || nvRes.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
  };

  const isManager = user?.quyenTruyCap === 'BAN_QUAN_LY';

  const openCreate = () => {
    setForm({
      maChiDao: 'CD' + Date.now().toString().slice(-6),
      maNguoiNhan: '', tieuDe: '', noiDung: '', mucDoUuTien: 'TRUNG_BINH'
    });
    setShowForm(true);
  };

  const handleCreate = async () => {
    if (!form.tieuDe || !form.noiDung || !form.maNguoiNhan) {
      showToast('Vui lòng nhập đầy đủ thông tin', 'error'); return;
    }
    setFormLoading(true);
    try {
      await chiDaoAPI.create({ ...form, maNguoiGui: user?.maTaiKhoan });
      showToast('Gửi chỉ đạo thành công!');
      setShowForm(false); 
      loadData();
    } catch (e) { showToast(e.response?.data?.message || 'Lỗi khi gửi', 'error'); }
    finally { setFormLoading(false); }
  };

  const handleMarkRead = async (cd) => {
    try {
      await chiDaoAPI.markRead(cd.maChiDao);
      showToast('Đã đánh dấu đã đọc');
      loadData();
    } catch (e) { showToast('Lỗi', 'error'); }
  };

  const myDirectives = chiDao.filter(cd =>
    isManager ? cd.maNguoiGui === user?.maTaiKhoan : cd.maNguoiNhan === user?.maTaiKhoan
  );

  return (
    <>
      {toast && <div className="toast-container"><div className={`toast ${toast.type}`}>{toast.type === 'success' ? '✅' : '❌'} {toast.msg}</div></div>}

      <div className="page-header" style={{ borderBottom: '1px solid var(--gray-200)', paddingBottom: '24px', marginBottom: '24px' }}>
        <div className="page-header-actions">
          <div>
            <h1 style={{ fontSize: '24px', color: 'var(--navy-900)' }}>
              {isManager ? '📨 Ban hành Chỉ đạo' : '📬 Hộp thư Chỉ đạo'}
            </h1>
            <p style={{ color: 'var(--gray-500)', marginTop: '4px' }}>
              {isManager ? 'Gửi và theo dõi các chỉ đạo vận hành đến nhân sự' : 'Nhận và xác nhận các yêu cầu điều hành từ Ban Quản lý'}
            </p>
          </div>
          {isManager && (
            <button className="btn btn-primary" style={{ padding: '10px 20px', fontWeight: 600 }} onClick={openCreate}>
              + Tạo Chỉ đạo Mới
            </button>
          )}
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '24px' }}>
        <div className="stat-card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <div className="stat-info">
            <div className="stat-label" style={{ color: '#64748b' }}>Tổng số hộp thư</div>
            <div className="stat-value" style={{ color: '#0f172a' }}>{myDirectives.length}</div>
          </div>
          <div className="stat-icon" style={{ background: '#e2e8f0' }}>📁</div>
        </div>
        <div className="stat-card" style={{ background: '#fffbeb', border: '1px solid #fef08a' }}>
          <div className="stat-info">
            <div className="stat-label" style={{ color: '#b45309' }}>Chưa xử lý / Mới</div>
            {/* Đã sửa CHUA_DOC thành DA_GUI */}
            <div className="stat-value" style={{ color: '#78350f' }}>{myDirectives.filter(c => c.trangThai === 'DA_GUI').length}</div>
          </div>
          <div className="stat-icon" style={{ background: '#fde68a' }}>🔥</div>
        </div>
        <div className="stat-card" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <div className="stat-info">
            <div className="stat-label" style={{ color: '#15803d' }}>Đã hoàn tất</div>
            <div className="stat-value" style={{ color: '#14532d' }}>{myDirectives.filter(c => c.trangThai === 'DA_DOC').length}</div>
          </div>
          <div className="stat-icon" style={{ background: '#bbf7d0' }}>✅</div>
        </div>
      </div>

      <div className="card" style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div className="card-header" style={{ borderBottom: '1px solid var(--gray-100)', padding: '20px' }}>
          <h3 style={{ fontSize: '16px', color: 'var(--navy-800)' }}>Lịch sử giao tiếp</h3>
        </div>
        
        <div className="card-body" style={{ padding: 0 }}>
          {myDirectives.length === 0 ? (
            <div className="text-center text-muted" style={{ padding: '80px 20px' }}>
              <div style={{ fontSize: '60px', marginBottom: '16px', opacity: 0.5 }}>📭</div>
              <h3 style={{ fontSize: '18px', color: 'var(--gray-700)', marginBottom: '8px' }}>Hộp thư trống</h3>
              <p style={{ fontSize: '14px' }}>Chưa có chỉ đạo hay thông báo nào được lưu trữ tại đây.</p>
            </div>
          ) : myDirectives.map(cd => (
            
            <div key={cd.maChiDao} style={{
              padding: '24px', borderBottom: '1px solid var(--gray-100)',
              background: cd.trangThai === 'DA_GUI' ? '#f8fafc' : '#ffffff', 
              display: 'flex', gap: '20px', alignItems: 'flex-start',
              transition: 'all 0.2s ease',
              borderLeft: cd.trangThai === 'DA_GUI' ? '4px solid var(--primary)' : '4px solid transparent'
            }}>
              
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px',
                background: cd.trangThai === 'DA_GUI' ? 'var(--blue-100)' : 'var(--gray-100)'
              }}>
                {cd.mucDoUuTien === 'KHAN_CAP' ? '🚨' : cd.mucDoUuTien === 'CAO' ? '⚡' : '✉️'}
              </div>

              <div style={{ flex: 1 }}>
                <div className="flex-between" style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: cd.trangThai === 'DA_GUI' ? 700 : 600, color: 'var(--navy-900)', margin: 0 }}>
                      {cd.tieuDe}
                    </h4>
                    {cd.trangThai === 'DA_GUI' && <span className="badge badge-navy" style={{ fontSize: '11px', padding: '4px 8px' }}>MỚI</span>}
                    <span className={`badge ${cd.mucDoUuTien === 'KHAN_CAP' ? 'badge-danger' : cd.mucDoUuTien === 'CAO' ? 'badge-warning' : 'badge-gray'}`} style={{ fontSize: '11px' }}>
                      {cd.mucDoUuTien === 'KHAN_CAP' ? 'KHẨN CẤP' : cd.mucDoUuTien}
                    </span>
                  </div>
                  <span className="text-xs text-muted" style={{ fontWeight: 500 }}>
                    {cd.ngayTao ? new Date(cd.ngayTao).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}
                  </span>
                </div>

                <div style={{ 
                  background: cd.trangThai === 'DA_GUI' ? '#ffffff' : '#f8fafc',
                  border: '1px solid var(--gray-200)', borderRadius: '8px', 
                  padding: '16px', marginTop: '12px', marginBottom: '16px'
                }}>
                  <p className="text-sm" style={{ color: 'var(--gray-800)', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>
                    {cd.noiDung}
                  </p>
                </div>

                <div className="flex-between" style={{ alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: 'var(--gray-500)', background: 'var(--gray-100)', padding: '4px 12px', borderRadius: '100px' }}>
                      {isManager ? `📤 Gửi đến: ${cd.maNguoiNhan}` : `📥 Từ: Ban Quản lý (${cd.maNguoiGui})`}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--gray-400)' }}>
                      Mã: {cd.maChiDao}
                    </span>
                  </div>

                  {/* CHỖ NÀY ĐÂY: Hiển thị nút cho NV Điều Hành / NV Nhà Ga nếu thư mới gửi tới (DA_GUI) */}
                  {!isManager && cd.trangThai === 'DA_GUI' && (
                    <button 
                      className="btn btn-success" 
                      style={{ padding: '6px 16px', fontSize: '13px', fontWeight: 600, boxShadow: '0 2px 4px rgba(34,197,94,0.2)' }} 
                      onClick={() => handleMarkRead(cd)}
                    >
                      ✓ Đánh dấu đã nhận & xử lý
                    </button>
                  )}
                  {cd.trangThai === 'DA_DOC' && (
                    <span style={{ fontSize: '13px', color: 'var(--green-600)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '16px' }}>✓</span> Đã xử lý
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Soạn Chỉ đạo Mới" size="md">
        <div style={{ background: 'var(--blue-50)', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--blue-100)' }}>
          <p style={{ fontSize: '13px', color: 'var(--blue-800)', margin: 0 }}>
            💡 <strong>Lưu ý:</strong> Chỉ đạo sẽ được gửi ngay lập tức đến ứng dụng của nhân viên. Hãy đánh dấu "Khẩn cấp" đối với các sự cố liên quan đến an toàn đường ray.
          </p>
        </div>

        <div className="form-row">
          <div className="form-group" style={{ flex: 2 }}>
            <label className="form-label" style={{ fontWeight: 600, color: 'var(--navy-800)' }}>NGƯỜI NHẬN <span style={{color: 'red'}}>*</span></label>
            <select className="form-control" style={{ border: '1px solid var(--gray-300)' }} value={form.maNguoiNhan} onChange={(e) => setForm({...form, maNguoiNhan: e.target.value})}>
              <option value="">-- Chọn nhân viên tiếp nhận --</option>
              {nhanVien
                .filter(nv => nv.quyenTruyCap === 'NHAN_VIEN_NHA_GA' || nv.quyenTruyCap === 'NHAN_VIEN_DIEU_HANH')
                .map(nv => (
                  <option key={nv.maTaiKhoan} value={nv.maTaiKhoan}>
                    {nv.hoTen} - {nv.quyenTruyCap === 'NHAN_VIEN_NHA_GA' ? 'NV Nhà ga' : 'NV Điều hành'}
                  </option>
                ))}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label" style={{ fontWeight: 600, color: 'var(--navy-800)' }}>MỨC ƯU TIÊN</label>
            <select className="form-control" style={{ border: '1px solid var(--gray-300)' }} value={form.mucDoUuTien} onChange={(e) => setForm({...form, mucDoUuTien: e.target.value})}>
              <option value="THAP">Thấp</option>
              <option value="TRUNG_BINH">Trung bình</option>
              <option value="CAO">Cao</option>
              <option value="KHAN_CAP">🔴 Khẩn cấp</option>
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label" style={{ fontWeight: 600, color: 'var(--navy-800)' }}>TIÊU ĐỀ <span style={{color: 'red'}}>*</span></label>
          <input className="form-control" style={{ border: '1px solid var(--gray-300)', fontWeight: 500 }} placeholder="Nhập tiêu đề ngắn gọn, dễ hiểu..." value={form.tieuDe} onChange={(e) => setForm({...form, tieuDe: e.target.value})} />
        </div>
        
        <div className="form-group">
          <label className="form-label" style={{ fontWeight: 600, color: 'var(--navy-800)' }}>NỘI DUNG CHỈ ĐẠO CHI TIẾT <span style={{color: 'red'}}>*</span></label>
          <textarea className="form-control" rows="6" style={{ border: '1px solid var(--gray-300)', lineHeight: 1.6 }} placeholder="Nhập chi tiết các công việc, yêu cầu cần thực hiện..." value={form.noiDung} onChange={(e) => setForm({...form, noiDung: e.target.value})} />
        </div>
        
        <div className="modal-footer" style={{ padding: '20px 0 0', borderTop: '1px solid var(--gray-200)', marginTop: '24px' }}>
          <button className="btn btn-secondary" style={{ padding: '10px 24px' }} onClick={() => setShowForm(false)}>Hủy bỏ</button>
          <button className="btn btn-primary" style={{ padding: '10px 24px', fontWeight: 600 }} onClick={handleCreate} disabled={formLoading}>
            {formLoading ? 'Đang gửi...' : '📤 Gửi Chỉ đạo'}
          </button>
        </div>
      </Modal>
    </>
  );
}