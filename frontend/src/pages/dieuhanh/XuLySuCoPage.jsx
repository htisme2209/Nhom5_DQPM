import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { suCoAPI, duongRayAPI } from '../../services/api';

// ─── Trạng thái config ─────────────────────────────────────────────────────
const TRANG_THAI_CONFIG = {
    CHO_TIEP_NHAN: {
        label: 'Chờ tiếp nhận', icon: '⏳',
        bg: '#FEF3C7', color: '#92400E', border: '#FCD34D', badgeBg: '#FFFBEB', dot: '#F59E0B'
    },
    DANG_XU_LY: {
        label: 'Đang xử lý', icon: '🟡',
        bg: '#FFFBEB', color: '#D97706', border: '#FCD34D', badgeBg: '#FFFBEB', dot: '#F59E0B'
    },
    DA_XU_LY: {
        label: 'Đã xử lý', icon: '🟢',
        bg: '#F0FDF4', color: '#16A34A', border: '#86EFAC', badgeBg: '#F0FDF4', dot: '#22C55E'
    }
};

function TrangThaiBadge({ trangThai, size = 'sm' }) {
    const cfg = TRANG_THAI_CONFIG[trangThai] || TRANG_THAI_CONFIG.CHO_TIEP_NHAN;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            padding: size === 'lg' ? '6px 14px' : '3px 10px',
            borderRadius: '20px', fontSize: size === 'lg' ? '13px' : '11px',
            fontWeight: 600, background: cfg.badgeBg, color: cfg.color,
            border: `1px solid ${cfg.border}`, whiteSpace: 'nowrap'
        }}>
            <span style={{
                width: size === 'lg' ? '8px' : '6px', height: size === 'lg' ? '8px' : '6px',
                borderRadius: '50%', background: cfg.dot, display: 'inline-block', flexShrink: 0,
                animation: trangThai === 'DANG_XU_LY' ? 'pulse 1.5s infinite' : 'none'
            }} />
            {cfg.label}
        </span>
    );
}

