import { useState, useEffect } from 'react';
import { xacNhanTauAPI } from '../../services/api';
import Modal from '../../components/Modal';

/**
 * UC-10: Xác nhận tàu
 * Logic theo vai trò:
 *  - XUAT_PHAT  → chỉ nút "Xác nhận xuất phát" (ghi gioDiThucTe)
 *  - DIEM_CUOI  → chỉ nút "Xác nhận vào ga"    (ghi gioDenThucTe, kết thúc)
 *  - TRUNG_GIAN → nút "Vào ga" (bước 1) rồi "Xuất phát" (bước 2)
 */
export default function XacNhanTauPage() {
    const [lichTrinhs, setLichTrinhs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedLT, setSelectedLT] = useState(null);
    const [form, setForm] = useState({ trangThai: '', daKiemTraAnToan: false, ghiChu: '' });
    const [toast, setToast] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const checkMatLienLac = async () => {
            try { await xacNhanTauAPI.kiemTraQuaHan(); } catch { /* ignore */ }
        };
        const t = setTimeout(checkMatLienLac, 10000);
        const iv = setInterval(checkMatLienLac, 45000);
        return () => { clearTimeout(t); clearInterval(iv); };
    }, []);

    const loadData = async () => {
        try {
            const res = await xacNhanTauAPI.getDanhSachChoXacNhan();
            setLichTrinhs(res.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const formatTime = (dt) => {
        if (!dt) return '---';
        const d = new Date(dt);
        return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
    };

    const getTimeDiff = (duKien) => {
        if (!duKien) return 0;
        return Math.floor((Date.now() - new Date(duKien)) / 60000);
    };

    const openXacNhan = (lt, action) => {
        setSelectedLT(lt);
        setForm({ trangThai: action, daKiemTraAnToan: false, ghiChu: '' });
        setShowModal(true);
    };

    const handleXacNhan = async () => {
        if (!form.daKiemTraAnToan) {
            showToast('Vui lòng xác nhận đã kiểm tra an toàn kỹ thuật!', 'error');
            return;
        }
        setSubmitting(true);
        try {
            const res = await xacNhanTauAPI.xacNhan({ maLichTrinh: selectedLT.maLichTrinh, ...form });
            showToast(res.data.message || 'Xác nhận thành công!');
            if (res.data.soPhutTre > 0) {
                showToast(`⚠️ Tàu trễ ${res.data.soPhutTre} phút`, 'warning');
            }
            setShowModal(false);
            loadData();
        } catch (e) {
            showToast(e.response?.data?.message || 'Lỗi khi xác nhận', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleHuyXacNhan = async (maLichTrinh) => {
        if (!confirm('Bạn có chắc muốn hủy xác nhận này?')) return;
        try {
            await xacNhanTauAPI.huyXacNhan(maLichTrinh);
            showToast('Đã hủy xác nhận thành công');
            loadData();
        } catch (e) {
            showToast(e.response?.data?.message || 'Lỗi khi hủy xác nhận', 'error');
        }
    };

    // ─── Phân loại ───────────────────────────────────────────────────────────
    // Tàu chờ xác nhận lần đầu (chưa vào ga)
    const tauChoXacNhan = lichTrinhs.filter(lt =>
        lt.trangThai === 'CHO_XAC_NHAN' || lt.trangThai === 'DA_XAC_NHAN'
    );
    // Tàu trung gian đang đỗ (đã vào ga, chưa xuất phát)
    const tauDangDo = lichTrinhs.filter(lt => lt.trangThai === 'DUNG_TAI_GA');
    const tauQuaHan = tauChoXacNhan.filter(lt => getTimeDiff(lt.gioDenDuKien) >= 10);

    // ─── Nhãn / nút theo vai trò ─────────────────────────────────────────────
    const getVaiTroLabel = (vaiTro) => {
        if (vaiTro === 'XUAT_PHAT') return { label: '🚀 Xuất phát', badge: 'badge-success' };
        if (vaiTro === 'DIEM_CUOI') return { label: '🏁 Điểm cuối', badge: 'badge-info' };
        return { label: '🔀 Trung gian', badge: 'badge-secondary' };
    };

    const renderActionButton = (lt) => {
        const vaiTro = lt.vaiTroTaiDaNang;
        if (vaiTro === 'XUAT_PHAT') {
            // Chỉ 1 nút: Xác nhận xuất phát
            return (
                <button className="btn btn-success btn-sm" style={{ width: '100%' }}
                    onClick={() => openXacNhan(lt, 'XUAT_PHAT')}>
                    🚀 Xác nhận xuất phát
                </button>
            );
        }
        if (vaiTro === 'DIEM_CUOI') {
            // Chỉ 1 nút: Xác nhận vào ga (kết thúc)
            return (
                <button className="btn btn-primary btn-sm" style={{ width: '100%' }}
                    onClick={() => openXacNhan(lt, 'VAO_GA')}>
                    🏁 Xác nhận tàu đến (kết thúc)
                </button>
            );
        }
        // TRUNG_GIAN: Bước 1 – Vào ga
        return (
            <button className="btn btn-primary btn-sm" style={{ width: '100%' }}
                onClick={() => openXacNhan(lt, 'VAO_GA')}>
                ✅ Xác nhận vào ga
            </button>
        );
    };

    // Label cho modal
    const getModalTitle = () => {
        if (!selectedLT) return '';
        const vaiTro = selectedLT.vaiTroTaiDaNang;
        if (form.trangThai === 'VAO_GA') {
            return vaiTro === 'DIEM_CUOI'
                ? '🏁 Xác nhận Tàu đến (Kết thúc hành trình)'
                : '✅ Xác nhận Tàu Vào Ga';
        }
        return '🚀 Xác nhận Tàu Xuất Phát';
    };

    return (
        <>
            {/* Toast */}
            {toast && (
                <div className="toast-container">
                    <div className={`toast ${toast.type}`}>
                        {toast.type === 'success' ? '✅' : toast.type === 'warning' ? '⚠️' : '❌'} {toast.msg}
                    </div>
                </div>
            )}

            {/* Page Header */}
            <div className="page-header">
                <div className="page-header-actions">
                    <div>
                        <p style={{ fontSize: '11px', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            UC-10: XÁC NHẬN TÀU
                        </p>
                        <h1>Xác Nhận Tàu Vào/Xuất Ga</h1>
                        <p>Xác nhận trạng thái thực tế của tàu tại sân ga theo QCVN 08:2018/BGTVT</p>
                    </div>
                    <button className="btn btn-secondary" onClick={loadData}>🔄 Làm mới</button>
                </div>
            </div>

            {/* Warning */}
            {tauQuaHan.length > 0 && (
                <div style={{ background: '#FEE2E2', border: '2px solid #DC2626', borderRadius: 'var(--radius-md)', padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '24px' }}>🚨</div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: '#991B1B', marginBottom: '4px' }}>
                            CẢNH BÁO: {tauQuaHan.length} tàu quá hạn 10 phút chưa xác nhận!
                        </div>
                        <div style={{ fontSize: '13px', color: '#991B1B' }}>
                            Hệ thống sẽ tự động tạo sự cố "Mất liên lạc" nếu không xác nhận ngay.
                        </div>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="stats-grid" style={{ marginBottom: '24px' }}>
                <div className="stat-card blue">
                    <div className="stat-info"><div className="stat-label">Chờ xác nhận</div><div className="stat-value">{tauChoXacNhan.length}</div></div>
                    <div className="stat-icon">🚂</div>
                </div>
                <div className="stat-card green">
                    <div className="stat-info"><div className="stat-label">Đang đỗ (chờ xuất phát)</div><div className="stat-value">{tauDangDo.length}</div></div>
                    <div className="stat-icon">🅿️</div>
                </div>
                <div className="stat-card red">
                    <div className="stat-info"><div className="stat-label">Quá hạn</div><div className="stat-value">{tauQuaHan.length}</div></div>
                    <div className="stat-icon">⚠️</div>
                </div>
            </div>

            {/* Bảng: Tàu chờ xác nhận lần đầu */}
            <div className="card" style={{ marginBottom: '24px' }}>
                <div className="card-header">
                    <h3>🚂 Tàu chờ xác nhận</h3>
                </div>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Chuyến tàu</th>
                                <th>Vai trò</th>
                                <th>Giờ đến/đi DK</th>
                                <th>Đường ray</th>
                                <th>Độ lệch</th>
                                <th>Trạng thái</th>
                                <th style={{ width: '220px' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" className="text-center text-muted" style={{ padding: '40px' }}>⏳ Đang tải...</td></tr>
                            ) : tauChoXacNhan.length === 0 ? (
                                <tr><td colSpan="7" className="text-center text-muted" style={{ padding: '40px' }}>Không có tàu chờ xác nhận</td></tr>
                            ) : (
                                tauChoXacNhan.map(lt => {
                                    const vaiTro = lt.vaiTroTaiDaNang;
                                    const refTime = vaiTro === 'XUAT_PHAT' ? lt.gioDiDuKien : lt.gioDenDuKien;
                                    const diff = getTimeDiff(refTime);
                                    const isOverdue = diff >= 10;
                                    const vaiTroInfo = getVaiTroLabel(vaiTro);
                                    return (
                                        <tr key={lt.maLichTrinh} style={isOverdue ? { background: '#FEE2E2', borderLeft: '4px solid #DC2626' } : {}}>
                                            <td className="font-bold text-navy">{lt.maChuyenTau}</td>
                                            <td><span className={`badge ${vaiTroInfo.badge}`}>{vaiTroInfo.label}</span></td>
                                            <td className="time-display">
                                                {vaiTro === 'XUAT_PHAT'
                                                    ? formatTime(lt.gioDiDuKien)
                                                    : vaiTro === 'DIEM_CUOI'
                                                        ? formatTime(lt.gioDenDuKien)
                                                        : `${formatTime(lt.gioDenDuKien)} / ${formatTime(lt.gioDiDuKien)}`
                                                }
                                            </td>
                                            <td><span className="ray-badge">{lt.maRay || '---'}</span></td>
                                            <td>
                                                {diff > 0 ? (
                                                    <span className={`badge ${isOverdue ? 'badge-danger' : 'badge-warning'}`}>+{diff}p</span>
                                                ) : diff < 0 ? (
                                                    <span className="badge badge-info">{diff}p</span>
                                                ) : (
                                                    <span className="text-success">⬤ Đúng giờ</span>
                                                )}
                                            </td>
                                            <td><span className="badge badge-warning">Chờ xác nhận</span></td>
                                            <td>{renderActionButton(lt)}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bảng: Tàu trung gian đang đỗ (chờ xuất phát) */}
            {tauDangDo.length > 0 && (
                <div className="card">
                    <div className="card-header">
                        <h3>🅿️ Tàu trung gian đang đỗ – chờ xuất phát</h3>
                    </div>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Chuyến tàu</th>
                                    <th>Giờ đến TT</th>
                                    <th>Giờ đi DK</th>
                                    <th>Đường ray</th>
                                    <th>Trễ</th>
                                    <th style={{ width: '250px' }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tauDangDo.map(lt => (
                                    <tr key={lt.maLichTrinh} style={{ background: 'var(--green-50)', borderLeft: '4px solid var(--green-500)' }}>
                                        <td className="font-bold text-navy">{lt.maChuyenTau}</td>
                                        <td className="time-display">{formatTime(lt.gioDenThucTe)}</td>
                                        <td className="time-display">{formatTime(lt.gioDiDuKien)}</td>
                                        <td><span className="ray-badge">{lt.maRay}</span></td>
                                        <td>
                                            {lt.soPhutTre > 0
                                                ? <span className="badge badge-danger">-{lt.soPhutTre}p</span>
                                                : <span className="text-success">⬤ 0</span>
                                            }
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button className="btn btn-success btn-sm" style={{ flex: 1 }}
                                                    onClick={() => openXacNhan(lt, 'XUAT_PHAT')}>
                                                    🚀 Xuất phát
                                                </button>
                                                <button className="btn btn-secondary btn-sm" title="Hủy xác nhận"
                                                    onClick={() => handleHuyXacNhan(lt.maLichTrinh)}>
                                                    ↩️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal xác nhận */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={getModalTitle()}
                subtitle={`Chuyến tàu: ${selectedLT?.maChuyenTau || ''}`}
                size="md"
            >
                {selectedLT && (
                    <>
                        {/* Thông tin tóm tắt */}
                        <div style={{ background: 'var(--navy-50)', padding: '16px', borderRadius: 'var(--radius)', marginBottom: '20px', border: '1px solid var(--navy-200)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                                <div>
                                    <div style={{ color: 'var(--gray-600)', marginBottom: '4px' }}>Mã lịch trình</div>
                                    <div style={{ fontWeight: 600, color: 'var(--navy-800)' }}>{selectedLT.maLichTrinh}</div>
                                </div>
                                <div>
                                    <div style={{ color: 'var(--gray-600)', marginBottom: '4px' }}>Đường ray</div>
                                    <div style={{ fontWeight: 600, color: 'var(--navy-800)' }}>{selectedLT.maRay || '---'}</div>
                                </div>
                                <div>
                                    <div style={{ color: 'var(--gray-600)', marginBottom: '4px' }}>
                                        {form.trangThai === 'VAO_GA' ? 'Giờ đến dự kiến' : 'Giờ đi dự kiến'}
                                    </div>
                                    <div style={{ fontWeight: 600, color: 'var(--navy-800)' }}>
                                        {formatTime(form.trangThai === 'VAO_GA' ? selectedLT.gioDenDuKien : selectedLT.gioDiDuKien)}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ color: 'var(--gray-600)', marginBottom: '4px' }}>Thời gian hiện tại</div>
                                    <div style={{ fontWeight: 600, color: 'var(--green-600)' }}>
                                        {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>

                            {/* Ghi chú đặc biệt cho DIEM_CUOI */}
                            {selectedLT.vaiTroTaiDaNang === 'DIEM_CUOI' && (
                                <div style={{ marginTop: '12px', padding: '8px 12px', background: '#EFF6FF', borderRadius: '6px', border: '1px solid #BFDBFE', fontSize: '12px', color: '#1D4ED8' }}>
                                    ℹ️ Tàu điểm cuối – Sau xác nhận hành trình tại ga Đà Nẵng sẽ kết thúc. Không cần xác nhận xuất phát.
                                </div>
                            )}
                            {selectedLT.vaiTroTaiDaNang === 'XUAT_PHAT' && (
                                <div style={{ marginTop: '12px', padding: '8px 12px', background: '#F0FDF4', borderRadius: '6px', border: '1px solid #BBF7D0', fontSize: '12px', color: '#166534' }}>
                                    ℹ️ Tàu xuất phát – Ghi nhận giờ xuất phát thực tế.
                                </div>
                            )}
                        </div>

                        {/* Checkbox an toàn */}
                        <div style={{ background: 'var(--yellow-50)', border: '2px solid var(--yellow-500)', borderRadius: 'var(--radius)', padding: '16px', marginBottom: '20px' }}>
                            <label style={{ display: 'flex', alignItems: 'start', gap: '12px', cursor: 'pointer' }}>
                                <input type="checkbox" checked={form.daKiemTraAnToan}
                                    onChange={(e) => setForm({ ...form, daKiemTraAnToan: e.target.checked })}
                                    style={{ marginTop: '2px', width: '18px', height: '18px' }} />
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--gray-800)', marginBottom: '4px' }}>
                                        ✓ Xác nhận an toàn kỹ thuật (QCVN 08:2018/BGTVT)
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--gray-600)', lineHeight: '1.5' }}>
                                        Tôi xác nhận đã kiểm tra đường {form.trangThai === 'VAO_GA' ? 'đón' : 'gửi'} tàu thông thoáng
                                        và các bộ ghi đã khóa an toàn theo quy định.
                                    </div>
                                </div>
                            </label>
                        </div>

                        {/* Ghi chú */}
                        <div className="form-group">
                            <label className="form-label">GHI CHÚ VẬN HÀNH (Tùy chọn)</label>
                            <textarea className="form-control" value={form.ghiChu}
                                onChange={(e) => setForm({ ...form, ghiChu: e.target.value })}
                                rows="3" placeholder="Ghi chú về tình hình hành khách, vấn đề phát sinh..."
                                style={{ resize: 'vertical' }} />
                        </div>

                        {/* Actions */}
                        <div className="modal-footer" style={{ padding: '16px 0 0', borderTop: '1px solid var(--gray-200)' }}>
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={submitting}>Hủy</button>
                            <button className="btn btn-primary" onClick={handleXacNhan}
                                disabled={!form.daKiemTraAnToan || submitting}
                                style={{ opacity: !form.daKiemTraAnToan ? 0.5 : 1, cursor: !form.daKiemTraAnToan ? 'not-allowed' : 'pointer' }}>
                                {submitting ? '⏳ Đang xử lý...' :
                                    form.trangThai === 'VAO_GA'
                                        ? (selectedLT.vaiTroTaiDaNang === 'DIEM_CUOI' ? '🏁 Xác nhận tàu đến' : '✅ Xác nhận vào ga')
                                        : '🚀 Xác nhận xuất phát'
                                }
                            </button>
                        </div>
                    </>
                )}
            </Modal>
        </>
    );
}
