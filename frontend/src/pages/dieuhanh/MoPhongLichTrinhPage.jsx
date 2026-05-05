import { useState, useEffect } from 'react';
import { chuyenTauAPI, duongRayAPI, lichTrinhAPI, quyTacAPI } from '../../services/api';
import { optimizeSchedule } from '../../utils/scheduleOptimizer';
import SimulationGanttChart from '../../components/simulation/SimulationGanttChart';
import SimulationImpactPanel from '../../components/simulation/SimulationImpactPanel';
import SimulationConflictPanel from '../../components/simulation/SimulationConflictPanel';
import SimulationChangesLog from '../../components/simulation/SimulationChangesLog';

/**
 * Mô Phỏng Lịch Trình - Full Layout
 * Sidebar + Gantt Chart + 3 Bottom Panels
 */
// ─── Toast types ────────────────────────────────────────────────────────────
const TOAST_CFG = {
    success: { icon: '✅', bg: '#F0FDF4', border: '#86EFAC', color: '#166534', title: 'Thành công' },
    error:   { icon: '❌', bg: '#FEF2F2', border: '#FCA5A5', color: '#991B1B', title: 'Lỗi' },
    warning: { icon: '⚠️', bg: '#FFFBEB', border: '#FCD34D', color: '#92400E', title: 'Cảnh báo' },
    info:    { icon: 'ℹ️', bg: '#EFF6FF', border: '#93C5FD', color: '#1E40AF', title: 'Thông tin' },
};

