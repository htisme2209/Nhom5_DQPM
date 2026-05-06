import { useState, useEffect, useMemo } from 'react';
import { lichTrinhAPI, suCoAPI } from '../../services/api'; // Đã thêm suCoAPI vào đây
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// --- Hàm Helper Ánh xạ Dữ liệu ---
const mapVaiTro = (val) => {
  switch (val) {
    case 'XUAT_PHAT': return 'Xuất Phát';
    case 'DIEM_CUOI': return 'Điểm Cuối';
    case 'TRUNG_GIAN': return 'Trung Gian';
    default: return val || '---';
  }
};

const mapLoaiTau = (val) => {
  switch (val) {
    case 'TAU_KHACH': return 'Tàu Khách';
    case 'TAU_NHANH': return 'Tàu Nhanh';
    case 'TAU_HANG': return 'Tàu Hàng';
    default: return val || '---';
  }
};

const mapTrangThai = (val) => {
  switch (val) {
    case 'DA_ROI_GA': return 'Đã rời ga';
    case 'DA_XAC_NHAN': return 'Đã xác nhận';
    case 'CHO_XAC_NHAN': return 'Chờ xác nhận';
    case 'DUNG_TAI_GA': return 'Đang đỗ';
    case 'TRE': return 'Báo trễ';
    case 'HUY': return 'Đã hủy';
    default: return val || '---';
  }
};

const mapLoaiSuCo = (val) => {
  switch (val) {
    case 'SU_CO_KY_THUAT': return 'Sự cố Kỹ thuật';
    case 'SU_CO_CO_SO_HA_TANG': return 'Sự cố Cơ sở hạ tầng';
    case 'SU_CO_DIEU_HANH': return 'Sự cố Điều hành';
    case 'SU_CO_THOI_TIET': return 'Sự cố Thời tiết';
    case 'MAT_LIEN_LAC': return 'Sự cố Mất liên lạc';
    default: return val || 'Sự cố Khác';
  }
};

const mapMucDo = (val) => {
  switch (val) {
    case 'THAP': return 'Thấp';
    case 'TRUNG_BINH': return 'Trung bình';
    case 'CAO': return 'Cao';
    case 'NGHIEM_TRONG': return 'Nghiêm trọng';
    default: return val || '---';
  }
};