export default function XuLySuCoPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [suCos, setSuCos] = useState([]);
    const [selectedSuCo, setSelectedSuCo] = useState(null);
    const [lichTrinhBiAnhHuong, setLichTrinhBiAnhHuong] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState({});
    const [toast, setToast] = useState(null);
    const [filterTab, setFilterTab] = useState('CHO_TIEP_NHAN');
    const [confirmHuy, setConfirmHuy] = useState(null);

    // ═══ SLA State ═══
    const [slaInfo, setSlaInfo] = useState(null); // { trangThaiSLA, hanChot, giayConLai }
    const [slaCountdown, setSlaCountdown] = useState(null); // string "MM:SS"

    // Modal Tiếp nhận & Đánh giá
    const [showTiepNhanModal, setShowTiepNhanModal] = useState(false);
    const [tiepNhanForm, setTiepNhanForm] = useState({
        mucDo: 'TRUNG_BINH',
        coPhongToaRay: true,
        loaiPhongToa: 'PHONG_TOA_TAM',
        thoiGianXuLyUocTinh: '',
    });
    const [tiepNhanLoading, setTiepNhanLoading] = useState(false);

    const loadSuCos = useCallback(async () => {
        try {
            const res = await suCoAPI.getAll();
            const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            setSuCos(data);
            return data;
        } catch (err) { console.error(err); setSuCos([]); return []; }
    }, []);

    // Load ban đầu + polling 30s
    useEffect(() => {
        loadSuCos();
        const interval = setInterval(loadSuCos, 30000);
        return () => clearInterval(interval);
    }, [loadSuCos]);

    // ═══ SLA Polling: mỗi 10s lấy SLA info cho sự cố đang chọn ═══
    useEffect(() => {
        if (!selectedSuCo || selectedSuCo.trangThaiXuLy !== 'DANG_XU_LY') {
            setSlaInfo(null); setSlaCountdown(null); return;
        }
        const fetchSla = async () => {
            try {
                const res = await suCoAPI.getSlaInfo(selectedSuCo.maSuCo);
                const data = res.data?.data || res.data;
                setSlaInfo(data);
            } catch { /* ignore */ }
        };
        fetchSla();
        const interval = setInterval(fetchSla, 10000);
        return () => clearInterval(interval);
    }, [selectedSuCo?.maSuCo, selectedSuCo?.trangThaiXuLy]);

    // ═══ SLA Countdown ticker: mỗi 1s cập nhật đồng hồ đếm ngược ═══
    useEffect(() => {
        if (!slaInfo?.giayConLai && slaInfo?.giayConLai !== 0) {
            setSlaCountdown(null); return;
        }
        let remaining = slaInfo.giayConLai;
        const format = (s) => {
            if (s <= 0) return '00:00';
            const m = Math.floor(s / 60);
            const sec = s % 60;
            return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
        };
        setSlaCountdown(format(remaining));
        const tick = setInterval(() => {
            remaining--;
            setSlaCountdown(format(remaining));
            // Trigger browser notification sound at T-5
            if (remaining === 300) {
                try { new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10LBAAAAEAAQARIwAAESMAABAAAAAQ').play(); } catch {}
            }
        }, 1000);
        return () => clearInterval(tick);
    }, [slaInfo?.giayConLai]);

    // Tự động chọn sự cố từ URL param (NVNH chuyển sang sau khi gửi báo cáo)
    useEffect(() => {
        const suCoId = searchParams.get('suCoId');
        if (suCoId && suCos.length > 0) {
            const found = suCos.find(s => s.maSuCo === suCoId);
            if (found && (!selectedSuCo || selectedSuCo.maSuCo !== suCoId)) {
                handleSelectSuCo(found);
                setFilterTab(found.trangThaiXuLy || 'CHO_TIEP_NHAN');
            }
        }
    }, [suCos, searchParams]);

    const loadLichTrinhBiAnhHuong = async (maSuCo) => {
        try {
            const res = await suCoAPI.getLichTrinhAnhHuong(maSuCo);
            const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            setLichTrinhBiAnhHuong(data);
        } catch (err) {
            console.error(err);
            setLichTrinhBiAnhHuong([]);
            showToast(err.response?.data?.message || err.message, 'error');
        }
    };

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const handleSelectSuCo = (suCo) => {
        setSelectedSuCo(suCo);
        loadLichTrinhBiAnhHuong(suCo.maSuCo);
    };


    // ── Tiếp nhận & Đánh giá: CHO_TIEP_NHAN → DANG_XU_LY ───────────────────
    const handleMoModalTiepNhan = () => {
        if (!selectedSuCo) return;
        setTiepNhanForm({
            mucDo: selectedSuCo.mucDo || 'TRUNG_BINH',
            coPhongToaRay: !!selectedSuCo.maRay,
            loaiPhongToa: 'PHONG_TOA_TAM',
            thoiGianXuLyUocTinh: selectedSuCo.thoiGianXuLyUocTinh || '',
        });
        setShowTiepNhanModal(true);
    };

    const handleXacNhanTiepNhan = async () => {
        if (!selectedSuCo) return;

        if (tiepNhanForm.coPhongToaRay && tiepNhanForm.loaiPhongToa === 'PHONG_TOA_TAM') {
            if (!tiepNhanForm.thoiGianXuLyUocTinh || parseInt(tiepNhanForm.thoiGianXuLyUocTinh) <= 0) {
                showToast('Vui lòng điền Thời gian xử lý ước tính hợp lệ!', 'error');
                return;
            }
        }

        setTiepNhanLoading(true);
        try {
            await suCoAPI.tiepNhan(selectedSuCo.maSuCo, tiepNhanForm);
            showToast('✅ Tiếp nhận sự cố thành công! Đường ray đã phong tỏa, lịch trình bị ảnh hưởng đã được quét.');
            setShowTiepNhanModal(false);
            const newList = await loadSuCos();
            const refreshed = newList.find(s => s.maSuCo === selectedSuCo.maSuCo);
            if (refreshed) { setSelectedSuCo(refreshed); loadLichTrinhBiAnhHuong(refreshed.maSuCo); }
            setFilterTab('DANG_XU_LY');
        } catch (err) {
            showToast(err.response?.data?.message || err.message, 'error');
        } finally { setTiepNhanLoading(false); }
    };


    // ── Hủy chuyến một lịch trình ───────────────────────────────────────────
    const handleHuyMotChuyen = async (lt) => {
        setActionLoading(prev => ({ ...prev, [lt.maLichTrinh]: true }));
        try {
            await suCoAPI.xuLyPhuongAn({
                maLichTrinh: lt.maLichTrinh,
                phuongAn: 'HUY_CHUYEN',
                maRayMoi: null
            });
            showToast(`Đã hủy chuyến ${lt.maChuyenTau}`);
            loadLichTrinhBiAnhHuong(selectedSuCo.maSuCo);
        } catch (err) {
            showToast(err.response?.data?.message || err.message, 'error');
        } finally {
            setActionLoading(prev => ({ ...prev, [lt.maLichTrinh]: false }));
            setConfirmHuy(null);
        }
    };

    // ── Điều chỉnh giờ lịch trình (không cần đổi ray) ─────────────────────
    const handleDieuChinhGio = async (lt, gioDenMoi, gioDiMoi) => {
        setActionLoading(prev => ({ ...prev, [lt.maLichTrinh]: true }));
        try {
            // Tính số phút trễ dựa trên giờ gốc và giờ mới
            const ngayChay = lt.gioDenDuKien
                ? lt.gioDenDuKien.substring(0, 10)
                : lt.gioDiDuKien?.substring(0, 10);
            const payload = {
                maLichTrinh: lt.maLichTrinh,
                phuongAn: 'DIEU_CHINH_GIO',
                gioDenDuKienMoi: gioDenMoi && ngayChay ? `${ngayChay}T${gioDenMoi}:00` : null,
                gioDiDuKienMoi: gioDiMoi && ngayChay ? `${ngayChay}T${gioDiMoi}:00` : null,
            };
            await suCoAPI.dieuChinhGio(payload);
            showToast(`✅ Đã cập nhật giờ cho ${lt.maLichTrinh}`);
            loadLichTrinhBiAnhHuong(selectedSuCo.maSuCo);
        } catch (err) {
            showToast(err.response?.data?.message || 'Không thể cập nhật giờ', 'error');
        } finally {
            setActionLoading(prev => ({ ...prev, [lt.maLichTrinh]: false }));
        }
    };

    // ── Điều phối một lịch trình sang DieuPhoiRayPage ───────────────────────
    const handleDieuPhoiMotLichTrinh = (lt) => {
        const params = new URLSearchParams({
            suCoId: selectedSuCo.maSuCo,
            lichTrinhIds: lt.maLichTrinh
        });
        navigate(`/dieu-hanh/duong-ray?${params.toString()}`);
    };

    // ── Điều phối TẤT CẢ lịch trình bị ảnh hưởng ───────────────────────────
    const handleDieuPhoiTatCa = () => {
        const ids = lichTrinhBiAnhHuong
            .filter(lt => lt.phuongAnXuLy !== 'HUY_CHUYEN')
            .map(lt => lt.maLichTrinh)
            .join(',');
        if (!ids) { showToast('Không có lịch trình nào cần điều phối', 'error'); return; }
        const params = new URLSearchParams({ suCoId: selectedSuCo.maSuCo, lichTrinhIds: ids });
        navigate(`/dieu-hanh/duong-ray?${params.toString()}`);
    };

    // ── Hoàn thành xử lý — gọi khi DANG_XU_LY và không còn lịch trình ────────
    const handleHoanThanhXuLy = async () => {
        if (!selectedSuCo) return;
        const rayMsg = selectedSuCo.maRay
            ? `\nĐường ray ${selectedSuCo.maRay} sẽ được giải phóng về SẴN SÀNG.`
            : '';
        if (!confirm(`Xác nhận hoàn thành xử lý sự cố ${selectedSuCo.maSuCo}?${rayMsg}`)) return;
        setLoading(true);
        try {
            await suCoAPI.giaiPhongRay({ maRay: selectedSuCo.maRay || null, maSuCo: selectedSuCo.maSuCo });
            showToast(selectedSuCo.maRay
                ? '✅ Hoàn thành xử lý! Đường ray đã được giải phóng.'
                : '✅ Hoàn thành xử lý sự cố!');
            await loadSuCos();
            setSelectedSuCo(null);
            setLichTrinhBiAnhHuong([]);
        } catch (err) {
            showToast(err.response?.data?.message || err.message, 'error');
        } finally { setLoading(false); }
    };

    // ── Giải phóng ray (nút header) ─────────────────────────────────────────
    const handleGiaiPhongRay = async () => {
        if (!selectedSuCo) return;
        const rayMsg = selectedSuCo.maRay
            ? `Đường ray ${selectedSuCo.maRay} sẽ được giải phóng.`
            : 'Sự cố không có đường ray, chỉ đánh dấu hoàn thành.';
        if (!confirm(`Xác nhận hoàn thành xử lý?\n${rayMsg}\nTất cả lịch trình phải đã được xử lý.`)) return;
        setLoading(true);
        try {
            await suCoAPI.giaiPhongRay({ maRay: selectedSuCo.maRay || null, maSuCo: selectedSuCo.maSuCo });
            showToast(selectedSuCo.maRay ? '✅ Giải phóng ray thành công!' : '✅ Đánh dấu hoàn thành thành công!');
            loadSuCos();
            setSelectedSuCo(null);
            setLichTrinhBiAnhHuong([]);
        } catch (err) {
            showToast(err.response?.data?.message || err.message, 'error');
        } finally { setLoading(false); }
    };


    const countByStatus = {
        CHO_TIEP_NHAN: suCos.filter(s => s.trangThaiXuLy === 'CHO_TIEP_NHAN').length,
        DANG_XU_LY: suCos.filter(s => s.trangThaiXuLy === 'DANG_XU_LY').length,
        DA_XU_LY: suCos.filter(s => s.trangThaiXuLy === 'DA_XU_LY').length,
    };
    const filteredSuCos = filterTab === 'ALL' ? suCos : suCos.filter(s => s.trangThaiXuLy === filterTab);
    // Chỉ tính những lịch trình thực sự cần xử lý (CHO_RAY)
    const pendingLichTrinh = lichTrinhBiAnhHuong.filter(lt => lt.phuongAnXuLy === 'CHO_RAY' || !lt.phuongAnXuLy);
    // Kiểm tra đã xử lý hết chưa: không còn CHO_RAY nào
    const daXuLyHetLichTrinh = lichTrinhBiAnhHuong.length === 0 || pendingLichTrinh.length === 0;
    // Hiển thị nút "Hoàn thành" khi DANG_XU_LY và không còn việc gì
    const hienThiNutHoanThanh = selectedSuCo?.trangThaiXuLy === 'DANG_XU_LY' && daXuLyHetLichTrinh;

    const tabs = [
        { key: 'ALL', label: 'Tất cả', count: suCos.length, color: '#4B5563' },
        { key: 'CHO_TIEP_NHAN', label: 'Chờ tiếp nhận', count: countByStatus.CHO_TIEP_NHAN, color: '#92400E' },
        { key: 'DANG_XU_LY', label: 'Đang xử lý', count: countByStatus.DANG_XU_LY, color: '#D97706' },
        { key: 'DA_XU_LY', label: 'Đã xử lý', count: countByStatus.DA_XU_LY, color: '#16A34A' },
    ];

    return (
        <>
            <style>{`
                @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.3)} }
                @keyframes slaPulse { 0%,100%{box-shadow:0 0 0 0 rgba(220,38,38,0.4)} 70%{box-shadow:0 0 0 10px rgba(220,38,38,0)} }
                @keyframes slaShake { 0%,100%{transform:translateX(0)} 10%,30%,50%,70%,90%{transform:translateX(-2px)} 20%,40%,60%,80%{transform:translateX(2px)} }
            `}</style>

            {/* Toast */}
            {toast && (
                <div className="toast-container">
                    <div className={`toast ${toast.type}`}>
                        {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
                    </div>
                </div>
            )}

            {/* Confirm hủy overlay */}
            {confirmHuy && (
                <div className="confirm-overlay" onClick={() => setConfirmHuy(null)}>
                    <div className="confirm-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
                        <div style={{ fontSize: '32px', textAlign: 'center', marginBottom: '12px' }}>❌</div>
                        <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px', textAlign: 'center' }}>
                            Xác nhận hủy chuyến
                        </h3>
                        <p style={{ fontSize: '13px', color: 'var(--gray-600)', textAlign: 'center', marginBottom: '20px' }}>
                            Bạn có chắc muốn hủy chuyến <strong>{confirmHuy.maChuyenTau}</strong>?<br />
                            Hành động này không thể hoàn tác.
                        </p>
                        <div className="confirm-actions">
                            <button className="btn btn-secondary" onClick={() => setConfirmHuy(null)}>
                                Quay lại
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={() => handleHuyMotChuyen(confirmHuy)}
                                disabled={actionLoading[confirmHuy.maLichTrinh]}
                            >
                                {actionLoading[confirmHuy.maLichTrinh] ? '⏳ Đang xử lý...' : '❌ Xác nhận hủy'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Tiếp nhận & Đánh giá */}
            {showTiepNhanModal && selectedSuCo && (
                <div style={MODAL_OVERLAY} onClick={() => setShowTiepNhanModal(false)}>
                    <div style={MODAL_BOX} onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: 28, textAlign: 'center', marginBottom: 8 }}>📋</div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, textAlign: 'center', marginBottom: 4 }}>
                            Tiếp nhận &amp; Đánh giá Sự cố
                        </h3>
                        <p style={{ fontSize: 13, color: '#6B7280', textAlign: 'center', marginBottom: 12 }}>
                            {selectedSuCo.maSuCo} &nbsp;·&nbsp; {selectedSuCo.loaiSuCo}
                        </p>

                        <div style={{ background: '#F9FAFB', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #E5E7EB' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <span style={{ fontSize: '12px', color: '#6B7280' }}>Thời gian xảy ra:</span>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                                    {selectedSuCo.ngayXayRa ? new Date(selectedSuCo.ngayXayRa).toLocaleString('vi-VN') : '—'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '12px', color: '#6B7280' }}>Thời gian ước tính xử lí (NVNG):</span>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                                    {selectedSuCo.thoiGianXuLyUocTinh ? `${selectedSuCo.thoiGianXuLyUocTinh} phút` : 'Chưa nhập (Trống)'}
                                </span>
                            </div>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#374151', display: 'block', marginBottom: 6 }}>
                                Mức độ chính thức
                            </label>
                            <select
                                value={tiepNhanForm.mucDo}
                                onChange={e => setTiepNhanForm(p => ({ ...p, mucDo: e.target.value }))}
                                style={MODAL_INPUT}
                            >
                                <option value="THAP">🟢 Thấp — Xử lý trong vài phút</option>
                                <option value="TRUNG_BINH">🟡 Trung bình — Cần hỗ trợ</option>
                                <option value="CAO">🔴 Cao — Ảnh hưởng nhiều lịch trình</option>
                                <option value="KHAN_CAP">🚨 Khẩn cấp — Ưu tiên tối cao</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#374151', display: 'block', marginBottom: 6 }}>
                                Phong tỏa đường ray?
                            </label>
                            <div style={{ display: 'flex', gap: 10 }}>
                                {[
                                    { v: true, lt: '🔒 Có phong tỏa', sub: 'Ray bị chặn, lịch trình được quét' },
                                    { v: false, lt: '✅ Không phong tỏa', sub: 'Ray vẫn hoạt động, chỉ quản lý LT' },
                                ].map(o => (
                                    <button key={String(o.v)} type="button"
                                        onClick={() => setTiepNhanForm(p => ({ ...p, coPhongToaRay: o.v, loaiPhongToa: o.v ? 'PHONG_TOA_TAM' : null }))}
                                        style={{
                                            flex: 1, padding: '10px 12px', borderRadius: 8, border: '2px solid',
                                            borderColor: tiepNhanForm.coPhongToaRay === o.v ? '#DC2626' : '#E5E7EB',
                                            background: tiepNhanForm.coPhongToaRay === o.v ? '#FEF2F2' : '#fff',
                                            cursor: 'pointer', textAlign: 'left', fontSize: 13,
                                        }}
                                    >
                                        <div style={{ fontWeight: 700 }}>{o.lt}</div>
                                        <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{o.sub}</div>
                                    </button>
                                ))}
                            </div>
                            {tiepNhanForm.coPhongToaRay && (
                                <select
                                    value={tiepNhanForm.loaiPhongToa}
                                    onChange={e => setTiepNhanForm(p => ({ ...p, loaiPhongToa: e.target.value }))}
                                    style={{ ...MODAL_INPUT, marginTop: 8 }}
                                >
                                    <option value="PHONG_TOA_TAM">Phong tỏa tạm — Tự động giải phóng khi xử lý xong</option>
                                    <option value="PHONG_TOA_CUNG">Phong tỏa cứng — Cần Ban Quản lý duyệt mới giải phóng</option>
                                </select>
                            )}

                            {tiepNhanForm.coPhongToaRay && tiepNhanForm.loaiPhongToa === 'PHONG_TOA_TAM' && (
                                <div style={{ marginTop: 16 }}>
                                    <label style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#374151', display: 'block', marginBottom: 6 }}>
                                        Thời gian xử lý ước tính (Phút) <span style={{ color: '#DC2626' }}>*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        placeholder="VD: 60"
                                        value={tiepNhanForm.thoiGianXuLyUocTinh}
                                        onChange={e => setTiepNhanForm(p => ({ ...p, thoiGianXuLyUocTinh: e.target.value }))}
                                        style={MODAL_INPUT}
                                    />
                                    <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>
                                        Hệ thống sẽ giữ phong tỏa ray trong khoảng thời gian này.
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                            <button
                                style={{ padding: '10px 18px', border: '1px solid #D1D5DB', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 13 }}
                                onClick={() => setShowTiepNhanModal(false)}
                            >Hủy</button>
                            <button
                                style={{ padding: '10px 20px', background: '#DC2626', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 13, opacity: tiepNhanLoading ? 0.7 : 1 }}
                                onClick={handleXacNhanTiepNhan}
                                disabled={tiepNhanLoading}
                            >{tiepNhanLoading ? '⏳ Đang xử lý...' : '✅ Xác nhận Tiếp nhận'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Page Header */}
            <div className="page-header">
                <div className="page-header-actions">
                    <div>
                        <p style={{ fontSize: '11px', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            UC-06: XỬ LÝ SỰ CỐ
                        </p>
                        <h1>Điều Hành và Xử Lý Sự Cố</h1>
                        <p>Quản lý phương án xử lý cho lịch trình bị ảnh hưởng</p>
                    </div>
                    {selectedSuCo && (
                        <button className="btn btn-primary" onClick={handleGiaiPhongRay} disabled={loading}>
                            🔓 Giải phóng ray
                        </button>
                    )}
                </div>
            </div>

            {/* Summary Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                {Object.entries(TRANG_THAI_CONFIG).map(([key, cfg]) => (
                    <div key={key} onClick={() => setFilterTab(key)} style={{
                        background: filterTab === key ? cfg.bg : 'white',
                        border: `2px solid ${filterTab === key ? cfg.border : 'var(--gray-200)'}`,
                        borderRadius: 'var(--radius-md)', padding: '16px 20px',
                        cursor: 'pointer', transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', gap: '16px'
                    }}>
                        <div style={{
                            width: '44px', height: '44px', borderRadius: '12px',
                            background: cfg.bg, border: `1px solid ${cfg.border}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '22px', flexShrink: 0
                        }}>{cfg.icon}</div>
                        <div>
                            <div style={{ fontSize: '24px', fontWeight: 700, color: cfg.color, lineHeight: 1 }}>
                                {countByStatus[key]}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--gray-600)', marginTop: '2px' }}>{cfg.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px' }}>
                {/* Sidebar */}
                <div className="card" style={{ height: 'fit-content' }}>
                    {/* Filter tabs */}
                    <div style={{ padding: '8px', borderBottom: '1px solid var(--gray-200)', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {tabs.map(tab => (
                            <button key={tab.key} onClick={() => setFilterTab(tab.key)} style={{
                                padding: '4px 10px', borderRadius: '16px', border: 'none', cursor: 'pointer',
                                fontSize: '11px', fontWeight: 600, transition: 'all 0.2s',
                                background: filterTab === tab.key ? tab.color : 'var(--gray-100)',
                                color: filterTab === tab.key ? 'white' : 'var(--gray-600)',
                                display: 'flex', alignItems: 'center', gap: '4px'
                            }}>
                                {tab.label}
                                <span style={{
                                    background: filterTab === tab.key ? 'rgba(255,255,255,0.3)' : 'var(--gray-200)',
                                    borderRadius: '10px', padding: '0 5px', fontSize: '10px'
                                }}>{tab.count}</span>
                            </button>
                        ))}
                    </div>
                    {/* List */}
                    <div style={{ maxHeight: '580px', overflowY: 'auto' }}>
                        {filteredSuCos.length === 0 ? (
                            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--gray-500)' }}>
                                <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
                                <div style={{ fontSize: '13px' }}>Không có sự cố nào</div>
                            </div>
                        ) : filteredSuCos.map(suCo => {
                            const cfg = TRANG_THAI_CONFIG[suCo.trangThaiXuLy] || TRANG_THAI_CONFIG.CHO_TIEP_NHAN;
                            const isSelected = selectedSuCo?.maSuCo === suCo.maSuCo;
                            return (
                                <div key={suCo.maSuCo} onClick={() => handleSelectSuCo(suCo)}
                                    style={{
                                        padding: '14px 16px', borderBottom: '1px solid var(--gray-200)',
                                        cursor: 'pointer', transition: 'all 0.15s',
                                        background: isSelected ? 'var(--navy-50)' : 'transparent',
                                        borderLeft: `4px solid ${isSelected ? 'var(--navy-500)' : cfg.dot}`,
                                    }}
                                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--gray-50)'; }}
                                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '8px' }}>
                                        <div style={{ fontWeight: 600, fontSize: '13px' }}>{suCo.maSuCo}</div>
                                        <TrangThaiBadge trangThai={suCo.trangThaiXuLy} />
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--gray-600)', margin: '4px 0' }}>
                                        Ray: {suCo.maRay}
                                    </div>
                                    <span style={{
                                        display: 'inline-block', padding: '2px 8px', borderRadius: '12px',
                                        fontSize: '11px', fontWeight: 600,
                                        background: suCo.mucDo === 'KHAN_CAP' ? '#FEE2E2' : suCo.mucDo === 'CAO' ? '#FFEDD5' : '#FFFBEB',
                                        color: suCo.mucDo === 'KHAN_CAP' ? '#DC2626' : suCo.mucDo === 'CAO' ? '#EA580C' : '#CA8A04'
                                    }}>
                                        {suCo.mucDo === 'KHAN_CAP' ? '🔴' : suCo.mucDo === 'CAO' ? '🟠' : '🟡'} {suCo.mucDo}
                                    </span>
                                    {/* SLA indicator trên sidebar */}
                                    {suCo.trangThaiSLA && suCo.trangThaiSLA !== 'NORMAL' && (
                                        <span style={{
                                            display: 'inline-block', padding: '2px 8px', borderRadius: '12px',
                                            fontSize: '10px', fontWeight: 700, marginLeft: '4px',
                                            background: suCo.trangThaiSLA === 'ESCALATED' ? '#7F1D1D' :
                                                        suCo.trangThaiSLA === 'RED_ALERT' ? '#DC2626' : '#EAB308',
                                            color: 'white',
                                            animation: suCo.trangThaiSLA === 'RED_ALERT' || suCo.trangThaiSLA === 'ESCALATED'
                                                ? 'slaPulse 1.5s infinite' : 'none'
                                        }}>
                                            {suCo.trangThaiSLA === 'ESCALATED' ? '⚠️ LEO THANG' :
                                             suCo.trangThaiSLA === 'RED_ALERT' ? '🔴 SLA' : '🟡 SLA'}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content */}
                <div>
                    {selectedSuCo ? (
                        <>
                            {/* Cảnh báo mất liên lạc */}
                            {selectedSuCo.loaiSuCo === 'MAT_LIEN_LAC' && (
                                <div style={{
                                    background: '#FEE2E2', border: '2px solid #DC2626',
                                    borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '20px',
                                    display: 'flex', alignItems: 'start', gap: '16px'
                                }}>
                                    <div style={{ fontSize: '32px' }}>🚨</div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '16px', color: '#991B1B', marginBottom: '8px' }}>
                                            CHẾ ĐỘ VẬN HÀNH KHẨN CẤP
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#991B1B', lineHeight: '1.6' }}>
                                            Tàu mất liên lạc {'>'}10 phút. Áp dụng quy trình khẩn cấp theo
                                            <strong> Thông tư 15/2023/TT-GTVT</strong>.
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ═══ SLA COUNTDOWN BANNER ═══ */}
                            {selectedSuCo.trangThaiXuLy === 'DANG_XU_LY' && slaInfo && slaInfo.trangThaiSLA !== 'NORMAL' && (
                                <div style={{
                                    background: slaInfo.trangThaiSLA === 'ESCALATED' ? 'linear-gradient(135deg, #7F1D1D 0%, #991B1B 100%)' :
                                               slaInfo.trangThaiSLA === 'RED_ALERT' ? 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)' :
                                               'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                                    borderRadius: 'var(--radius-md)', padding: '16px 20px', marginBottom: '16px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    color: 'white', gap: '16px',
                                    animation: slaInfo.trangThaiSLA === 'RED_ALERT' ? 'slaShake 0.5s ease-in-out' :
                                              slaInfo.trangThaiSLA === 'ESCALATED' ? 'slaPulse 2s infinite' : 'none'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ fontSize: '28px' }}>
                                            {slaInfo.trangThaiSLA === 'ESCALATED' ? '🚨' :
                                             slaInfo.trangThaiSLA === 'RED_ALERT' ? '⏰' : '⚠️'}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '2px' }}>
                                                {slaInfo.trangThaiSLA === 'ESCALATED'
                                                    ? 'ĐÃ LEO THANG — Chuyển quyền Ban Quản lý'
                                                    : slaInfo.trangThaiSLA === 'RED_ALERT'
                                                    ? 'CẢNH BÁO ĐỎ — Sắp hết hạn SLA'
                                                    : 'CẢNH BÁO VÀNG — Cần xử lý sớm'}
                                            </div>
                                            <div style={{ fontSize: '12px', opacity: 0.9 }}>
                                                Hạn chót phương án: {slaInfo.hanChot
                                                    ? new Date(slaInfo.hanChot).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                                                    : '—'}
                                            </div>
                                        </div>
                                    </div>
                                    {slaCountdown && slaInfo.trangThaiSLA !== 'ESCALATED' && (
                                        <div style={{
                                            background: 'rgba(0,0,0,0.25)', borderRadius: '12px',
                                            padding: '8px 20px', textAlign: 'center', minWidth: '100px'
                                        }}>
                                            <div style={{ fontSize: '10px', opacity: 0.8, marginBottom: '2px' }}>CÒN LẠI</div>
                                            <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '2px' }}>
                                                {slaCountdown}
                                            </div>
                                        </div>
                                    )}
                                    {slaInfo.trangThaiSLA === 'ESCALATED' && (
                                        <div style={{
                                            background: 'rgba(255,255,255,0.15)', borderRadius: '12px',
                                            padding: '8px 16px', fontSize: '12px', textAlign: 'center', maxWidth: '180px'
                                        }}>
                                            ⚠️ Đã quá hạn SLA<br/>
                                            <strong>BQL đã được thông báo</strong><br/>
                                            và có quyền override phương án
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* SLA NORMAL — hiển thị hạn chót nhỏ */}
                            {selectedSuCo.trangThaiXuLy === 'DANG_XU_LY' && slaInfo && slaInfo.trangThaiSLA === 'NORMAL' && slaInfo.hanChot && (
                                <div style={{
                                    background: '#F0FDF4', border: '1px solid #86EFAC',
                                    borderRadius: 'var(--radius)', padding: '8px 16px', marginBottom: '12px',
                                    display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#166534'
                                }}>
                                    ⏱️ Hạn chót phương án: <strong>
                                        {new Date(slaInfo.hanChot).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                    </strong>
                                    {slaCountdown && <span style={{ marginLeft: 'auto', fontFamily: 'monospace', fontWeight: 600 }}>còn {slaCountdown}</span>}
                                </div>
                            )}

                            {/* Thông tin sự cố */}
                            <div className="card" style={{ marginBottom: '20px' }}>
                                <div style={{ padding: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                                        <div>
                                            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>
                                                {selectedSuCo.maSuCo}
                                            </h2>
                                            <p style={{ fontSize: '13px', color: 'var(--gray-600)' }}>{selectedSuCo.moTa}</p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <TrangThaiBadge trangThai={selectedSuCo.trangThaiXuLy} size="lg" />
                                            {selectedSuCo.trangThaiXuLy === 'CHO_TIEP_NHAN' && (
                                                <button onClick={handleMoModalTiepNhan} disabled={loading}
                                                    style={{
                                                        padding: '8px 18px', borderRadius: '20px', border: 'none',
                                                        background: '#DC2626', color: 'white', fontSize: '13px', fontWeight: 700,
                                                        cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
                                                        display: 'flex', alignItems: 'center', gap: '6px',
                                                        boxShadow: '0 2px 8px rgba(220,38,38,0.3)',
                                                    }}>
                                                    📋 Tiếp nhận &amp; Đánh giá
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{
                                        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px',
                                        padding: '16px', background: 'var(--gray-50)', borderRadius: 'var(--radius)'
                                    }}>
                                        {[
                                            { label: 'ĐƯỜNG RAY', value: selectedSuCo.maRay },
                                            { label: 'LOẠI SỰ CỐ', value: selectedSuCo.loaiSuCo },
                                            { label: 'MỨC ĐỘ', value: selectedSuCo.mucDo },
                                            { label: 'SLA', value: (
                                                <span style={{
                                                    padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700,
                                                    background: (selectedSuCo.trangThaiSLA || slaInfo?.trangThaiSLA) === 'ESCALATED' ? '#7F1D1D' :
                                                               (selectedSuCo.trangThaiSLA || slaInfo?.trangThaiSLA) === 'RED_ALERT' ? '#FEE2E2' :
                                                               (selectedSuCo.trangThaiSLA || slaInfo?.trangThaiSLA) === 'YELLOW_ALERT' ? '#FEF3C7' : '#F0FDF4',
                                                    color: (selectedSuCo.trangThaiSLA || slaInfo?.trangThaiSLA) === 'ESCALATED' ? 'white' :
                                                           (selectedSuCo.trangThaiSLA || slaInfo?.trangThaiSLA) === 'RED_ALERT' ? '#DC2626' :
                                                           (selectedSuCo.trangThaiSLA || slaInfo?.trangThaiSLA) === 'YELLOW_ALERT' ? '#CA8A04' : '#16A34A',
                                                }}>
                                                    {(selectedSuCo.trangThaiSLA || slaInfo?.trangThaiSLA || 'NORMAL')}
                                                </span>
                                            )}
                                        ].map(({ label, value }) => (
                                            <div key={label}>
                                                <div style={{ fontSize: '11px', color: 'var(--gray-500)', marginBottom: '6px' }}>{label}</div>
                                                <div style={{ fontWeight: 600, fontSize: '13px' }}>{value}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Lịch trình bị ảnh hưởng */}
                            <div className="card">
                                {/* Header + nút Điều phối tất cả */}
                                <div style={{
                                    padding: '16px 20px', borderBottom: '1px solid var(--gray-200)',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--gray-700)' }}>
                                            LỊCH TRÌNH BỊ ẢNH HƯỞNG ({lichTrinhBiAnhHuong.length})
                                        </div>
                                        {pendingLichTrinh.length > 0 && (
                                            <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '2px' }}>
                                                {pendingLichTrinh.length} lịch trình cần xử lý
                                            </div>
                                        )}
                                    </div>
                                    {pendingLichTrinh.length > 0 && (
                                        <button onClick={handleDieuPhoiTatCa}
                                            style={{
                                                padding: '8px 18px', borderRadius: '8px', border: 'none',
                                                background: 'var(--navy-600)', color: 'white',
                                                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'var(--navy-700)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'var(--navy-600)'}
                                        >
                                            🔄 Điều phối tất cả ({pendingLichTrinh.length}) →
                                        </button>
                                    )}
                                </div>

                                {/* Body */}
                                <div style={{ padding: '20px' }}>
                                    {lichTrinhBiAnhHuong.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--gray-500)' }}>
                                            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📋</div>
                                            <div style={{ fontSize: '13px', marginBottom: '16px' }}>
                                                Không có lịch trình nào bị ảnh hưởng
                                            </div>
                                            {/* Nút Hoàn thành khi đang xử lý và không có lịch trình */}
                                            {hienThiNutHoanThanh && (
                                                <button
                                                    onClick={handleHoanThanhXuLy}
                                                    disabled={loading}
                                                    style={{
                                                        padding: '10px 24px', borderRadius: '10px', border: 'none',
                                                        background: '#16A34A', color: 'white',
                                                        fontSize: '14px', fontWeight: 700,
                                                        cursor: loading ? 'not-allowed' : 'pointer',
                                                        opacity: loading ? 0.6 : 1,
                                                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                                                        boxShadow: '0 2px 8px rgba(22,163,74,0.3)',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#15803D'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = '#16A34A'; }}
                                                >
                                                    {loading ? '⏳ Đang xử lý...' : '✅ Hoàn thành Xử lý — Giải phóng Ray'}
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {lichTrinhBiAnhHuong.map(lt => (
                                                <LichTrinhAnhHuongCard
                                                    key={lt.maLichTrinh}
                                                    lichTrinh={lt}
                                                    actionLoading={actionLoading}
                                                    onHuy={() => setConfirmHuy(lt)}
                                                    onDieuPhoi={() => handleDieuPhoiMotLichTrinh(lt)}
                                                    onDieuChinhGio={handleDieuChinhGio}
                                                />
                                            ))}

                                            {/* Nút Hoàn thành khi tất cả lịch trình đã được xử lý */}
                                            {hienThiNutHoanThanh && (
                                                <div style={{
                                                    marginTop: '8px', paddingTop: '16px',
                                                    borderTop: '2px dashed #86EFAC',
                                                    display: 'flex', flexDirection: 'column',
                                                    alignItems: 'center', gap: '8px'
                                                }}>
                                                    <div style={{ fontSize: '12px', color: '#16A34A', fontWeight: 600 }}>
                                                        ✅ Tất cả lịch trình đã được xử lý
                                                    </div>
                                                    <button
                                                        onClick={handleHoanThanhXuLy}
                                                        disabled={loading}
                                                        style={{
                                                            padding: '10px 28px', borderRadius: '10px', border: 'none',
                                                            background: '#16A34A', color: 'white',
                                                            fontSize: '14px', fontWeight: 700,
                                                            cursor: loading ? 'not-allowed' : 'pointer',
                                                            opacity: loading ? 0.6 : 1,
                                                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                                                            boxShadow: '0 2px 8px rgba(22,163,74,0.3)',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#15803D'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.background = '#16A34A'; }}
                                                    >
                                                        {loading ? '⏳ Đang xử lý...' : '✅ Hoàn thành Xử lý — Giải phóng Ray'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="card">
                            <div style={{ padding: '80px 40px', textAlign: 'center', color: 'var(--gray-500)' }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                                <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>
                                    Chọn một sự cố để xem chi tiết
                                </div>
                                <div style={{ fontSize: '13px' }}>
                                    Chọn sự cố từ danh sách bên trái để bắt đầu xử lý
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

// ─── Card lịch trình bị ảnh hưởng — 3 phương án xử lý ───────────────────────
function LichTrinhAnhHuongCard({ lichTrinh, actionLoading, onHuy, onDieuPhoi, onDieuChinhGio }) {
    const isHuyed = lichTrinh.phuongAnXuLy === 'HUY_CHUYEN' || lichTrinh.trangThai === 'HUY';
    const isDoi = lichTrinh.phuongAnXuLy === 'DOI_RAY';
    const isDieuChinh = lichTrinh.phuongAnXuLy === 'DIEU_CHINH_GIO';
    const isDone = isDoi || isDieuChinh;
    const soPhutTre = lichTrinh.soPhutTre || 0;
    const isLoading = actionLoading[lichTrinh.maLichTrinh];

    // State cho inline form điều chỉnh giờ
    const [showGioForm, setShowGioForm] = useState(false);
    const [gioDenMoi, setGioDenMoi] = useState('');
    const [gioDiMoi, setGioDiMoi] = useState('');

    const formatDT = (dt) => {
        if (!dt) return '--:--';
        const d = new Date(dt);
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    };

    // Màu viền và nền theo trạng thái
    const cardStyle = isHuyed
        ? { border: '1px solid #E5E7EB', background: '#F9FAFB', opacity: 0.65 }
        : isDieuChinh
            ? { border: '1px solid #A7F3D0', background: '#ECFDF5' }
            : isDoi
                ? { border: '1px solid #86EFAC', background: '#F0FDF4' }
                : { border: '1px solid #FCA5A5', background: 'white' };

    return (
        <div style={{ ...cardStyle, borderRadius: 'var(--radius-md)', padding: '16px 20px', transition: 'all 0.2s' }}>
            {/* Header - thông tin tàu */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 700, fontSize: '14px' }}>{lichTrinh.maLichTrinh}</span>
                        <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>—</span>
                        <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--navy-600)' }}>
                            {lichTrinh.maChuyenTau}
                        </span>
                        {soPhutTre > 0 && (
                            <span style={{
                                padding: '2px 8px', borderRadius: '12px', fontSize: '11px',
                                fontWeight: 600, background: '#FEE2E2', color: '#DC2626'
                            }}>
                                ⏱ Trễ {soPhutTre} phút
                            </span>
                        )}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-600)', display: 'flex', gap: '16px' }}>
                        <span>🛤 Ray: <strong>{lichTrinh.maRay || '—'}</strong></span>
                        <span>🕐 Đến: <strong>{formatDT(lichTrinh.gioDenDuKien)}</strong></span>
                        <span>🕐 Đi: <strong>{formatDT(lichTrinh.gioDiDuKien)}</strong></span>
                    </div>
                </div>

                {/* Status badge */}
                <div style={{ marginLeft: '12px', flexShrink: 0 }}>
                    {isHuyed ? (
                        <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: '#F3F4F6', color: '#6B7280', border: '1px solid #D1D5DB' }}>✖ Đã hủy chuyến</span>
                    ) : isDieuChinh ? (
                        <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' }}>⏰ Đã điều chỉnh giờ</span>
                    ) : isDoi ? (
                        <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: '#F0FDF4', color: '#16A34A', border: '1px solid #86EFAC' }}>✓ Đã đổi ray</span>
                    ) : (
                        <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: '#FEF2F2', color: '#DC2626', border: '1px solid #FCA5A5' }}>⚡ Cần xử lý</span>
                    )}
                </div>
            </div>

            {/* Action buttons — chỉ hiển thị khi chưa xử lý */}
            {!isHuyed && !isDone && !showGioForm && (
                <div style={{
                    marginTop: '14px', paddingTop: '14px',
                    borderTop: '1px dashed #FCA5A5',
                    display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap'
                }}>
                    <span style={{ fontSize: '11px', color: 'var(--gray-500)', marginRight: '2px' }}>Phương án:</span>

                    {/* Hủy chuyến */}
                    <button onClick={onHuy} disabled={isLoading} style={{
                        padding: '6px 14px', borderRadius: '8px',
                        border: '1.5px solid #DC2626', background: 'white',
                        color: '#DC2626', fontSize: '12px', fontWeight: 600,
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.15s'
                    }}
                        onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
                        onMouseLeave={e => e.currentTarget.style.background = 'white'}
                    >❌ Hủy chuyến</button>

                    <span style={{ color: 'var(--gray-300)' }}>|</span>

                    {/* Điều chỉnh giờ — phương án mới */}
                    <button onClick={() => {
                        setGioDenMoi(formatDT(lichTrinh.gioDenDuKien) === '--:--' ? '' : formatDT(lichTrinh.gioDenDuKien));
                        setGioDiMoi(formatDT(lichTrinh.gioDiDuKien) === '--:--' ? '' : formatDT(lichTrinh.gioDiDuKien));
                        setShowGioForm(true);
                    }} disabled={isLoading} style={{
                        padding: '6px 14px', borderRadius: '8px',
                        border: '1.5px solid #059669', background: 'white',
                        color: '#059669', fontSize: '12px', fontWeight: 600,
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.15s'
                    }}
                        onMouseEnter={e => e.currentTarget.style.background = '#ECFDF5'}
                        onMouseLeave={e => e.currentTarget.style.background = 'white'}
                    >⏰ Điều chỉnh giờ</button>

                    <span style={{ color: 'var(--gray-300)' }}>|</span>

                    {/* Điều phối đổi ray */}
                    <button onClick={onDieuPhoi} disabled={isLoading} style={{
                        padding: '6px 14px', borderRadius: '8px',
                        border: '1.5px solid var(--navy-500)',
                        background: 'var(--navy-600)', color: 'white',
                        fontSize: '12px', fontWeight: 600,
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.15s'
                    }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--navy-700)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'var(--navy-600)'}
                    >🔄 Đổi ray →</button>
                </div>
            )}

            {/* Inline form điều chỉnh giờ — logic theo loại tàu + thực tế */}
            {showGioForm && !isDone && !isHuyed && (() => {
                // Xác định trường nào được phép chỉnh
                const coDenDuKien = !!lichTrinh.gioDenDuKien;   // null nếu XUAT_PHAT
                const coDiDuKien = !!lichTrinh.gioDiDuKien;    // null nếu DIEM_CUOI
                const daDen = !!lichTrinh.gioDenThucTe;   // đã đến rồi → không chỉnh
                const daDi = !!lichTrinh.gioDiThucTe;    // đã đi rồi → không chỉnh

                const coTheChinhDen = coDenDuKien && !daDen;
                const coTheChinhDi = coDiDuKien && !daDi;

                // Hint giải thích tại sao trường bị vô hiệu
                const hintDen = !coDenDuKien ? 'Tàu xuất phát — không có giờ đến'
                    : daDen ? `Đã đến lúc ${formatDT(lichTrinh.gioDenThucTe)} — không thể thay đổi`
                        : null;
                const hintDi = !coDiDuKien ? 'Tàu điểm cuối — không có giờ đi'
                    : daDi ? `Đã đi lúc ${formatDT(lichTrinh.gioDiThucTe)} — không thể thay đổi`
                        : null;

                const canSubmit = (coTheChinhDen && gioDenMoi) || (coTheChinhDi && gioDiMoi);

                return (
                    <div style={{
                        marginTop: '12px', borderTop: '1px dashed #A7F3D0',
                        background: '#F0FDF4', borderRadius: '8px', padding: '14px'
                    }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#065F46', marginBottom: '10px' }}>
                            ⏰ Cập nhật thời gian dự kiến
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                            {/* Giờ đến */}
                            <div style={{ flex: 1, minWidth: '130px' }}>
                                <label style={{
                                    fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '4px',
                                    color: coTheChinhDen ? '#374151' : '#9CA3AF'
                                }}>
                                    Giờ đến mới
                                    {!coTheChinhDen && <span style={{ fontSize: '10px', fontWeight: 400 }}> (khoá)</span>}
                                </label>
                                {coTheChinhDen ? (
                                    <input type="time" value={gioDenMoi}
                                        onChange={e => setGioDenMoi(e.target.value)}
                                        style={{
                                            width: '100%', padding: '7px 10px', borderRadius: '8px',
                                            border: '1px solid #D1D5DB', fontSize: '13px', boxSizing: 'border-box'
                                        }}
                                    />
                                ) : (
                                    <div style={{
                                        padding: '7px 10px', borderRadius: '8px', background: '#F3F4F6',
                                        fontSize: '11px', color: '#9CA3AF', border: '1px solid #E5E7EB'
                                    }}>
                                        {hintDen}
                                    </div>
                                )}
                            </div>

                            {/* Giờ đi */}
                            <div style={{ flex: 1, minWidth: '130px' }}>
                                <label style={{
                                    fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '4px',
                                    color: coTheChinhDi ? '#374151' : '#9CA3AF'
                                }}>
                                    Giờ đi mới
                                    {!coTheChinhDi && <span style={{ fontSize: '10px', fontWeight: 400 }}> (khoá)</span>}
                                </label>
                                {coTheChinhDi ? (
                                    <input type="time" value={gioDiMoi}
                                        onChange={e => setGioDiMoi(e.target.value)}
                                        style={{
                                            width: '100%', padding: '7px 10px', borderRadius: '8px',
                                            border: '1px solid #D1D5DB', fontSize: '13px', boxSizing: 'border-box'
                                        }}
                                    />
                                ) : (
                                    <div style={{
                                        padding: '7px 10px', borderRadius: '8px', background: '#F3F4F6',
                                        fontSize: '11px', color: '#9CA3AF', border: '1px solid #E5E7EB'
                                    }}>
                                        {hintDi}
                                    </div>
                                )}
                            </div>

                            {/* Buttons */}
                            <div style={{ display: 'flex', gap: '6px', flexShrink: 0, alignItems: 'flex-end', paddingBottom: '1px' }}>
                                <button onClick={() => setShowGioForm(false)} style={{
                                    padding: '7px 12px', borderRadius: '8px', border: '1px solid #D1D5DB',
                                    background: 'white', cursor: 'pointer', fontSize: '12px'
                                }}>Hủy</button>
                                <button
                                    disabled={!canSubmit || isLoading}
                                    onClick={() => {
                                        onDieuChinhGio(lichTrinh,
                                            coTheChinhDen ? gioDenMoi : null,
                                            coTheChinhDi ? gioDiMoi : null);
                                        setShowGioForm(false);
                                    }}
                                    style={{
                                        padding: '7px 14px', borderRadius: '8px', border: 'none',
                                        background: !canSubmit ? '#D1D5DB' : '#059669',
                                        color: 'white', cursor: !canSubmit ? 'not-allowed' : 'pointer',
                                        fontSize: '12px', fontWeight: 600
                                    }}
                                >✓ Xác nhận</button>
                            </div>
                        </div>

                        {/* Ghi chú ngữ cảnh */}
                        <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '8px', lineHeight: '1.6' }}>
                            {!coTheChinhDen && !coTheChinhDi
                                ? '⚠️ Không còn trường giờ nào có thể điều chỉnh. Hãy chọn phương án khác.'
                                : '💡 Chỉ nhập giờ cần thay đổi. Tàu giữ nguyên ray, chỉ cập nhật thời gian dự kiến.'}
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}

// ── Modal Style Constants ─────────────────────────────────────────────────────
const MODAL_OVERLAY = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
};
const MODAL_BOX = {
    background: '#fff', borderRadius: 16, padding: '32px 28px',
    width: '100%', maxWidth: 480,
    boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
};
const MODAL_INPUT = {
    width: '100%', padding: '9px 12px', borderRadius: 8,
    border: '1px solid #D1D5DB', fontSize: 13, color: '#111827',
    outline: 'none', boxSizing: 'border-box',
};
