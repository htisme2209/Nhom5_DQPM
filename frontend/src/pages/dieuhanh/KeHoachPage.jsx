import { useState, useEffect } from 'react';
import { keHoachAPI } from '../../services/api';
import Modal from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';

export default function KeHoachPage() {
  const { user } = useAuth();
  const [keHoach, setKeHoach] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [toast, setToast] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [yKienDuyet, setYkienDuyet] = useState('');
  
  const [form, setForm] = useState({
    tieuDe: '', noiDung: '', mucDoUuTien: 'TRUNG_BINH'
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await keHoachAPI.getAll();
      const sortedData = (res.data.data || res.data || []).sort((a, b) => new Date(b.ngayGui || 0) - new Date(a.ngayGui || 0));
      setKeHoach(sortedData);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
  };

  const openCreate = () => {
    setForm({
      tieuDe: '', noiDung: '', mucDoUuTien: 'TRUNG_BINH'
    });
    setShowForm(true);
  };

  const handleCreate = async () => {
    if (!form.tieuDe || !form.noiDung) { showToast('Vui lòng nhập đầy đủ tiêu đề và nội dung', 'error'); return; }
    setFormLoading(true);
    try {
      await keHoachAPI.create({
        ...form, 
        maNguoiGui: user?.maTaiKhoan
      });
      showToast('Gửi kế hoạch phê duyệt thành công!');
      setShowForm(false); 
      loadData();
    } catch (e) { showToast(e.response?.data?.message || 'Lỗi khi gửi', 'error'); }
    finally { setFormLoading(false); }
  };

  const handleApprove = async (kh, approved) => {
    if (!approved && !yKienDuyet.trim()) {
      showToast('Vui lòng nhập lý do từ chối!', 'error');
      return;
    }
    try {
      await keHoachAPI.pheDuyet(kh.maKeHoach, {
        trangThai: approved ? 'DA_PHE_DUYET' : 'TU_CHOI',
        maNguoiDuyet: user?.maTaiKhoan, 
        yKienDuyet: yKienDuyet          
      });
      showToast(approved ? 'Đã phê duyệt kế hoạch!' : 'Đã từ chối kế hoạch');
      setShowDetail(null); 
      setYkienDuyet('');
      loadData();
    } catch (e) { showToast('Lỗi khi xử lý', 'error'); }
  };

  const ttMap = {
    'CHO_PHE_DUYET': { label: 'Chờ phê duyệt', cls: 'badge-warning' },
    'DA_PHE_DUYET': { label: 'Đã phê duyệt', cls: 'badge-success' },
    'TU_CHOI': { label: 'Từ chối', cls: 'badge-danger' },
  };

  const isQuanLy = user?.quyenTruyCap === 'BAN_QUAN_LY';

  return (
    <>
      {toast && <div className="toast-container"><div className={`toast ${toast.type}`}>{toast.type === 'success' ? '✅' : '❌'} {toast.msg}</div></div>}

      <div className="page-header">
        <div className="page-header-actions">
          <div>
            <h1>{isQuanLy ? 'Phê duyệt Kế hoạch' : 'Kế hoạch Đặc biệt'}</h1>
            <p>{isQuanLy ? 'Xem xét và phê duyệt các kế hoạch đặc biệt' : 'Tạo và theo dõi kế hoạch đặc biệt'}</p>
          </div>
          {!isQuanLy && <button className="btn btn-primary" onClick={openCreate}>📝 Tạo kế hoạch mới</button>}
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card orange">
          <div className="stat-info"><div className="stat-label">Chờ duyệt</div><div className="stat-value">{keHoach.filter(k => k.trangThai === 'CHO_PHE_DUYET').length}</div></div>
          <div className="stat-icon">⏳</div>
        </div>
        <div className="stat-card green">
          <div className="stat-info"><div className="stat-label">Đã duyệt</div><div className="stat-value">{keHoach.filter(k => k.trangThai === 'DA_PHE_DUYET').length}</div></div>
          <div className="stat-icon">✅</div>
        </div>
        <div className="stat-card red">
          <div className="stat-info"><div className="stat-label">Từ chối</div><div className="stat-value">{keHoach.filter(k => k.trangThai === 'TU_CHOI').length}</div></div>
          <div className="stat-icon">❌</div>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Mã</th>
                <th>Tiêu đề</th>
                <th>Người gửi</th>
                <th>Ưu tiên</th>
                <th>Ngày gửi</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {keHoach.map(kh => {
                const tt = ttMap[kh.trangThai] || { label: kh.trangThai, cls: 'badge-gray' };
                return (
                  <tr key={kh.maKeHoach}>
                    <td className="font-bold">{kh.maKeHoach}</td>
                    <td>{kh.tieuDe}</td>
                    <td>{kh.maNguoiGui}</td>
                    <td><span className={`badge ${kh.mucDoUuTien === 'KHAN_CAP' ? 'badge-danger' : kh.mucDoUuTien === 'CAO' ? 'badge-warning' : 'badge-info'}`}>{kh.mucDoUuTien}</span></td>
                    <td className="text-sm font-medium text-navy">
                      {kh.ngayGui ? new Date(kh.ngayGui).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : '---'}
                    </td>
                    <td><span className={`badge ${tt.cls}`}>{tt.label}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => { setShowDetail(kh); setYkienDuyet(''); }}>👁️ Xem</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {keHoach.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center text-muted" style={{ padding: '40px' }}>Không có dữ liệu kế hoạch.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Tạo Kế hoạch Đặc biệt" subtitle="Gửi kế hoạch tới Ban Quản lý phê duyệt" size="md">
        <div className="form-group">
          <label className="form-label">TIÊU ĐỀ <span style={{color: 'red'}}>*</span></label>
          <input className="form-control" placeholder="Nhập tiêu đề tóm tắt..."
            value={form.tieuDe} onChange={(e) => setForm({...form, tieuDe: e.target.value})} />
        </div>
        <div className="form-group">
          <label className="form-label">MỨC ĐỘ ƯU TIÊN</label>
          <select className="form-control" value={form.mucDoUuTien}
            onChange={(e) => setForm({...form, mucDoUuTien: e.target.value})}>
            <option value="THAP">Thấp</option>
            <option value="TRUNG_BINH">Trung bình</option>
            <option value="CAO">Cao</option>
            <option value="KHAN_CAP">🔴 Khẩn cấp</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">NỘI DUNG CHI TIẾT <span style={{color: 'red'}}>*</span></label>
          <textarea className="form-control" rows="6" placeholder="Mô tả chi tiết kế hoạch, lý do và đề xuất..."
            value={form.noiDung} onChange={(e) => setForm({...form, noiDung: e.target.value})} />
        </div>
        <div className="modal-footer" style={{ padding: '16px 0 0', borderTop: '1px solid var(--gray-200)' }}>
          <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Hủy</button>
          <button className="btn btn-primary" onClick={handleCreate} disabled={formLoading}>
            {formLoading ? '⏳' : '📤 Gửi phê duyệt'}
          </button>
        </div>
      </Modal>

      {/* Detail Modal - Giao diện VIP 3 Cột */}
      <Modal isOpen={!!showDetail} onClose={() => setShowDetail(null)} title="Hồ sơ Kế hoạch Đặc biệt" size="md">
        {showDetail && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ borderBottom: '1px solid var(--gray-200)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '8px', lineHeight: 1.3 }}>
                    {showDetail.tieuDe}
                  </h2>
                  <p style={{ color: 'var(--gray-500)', fontSize: '13px' }}>
                    Mã hồ sơ: <strong style={{ color: 'var(--navy-700)' }}>{showDetail.maKeHoach}</strong>
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                  <span className={`badge ${(ttMap[showDetail.trangThai] || {}).cls}`} style={{ fontSize: '13px', padding: '6px 12px' }}>
                    {(ttMap[showDetail.trangThai] || {}).label}
                  </span>
                  <span className={`badge ${showDetail.mucDoUuTien === 'KHAN_CAP' ? 'badge-danger' : showDetail.mucDoUuTien === 'CAO' ? 'badge-warning' : 'badge-info'}`}>
                    {showDetail.mucDoUuTien === 'KHAN_CAP' ? '🔴 KHẨN CẤP' : showDetail.mucDoUuTien}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ 
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', 
              background: 'var(--gray-50)', padding: '16px', borderRadius: '8px', border: '1px solid var(--gray-100)'
            }}>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gray-500)', marginBottom: '4px', textTransform: 'uppercase' }}>Người đề xuất</p>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--navy-800)' }}>👤 {showDetail.maNguoiGui}</p>
              </div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gray-500)', marginBottom: '4px', textTransform: 'uppercase' }}>Thời gian gửi</p>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--navy-800)' }}>
                  📅 {showDetail.ngayGui ? new Date(showDetail.ngayGui).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : '---'}
                </p>
              </div>
              {/* CẬP NHẬT CỘT 3: Hiển thị Người duyệt & Thời gian duyệt nếu đã xử lý */}
              <div>
                <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gray-500)', marginBottom: '4px', textTransform: 'uppercase' }}>
                  {showDetail.trangThai === 'CHO_PHE_DUYET' ? 'Trạng thái xử lý' : 'Người phê duyệt'}
                </p>
                {showDetail.trangThai === 'CHO_PHE_DUYET' ? (
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-400)' }}>
                    🕒 Đang chờ...
                  </p>
                ) : (
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: showDetail.trangThai === 'DA_PHE_DUYET' ? '#166534' : '#991b1b', marginBottom: '2px' }}>
                      ✍️ {showDetail.maNguoiDuyet || 'Hệ thống'}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--gray-500)' }}>
                      🕒 {showDetail.ngayDuyet ? new Date(showDetail.ngayDuyet).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : '---'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gray-700)', marginBottom: '8px', textTransform: 'uppercase' }}>
                Nội dung trình bày
              </h4>
              <div style={{ 
                background: '#ffffff', border: '1px solid var(--gray-200)', borderRadius: '8px', 
                padding: '16px', fontSize: '14px', lineHeight: 1.8, color: 'var(--gray-800)', whiteSpace: 'pre-wrap' 
              }}>
                {showDetail.noiDung}
              </div>
            </div>

            {/* FORM XỬ LÝ (CHỈ BQL VÀ KHI ĐANG CHỜ DUYỆT) */}
            {isQuanLy && showDetail.trangThai === 'CHO_PHE_DUYET' && (
              <div style={{ 
                background: 'var(--navy-50)', border: '1px solid var(--navy-200)', 
                borderRadius: '8px', padding: '20px', marginTop: '8px' 
              }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--navy-800)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  ✍️ Quyết định Phê duyệt
                </h4>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--navy-700)', display: 'block', marginBottom: '8px' }}>
                    Ý KIẾN CHỈ ĐẠO / LÝ DO TỪ CHỐI <span style={{color: 'red'}}>*</span>
                  </label>
                  <textarea 
                    className="form-control" 
                    rows="3" 
                    style={{ border: '1px solid var(--navy-300)', backgroundColor: '#fff' }}
                    placeholder="Nhập ý kiến của Ban quản lý..."
                    value={yKienDuyet}
                    onChange={(e) => setYkienDuyet(e.target.value)}
                  />
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button 
                    className="btn btn-danger" 
                    style={{ padding: '8px 24px', fontWeight: 600 }}
                    onClick={() => handleApprove(showDetail, false)}
                  >
                    ❌ Từ chối
                  </button>
                  <button 
                    className="btn btn-success" 
                    style={{ padding: '8px 24px', fontWeight: 600 }}
                    onClick={() => handleApprove(showDetail, true)}
                  >
                    ✅ Phê duyệt Kế hoạch
                  </button>
                </div>
              </div>
            )}
            
            {/* BOX XEM Ý KIẾN (KHI ĐÃ XỬ LÝ) */}
            {showDetail.trangThai !== 'CHO_PHE_DUYET' && (
              <div style={{ 
                background: showDetail.trangThai === 'DA_PHE_DUYET' ? '#f0fdf4' : '#fef2f2', 
                border: `1px solid ${showDetail.trangThai === 'DA_PHE_DUYET' ? '#bbf7d0' : '#fecaca'}`, 
                borderRadius: '8px', padding: '16px', marginTop: '8px' 
              }}>
                <h4 style={{ 
                  fontSize: '13px', fontWeight: 700, 
                  color: showDetail.trangThai === 'DA_PHE_DUYET' ? '#166534' : '#991b1b', 
                  marginBottom: '8px', textTransform: 'uppercase' 
                }}>
                  Ý kiến chỉ đạo từ Ban Quản lý
                </h4>
                <p style={{ fontSize: '14px', color: 'var(--gray-800)', margin: 0, fontStyle: 'italic' }}>
                  {(showDetail.ykienDuyet || showDetail.yKienDuyet) 
                    ? `"${showDetail.ykienDuyet || showDetail.yKienDuyet}"` 
                    : "Không có ý kiến bổ sung."}
                </p>
              </div>
            )}
            
          </div>
        )}
      </Modal>
    </>
  );
}