export default function XuatBaoCaoPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // --- STATE ---
  const [allLichTrinh, setAllLichTrinh] = useState([]);
  const [allSuCo, setAllSuCo] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [format, setFormat] = useState('PDF'); 
  
  const [dateRange, setDateRange] = useState({
    from: '2026-04-01',
    to: '2026-04-30'
  });
  
  const [filters, setFilters] = useState({
    loaiTau: 'ALL',
    vaiTro: 'ALL',
    trangThaiTre: 'ALL',
    trangThaiLT: 'ALL',
    maRay: 'ALL',
    coSuCo: 'ALL'
  });

  // --- TẢI DỮ LIỆU TỪ BACKEND (Dùng API chuẩn) ---
  const loadData = async () => {
    setLoading(true);
    
    // 1. Tải Lịch Trình
    try {
      const resLT = await lichTrinhAPI.getAll({});
      setAllLichTrinh(resLT.data?.data || resLT.data || []);
    } catch (e) { 
      console.error("Lỗi khi tải dữ liệu Lịch trình:", e); 
    }
    
    // 2. Tải Sự Cố bằng axios chuẩn (tự động đính kèm token)
    try {
      const resSC = await suCoAPI.getAll();
      setAllSuCo(resSC.data?.data || resSC.data || []);
    } catch (errSC) { 
      console.warn("Chưa lấy được Sự cố, nhưng Lịch trình vẫn chạy tốt:", errSC); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { loadData(); }, []);

  // --- LOGIC LỌC & THỐNG KÊ ---
  const reportData = useMemo(() => {
    const filtered = allLichTrinh.filter(lt => {
      // 1. Lọc theo ngày
      const dateStr = lt.ngayTao || lt.gioDenDuKien;
      if (!dateStr) return false;
      const date = dateStr.split('T')[0];
      if (date < dateRange.from || date > dateRange.to) return false;

      // Trích xuất
      const loaiTauLt = lt.chuyenTau?.tau?.loaiTau;
      const vaiTroLt = lt.chuyenTau?.vaiTroTaiDaNang;
      const phutTre = lt.soPhutTre || 0;
      const maRayLt = lt.maRay || 'NULL';
      const coSuCoLt = lt.maSuCoAnhHuong ? true : false;

      // 2. Lọc các tiêu chí
      if (filters.loaiTau !== 'ALL' && loaiTauLt !== filters.loaiTau) return false;
      if (filters.vaiTro !== 'ALL' && vaiTroLt !== filters.vaiTro) return false;
      if (filters.trangThaiTre === 'ON_TIME' && phutTre > 0) return false;
      if (filters.trangThaiTre === 'LATE_LIGHT' && (phutTre === 0 || phutTre > 15)) return false;
      if (filters.trangThaiTre === 'LATE_HEAVY' && phutTre <= 15) return false;
      if (filters.trangThaiLT !== 'ALL' && lt.trangThai !== filters.trangThaiLT) return false;
      if (filters.maRay !== 'ALL' && maRayLt !== filters.maRay) return false;
      if (filters.coSuCo === 'YES' && !coSuCoLt) return false;
      if (filters.coSuCo === 'NO' && coSuCoLt) return false;

      return true;
    });

    const tongChuyen = filtered.length;
    const dungGio = filtered.filter(lt => (lt.soPhutTre || 0) === 0).length;
    const chuyenTre = tongChuyen - dungGio;
    const tyLeOnTime = tongChuyen > 0 ? ((dungGio / tongChuyen) * 100).toFixed(1) : 0;
    const treTB = tongChuyen > 0 ? (filtered.reduce((sum, lt) => sum + (lt.soPhutTre || 0), 0) / tongChuyen).toFixed(1) : 0;

    const statsRole = {
      XUAT_PHAT: { total: 0, onTime: 0 },
      DIEM_CUOI: { total: 0, onTime: 0 },
      TRUNG_GIAN: { total: 0, onTime: 0 }
    };
    const statsType = {
      TAU_HANG: { total: 0, delaySum: 0 },
      TAU_KHACH: { total: 0, delaySum: 0 },
      TAU_NHANH: { total: 0, delaySum: 0 }
    };

    filtered.forEach(lt => {
      const vaiTro = lt.chuyenTau?.vaiTroTaiDaNang;
      const loaiTau = lt.chuyenTau?.tau?.loaiTau;
      const phutTre = lt.soPhutTre || 0;

      if (statsRole[vaiTro] !== undefined) {
        statsRole[vaiTro].total += 1;
        if (phutTre === 0) statsRole[vaiTro].onTime += 1;
      }
      if (statsType[loaiTau] !== undefined) {
        statsType[loaiTau].total += 1;
        statsType[loaiTau].delaySum += phutTre;
      }
    });

    return { 
      filtered, tongChuyen, tyLeOnTime, treTB, chuyenTre, statsRole, statsType
    };
  }, [allLichTrinh, dateRange, filters]);

  // --- LOGIC LỌC DANH SÁCH SỰ CỐ CHI TIẾT ---
  const incidentsInReport = useMemo(() => {
    const uniqueIncidentIds = [...new Set(reportData.filtered
      .map(lt => lt.maSuCoAnhHuong)
      .filter(id => id != null && id !== ''))];

    return allSuCo.filter(sc => uniqueIncidentIds.includes(sc.maSuCo));
  }, [reportData.filtered, allSuCo]);

  // --- XUẤT EXCEL ---
  const exportToExcel = () => {
    if (reportData.filtered.length === 0) return alert("Không có dữ liệu để xuất!");
    let csvContent = "\uFEFF"; 
    csvContent += "Mã Chuyến,Tên Tàu,Loại Tàu,Vai Trò,Ray Đỗ,Phút Trễ,Trạng Thái,Sự Cố,Thời Gian\n";
    
    reportData.filtered.forEach(lt => {
      const tenTau = lt.chuyenTau?.tau?.tenTau || '---';
      const loaiTau = mapLoaiTau(lt.chuyenTau?.tau?.loaiTau);
      const vaiTro = mapVaiTro(lt.chuyenTau?.vaiTroTaiDaNang);
      const thoiGian = (lt.ngayTao || lt.gioDenDuKien || '').split('T')[0];
      const suCo = lt.maSuCoAnhHuong ? lt.maSuCoAnhHuong : 'Không';
      
      csvContent += `${lt.maChuyenTau},${tenTau},${loaiTau},${vaiTro},${lt.maRay || '---'},${lt.soPhutTre},${mapTrangThai(lt.trangThai)},${suCo},${thoiGian}\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Thong_Ke_Ga_Da_Nang_${dateRange.from}.csv`;
    link.click();
  };

  const handleAction = () => {
    if (format === 'PDF') window.print();
    else exportToExcel();
  };

  const calcPercent = (onTime, total) => total > 0 ? ((onTime/total)*100).toFixed(1) + '%' : 'N/A';
  const calcAvg = (sum, total) => total > 0 ? (sum/total).toFixed(1) + 'p' : 'N/A';

  if (loading) return <div className="flex-center" style={{height: '100vh'}}>⌛ Đang tổng hợp dữ liệu...</div>;

  return (
    <div className="report-container-global" style={{ 
      backgroundColor: '#f4f7f6', minHeight: '100vh', display: 'flex', 
      flexDirection: 'column', alignItems: 'center', padding: '40px 20px' 
    }}>
      
      <div style={{ width: '100%', maxWidth: '1200px', marginBottom: '20px' }} className="no-print">
        <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>← Quay lại</button>
      </div>

      <div className="main-layout" style={{ 
        display: 'grid', gridTemplateColumns: '320px 1fr', gap: '30px', 
        width: '100%', maxWidth: '1250px', alignItems: 'start' 
      }}>
        
        {/* ================= CỘT TRÁI: BỘ LỌC ================= */}
        <div className="config-sidebar no-print" style={{ position: 'sticky', top: '20px', maxHeight: '90vh', overflowY: 'auto' }}>
          <div className="card shadow-lg" style={{ padding: '20px', background: '#fff', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '18px', fontWeight: 800 }}>⚙️ Cấu hình Thống kê</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '5px' }}>ĐỊNH DẠNG</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button className={`btn btn-sm ${format === 'PDF' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFormat('PDF')}>📄 PDF</button>
                <button className={`btn btn-sm ${format === 'EXCEL' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFormat('EXCEL')}>📊 EXCEL</button>
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '5px' }}>THỜI GIAN</label>
              <input type="date" className="form-control form-control-sm mb-1" value={dateRange.from} onChange={e => setDateRange({...dateRange, from: e.target.value})} />
              <input type="date" className="form-control form-control-sm" value={dateRange.to} onChange={e => setDateRange({...dateRange, to: e.target.value})} />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '5px' }}>TRẠNG THÁI LỊCH TRÌNH</label>
              <select className="form-control form-control-sm" value={filters.trangThaiLT} onChange={e => setFilters({...filters, trangThaiLT: e.target.value})}>
                <option value="ALL">Tất cả trạng thái</option>
                <option value="DA_ROI_GA">Chỉ tính Đã Rời Ga</option>
                <option value="HUY">Chỉ tính Chuyến Hủy</option>
                <option value="DA_XAC_NHAN">Đã xác nhận</option>
                <option value="CHO_XAC_NHAN">Chờ xác nhận</option>
              </select>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '5px' }}>TÌNH TRẠNG SỰ CỐ</label>
              <select className="form-control form-control-sm" value={filters.coSuCo} onChange={e => setFilters({...filters, coSuCo: e.target.value})}>
                <option value="ALL">Tất cả (Có & Không)</option>
                <option value="YES">Chỉ tàu CÓ dính sự cố</option>
                <option value="NO">Chỉ tàu KHÔNG sự cố</option>
              </select>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '5px' }}>ĐƯỜNG RAY ĐỖ</label>
              <select className="form-control form-control-sm" value={filters.maRay} onChange={e => setFilters({...filters, maRay: e.target.value})}>
                <option value="ALL">Tất cả đường ray</option>
                <option value="RAY-01">Ray 01</option>
                <option value="RAY-02">Ray 02</option>
                <option value="RAY-03">Ray 03</option>
                <option value="RAY-04">Ray 04</option>
                <option value="RAY-05">Ray 05</option>
                <option value="RAY-06">Ray 06</option>
              </select>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '5px' }}>LOẠI TÀU</label>
              <select className="form-control form-control-sm" value={filters.loaiTau} onChange={e => setFilters({...filters, loaiTau: e.target.value})}>
                <option value="ALL">Tất cả loại tàu</option>
                <option value="TAU_KHACH">Tàu Khách</option>
                <option value="TAU_NHANH">Tàu Nhanh (SE)</option>
                <option value="TAU_HANG">Tàu Hàng (HD)</option>
              </select>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '5px' }}>VAI TRÒ CHUYẾN</label>
              <select className="form-control form-control-sm" value={filters.vaiTro} onChange={e => setFilters({...filters, vaiTro: e.target.value})}>
                <option value="ALL">Tất cả vai trò</option>
                <option value="XUAT_PHAT">Xuất Phát từ Đà Nẵng</option>
                <option value="DIEM_CUOI">Điểm Cuối tại Đà Nẵng</option>
                <option value="TRUNG_GIAN">Trung Gian (Đi ngang)</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '5px' }}>TRẠNG THÁI TRỄ</label>
              <select className="form-control form-control-sm" value={filters.trangThaiTre} onChange={e => setFilters({...filters, trangThaiTre: e.target.value})}>
                <option value="ALL">Tất cả thời gian</option>
                <option value="ON_TIME">Đúng giờ (0 phút)</option>
                <option value="LATE_LIGHT">Trễ nhẹ (1 - 15 phút)</option>
                <option value="LATE_HEAVY">Trễ nặng (hơn 15 phút)</option>
              </select>
            </div>

            <button className="btn btn-primary w-full shadow" style={{ background: '#1e293b', padding: '12px', fontWeight: 800, borderRadius: '8px', fontSize: '14px' }} onClick={handleAction}>
              {format === 'PDF' ? '🖨️ IN / LƯU PDF' : '📥 TẢI CSV'}
            </button>
          </div>
        </div>

        {/* ================= CỘT PHẢI: TỜ BÁO CÁO A4 ================= */}
        <div className="report-preview-column" style={{ display: 'flex', justifyContent: 'center' }}>
          <div id="printable-area" style={{ 
            width: '210mm', minHeight: '297mm', backgroundColor: '#fff', 
            padding: '20mm 15mm', boxShadow: '0 10px 50px rgba(0,0,0,0.1)',
            boxSizing: 'border-box', position: 'relative', borderRadius: '4px'
          }}>
            {/* --- HEADER --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '12px' }}>TỔNG CÔNG TY ĐƯỜNG SẮT VN</h4>
                <h3 style={{ margin: '3px 0 0', fontSize: '14px', fontWeight: 900 }}>GA ĐÀ NẴNG</h3>
              </div>
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '12px', fontWeight: 900 }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h4>
                <p style={{ margin: '3px 0 0', fontSize: '11px', fontWeight: 700 }}>Độc lập - Tự do - Hạnh phúc</p>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 900, margin: '0' }}>BÁO CÁO THỐNG KÊ VẬN HÀNH CHI TIẾT</h2>
              <p style={{ fontStyle: 'italic', fontSize: '13px', marginTop: '8px' }}>
                (Dữ liệu hệ thống từ ngày {new Date(dateRange.from).toLocaleDateString('vi-VN')} đến {new Date(dateRange.to).toLocaleDateString('vi-VN')})
              </p>
            </div>

            {/* --- PHẦN I: TỔNG QUAN --- */}
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 900, borderLeft: '4px solid #000', paddingLeft: '8px', marginBottom: '15px' }}>I. CHỈ SỐ TỔNG QUAN</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                <div style={{ border: '1px solid #000', padding: '12px', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '11px', fontWeight: 700 }}>TỔNG LƯỢT TÀU</p>
                  <h4 style={{ margin: '5px 0 0', fontSize: '18px', fontWeight: 900 }}>{reportData.tongChuyen}</h4>
                </div>
                <div style={{ border: '1px solid #000', padding: '12px', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '11px', fontWeight: 700 }}>TỶ LỆ ON-TIME</p>
                  <h4 style={{ margin: '5px 0 0', fontSize: '18px', fontWeight: 900, color: '#16a34a' }}>{reportData.tyLeOnTime}%</h4>
                </div>
                <div style={{ border: '1px solid #000', padding: '12px', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '11px', fontWeight: 700 }}>TRỄ BÌNH QUÂN</p>
                  <h4 style={{ margin: '5px 0 0', fontSize: '18px', fontWeight: 900, color: '#ef4444' }}>{reportData.treTB}p</h4>
                </div>
                <div style={{ border: '1px solid #000', padding: '12px', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '11px', fontWeight: 700 }}>SỐ CHUYẾN TRỄ</p>
                  <h4 style={{ margin: '5px 0 0', fontSize: '18px', fontWeight: 900 }}>{reportData.chuyenTre}</h4>
                </div>
              </div>
            </div>

            {/* --- PHẦN II: PHÂN TÍCH CHUYÊN SÂU --- */}
            <div style={{ marginBottom: '25px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 900, borderLeft: '4px solid #000', paddingLeft: '8px', marginBottom: '10px' }}>II.1. ĐÚNG GIỜ THEO VAI TRÒ</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ border: '1px solid #000', padding: '6px' }}>Vai Trò</th>
                      <th style={{ border: '1px solid #000', padding: '6px' }}>Tổng</th>
                      <th style={{ border: '1px solid #000', padding: '6px' }}>% Đúng Giờ</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 700 }}>Xuất Phát</td>
                      <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{reportData.statsRole.XUAT_PHAT.total}</td>
                      <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 800 }}>{calcPercent(reportData.statsRole.XUAT_PHAT.onTime, reportData.statsRole.XUAT_PHAT.total)}</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 700 }}>Điểm Cuối</td>
                      <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{reportData.statsRole.DIEM_CUOI.total}</td>
                      <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 800 }}>{calcPercent(reportData.statsRole.DIEM_CUOI.onTime, reportData.statsRole.DIEM_CUOI.total)}</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 700 }}>Trung Gian</td>
                      <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{reportData.statsRole.TRUNG_GIAN.total}</td>
                      <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 800 }}>{calcPercent(reportData.statsRole.TRUNG_GIAN.onTime, reportData.statsRole.TRUNG_GIAN.total)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 900, borderLeft: '4px solid #000', paddingLeft: '8px', marginBottom: '10px' }}>II.2. PHÚT TRỄ BÌNH QUÂN THEO LOẠI</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ border: '1px solid #000', padding: '6px' }}>Loại Tàu</th>
                      <th style={{ border: '1px solid #000', padding: '6px' }}>Tổng</th>
                      <th style={{ border: '1px solid #000', padding: '6px' }}>TB Trễ</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 700 }}>Tàu Nhanh</td>
                      <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{reportData.statsType.TAU_NHANH.total}</td>
                      <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', color: '#ef4444', fontWeight: 800 }}>{calcAvg(reportData.statsType.TAU_NHANH.delaySum, reportData.statsType.TAU_NHANH.total)}</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 700 }}>Tàu Khách</td>
                      <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{reportData.statsType.TAU_KHACH.total}</td>
                      <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', color: '#ef4444', fontWeight: 800 }}>{calcAvg(reportData.statsType.TAU_KHACH.delaySum, reportData.statsType.TAU_KHACH.total)}</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 700 }}>Tàu Hàng</td>
                      <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{reportData.statsType.TAU_HANG.total}</td>
                      <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', color: '#ef4444', fontWeight: 800 }}>{calcAvg(reportData.statsType.TAU_HANG.delaySum, reportData.statsType.TAU_HANG.total)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* --- PHẦN III: CHI TIẾT --- */}
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 900, borderLeft: '4px solid #000', paddingLeft: '8px', marginBottom: '15px' }}>III. DANH SÁCH CHI TIẾT</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9' }}>
                    <th style={{ border: '1px solid #000', padding: '6px', width: '15%' }}>Mã Chuyến</th>
                    <th style={{ border: '1px solid #000', padding: '6px', width: '15%' }}>Loại Tàu</th>
                    <th style={{ border: '1px solid #000', padding: '6px', width: '15%' }}>Vai Trò</th>
                    <th style={{ border: '1px solid #000', padding: '6px', width: '10%' }}>Ray</th>
                    <th style={{ border: '1px solid #000', padding: '6px', width: '15%' }}>Trạng Thái</th>
                    <th style={{ border: '1px solid #000', padding: '6px', width: '15%' }}>Sự Cố</th>
                    <th style={{ border: '1px solid #000', padding: '6px', width: '10%' }}>Trễ(p)</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.filtered.length > 0 ? reportData.filtered.map((lt, idx) => (
                    <tr key={idx} style={{ pageBreakInside: 'avoid' }}>
                      <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 700 }}>{lt.maChuyenTau}</td>
                      <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{mapLoaiTau(lt.chuyenTau?.tau?.loaiTau)}</td>
                      <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{mapVaiTro(lt.chuyenTau?.vaiTroTaiDaNang)}</td>
                      <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{lt.maRay || '---'}</td>
                      <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{mapTrangThai(lt.trangThai)}</td>
                      
                      <td style={{ 
                        border: '1px solid #000', 
                        padding: '6px', 
                        textAlign: 'center',
                        color: lt.maSuCoAnhHuong ? '#ef4444' : '#64748b',
                        fontWeight: lt.maSuCoAnhHuong ? 'bold' : 'normal'
                      }}>
                        {lt.maSuCoAnhHuong || 'Không'}
                      </td>
                      
                      <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right', fontWeight: 800, color: (lt.soPhutTre || 0) > 0 ? '#ef4444' : '#000' }}>{lt.soPhutTre || 0}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="7" style={{ border: '1px solid #000', padding: '20px', textAlign: 'center' }}>Không có dữ liệu thỏa mãn điều kiện lọc</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* --- PHẦN IV: DIỄN GIẢI SỰ CỐ --- */}
            {incidentsInReport.length > 0 && (
              <div style={{ marginTop: '25px', pageBreakInside: 'avoid' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 900, borderLeft: '4px solid #000', paddingLeft: '8px', marginBottom: '10px' }}>
                  IV. CHI TIẾT NỘI DUNG SỰ CỐ GHI NHẬN
                </h3>
                <div style={{ 
                  border: '1px solid #000', 
                  padding: '15px', 
                  backgroundColor: '#fffcf5', 
                  fontSize: '12px',
                  lineHeight: '1.6'
                }}>
                  {incidentsInReport.map((sc, index) => (
                    <div key={sc.maSuCo} style={{ marginBottom: index === incidentsInReport.length - 1 ? 0 : '10px' }}>
                      <strong>• Mã {sc.maSuCo}:</strong> {sc.moTa} 
                      <span style={{ fontStyle: 'italic', color: '#64748b' }}> 
                        {' '}(Loại: {mapLoaiSuCo(sc.loaiSuCo)}, Mức độ: {mapMucDo(sc.mucDo)})
                      </span>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: '11px', fontStyle: 'italic', marginTop: '5px', color: '#64748b' }}>
                  * Ghi chú: Chi tiết về phương án xử lý kỹ thuật vui lòng tra cứu trong module Quản lý Sự cố.
                </p>
              </div>
            )}

            {/* --- CHỮ KÝ --- */}
            <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', fontSize: '13px', pageBreakInside: 'avoid' }}>
              <div style={{ textAlign: 'center', width: '220px' }}>
                <p style={{ fontWeight: 800, margin: 0 }}>NGƯỜI LẬP BIỂU</p>
                <p style={{ fontSize: '11px', fontStyle: 'italic', marginBottom: '60px' }}>(Ký và ghi rõ họ tên)</p>
                <p style={{ fontWeight: 900 }}>{user?.hoTen || 'Nguyễn Phước Quý Bửu'}</p>
              </div>
              <div style={{ textAlign: 'center', width: '250px' }}>
                <p style={{ margin: 0 }}>Đà Nẵng, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</p>
                <p style={{ fontWeight: 800, marginTop: '5px' }}>XÁC NHẬN BAN QUẢN LÝ</p>
                <div style={{ marginBottom: '60px' }}></div>
                <p style={{ fontWeight: 900 }}>Trương Quang Vinh</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* --- CSS CHO CHẾ ĐỘ IN ẤN --- */}
      <style>{`
        @media print {
          @page { size: A4; margin: 20mm 15mm 20mm 15mm; }
          body { background: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .no-print, button { display: none !important; }
          body * { visibility: hidden; }
          #printable-area, #printable-area * { visibility: visible; }
          #printable-area {
            position: absolute !important; left: 0 !important; top: 0 !important;
            width: 100% !important; box-shadow: none !important; margin: 0 !important; padding: 0 !important;
          }
          thead { display: table-header-group; }
          table { width: 100% !important; border-collapse: collapse; }
        }
      `}</style>
    </div>
  );
}