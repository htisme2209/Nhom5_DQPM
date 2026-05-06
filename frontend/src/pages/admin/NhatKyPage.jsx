import { useState, useEffect } from 'react';
import { nhatKyAPI, taiKhoanAPI } from '../../services/api';

export default function NhatKyPage() {
  const [nhatKy, setNhatKy] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [searchPersonnel, setSearchPersonnel] = useState('');
  const [activeTab, setActiveTab] = useState('nhat-ky');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => { loadData(); }, [currentPage]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resLogs, resAccounts] = await Promise.all([
        nhatKyAPI.getAll(currentPage, 50),
        taiKhoanAPI.getAll()
      ]);
      
      // Handle phân trang từ ApiResponse<Page<NhatKy>>
      const responseData = resLogs.data;
      if (responseData && responseData.data && responseData.data.content) {
        setNhatKy(responseData.data.content);
        setTotalPages(responseData.data.totalPages || 1);
      } else if (responseData && Array.isArray(responseData.data)) {
        setNhatKy(responseData.data);
        setTotalPages(1);
      } else if (Array.isArray(responseData)) {
        setNhatKy(responseData);
        setTotalPages(1);
      } else {
        setNhatKy([]);
        setTotalPages(1);
      }
      
      setAccounts(resAccounts.data.data || resAccounts.data || []);
    } catch (e) { 
      console.error(e); 
      setNhatKy([]);
    }
    finally { setLoading(false); }
  };

  const actionIcons = {
    'DANG_NHAP': { icon: '🔐', label: 'Đăng nhập' },
    'THEM': { icon: '➕', label: 'Thêm mới' },
    'CAP_NHAT': { icon: '✏️', label: 'Cập nhật' },
    'XOA': { icon: '🗑️', label: 'Xóa' },
    'PHE_DUYET': { icon: '✅', label: 'Phê duyệt' },
    'GHI_NHAN_SU_CO': { icon: '⚠️', label: 'Ghi nhận sự cố' },
    'TIEP_NHAN_SU_CO': { icon: '🔧', label: 'Tiếp nhận sự cố' },
  };

  const actionColors = {
    'DANG_NHAP': { bg: '#DBEAFE', color: '#1E40AF' },
    'THEM': { bg: '#DCFCE7', color: '#166534' },
    'CAP_NHAT': { bg: '#FEF3C7', color: '#92400E' },
    'XOA': { bg: '#FEE2E2', color: '#991B1B' },
    'PHE_DUYET': { bg: '#E0E7FF', color: '#3730A3' },
    'GHI_NHAN_SU_CO': { bg: '#FEF2F2', color: '#991B1B' },
    'TIEP_NHAN_SU_CO': { bg: '#DBEAFE', color: '#1E40AF' },
  };

  const doiTuongIcons = {
    'TAI_KHOAN': '👤',
    'LICH_TRINH': '📅',
    'CHUYEN_TAU': '🚂',
    'GA': '🏢',
    'RAY': '🛤️',
    'SU_CO': '⚠️',
    'KE_HOACH': '📋',
  };

  const filtered = nhatKy.filter(nk => {
    const matchAction = !filterAction || nk.hanhDong === filterAction;
    return matchAction;
  });

  const filteredAccounts = accounts.filter(acc => {
    const matchSearch = acc.hoTen?.toLowerCase().includes(searchPersonnel.toLowerCase()) ||
                       acc.email?.toLowerCase().includes(searchPersonnel.toLowerCase()) ||
                       acc.maTaiKhoan?.toLowerCase().includes(searchPersonnel.toLowerCase());
    const matchRole = !filterRole || acc.quyenTruyCap === filterRole;
    return matchSearch && matchRole;
  });

  const getRoleLabel = (role) => {
    const roleMap = {
      'QUAN_TRI_VIEN': 'Quản trị viên',
      'NHAN_VIEN_DIEU_HANH': 'Nhân viên điều hành',
      'NHAN_VIEN_NHA_GA': 'Nhân viên nhà ga',
      'BAN_QUAN_LY': 'Ban quản lý'
    };
    return roleMap[role] || role;
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'HOAT_DONG': 'Hoạt động',
      'CHO_XAC_NHAN': 'Chờ xác nhận',
      'KHOA': 'Khóa'
    };
    return statusMap[status] || status;
  };

  const formatDateTime = (dt) => {
    if (!dt) return '---';
    try {
      return new Date(dt).toLocaleString('vi-VN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
    } catch {
      return dt;
    }
  };

  const getActionInfo = (action) => {
    return actionIcons[action] || { icon: '📝', label: action };
  };

  return (
    <>
      <div className="page-header">
        <div className="page-header-actions">
          <div>
            <h1>📋 Nhật ký Hệ thống</h1>
            <p>Theo dõi lịch sử hành động của tất cả người dùng trong hệ thống quản lý</p>
          </div>
          <button className="btn btn-secondary" onClick={() => loadData()}>🔄 Làm mới</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--gray-200)' }}>
          <button
            onClick={() => setActiveTab('nhat-ky')}
            style={{
              padding: '15px 20px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'nhat-ky' ? '3px solid var(--primary)' : 'none',
              color: activeTab === 'nhat-ky' ? 'var(--primary)' : 'var(--gray-600)',
              fontWeight: activeTab === 'nhat-ky' ? '600' : '500',
              cursor: 'pointer',
              marginRight: '20px'
            }}
          >
            📋 Nhật ký Hoạt động
          </button>
          <button
            onClick={() => setActiveTab('nhan-su')}
            style={{
              padding: '15px 20px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'nhan-su' ? '3px solid var(--primary)' : 'none',
              color: activeTab === 'nhan-su' ? 'var(--primary)' : 'var(--gray-600)',
              fontWeight: activeTab === 'nhan-su' ? '600' : '500',
              cursor: 'pointer'
            }}
          >
            👥 Quản lý Nhân sự
          </button>
        </div>
      </div>

      {/* Activity Log Tab */}
      {activeTab === 'nhat-ky' && (
        <>
          <div className="filter-bar">
            <select className="form-control" style={{ width: 'auto' }} value={filterAction}
              onChange={(e) => { setFilterAction(e.target.value); setCurrentPage(0); }}>
              <option value="">Tất cả hành động</option>
              <option value="DANG_NHAP">🔐 Đăng nhập</option>
              <option value="THEM">➕ Thêm mới</option>
              <option value="CAP_NHAT">✏️ Cập nhật</option>
              <option value="XOA">🗑️ Xóa</option>
              <option value="PHE_DUYET">✅ Phê duyệt</option>
              <option value="GHI_NHAN_SU_CO">⚠️ Ghi nhận sự cố</option>
              <option value="TIEP_NHAN_SU_CO">🔧 Tiếp nhận sự cố</option>
            </select>
            <span className="text-sm text-muted" style={{ marginLeft: 'auto' }}>
              Tổng: {filtered.length} bản ghi (Trang {currentPage + 1}/{totalPages})
            </span>
          </div>

          <div className="card">
            <div className="card-body" style={{ padding: 0 }}>
              {loading ? (
                <div className="text-center text-muted" style={{ padding: '60px 20px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
                  Đang tải nhật ký...
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center text-muted" style={{ padding: '60px 20px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>📭</div>
                  <h3>Không có nhật ký nào</h3>
                  <p>Không tìm thấy hoạt động phù hợp với bộ lọc của bạn</p>
                </div>
              ) : (
                <div style={{ padding: 0 }}>
                  {filtered.map((nk, i) => {
                    const ac = actionColors[nk.hanhDong] || { bg: 'var(--gray-100)', color: 'var(--gray-600)' };
                    const actInfo = getActionInfo(nk.hanhDong);
                    return (
                      <div 
                        key={nk.maNhatKy || i}
                        onClick={() => setSelectedLog(selectedLog?.maNhatKy === nk.maNhatKy ? null : nk)}
                        style={{
                          padding: '16px 20px',
                          borderBottom: '1px solid var(--gray-100)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          background: selectedLog?.maNhatKy === nk.maNhatKy ? 'var(--blue-50)' : 'transparent',
                          borderLeft: selectedLog?.maNhatKy === nk.maNhatKy ? '4px solid var(--primary)' : '4px solid transparent',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-50)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = selectedLog?.maNhatKy === nk.maNhatKy ? 'var(--blue-50)' : 'transparent'}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', flex: 1 }}>
                            <div style={{ fontSize: '24px', marginTop: '2px' }}>{actInfo.icon}</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--navy-900)' }}>
                                  {nk.maTaiKhoan}
                                </span>
                                <span style={{
                                  display: 'inline-flex', padding: '3px 10px', borderRadius: '20px',
                                  fontSize: '11px', fontWeight: 600, background: ac.bg, color: ac.color
                                }}>
                                  {actInfo.label}
                                </span>
                                <span style={{
                                  display: 'inline-flex', padding: '3px 10px', borderRadius: '20px',
                                  fontSize: '11px', background: 'var(--gray-100)', color: 'var(--gray-700)'
                                }}>
                                  {doiTuongIcons[nk.doiTuong] || '📝'} {nk.doiTuong}
                                </span>
                              </div>
                              <div style={{ fontSize: '13px', color: 'var(--gray-600)', marginBottom: '6px' }}>
                                {nk.noiDungMoi || nk.noiDungCu || 'Không có thêm chi tiết'}
                              </div>
                              <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--gray-500)' }}>
                                <span>🕐 {formatDateTime(nk.thoiGian)}</span>
                                <span>🔗 {nk.maDoiTuong || '—'}</span>
                                <span>📍 {nk.diaChiIp || 'Unknown'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Expanded view */}
                        {selectedLog?.maNhatKy === nk.maNhatKy && (nk.noiDungCu || nk.noiDungMoi) && (
                          <div style={{
                            marginTop: '12px',
                            padding: '12px',
                            background: 'var(--gray-50)',
                            borderRadius: '6px',
                            borderLeft: '3px solid var(--primary)',
                            fontSize: '12px'
                          }}>
                            {nk.noiDungCu && (
                              <div style={{ marginBottom: '8px' }}>
                                <strong>📌 Giá trị cũ:</strong>
                                <pre style={{ margin: '4px 0', whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: '#fff', padding: '8px', borderRadius: '4px', fontSize: '11px' }}>
                                  {nk.noiDungCu}
                                </pre>
                              </div>
                            )}
                            {nk.noiDungMoi && (
                              <div>
                                <strong>✨ Giá trị mới:</strong>
                                <pre style={{ margin: '4px 0', whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: '#fff', padding: '8px', borderRadius: '4px', fontSize: '11px' }}>
                                  {nk.noiDungMoi}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Phân trang */}
          {totalPages > 1 && (
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <button 
                className="btn btn-secondary"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
              >
                ← Trước
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  className={`btn ${currentPage === i ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setCurrentPage(i)}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                className="btn btn-secondary"
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
              >
                Sau →
              </button>
            </div>
          )}
        </>
      )}

      {/* Personnel Directory Tab */}
      {activeTab === 'nhan-su' && (
        <>
          <div className="filter-bar">
            <input
              type="text"
              className="form-control"
              placeholder="🔍 Tìm theo tên, email, hoặc mã tài khoản..."
              value={searchPersonnel}
              onChange={(e) => setSearchPersonnel(e.target.value)}
              style={{ flex: 1 }}
            />
            <select className="form-control" style={{ width: 'auto', marginLeft: '10px' }} value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}>
              <option value="">Tất cả vai trò</option>
              <option value="QUAN_TRI_VIEN">👤 Quản trị viên</option>
              <option value="BAN_QUAN_LY">📊 Ban quản lý</option>
              <option value="NHAN_VIEN_DIEU_HANH">🚂 Nhân viên điều hành</option>
              <option value="NHAN_VIEN_NHA_GA">🏢 Nhân viên nhà ga</option>
            </select>
            <span className="text-sm text-muted" style={{ marginLeft: 'auto' }}>
              Tổng: {filteredAccounts.length} nhân sự
            </span>
          </div>

          <div className="card">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Mã tài khoản</th>
                    <th>Họ tên</th>
                    <th>Email</th>
                    <th>Điện thoại</th>
                    <th>Vai trò</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6" className="text-center text-muted" style={{ padding: '40px' }}>Đang tải...</td></tr>
                  ) : filteredAccounts.length === 0 ? (
                    <tr><td colSpan="6" className="text-center text-muted" style={{ padding: '40px' }}>Không tìm thấy nhân sự nào</td></tr>
                  ) : filteredAccounts.map((acc, i) => (
                    <tr key={acc.maTaiKhoan || i}>
                      <td className="font-semibold text-navy">{acc.maTaiKhoan}</td>
                      <td>{acc.hoTen}</td>
                      <td className="text-sm">{acc.email}</td>
                      <td>{acc.soDienThoai || '—'}</td>
                      <td>
                        <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: 'var(--blue-100)', color: 'var(--blue-700)' }}>
                          {getRoleLabel(acc.quyenTruyCap)}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                          background: acc.trangThai === 'HOAT_DONG' ? 'var(--green-100)' : 'var(--red-100)',
                          color: acc.trangThai === 'HOAT_DONG' ? '#166534' : '#991B1B'
                        }}>
                          {acc.trangThai === 'HOAT_DONG' ? '✅' : '⛔'} {getStatusLabel(acc.trangThai)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
}