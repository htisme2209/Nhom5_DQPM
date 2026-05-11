import { useState, useEffect } from 'react';
import { lichTrinhAPI, suCoAPI, chuyenTauAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function BaoCaoPage() {
  const navigate = useNavigate();
  const [lichTrinh, setLichTrinh] = useState([]);
  const [suCo, setSuCo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  const currentYear = new Date().getFullYear();
  const [selectedYears, setSelectedYears] = useState([currentYear]);
  const [availableYears, setAvailableYears] = useState([]);

  useEffect(() => { loadData(); }, [dateRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ltRes, scRes] = await Promise.all([
        lichTrinhAPI.getAll({}),
        suCoAPI.getAll()
      ]);
      const ltData = ltRes.data.data || ltRes.data || [];
      setLichTrinh(ltData);
      setSuCo(scRes.data.data || scRes.data || []);

      // Extract available years from data
      const years = new Set();
      ltData.forEach(lt => {
        if (lt.ngayDuKien) {
          const year = new Date(lt.ngayDuKien).getFullYear();
          years.add(year);
        }
      });
      const sortedYears = Array.from(years).sort((a, b) => b - a);
      setAvailableYears(sortedYears.length > 0 ? sortedYears : [currentYear]);
    } catch (e) { 
      console.error(e); 
      setAvailableYears([currentYear]);
    }
    finally { setLoading(false); }
  };

  const tongChuyen = lichTrinh.length;
  const dungGio = lichTrinh.filter(lt => lt.soPhutTre === 0).length;
  const treTB = tongChuyen > 0 ? Math.round(lichTrinh.reduce((sum, lt) => sum + (lt.soPhutTre || 0), 0) / tongChuyen) : 0;
  const tyLeDungGio = tongChuyen > 0 ? Math.round((dungGio / tongChuyen) * 100) : 0;
  const suCoMo = suCo.filter(s => s.trangThaiXuLy !== 'DA_XU_LY').length;

  // Status distribution
  const statusDist = {};
  lichTrinh.forEach(lt => {
    statusDist[lt.trangThai] = (statusDist[lt.trangThai] || 0) + 1;
  });

  const statusLabels = {
    'CHO_XAC_NHAN': 'Chờ xác nhận',
    'DA_XAC_NHAN': 'Đã xác nhận',
    'DUNG_TAI_GA': 'Đang ở ga',
    'DA_ROI_GA': 'Đã rời ga',
  };

  return (
    <>
      <div className="page-header">
        <div className="page-header-actions">
          <div>
            <h1>Báo cáo & Phân tích</h1>
            <p>Phân tích hiệu suất vận hành Ga Đà Nẵng</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/quan-ly/xuat-bao-cao')}>📥 Xuất báo cáo</button>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-info">
            <div className="stat-label">Tổng chuyến</div>
            <div className="stat-value">{tongChuyen}</div>
          </div>
          <div className="stat-icon">🚂</div>
        </div>
        <div className="stat-card green">
          <div className="stat-info">
            <div className="stat-label">Tỷ lệ đúng giờ</div>
            <div className="stat-value">{tyLeDungGio}%</div>
            <div className="stat-change text-success">{dungGio}/{tongChuyen} chuyến</div>
          </div>
          <div className="stat-icon">✅</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-info">
            <div className="stat-label">Trễ trung bình</div>
            <div className="stat-value">{treTB}p</div>
          </div>
          <div className="stat-icon">⏰</div>
        </div>
        <div className="stat-card red">
          <div className="stat-info">
            <div className="stat-label">Sự cố mở</div>
            <div className="stat-value">{suCoMo}</div>
          </div>
          <div className="stat-icon">⚠️</div>
        </div>
      </div>

      <div className="two-col-layout">
        <div className="main-col">
          {/* On-time performance bar chart */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header"><h3>📊 Phân bổ trạng thái Lịch trình</h3></div>
            <div className="card-body">
              {Object.entries(statusDist).map(([status, count]) => {
                const pct = tongChuyen > 0 ? Math.round((count / tongChuyen) * 100) : 0;
                const colors = {
                  'CHO_XAC_NHAN': '#EAB308',
                  'DA_XAC_NHAN': '#3B82F6',
                  'DUNG_TAI_GA': '#22C55E',
                  'DA_ROI_GA': '#9CA3AF',
                  'BI_HUY': '#EF4444'
                };
                return (
                  <div key={status} style={{ marginBottom: '12px' }}>
                    <div className="flex-between" style={{ marginBottom: '4px' }}>
                      <span className="text-sm font-semibold">{statusLabels[status] || status}</span>
                      <span className="text-sm text-muted">{count} ({pct}%)</span>
                    </div>
                    <div style={{ height: '10px', background: 'var(--gray-100)', borderRadius: '5px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${pct}%`,
                        background: colors[status] || 'var(--navy-500)',
                        borderRadius: '5px', transition: 'width 0.5s ease'
                      }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top delayed trains */}
          <div className="card">
            <div className="card-header"><h3>⏰ Chuyến trễ nhiều nhất</h3></div>
            <div className="table-container">
              <table>
                <thead><tr><th>Chuyến</th><th>Lịch trình</th><th>Phút trễ</th><th>Đường ray</th></tr></thead>
                <tbody>
                  {lichTrinh
                    .filter(lt => lt.soPhutTre > 0)
                    .sort((a, b) => b.soPhutTre - a.soPhutTre)
                    .slice(0, 5)
                    .map(lt => (
                      <tr key={lt.maLichTrinh}>
                        <td className="font-bold text-navy">{lt.maChuyenTau}</td>
                        <td>{lt.maLichTrinh}</td>
                        <td><span className="badge badge-danger">-{lt.soPhutTre}p</span></td>
                        <td>{lt.maRay ? <span className="ray-badge">{lt.maRay}</span> : '---'}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="side-col">
          <div className="card card-accent" style={{ marginBottom: '16px' }}>
            <div className="card-body">
              <div className="accent-label">HIỆU SUẤT TỔNG THỂ</div>
              <div style={{ fontSize: '56px', fontWeight: 700, marginTop: '12px' }}>{tyLeDungGio}%</div>
              <p style={{ opacity: 0.7, fontSize: '12px', marginTop: '4px' }}>Tỷ lệ đúng giờ giai đoạn</p>
              <div style={{
                marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.1)',
                borderRadius: 'var(--radius)', fontSize: '13px'
              }}>
                <div className="flex-between" style={{ marginBottom: '4px' }}>
                  <span style={{ opacity: 0.7 }}>Đúng giờ</span>
                  <span style={{ fontWeight: 700 }}>{dungGio}</span>
                </div>
                <div className="flex-between" style={{ marginBottom: '4px' }}>
                  <span style={{ opacity: 0.7 }}>Trễ giờ</span>
                  <span style={{ fontWeight: 700 }}>{tongChuyen - dungGio}</span>
                </div>
                <div className="flex-between">
                  <span style={{ opacity: 0.7 }}>Tổng</span>
                  <span style={{ fontWeight: 700 }}>{tongChuyen}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3>⚠️ Sự cố theo mức độ</h3></div>
            <div className="card-body">
              {['KHAN_CAP', 'CAO', 'TRUNG_BINH', 'THAP'].map(md => {
                const count = suCo.filter(s => s.mucDo === md).length;
                const labels = { 'KHAN_CAP': '🔴 Khẩn cấp', 'CAO': '🟠 Cao', 'TRUNG_BINH': '🟡 Trung bình', 'THAP': '🔵 Thấp' };
                return (
                  <div key={md} className="flex-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--gray-100)' }}>
                    <span className="text-sm">{labels[md]}</span>
                    <span className="font-bold">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
