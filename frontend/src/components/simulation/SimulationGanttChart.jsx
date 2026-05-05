import { useRef, useCallback, useEffect } from 'react';
import { HOUR_WIDTH, TOTAL_WIDTH, generateTimeSlots } from '../../utils/timeUtils';

// ─── Hằng số (phải khớp với scheduleOptimizer.js) ───────────────────────────
const BOARDING_MINUTES = 30;   // Thời gian lên tàu trước giờ xuất phát
const BUFFER_MINUTES   = 15;   // Đệm sau khi tàu rời ray
const ARRIVAL_BUFFER   = 1;    // Chuẩn bị ray trước giờ đến
const DEP_GAP_MINUTES  = 10;   // Khoảng cách xuất phát tối thiểu

// ─── Helper ──────────────────────────────────────────────────────────────────

/** "HH:mm[:ss]" hoặc ISO → phút từ 00:00 */
function toMin(t) {
    if (!t) return null;
    const part = t.includes('T') ? t.split('T')[1] : t;
    const [h, m] = part.split(':').map(Number);
    return h * 60 + (m || 0);
}

/** Phút → pixel */
const toPx = (mins) => (mins / 60) * HOUR_WIDTH;

/** Phút → "HH:mm" */
function fmtMin(mins) {
    if (mins == null) return '';
    const n = ((mins % 1440) + 1440) % 1440;
    return `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
}

// ─── Màu theo vai trò ────────────────────────────────────────────────────────
const ROLE_COLORS = {
    XUAT_PHAT:  { core: '#1E3A5F', buffer: '#3B6EA5', boarding: '#7EB3E6', text: 'white' },
    DIEM_CUOI:  { core: '#14532D', buffer: '#22863A', boarding: '#6EC68A', text: 'white' },
    TRUNG_GIAN: { core: '#065F46', buffer: '#059669', boarding: '#6EE7B7', text: 'white' },
};

/**
 * Tính layout chi tiết của một block Gantt.
 * Trả về các khoảng phân chia rõ: boarding/prep | core | buffer
 */
function getDetailedLayout(schedule) {
    const role = schedule.vaiTroTaiDaNang;

    if (role === 'XUAT_PHAT') {
        const dep = toMin(schedule.gioDiDuKien);
        if (dep == null) return null;
        return {
            // zone 1: lên tàu (boarding) — trái nhất
            boardingStart: dep - BOARDING_MINUTES,
            boardingEnd:   dep,
            // zone 2: core (không có với XUAT_PHAT — giờ đi là điểm)
            coreStart:     dep,
            coreEnd:       dep,
            // zone 3: buffer đệm sau khi tàu đi
            bufferStart:   dep,
            bufferEnd:     dep + BUFFER_MINUTES,
            // thông tin render
            windowStart:   dep - BOARDING_MINUTES,
            windowEnd:     dep + BUFFER_MINUTES,
            label:         `Lên tàu ${fmtMin(dep - BOARDING_MINUTES)} | Xuất phát ${fmtMin(dep)}`,
        };
    }

    if (role === 'DIEM_CUOI') {
        const arr = toMin(schedule.gioDenDuKien);
        if (arr == null) return null;
        const leaveTrack = arr + BUFFER_MINUTES; // rời ray = đến + 15p
        return {
            boardingStart: arr - ARRIVAL_BUFFER,
            boardingEnd:   arr,
            coreStart:     arr,
            coreEnd:       leaveTrack,
            bufferStart:   leaveTrack,
            bufferEnd:     leaveTrack + BUFFER_MINUTES,
            windowStart:   arr - ARRIVAL_BUFFER,
            windowEnd:     leaveTrack + BUFFER_MINUTES,
            label:         `Đến ${fmtMin(arr)} | Rời ray ${fmtMin(leaveTrack)}`,
        };
    }

    // TRUNG_GIAN
    const arr = toMin(schedule.gioDenDuKien);
    const dep = toMin(schedule.gioDiDuKien);
    if (arr == null || dep == null) return null;
    return {
        boardingStart: arr - ARRIVAL_BUFFER,
        boardingEnd:   arr,
        coreStart:     arr,
        coreEnd:       dep,
        bufferStart:   dep,
        bufferEnd:     dep + BUFFER_MINUTES,
        windowStart:   arr - ARRIVAL_BUFFER,
        windowEnd:     dep + BUFFER_MINUTES,
        label:         `Đến ${fmtMin(arr)} → Đi ${fmtMin(dep)}`,
    };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function SimulationGanttChart({
    schedules,
    tracks,
    timeRange,
    conflicts,
    onScheduleDrag,
    targetDate   // ngày đang xem ("уууу-MM-dd")
}) {
    const ganttScrollRef = useRef(null);
    const isDragging     = useRef(false);
    const dragStartX     = useRef(0);
    const scrollStartX   = useRef(0);
    const timeSlots      = generateTimeSlots();

    // ── Drag-to-scroll ───────────────────────────────────────────────────────
    const onGanttMouseDown = useCallback((e) => {
        if (e.button !== 0) return;
        const el = ganttScrollRef.current;
        if (!el) return;
        isDragging.current  = true;
        dragStartX.current  = e.clientX;
        scrollStartX.current = el.scrollLeft;
        el.style.cursor     = 'grabbing';
        el.style.userSelect = 'none';
    }, []);

    const onGanttMouseMove = useCallback((e) => {
        if (!isDragging.current) return;
        const el = ganttScrollRef.current;
        if (!el) return;
        el.scrollLeft = scrollStartX.current - (e.clientX - dragStartX.current);
    }, []);

    const onGanttMouseUp = useCallback(() => {
        isDragging.current = false;
        const el = ganttScrollRef.current;
        if (el) { el.style.cursor = 'grab'; el.style.userSelect = ''; }
    }, []);

    useEffect(() => {
        document.addEventListener('mousemove', onGanttMouseMove);
        document.addEventListener('mouseup', onGanttMouseUp);
        return () => {
            document.removeEventListener('mousemove', onGanttMouseMove);
            document.removeEventListener('mouseup', onGanttMouseUp);
        };
    }, [onGanttMouseMove, onGanttMouseUp]);

    // ── Conflict check ───────────────────────────────────────────────────────
    const isInConflict = (schedule) =>
        conflicts.some(c => c.trains.includes(schedule.maChuyenTau));

    // ── Drop handler ─────────────────────────────────────────────────────────
    const handleDrop = (e, trackId) => {
        e.preventDefault();
        const scheduleId = e.dataTransfer.getData('scheduleId');
        if (scheduleId) onScheduleDrag(scheduleId, trackId);
    };

    // ── Tính vị trí các marker khoảng cách xuất phát 10 phút ────────────────
    // Tập hợp giờ đi của tất cả tàu có giờ đi (XUAT_PHAT + TRUNG_GIAN)
    const departureTimes = schedules
        .filter(s => s.vaiTroTaiDaNang !== 'DIEM_CUOI' && s.gioDiDuKien)
        .map(s => ({ id: s.id, ct: s.maChuyenTau, dep: toMin(s.gioDiDuKien) }))
        .sort((a, b) => a.dep - b.dep);

    return (
        <div style={{
            background: 'white',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0
        }}>
            {/* ── Header + Legend ─────────────────────────────────────────── */}
            <div style={{
                padding: '12px 20px',
                borderBottom: '2px solid var(--gray-200)',
                background: 'var(--gray-50)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
                gap: 12
            }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--navy-800)', whiteSpace: 'nowrap' }}>
                    📊 Biểu Đồ Gantt Lịch Trình
                </h3>

                {/* Legend */}
                <div style={{ display: 'flex', gap: '10px', fontSize: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {[
                        { color: '#1E3A5F', label: 'Xuất phát (ĐN→B)' },
                        { color: '#065F46', label: 'Trung gian (A→ĐN→B)' },
                        { color: '#14532D', label: 'Điểm cuối (A→ĐN)' },
                    ].map(({ color, label }) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <div style={{ width: 12, height: 12, background: color, borderRadius: 2 }} />
                            <span>{label}</span>
                        </div>
                    ))}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 12, height: 12, background: '#3B6EA5', borderRadius: 2, opacity: 0.6 }} />
                        <span>Vùng đệm 15p</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{
                            width: 12, height: 12, borderRadius: 2,
                            background: 'rgba(245,158,11,0.25)',
                            border: '1px dashed #F59E0B'
                        }} />
                        <span>Vùng cấm xuất phát ±10p (xuyên ray)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 12, height: 12, background: 'var(--red-600)', borderRadius: 2 }} />
                        <span>Xung đột</span>
                    </div>
                </div>
            </div>

            {/* ── Chart Body ──────────────────────────────────────────────── */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

                {/* LEFT: Track labels */}
                <div style={{
                    width: '110px', minWidth: '110px', flexShrink: 0,
                    zIndex: 4, background: 'var(--gray-50)',
                    borderRight: '2px solid var(--gray-200)'
                }}>
                    <div style={{
                        height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '10px', fontWeight: 600, color: 'var(--gray-500)',
                        textTransform: 'uppercase', borderBottom: '2px solid var(--gray-200)',
                        background: 'var(--gray-50)'
                    }}>ĐƯỜNG RAY</div>

                    {tracks.map(track => (
                        <div key={track.maRay} style={{
                            height: '68px',
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            borderBottom: '1px solid var(--gray-200)',
                            padding: '4px 8px', background: 'var(--gray-50)'
                        }}>
                            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--navy-800)' }}>
                                {track.soRay || track.maRay}
                            </div>
                            <div style={{ fontSize: '9px', color: 'var(--gray-400)', marginTop: 2 }}>
                                {(() => {
                                    // Phương án 2: check ngày phong tỏa
                                    if (track.trangThai === 'PHONG_TOA_TAM' && track.thoiGianBatDauPhongToa) {
                                        const batDau = new Date(track.thoiGianBatDauPhongToa);
                                        const bd = `${batDau.getFullYear()}-${String(batDau.getMonth()+1).padStart(2,'0')}-${String(batDau.getDate()).padStart(2,'0')}`;
                                        return bd === targetDate ? '🔒 Phong toả' : '';
                                    }
                                    if (track.trangThai === 'BAO_TRI') return '🔧 Bảo trì';
                                    return '';
                                })()}
                            </div>
                        </div>
                    ))}
                </div>

                {/* RIGHT: Scrollable timeline */}
                <div
                    ref={ganttScrollRef}
                    onMouseDown={onGanttMouseDown}
                    style={{ flex: 1, overflowX: 'auto', overflowY: 'auto', cursor: 'grab' }}
                >
                    <div style={{ minWidth: `${TOTAL_WIDTH}px`, position: 'relative' }}>

                        {/* Time header */}
                        <div style={{
                            display: 'flex', height: '40px',
                            background: 'var(--gray-50)',
                            borderBottom: '2px solid var(--gray-200)',
                            position: 'sticky', top: 0, zIndex: 3
                        }}>
                            {timeSlots.map((slot, i) => (
                                <div key={i} style={{
                                    flex: `0 0 ${HOUR_WIDTH}px`,
                                    textAlign: 'center', fontSize: '11px', fontWeight: 600,
                                    color: 'var(--gray-600)', padding: '12px 0',
                                    borderLeft: i > 0 ? '1px solid var(--gray-200)' : 'none'
                                }}>{slot}</div>
                            ))}
                        </div>

                        {/* Departure gap markers row (above tracks, below header) */}
                        {departureTimes.length > 1 && (
                            <div style={{ height: '20px', position: 'relative', background: '#FFFBEB', borderBottom: '1px dashed #F59E0B' }}>
                                {departureTimes.map((dt, idx) => {
                                    const x = toPx(dt.dep);
                                    const nextDt = departureTimes[idx + 1];
                                    const gap = nextDt ? nextDt.dep - dt.dep : null;
                                    const tooClose = gap != null && gap < DEP_GAP_MINUTES;
                                    return (
                                        <div key={dt.id}>
                                            {/* Marker đứng */}
                                            <div style={{
                                                position: 'absolute', left: `${x}px`, top: 0, bottom: 0,
                                                width: 2, background: tooClose ? '#DC2626' : '#F59E0B', zIndex: 2
                                            }} />
                                            {/* Nhãn giờ đi */}
                                            <div style={{
                                                position: 'absolute', left: `${x + 3}px`, top: 2,
                                                fontSize: 9, color: tooClose ? '#DC2626' : '#92400E',
                                                fontWeight: 600, whiteSpace: 'nowrap'
                                            }}>
                                                {fmtMin(dt.dep)}
                                                {tooClose && ` ⚠️ ${gap}p`}
                                            </div>
                                            {/* Span khoảng cách giữa 2 tàu */}
                                            {gap != null && (
                                                <div style={{
                                                    position: 'absolute',
                                                    left: `${x}px`,
                                                    width: `${toPx(gap)}px`,
                                                    top: 0, bottom: 0,
                                                    background: tooClose
                                                        ? 'rgba(220,38,38,0.10)'
                                                        : 'rgba(245,158,11,0.08)',
                                                    borderRight: `2px dashed ${tooClose ? '#DC2626' : '#F59E0B'}`,
                                                    zIndex: 1
                                                }} />
                                            )}
                                        </div>
                                    );
                                })}
                                <div style={{
                                    position: 'absolute', left: 4, top: 3,
                                    fontSize: 9, color: '#78350F', fontWeight: 700
                                }}>⏱ Khoảng xuất phát</div>
                            </div>
                        )}

                        {/* Track rows */}
                        {tracks.map(track => {
                            const trackSchedules = schedules.filter(s =>
                                s.maRay === track.maRay && (s.gioDenDuKien || s.gioDiDuKien)
                            );

                            return (
                                <div
                                    key={track.maRay}
                                    style={{
                                        height: '68px', position: 'relative',
                                        borderBottom: '1px solid var(--gray-200)',
                                        background: (() => {
                                            if (track.trangThai !== 'PHONG_TOA_TAM') return 'white';
                                            // Phương án 2: chỉ tô nền đỏ khi đúng ngày phong tỏa
                                            if (!track.thoiGianBatDauPhongToa) return 'white';
                                            const batDau = new Date(track.thoiGianBatDauPhongToa);
                                            const bd = `${batDau.getFullYear()}-${String(batDau.getMonth()+1).padStart(2,'0')}-${String(batDau.getDate()).padStart(2,'0')}`;
                                            return bd === targetDate
                                                ? 'repeating-linear-gradient(45deg,#FFF8F8,#FFF8F8 8px,#FEE2E2 8px,#FEE2E2 16px)'
                                                : 'white';
                                        })()
                                    }}
                                    onDragOver={e => e.preventDefault()}
                                    onDrop={e => handleDrop(e, track.maRay)}
                                >
                                    {/* Grid lines */}
                                    {timeSlots.map((_, i) => (
                                        <div key={i} style={{
                                            position: 'absolute', left: `${i * HOUR_WIDTH}px`,
                                            top: 0, bottom: 0, width: 1, background: 'var(--gray-100)'
                                        }} />
                                    ))}

                                    {/* Past-time overlay */}
                                    {(() => {
                                        if (!targetDate) return null;
                                        const now = new Date();
                                        const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
                                        let pastPx = 0;
                                        if (targetDate < todayStr) pastPx = TOTAL_WIDTH;
                                        else if (targetDate === todayStr) pastPx = (now.getHours() + now.getMinutes() / 60) * HOUR_WIDTH;
                                        if (pastPx <= 0) return null;
                                        return (
                                            <div style={{
                                                position: 'absolute', left: 0, top: 0, bottom: 0,
                                                width: `${pastPx}px`,
                                                background: 'rgba(148,163,184,0.13)',
                                                borderRight: pastPx < TOTAL_WIDTH ? '2px solid rgba(100,116,139,0.3)' : 'none',
                                                zIndex: 2, pointerEvents: 'none'
                                            }} />
                                        );
                                    })()}

                                    {/* Block phong tỏa thời gian thực (Phương án 2) */}
                                    {track.trangThai === 'PHONG_TOA_TAM'
                                        && track.thoiGianBatDauPhongToa
                                        && track.thoiGianKetThucPhongToa
                                        && (() => {
                                            const batDau = new Date(track.thoiGianBatDauPhongToa);
                                            const ketThuc = new Date(track.thoiGianKetThucPhongToa);
                                            const bd = `${batDau.getFullYear()}-${String(batDau.getMonth()+1).padStart(2,'0')}-${String(batDau.getDate()).padStart(2,'0')}`;
                                            if (bd !== targetDate) return null;

                                            const startH = batDau.getHours() + batDau.getMinutes() / 60;
                                            const endH   = ketThuc.getHours() + ketThuc.getMinutes() / 60;
                                            const totalMins = Math.round((ketThuc - batDau) / 60000);
                                            const leftPx  = toPx(startH * 60);
                                            const widthPx = toPx(totalMins);
                                            const fmt = (h) => `${String(Math.floor(h)%24).padStart(2,'0')}:${String(Math.round((h%1)*60)).padStart(2,'0')}`;
                                            return (
                                                <div style={{
                                                    position: 'absolute', top: 0, bottom: 0,
                                                    left: `${leftPx}px`, width: `${Math.max(widthPx, 40)}px`,
                                                    background: 'repeating-linear-gradient(45deg,#FFF8F8,#FFF8F8 8px,#FEE2E2 8px,#FEE2E2 16px)',
                                                    borderLeft: '2px solid #DC2626', borderRight: '1px solid #DC2626',
                                                    zIndex: 1, pointerEvents: 'none'
                                                }}>
                                                    <div style={{ position: 'absolute', top: 3, left: 5, fontSize: 9, color: '#DC2626', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                                        🚫 P/T TẠM
                                                    </div>
                                                    <div style={{ position: 'absolute', bottom: 3, left: 5, fontSize: 8, color: '#991B1B', whiteSpace: 'nowrap' }}>
                                                        {fmt(startH)} – {fmt(endH)} ({totalMins}p)
                                                    </div>
                                                </div>
                                            );
                                        })()
                                    }

                                    {/* ── Cross-track departure gap overlay ──────────────────────
                                        Với mỗi tàu xuất phát từ ray KHÁC ray này,
                                        vẽ vùng cấm 10 phút (trước & sau giờ đi).
                                        Giúp operator thấy ray này không thể có tàu xuất phát
                                        trong khoảng thời gian đó.
                                    ───────────────────────────────────────────────────────── */}
                                    {departureTimes
                                        .filter(dt => {
                                            // Lấy schedule gốc để xác định ray
                                            const src = schedules.find(s => s.id === dt.id);
                                            return src && src.maRay !== track.maRay;
                                        })
                                        .map((dt, idx) => {
                                            const gapLeft  = toPx(dt.dep - DEP_GAP_MINUTES);
                                            const gapWidth = toPx(DEP_GAP_MINUTES * 2);          // ±10p từ giờ đi
                                            const depX     = toPx(dt.dep);

                                            // Kiểm tra có tàu nào trên ray này xuất phát trùng khoảng không
                                            const hasLocalDep = departureTimes.some(lt => {
                                                const lSrc = schedules.find(s => s.id === lt.id);
                                                return lSrc?.maRay === track.maRay
                                                    && Math.abs(lt.dep - dt.dep) < DEP_GAP_MINUTES
                                                    && lt.id !== dt.id;
                                            });

                                            return (
                                                <div key={`gap-${dt.id}-${track.maRay}-${idx}`}>
                                                    {/* Vùng nền cấm ±10p — chỉ tô màu, không dùng border để tránh 2 đường biên */}
                                                    <div
                                                        title={`Khoảng cấm xuất phát: tàu ${dt.ct} (${fmtMin(dt.dep)}) đang xuất phát từ ray khác — ray này không được xuất phát trong ±${DEP_GAP_MINUTES}p`}
                                                        style={{
                                                            position: 'absolute',
                                                            left:   `${Math.max(0, gapLeft)}px`,
                                                            width:  `${gapWidth}px`,
                                                            top: 0, bottom: 0,
                                                            background: hasLocalDep
                                                                ? 'rgba(220,38,38,0.12)'
                                                                : 'rgba(245,158,11,0.10)',
                                                            zIndex: 0,
                                                            pointerEvents: 'none'
                                                        }}
                                                    />
                                                    {/* Chỉ 1 đường dọc duy nhất tại đúng giờ đi */}
                                                    <div style={{
                                                        position: 'absolute',
                                                        left: `${toPx(dt.dep)}px`,
                                                        top: 0, bottom: 0,
                                                        width: 1,
                                                        background: hasLocalDep
                                                            ? 'rgba(220,38,38,0.55)'
                                                            : 'rgba(245,158,11,0.50)',
                                                        zIndex: 1,
                                                        pointerEvents: 'none'
                                                    }} />
                                                    {/* Nhãn nhỏ tên tàu */}
                                                    <div style={{
                                                        position: 'absolute',
                                                        left: `${toPx(dt.dep) + 2}px`,
                                                        top: 2,
                                                        fontSize: 8,
                                                        color: hasLocalDep ? '#DC2626' : '#92400E',
                                                        fontWeight: 600,
                                                        whiteSpace: 'nowrap',
                                                        pointerEvents: 'none',
                                                        zIndex: 2
                                                    }}>
                                                        {hasLocalDep ? '⚠️' : '⏱'} {dt.ct}
                                                    </div>
                                                </div>
                                            );

                                        })
                                    }


                                    {trackSchedules.map(schedule => {
                                        const layout = getDetailedLayout(schedule);
                                        if (!layout) return null;

                                        const inConflict = isInConflict(schedule);
                                        const isModified = schedule.status === 'modified';
                                        const role       = schedule.vaiTroTaiDaNang;
                                        const colors     = ROLE_COLORS[role] || ROLE_COLORS.TRUNG_GIAN;

                                        const {
                                            boardingStart, boardingEnd,
                                            coreStart, coreEnd,
                                            bufferStart, bufferEnd,
                                            windowStart, windowEnd, label
                                        } = layout;

                                        const totalLeft  = toPx(windowStart);
                                        const totalWidth = toPx(windowEnd - windowStart);

                                        // Widths của từng zone
                                        const boardW = toPx(boardingEnd - boardingStart);
                                        const coreW  = toPx(coreEnd - coreStart);
                                        const bufW   = toPx(bufferEnd - bufferStart);

                                        const conflictColor = '#DC2626';

                                        return (
                                            <div
                                                key={schedule.id}
                                                draggable
                                                onDragStart={e => {
                                                    e.dataTransfer.setData('scheduleId', schedule.id);
                                                    e.dataTransfer.effectAllowed = 'move';
                                                }}
                                                title={`${schedule.maChuyenTau} | ${role}\n${label}\nCửa sổ: ${fmtMin(windowStart)} – ${fmtMin(windowEnd)}`}
                                                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                                                onMouseLeave={e => e.currentTarget.style.filter = ''}
                                                style={{
                                                    position: 'absolute',
                                                    left: `${totalLeft}px`,
                                                    top: '10px',
                                                    width: `${Math.max(totalWidth, 60)}px`,
                                                    height: '48px',
                                                    display: 'flex',
                                                    borderRadius: '6px',
                                                    overflow: 'hidden',
                                                    cursor: 'move',
                                                    zIndex: 2,
                                                    boxShadow: inConflict
                                                        ? `0 0 0 2px ${conflictColor}`
                                                        : '0 2px 4px rgba(0,0,0,0.15)',
                                                    transition: 'filter 0.1s'
                                                }}
                                            >
                                                {/* Zone 1: Boarding / Preparation (màu nhạt) */}
                                                {boardW > 0 && (
                                                    <div style={{
                                                        width: `${boardW}px`, flexShrink: 0,
                                                        background: inConflict ? '#FCA5A5' : colors.boarding,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        borderRight: `1px dashed ${inConflict ? conflictColor : 'rgba(255,255,255,0.4)'}`,
                                                        fontSize: 8, color: inConflict ? conflictColor : 'rgba(255,255,255,0.8)',
                                                        fontWeight: 600, padding: '0 2px', textAlign: 'center',
                                                        whiteSpace: 'nowrap', overflow: 'hidden'
                                                    }}>
                                                        {role === 'XUAT_PHAT'
                                                            ? (boardW > 24 ? '↑ Lên tàu' : '')
                                                            : (boardW > 16 ? '▶' : '')}
                                                    </div>
                                                )}

                                                {/* Zone 2: Core block (màu đậm chính) */}
                                                <div style={{
                                                    flex: coreW > 0 ? `0 0 ${coreW}px` : '1',
                                                    background: inConflict ? conflictColor
                                                              : isModified ? '#D97706'
                                                              : colors.core,
                                                    display: 'flex', flexDirection: 'column',
                                                    justifyContent: 'center', padding: '3px 6px',
                                                    minWidth: 0, overflow: 'hidden'
                                                }}>
                                                    <div style={{
                                                        fontSize: 10, fontWeight: 700, color: 'white',
                                                        whiteSpace: 'nowrap', overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}>
                                                        {inConflict && '⚠️ '}{schedule.maChuyenTau}
                                                    </div>
                                                    <div style={{
                                                        fontSize: 8, opacity: 0.85, color: 'white',
                                                        whiteSpace: 'nowrap', overflow: 'hidden',
                                                        textOverflow: 'ellipsis', marginTop: 1
                                                    }}>
                                                        {label}
                                                    </div>
                                                </div>

                                                {/* Zone 3: Buffer đệm (màu nhạt phải) */}
                                                {bufW > 0 && (
                                                    <div style={{
                                                        width: `${bufW}px`, flexShrink: 0,
                                                        background: inConflict ? '#FCA5A5' : colors.buffer,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        borderLeft: `1px dashed ${inConflict ? conflictColor : 'rgba(255,255,255,0.4)'}`,
                                                        fontSize: 8, color: inConflict ? conflictColor : 'rgba(255,255,255,0.7)',
                                                        fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden'
                                                    }}>
                                                        {bufW > 20 ? '+15p' : ''}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
