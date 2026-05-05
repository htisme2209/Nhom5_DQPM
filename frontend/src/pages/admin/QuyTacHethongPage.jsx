import { useState, useEffect } from 'react';
import { quyTacAPI } from '../../services/api';

export default function QuyTacHethongPage() {
  const [activeTab, setActiveTab] = useState('quy-tac-nghiep-vu');
  const [quyTacs, setQuyTacs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchQuyTacs();
  }, []);

  const fetchQuyTacs = async () => {
    setLoading(true);
    try {
      const res = await quyTacAPI.getAll();
      console.log('API Rules Response:', res.data); // DEBUG LOG
      if (res.data.success) {
        setQuyTacs(res.data.data || []);
        if (!res.data.data || res.data.data.length === 0) {
          console.warn('API trả về danh sách rỗng');
        }
      }
    } catch (err) {
      console.error('Lỗi lấy quy tắc:', err);
      showMsg('error', 'Không thể kết nối đến máy chủ để lấy danh sách quy tắc.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (qt) => {
    setEditingId(qt.maQuyTac);
    setEditValue(qt.giaTri);
  };

  const handleSave = async (id) => {
    // Validation
    const quyTac = quyTacs.find(q => q.maQuyTac === id);
    if (quyTac.kieuDuLieu === 'NUMBER' && (isNaN(editValue) || Number(editValue) < 0)) {
      showMsg('error', 'Thông số không hợp lệ. Vui lòng nhập số lớn hơn hoặc bằng 0.');
      return;
    }

    try {
      const res = await quyTacAPI.update(id, { giaTri: editValue });
      if (res.data.success) {
        setQuyTacs(prev => prev.map(q => q.maQuyTac === id ? { ...q, giaTri: editValue, capNhatLanCuoi: new Date().toISOString() } : q));
        setEditingId(null);
        showMsg('success', 'Cập nhật quy tắc thành công và áp dụng ngay vào hệ thống.');
      }
    } catch (err) {
      showMsg('error', 'Lỗi khi lưu quy tắc.');
    }
  };

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const renderRuleTable = (groupType) => {
    const filtered = quyTacs.filter(q => {
      const ma = q.maQuyTac;
      if (groupType === 'VAN_HANH') return ['QT-01', 'QT-02', 'QT-03', 'QT-07'].includes(ma);
      if (groupType === 'BAO_DONG') return ['QT-05', 'QT-06'].includes(ma);
      if (groupType === 'PHE_DUYET') return ['QT-04'].includes(ma);
      return false;
    });

    if (filtered.length === 0) return <p style={{ color: 'var(--gray-500)', fontStyle: 'italic' }}>Không có quy tắc nào trong nhóm này.</p>;

    return (
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead style={{ background: 'var(--gray-50)' }}>
          <tr>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid var(--gray-200)', width: '30%' }}>Tên quy tắc</th>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid var(--gray-200)', width: '15%' }}>Giá trị</th>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid var(--gray-200)' }}>Mô tả</th>
            <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid var(--gray-200)', width: '15%' }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(qt => (
            <tr key={qt.maQuyTac} style={{ borderBottom: '1px solid var(--gray-100)' }}>
              <td style={{ padding: '12px', fontWeight: '500' }}>{qt.tenQuyTac}</td>
              <td style={{ padding: '12px' }}>
                {editingId === qt.maQuyTac ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid var(--primary)',
                      borderRadius: '4px',
                      outline: 'none'
                    }}
                    autoFocus
                  />
                ) : (
                  <span style={{ 
                    background: 'var(--blue-50)', 
                    color: 'var(--blue-700)', 
                    padding: '4px 10px', 
                    borderRadius: '20px', 
                    fontWeight: '600' 
                  }}>
                    {qt.giaTri} {qt.kieuDuLieu === 'NUMBER' ? 'phút' : ''}
                  </span>
                )}
              </td>
              <td style={{ padding: '12px', color: 'var(--gray-600)', fontSize: '14px' }}>
                {qt.moTa}
                <div style={{ fontSize: '11px', marginTop: '4px', color: 'var(--gray-400)' }}>
                  Cập nhật cuối: {qt.capNhatLanCuoi ? new Date(qt.capNhatLanCuoi).toLocaleString('vi-VN') : 'N/A'}
                </div>
              </td>
              <td style={{ padding: '12px', textAlign: 'center' }}>
                {editingId === qt.maQuyTac ? (
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button onClick={() => handleSave(qt.maQuyTac)} className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }}>Lưu</button>
                    <button onClick={() => setEditingId(null)} className="btn-outline" style={{ padding: '6px 12px', fontSize: '12px' }}>Hủy</button>
                  </div>
                ) : (
                  <button onClick={() => handleEdit(qt)} className="btn-outline" style={{ padding: '6px 12px', fontSize: '12px' }}>✏️ Sửa</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <>
      <div className="page-header">
        <div className="page-header-actions">
          <div>
            <h1>Quy tắc & Quy trình Hệ thống</h1>
            <p>Quản lý các thông số vận hành và quy trình phê duyệt</p>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`} style={{ marginBottom: '20px' }}>
          {message.type === 'success' ? '✅' : '❌'} {message.text}
        </div>
      )}

      {/* Debug view if empty */}
      {quyTacs.length === 0 && !loading && (
        <div className="alert alert-info" style={{ marginBottom: '20px' }}>
          ℹ️ Không tìm thấy dữ liệu quy tắc. Số lượng: {quyTacs.length}. 
          Hãy kiểm tra Console (F12) để xem chi tiết API response.
        </div>
      )}

      {/* Tabs */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--gray-200)', overflowX: 'auto' }}>
          <button
            onClick={() => setActiveTab('quy-tac-nghiep-vu')}
            style={{
              padding: '15px 20px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'quy-tac-nghiep-vu' ? '3px solid var(--primary)' : 'none',
              color: activeTab === 'quy-tac-nghiep-vu' ? 'var(--primary)' : 'var(--gray-600)',
              fontWeight: activeTab === 'quy-tac-nghiep-vu' ? '600' : '500',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            📋 Cấu hình Thông số
          </button>
          <button
            onClick={() => setActiveTab('quy-trinh-phe-duyet')}
            style={{
              padding: '15px 20px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'quy-trinh-phe-duyet' ? '3px solid var(--primary)' : 'none',
              color: activeTab === 'quy-trinh-phe-duyet' ? 'var(--primary)' : 'var(--gray-600)',
              fontWeight: activeTab === 'quy-trinh-phe-duyet' ? '600' : '500',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            ✅ Quy trình Phê duyệt
          </button>
          <button
            onClick={() => setActiveTab('nhat-ky-thay-doi')}
            style={{
              padding: '15px 20px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'nhat-ky-thay-doi' ? '3px solid var(--primary)' : 'none',
              color: activeTab === 'nhat-ky-thay-doi' ? 'var(--primary)' : 'var(--gray-600)',
              fontWeight: activeTab === 'nhat-ky-thay-doi' ? '600' : '500',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            🕒 Nhật ký Thay đổi
          </button>
        </div>
      </div>

      {/* Business Rules Config Tab */}
      {activeTab === 'quy-tac-nghiep-vu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, color: 'var(--navy-800)' }}>🛤️ Lịch trình & Vận hành</h3>
                {loading && <span className="loader-small"></span>}
              </div>
              {renderRuleTable('VAN_HANH')}
            </div>
          </div>

          <div className="card">
            <div style={{ padding: '20px' }}>
              <h3 style={{ marginTop: '0', marginBottom: '15px', color: 'var(--navy-800)' }}>🔔 Báo động & Đồng bộ</h3>
              {renderRuleTable('BAO_DONG')}
            </div>
          </div>

          <div className="card">
            <div style={{ padding: '20px' }}>
              <h3 style={{ marginTop: '0', marginBottom: '15px', color: 'var(--navy-800)' }}>👤 Phê duyệt & Tài khoản</h3>
              {renderRuleTable('PHE_DUYET')}
            </div>
          </div>
        </div>
      )}

      {/* Approval Workflow Tab (Static Description as requested) */}
      {activeTab === 'quy-trinh-phe-duyet' && (
        <div className="card">
          <div style={{ padding: '20px' }}>
            <h3 style={{ marginTop: '0', marginBottom: '20px', color: 'var(--navy-800)' }}>📌 Quy trình Phê duyệt</h3>
            
            <div style={{ background: 'var(--gray-50)', padding: '20px', borderRadius: '8px', borderLeft: '5px solid var(--primary)' }}>
              <h4 style={{ color: 'var(--navy-700)', marginBottom: '15px' }}>Luồng duyệt Kế hoạch Đặc biệt (Mặc định)</h4>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', padding: '20px 0' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--blue-400)', margin: '0 auto 10px' }}>📝</div>
                  <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Lập đề xuất</span>
                </div>
                <div style={{ fontSize: '20px' }}>➔</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--orange-400)', margin: '0 auto 10px' }}>⌛</div>
                  <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Chờ phê duyệt</span>
                </div>
                <div style={{ fontSize: '20px' }}>➔</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--green-400)', margin: '0 auto 10px' }}>🏛️</div>
                  <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Ban quản lý duyệt</span>
                </div>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--gray-600)', textAlign: 'center' }}>
                Mọi kế hoạch đặc biệt hoặc điều chỉnh lịch vượt ngưỡng cảnh báo (15p) đều phải trải qua luồng duyệt này.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Change History Tab (Placeholder as per Alternative flow) */}
      {activeTab === 'nhat-ky-thay-doi' && (
        <div className="card">
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '50px', marginBottom: '20px' }}>🕒</div>
            <h3>Nhật ký Thay đổi Quy tắc</h3>
            <p style={{ color: 'var(--gray-500)' }}>Tính năng đang được phát triển để hiển thị lịch sử các lần thay đổi thông số hệ thống.</p>
          </div>
        </div>
      )}
    </>
  );
}