export default function MoPhongLichTrinhPage() {
    const [chuyenTau, setChuyenTau] = useState([]);
    const [duongRay, setDuongRay] = useState([]);
    const [quyTacs, setQuyTacs] = useState([]);
    const [draftSchedules, setDraftSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [timeRange, setTimeRange] = useState({ start: '06:00', end: '23:00' });
    const [conflicts, setConflicts] = useState([]);
    const [impacts, setImpacts] = useState({ networkDelay: 0, trackUtilization: 0, arrivals: 0, departures: 0 });
    const [changes, setChanges] = useState([]);
    const [toasts, setToasts] = useState([]);

    // Hiển thị toast (type: 'success' | 'error' | 'warning' | 'info')
    const showToast = (message, type = 'info', detail = null) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, detail, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
    };
    const dismissToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

    useEffect(() => {
        fetchData();
    }, [selectedDate]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [ctRes, rayRes, ltRes, qtRes] = await Promise.all([
                chuyenTauAPI.getAll({ ngay: selectedDate }),
                duongRayAPI.getAll(),
                lichTrinhAPI.getAll({ ngay: selectedDate }),
                quyTacAPI.getAll()
            ]);

            if (ctRes.data?.success && rayRes.data?.success) {
                const allChuyenTau   = ctRes.data.data  || [];
                const allDuongRay    = rayRes.data.data  || [];
                const existingLt     = ltRes.data?.data  || [];

                // Tập mã chuyến tàu đã có lịch trình (bất kể trạng thái)
                const daCoLichTrinh = new Set(existingLt.map(lt => lt.maChuyenTau));

                // Chỉ giữ những chuyến tàu chưa được xếp lịch
                const chuaCoLich = allChuyenTau.filter(ct => !daCoLichTrinh.has(ct.maChuyenTau));

                setChuyenTau(chuaCoLich);
                setDuongRay(allDuongRay);
                setQuyTacs(qtRes.data.data || []);
                setDraftSchedules([]);

                console.info(
                    `[MoPhong] Ngày ${selectedDate}: ${allChuyenTau.length} chuyến tàu,`,
                    `${existingLt.length} đã có lịch trình,`,
                    `${chuaCoLich.length} chưa xếp lịch`
                );
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAutoOptimize = () => {
        try {
            console.log('Starting optimization...', { chuyenTau, duongRay });

            if (!chuyenTau || chuyenTau.length === 0) {
                showToast('Không có chuyến tàu nào để tối ưu!', 'warning');
                return;
            }

            if (!duongRay || duongRay.length === 0) {
                showToast('Không có đường ray nào khả dụng!', 'warning');
                return;
            }

            // Log sample train data
            console.log('Sample train data:', chuyenTau[0]);

            const result = optimizeSchedule(chuyenTau, duongRay, quyTacs);
            console.log('Optimization result:', result);

            if (!result || !result.success) {
                showToast('Không có kết quả tối ưu', 'error');
                return;
            }

            // Lưu kết quả tạm thời và hiển thị trên Gantt Chart
            const optimized = result.success.map(s => ({
                id: `draft-${s.maChuyenTau}`,
                ...s,
                status: 'assigned'
            }));

            console.log('Optimized schedules:', optimized);

            setDraftSchedules(optimized);
            detectConflicts(optimized);
            calculateImpacts(optimized);

            setChanges([{
                time: new Date(),
                action: 'AUTO_OPTIMIZE',
                message: `Đã tối ưu ${result.success.length}/${chuyenTau.length} chuyến tàu`,
                type: 'success'
            }, ...changes]);

            // Hiển thị thông báo kết quả
            if (result.failed.length > 0) {
                showToast(
                    `Tối ưu hoàn tất: ${result.success.length}/${chuyenTau.length} chuyến tàu`,
                    'warning',
                    `${result.failed.length} chuyến không thể sắp xếp tự động. Kiểm tra bảng xung đột bên dưới.`
                );
            } else {
                showToast(
                    `Tối ưu thành công ${result.success.length}/${chuyenTau.length} chuyến tàu!`,
                    'success'
                );
            }

        } catch (error) {
            console.error('Error in handleAutoOptimize:', error);
            showToast('Lỗi khi tối ưu lịch trình', 'error', error.message);
        }
    };

    const detectConflicts = (schedules) => {
        const detected = [];
        schedules.forEach((s1, i) => {
            schedules.slice(i + 1).forEach(s2 => {
                // Chỉ kiểm tra xung đột trên cùng ray
                if (s1.maRay !== s2.maRay) return;

                const overlap = checkWindowOverlap(s1, s2);
                if (overlap) {
                    detected.push({
                        id: `conflict-${i}-${s2.maChuyenTau}`,
                        severity: 'HIGH',
                        trains: [s1.maChuyenTau, s2.maChuyenTau],
                        type: 'TRACK_OVERLAP',
                        track: s1.maRay,
                        detail: `${overlap.w1Start}–${overlap.w1End} ↔ ${overlap.w2Start}–${overlap.w2End}`,
                        suggestion: `Dời ${s2.maChuyenTau} sang ray khác hoặc đổi giờ`
                    });
                }
            });

            // Kiểm tra xung đột 10p xuất phát toàn mạng
            schedules.slice(i + 1).forEach(s2 => {
                if (s1.vaiTroTaiDaNang === 'DIEM_CUOI' || s2.vaiTroTaiDaNang === 'DIEM_CUOI') return;
                const t1 = toM(s1.gioDiDuKien);
                const t2 = toM(s2.gioDiDuKien);
                if (t1 == null || t2 == null) return;

                const minGap = quyTacs.find(r => r.maQuyTac === 'QT-10')?.giaTri || 10;
                if (Math.abs(t1 - t2) < minGap) {
                    detected.push({
                        id: `gap-${i}-${s2.maChuyenTau}`,
                        severity: 'MEDIUM',
                        trains: [s1.maChuyenTau, s2.maChuyenTau],
                        type: 'DEPARTURE_GAP',
                        detail: `${s1.gioDiDuKien} & ${s2.gioDiDuKien}`,
                        suggestion: `Giãn cách giờ xuất phát ít nhất ${minGap} phút`
                    });
                }
            });
        });
        setConflicts(detected);
    };

    const toM = (t) => {
        if (!t) return null;
        const part = t.includes('T') ? t.split('T')[1] : t;
        const [h, m] = part.split(':').map(Number);
        return h * 60 + (m || 0);
    };

    /**
     * Tính cửa sổ chiếm ray theo vai trò tàu (phút từ 00:00)
     * Dùng cùng logic scheduleOptimizer để tránh sai biệt.
     */
    const getTrackWindow = (s) => {
        const role = s.vaiTroTaiDaNang;
        const bufferMin   = parseInt(quyTacs.find(r => r.maQuyTac === 'QT-01')?.giaTri || 15);
        const boardingMin = parseInt(quyTacs.find(r => r.maQuyTac === 'QT-02')?.giaTri || 30);
        const dwellMin    = parseInt(quyTacs.find(r => r.maQuyTac === 'QT-03')?.giaTri || 20);

        if (role === 'XUAT_PHAT') {
            const dep = toM(s.gioDiDuKien);
            if (dep == null) return null;
            return { start: dep - boardingMin, end: dep + bufferMin };
        }
        if (role === 'DIEM_CUOI') {
            const arr = toM(s.gioDenDuKien);
            if (arr == null) return null;
            return { start: arr - 1, end: arr + dwellMin + bufferMin };
        }
        // TRUNG_GIAN
        const arr = toM(s.gioDenDuKien);
        const dep = toM(s.gioDiDuKien);
        if (arr == null || dep == null) return null;
        return { start: arr - 1, end: dep + bufferMin };
    };

    const checkWindowOverlap = (s1, s2) => {
        const w1 = getTrackWindow(s1);
        const w2 = getTrackWindow(s2);
        if (!w1 || !w2) return null;  // thiếu dữ liệu → không báo xung đột

        const hasOverlap = !(w1.end <= w2.start || w2.end <= w1.start);
        if (!hasOverlap) return null;

        const fmt = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
        return {
            w1Start: fmt(w1.start), w1End: fmt(w1.end),
            w2Start: fmt(w2.start), w2End: fmt(w2.end)
        };
    };

    const calculateImpacts = (schedules) => {
        setImpacts({
            networkDelay: (schedules.length * 0.5).toFixed(1),
            trackUtilization: ((schedules.length / chuyenTau.length) * 100).toFixed(1),
            arrivals: schedules.filter(s => s.vaiTroTaiDaNang !== 'XUAT_PHAT').length,
            departures: schedules.filter(s => s.vaiTroTaiDaNang === 'XUAT_PHAT').length
        });
    };

    const handleScheduleDrag = (scheduleId, newTrack) => {
        setDraftSchedules(prev => {
            const updated = prev.map(s =>
                s.id === scheduleId ? { ...s, maRay: newTrack, status: 'modified' } : s
            );
            detectConflicts(updated);
            calculateImpacts(updated);
            return updated;
        });

        setChanges([{
            time: new Date(),
            action: 'MANUAL_CHANGE',
            message: `Đã di chuyển tàu sang ${newTrack}`,
            type: 'info'
        }, ...changes]);
    };

    const [pendingApply, setPendingApply] = useState(false);

    const handleApply = async () => {
        if (conflicts.length > 0 && !pendingApply) {
            showToast(
                `Vẫn còn ${conflicts.length} xung đột chưa giải quyết`,
                'warning',
                'Bấm "Áp Dụng" lần nữa để xác nhận tiếp tục dù còn xung đột.'
            );
            setPendingApply(true);
            setTimeout(() => setPendingApply(false), 5000);
            return;
        }
        setPendingApply(false);

        /**
         * Backend field gioDenDuKien/gioDiDuKien là LocalDateTime.
         * Cần ghép: selectedDate ("2026-04-21") + timeStr ("22:30") → "2026-04-21T22:30:00"
         */
        const toLocalDateTime = (dateStr, timeStr) => {
            if (!dateStr || !timeStr) return null;
            const timePart = timeStr.length === 5 ? `${timeStr}:00` : timeStr;
            return `${dateStr}T${timePart}`;
        };

        try {
            const ts = Date.now();
            const promises = draftSchedules.map((s, idx) => {
                // Cột ma_lich_trinh tối đa 20 ký tự
                // Dùng 6 số cuối của timestamp + idx để đảm bảo unique mà không vượt giới hạn
                const shortTs = String(ts).slice(-6);
                const rawId = `LT-${s.maChuyenTau}-${shortTs}${idx}`;
                const maLichTrinh = rawId.slice(0, 20); // đảm bảo ≤ 20 ký tự

                return lichTrinhAPI.create({
                    maLichTrinh,
                    maChuyenTau: s.maChuyenTau,
                    maRay: s.maRay,
                    ngayChay: selectedDate,
                    gioDenDuKien: toLocalDateTime(selectedDate, s.gioDenDuKien),
                    gioDiDuKien: toLocalDateTime(selectedDate, s.gioDiDuKien),
                    trangThai: 'CHO_XAC_NHAN',
                    soPhutTre: 0
                });
            });

            await Promise.all(promises);
            showToast(`Đã áp dụng thành công ${draftSchedules.length} lịch trình!`, 'success');
            setTimeout(() => { window.location.href = '/dieu-hanh/lich-trinh'; }, 1500);
        } catch (error) {
            const errorData = error.response?.data;
            if (errorData?.code === 'ERR_LEAD_TIME_24H') {
                showToast(
                    'Vi phạm quy tắc 24 giờ (QT-05)',
                    'error',
                    errorData.message || 'Lịch trình được tạo quá sát giờ chạy. Vui lòng kiểm tra lại hoặc liên hệ người quản lý.'
                );
            } else {
                showToast(
                    'Lỗi khi áp dụng lịch trình',
                    'error',
                    errorData?.message || error.message
                );
            }
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>⏳ Đang tải...</div>;

    return (
        <>
        {/* ─── Toast Container ─────────────────────────────────────────── */}
        <div style={{
            position: 'fixed', top: '20px', right: '20px',
            zIndex: 9999,
            display: 'flex', flexDirection: 'column', gap: '10px',
            maxWidth: '400px', width: '100%'
        }}>
            {toasts.map(t => {
                const cfg = TOAST_CFG[t.type] || TOAST_CFG.info;
                return (
                    <div key={t.id} style={{
                        background: cfg.bg,
                        border: `1.5px solid ${cfg.border}`,
                        borderRadius: '12px',
                        padding: '14px 16px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'flex-start',
                        animation: 'slideInRight 0.25s ease',
                    }}>
                        <span style={{ fontSize: '20px', lineHeight: 1, flexShrink: 0 }}>{cfg.icon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: '13px', color: cfg.color, marginBottom: t.detail ? '4px' : 0 }}>
                                {cfg.title}: {t.message}
                            </div>
                            {t.detail && (
                                <div style={{ fontSize: '12px', color: cfg.color, opacity: 0.85, lineHeight: 1.5 }}>
                                    {t.detail}
                                </div>
                            )}
                        </div>
                        <button onClick={() => dismissToast(t.id)} style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: cfg.color, opacity: 0.6, fontSize: '16px',
                            lineHeight: 1, padding: '0', flexShrink: 0
                        }}>✕</button>
                    </div>
                );
            })}
        </div>

        <div style={{ display: 'flex', height: 'calc(100vh - 56px)', background: 'var(--gray-50)', margin: '-24px', overflow: 'hidden' }}>
            {/* LEFT SIDEBAR */}
            <div style={{ width: '300px', background: 'white', borderRight: '2px solid var(--gray-200)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '20px', borderBottom: '2px solid var(--gray-200)', background: 'var(--navy-600)', color: 'white' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>🚂 Chưa Xếp Lịch Trình</h3>
                    <div style={{ fontSize: '13px', opacity: 0.9 }}>
                        {chuyenTau.length === 0
                            ? '✅ Tất cả chuyến đã có lịch'
                            : `${chuyenTau.length} chuyến chờ sắp xếp`}
                    </div>
                </div>

                <div style={{ padding: '16px', borderBottom: '1px solid var(--gray-200)' }}>
                    <button
                        className="btn btn-primary"
                        onClick={handleAutoOptimize}
                        disabled={chuyenTau.length === 0}
                        style={{ width: '100%', height: '44px', fontWeight: 700 }}
                    >
                        🤖 Tối Ưu Tự Động
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                    {chuyenTau.length === 0 ? (
                        <div style={{
                            padding: '24px 16px',
                            textAlign: 'center',
                            color: 'var(--gray-500)'
                        }}>
                            <div style={{ fontSize: '32px', marginBottom: '12px' }}>✅</div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--green-700)', marginBottom: '6px' }}>
                                Tất cả chuyến tàu đã có lịch trình
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>
                                Không còn chuyến nào cần sắp xếp trong ngày {selectedDate}
                            </div>
                        </div>
                    ) : (
                        chuyenTau.map(train => {
                            const draft = draftSchedules.find(d => d.maChuyenTau === train.maChuyenTau);
                            const role  = train.vaiTroTaiDaNang;

                            // Nhãn loại tàu
                            const roleLabel = role === 'XUAT_PHAT'  ? { text: 'Xuất phát', color: 'var(--navy-600)' }
                                           : role === 'DIEM_CUOI'   ? { text: 'Điểm cuối', color: 'var(--green-700)' }
                                           : { text: 'Trung gian',  color: 'var(--green-600)' };

                            // Hiển thị giờ đúng theo loại tàu
                            let timeInfo;
                            if (role === 'XUAT_PHAT') {
                                timeInfo = `⬅️ Khởi hành: ${train.gioDiDuKien || 'N/A'}`;
                            } else if (role === 'DIEM_CUOI') {
                                timeInfo = `➡️ Đến: ${train.gioDenDuKien || 'N/A'}`;
                            } else {
                                timeInfo = `${train.gioDenDuKien || 'N/A'} → ${train.gioDiDuKien || 'N/A'}`;
                            }

                            return (
                                <div key={train.maChuyenTau} style={{
                                    padding: '10px 12px',
                                    marginBottom: '8px',
                                    background: draft?.maRay ? 'var(--green-50)' : 'var(--gray-50)',
                                    border: `2px solid ${draft?.maRay ? 'var(--green-300)' : 'var(--gray-200)'}`,
                                    borderRadius: 'var(--radius)',
                                    cursor: 'default'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--navy-800)' }}>
                                            {train.maChuyenTau}
                                        </div>
                                        <span style={{
                                            fontSize: '10px',
                                            fontWeight: 600,
                                            padding: '2px 7px',
                                            borderRadius: '10px',
                                            background: draft?.maRay ? 'var(--green-100)' : 'var(--gray-100)',
                                            color: draft?.maRay ? 'var(--green-700)' : roleLabel.color,
                                            border: `1px solid ${draft?.maRay ? 'var(--green-300)' : 'var(--gray-200)'}`
                                        }}>
                                            {draft?.maRay ? `✓ ${draft.maRay}` : roleLabel.text}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>
                                        {timeInfo}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div style={{ padding: '16px', borderTop: '2px solid var(--gray-200)' }}>
                    <button className="btn btn-primary btn-lg" onClick={handleApply} disabled={draftSchedules.length === 0} style={{ width: '100%', height: '48px', fontWeight: 700 }}>
                        ⚡ Áp Dụng Lịch Trình
                    </button>
                    <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--gray-600)', textAlign: 'center' }}>
                        {draftSchedules.length}/{chuyenTau.length} đã sắp xếp
                    </div>
                </div>
            </div>

            {/* RIGHT CONTENT */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {/* TOP BAR */}
                <div style={{ padding: '16px 24px', background: 'white', borderBottom: '2px solid var(--gray-200)', display: 'flex', gap: '24px' }}>
                    <div style={{ padding: '8px 16px', background: 'var(--orange-50)', border: '1px solid var(--orange-300)', borderRadius: 'var(--radius)', fontSize: '13px', fontWeight: 700, color: 'var(--orange-700)' }}>
                        📝 Chế độ mô phỏng
                    </div>
                    <div>
                        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: '4px' }}>NGÀY</label>
                        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="form-control" style={{ width: '160px', height: '36px' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: '4px' }}>THỜI GIAN</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input type="time" value={timeRange.start} onChange={(e) => setTimeRange({ ...timeRange, start: e.target.value })} className="form-control" style={{ width: '100px', height: '36px' }} />
                            <span>—</span>
                            <input type="time" value={timeRange.end} onChange={(e) => setTimeRange({ ...timeRange, end: e.target.value })} className="form-control" style={{ width: '100px', height: '36px' }} />
                        </div>
                    </div>
                </div>

                {/* GANTT CHART - Scrollable Container */}
                <div style={{
                    flex: 1,
                    overflow: 'hidden',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0
                }}>
                    <SimulationGanttChart
                        schedules={draftSchedules}
                        tracks={duongRay}
                        timeRange={timeRange}
                        conflicts={conflicts}
                        onScheduleDrag={handleScheduleDrag}
                        targetDate={selectedDate}
                    />
                </div>

                {/* BOTTOM PANELS */}
                <div style={{ height: '280px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', padding: '16px', background: 'var(--gray-50)', borderTop: '2px solid var(--gray-200)' }}>
                    <SimulationImpactPanel impacts={impacts} />
                    <SimulationConflictPanel conflicts={conflicts} />
                    <SimulationChangesLog changes={changes} />
                </div>
            </div>
        </div>
        </>
    );
}
