import { useRef, useCallback, useEffect } from 'react';
import { HOUR_WIDTH, TOTAL_WIDTH, TIMELINE_START, TIMELINE_END, generateTimeSlots, getPxPos, getPxWidth, formatTime } from '../../utils/timeUtils';
import ScheduleBlock from './ScheduleBlock';
import SchedulePreviewBlock from './SchedulePreviewBlock';

/**
 * Gantt Timeline Component
 * Displays timeline with schedule blocks for track selection
 */
export default function GanttTimeline({
    duongRay,
    lichTrinh,
    selectedRay,
    onSelectRay,
    editItem,
    newSchedulePreview,
    targetDate   // "YYYY-MM-DD" — để tính overlay quá khứ
}) {
    const ganttScrollRef = useRef(null);
    const isDragging = useRef(false);
    const dragStartX = useRef(0);
    const scrollStartX = useRef(0);
    const timeSlots = generateTimeSlots();

    // ── Past-time overlay (ơ mờ vùng đã qua) ─────────────────────
    const getPastOverlayWidth = () => {
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
        if (!targetDate || targetDate > todayStr) return 0;         // Ngày tương lai — không có overlay
        if (targetDate < todayStr) return TOTAL_WIDTH;               // Ngày đã qua — phủ toàn bộ
        // Hôm nay: phủ từ 0h đến giờ hiện tại
        const nowH = now.getHours() + now.getMinutes() / 60;
        return nowH * HOUR_WIDTH;
    };
    const pastOverlayWidth = getPastOverlayWidth();

    const onGanttMouseDown = useCallback((e) => {
        if (e.button !== 0) return;
        const el = ganttScrollRef.current;
        if (!el) return;
        isDragging.current = true;
        dragStartX.current = e.clientX;
        scrollStartX.current = el.scrollLeft;
        el.style.cursor = 'grabbing';
        el.style.userSelect = 'none';
    }, []);

    const onGanttMouseMove = useCallback((e) => {
        if (!isDragging.current) return;
        const el = ganttScrollRef.current;
        if (!el) return;
        const dx = e.clientX - dragStartX.current;
        el.scrollLeft = scrollStartX.current - dx;
    }, []);

    const onGanttMouseUp = useCallback(() => {
        isDragging.current = false;
        const el = ganttScrollRef.current;
        if (el) {
            el.style.cursor = 'grab';
            el.style.userSelect = '';
        }
    }, []);

    useEffect(() => {
        document.addEventListener('mousemove', onGanttMouseMove);
        document.addEventListener('mouseup', onGanttMouseUp);
        return () => {
            document.removeEventListener('mousemove', onGanttMouseMove);
            document.removeEventListener('mouseup', onGanttMouseUp);
        };
    }, [onGanttMouseMove, onGanttMouseUp]);

    return (
        <div style={{
            border: '1px solid var(--gray-200)',
            borderRadius: 'var(--radius-md)',
            overflow: 'visible',
            background: 'var(--white)',
            display: 'flex',
            position: 'relative'
        }}>
            {/* LEFT: Fixed ray labels column */}
            <div style={{ width: '72px', minWidth: '72px', flexShrink: 0, zIndex: 4 }}>
                <div style={{
                    padding: '8px',
                    fontSize: '10px',
                    fontWeight: 600,
                    color: 'var(--gray-500)',
                    textTransform: 'uppercase',
                    background: 'var(--gray-50)',
                    borderBottom: '2px solid var(--gray-200)',
                    borderRight: '1px solid var(--gray-200)',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    RAY
                </div>
                {duongRay.map(ray => {
                    const isSelected = ray.maRay === selectedRay;
                    return (
                        <div
                            key={ray.maRay}
                            style={{
                                padding: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                background: isSelected ? 'var(--navy-800)' : 'var(--gray-50)',
                                color: isSelected ? 'var(--white)' : 'var(--gray-600)',
                                fontWeight: 700,
                                fontSize: '13px',
                                flexDirection: 'column',
                                lineHeight: 1.2,
                                borderRight: '1px solid var(--gray-200)',
                                borderBottom: '1px solid var(--gray-100)',
                                height: '48px'
                            }}
                            onClick={() => onSelectRay(ray.maRay)}
                        >
                            <span style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '1px', opacity: 0.7 }}>
                                RAY
                            </span>
                            <span style={{ fontSize: '18px' }}>{ray.soRay || ray.maRay}</span>
                        </div>
                    );
                })}
            </div>

            {/* RIGHT: Scrollable timeline */}
            <div
                ref={ganttScrollRef}
                onMouseDown={onGanttMouseDown}
                style={{
                    flex: 1,
                    overflowX: 'auto',
                    overflowY: 'visible',
                    cursor: 'grab',
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'var(--gray-300) transparent'
                }}
            >
                <div style={{ minWidth: `${TOTAL_WIDTH}px`, overflow: 'visible', position: 'relative' }}>
                    {/* Time header row */}
                    <div style={{ display: 'flex', borderBottom: '2px solid var(--gray-200)', height: '34px' }}>
                        {timeSlots.map((slot, i) => (
                            <div
                                key={i}
                                style={{
                                    flex: `0 0 ${HOUR_WIDTH}px`,
                                    textAlign: 'center',
                                    fontSize: '9px',
                                    fontWeight: 600,
                                    color: 'var(--gray-400)',
                                    padding: '8px 0',
                                    borderLeft: '1px solid var(--gray-100)',
                                    background: 'var(--gray-50)'
                                }}
                            >
                                {slot.substring(0, 5)}
                            </div>
                        ))}
                    </div>

                    {/* Track timeline rows */}
                    {duongRay.map(ray => {
                        const isSelected = ray.maRay === selectedRay;
                        const raySchedules = lichTrinh.filter(
                            lt => lt.maRay === ray.maRay && (!editItem || lt.maLichTrinh !== editItem.maLichTrinh)
                        );

                        return (
                            <div
                                key={ray.maRay}
                                style={{
                                    height: '48px',
                                    position: 'relative',
                                    borderBottom: '1px solid var(--gray-100)',
                                    background: isSelected ? 'var(--navy-50)' : 'transparent',
                                    transition: 'background 0.15s',
                                    overflow: 'visible'
                                }}
                                onClick={() => onSelectRay(ray.maRay)}
                            >
                                {/* Grid lines */}
                                {timeSlots.map((_, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            position: 'absolute',
                                            left: `${i * HOUR_WIDTH}px`,
                                            top: 0,
                                            bottom: 0,
                                            width: '1px',
                                            background: 'var(--gray-100)'
                                        }}
                                    />
                                ))}

                                {/* Past-time overlay */}
                                {pastOverlayWidth > 0 && (
                                    <div style={{
                                        position: 'absolute', left: 0, top: 0, bottom: 0,
                                        width: `${pastOverlayWidth}px`,
                                        background: 'rgba(148,163,184,0.13)',
                                        borderRight: pastOverlayWidth < TOTAL_WIDTH ? '2px solid rgba(100,116,139,0.35)' : 'none',
                                        zIndex: 4, pointerEvents: 'none'
                                    }} />
                                )}

                                {/* Current time indicator */}
                                {(() => {
                                    const now = new Date();
                                    const nowH = now.getHours() + now.getMinutes() / 60;
                                    if (nowH >= TIMELINE_START && nowH <= TIMELINE_END) {
                                        const px = (nowH - TIMELINE_START) * HOUR_WIDTH;
                                        return (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    left: `${px}px`,
                                                    top: 0,
                                                    bottom: 0,
                                                    width: '2px',
                                                    background: 'rgba(59, 85, 149, 0.5)',
                                                    zIndex: 2
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        position: 'absolute',
                                                        top: '-2px',
                                                        left: '-3px',
                                                        width: '8px',
                                                        height: '8px',
                                                        background: 'var(--navy-600)',
                                                        borderRadius: '50%'
                                                    }}
                                                />
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}

                                {/* Existing schedule blocks */}
                                {raySchedules.map(lt => {
                                    if (!lt.gioDenDuKien || !lt.gioDiDuKien) return null;
                                    const tDen = formatTime(lt.gioDenDuKien);
                                    const tDi = formatTime(lt.gioDiDuKien);

                                    // Calculate width including delay
                                    const delayMinutes = parseInt(lt.soPhutTre) || 0;
                                    const leftPx = getPxPos(tDen);
                                    const baseWidth = getPxWidth(tDen, tDi);
                                    // Add delay to the width (convert minutes to pixels)
                                    const delayPx = (delayMinutes / 60) * HOUR_WIDTH;
                                    const widthPx = Math.max(60, baseWidth + delayPx);

                                    return (
                                        <ScheduleBlock
                                            key={lt.maLichTrinh}
                                            schedule={lt}
                                            leftPx={leftPx}
                                            widthPx={widthPx}
                                        />
                                    );
                                })}

                                {/* Departure time markers - 10 minute buffer zones */}
                                {lichTrinh
                                    .filter(lt => lt.gioDiDuKien && (!editItem || lt.maLichTrinh !== editItem.maLichTrinh))
                                    .map(lt => {
                                        const tDi = formatTime(lt.gioDiDuKien);
                                        const departurePx = getPxPos(tDi);

                                        // 10 phút buffer zone (5 phút trước + 5 phút sau)
                                        const bufferWidth = (10 / 60) * HOUR_WIDTH; // 10 phút
                                        const bufferLeft = departurePx - (bufferWidth / 2);

                                        return (
                                            <div
                                                key={`departure-${lt.maLichTrinh}`}
                                                style={{
                                                    position: 'absolute',
                                                    left: `${bufferLeft}px`,
                                                    top: 0,
                                                    bottom: 0,
                                                    width: `${bufferWidth}px`,
                                                    background: 'rgba(239, 68, 68, 0.08)',
                                                    border: '1px dashed rgba(239, 68, 68, 0.3)',
                                                    pointerEvents: 'none',
                                                    zIndex: 1
                                                }}
                                            >
                                                {/* Departure marker line */}
                                                <div
                                                    style={{
                                                        position: 'absolute',
                                                        left: '50%',
                                                        transform: 'translateX(-50%)',
                                                        top: 0,
                                                        bottom: 0,
                                                        width: '2px',
                                                        background: 'rgba(239, 68, 68, 0.5)'
                                                    }}
                                                />
                                                {/* Label */}
                                                <div
                                                    style={{
                                                        position: 'absolute',
                                                        left: '50%',
                                                        transform: 'translateX(-50%)',
                                                        top: '2px',
                                                        fontSize: '8px',
                                                        fontWeight: 700,
                                                        color: '#DC2626',
                                                        background: 'rgba(254, 242, 242, 0.95)',
                                                        padding: '1px 4px',
                                                        borderRadius: '3px',
                                                        whiteSpace: 'nowrap',
                                                        border: '1px solid rgba(239, 68, 68, 0.3)'
                                                    }}
                                                >
                                                    {lt.maChuyenTau} ⬅️
                                                </div>
                                            </div>
                                        );
                                    })
                                }

                                {/* New schedule preview */}
                                {isSelected && newSchedulePreview && (() => {
                                    const leftPx = getPxPos(newSchedulePreview.gioDenDuKien);
                                    const baseWidth = getPxWidth(newSchedulePreview.gioDenDuKien, newSchedulePreview.gioDiDuKien);
                                    // Add delay to preview width if present
                                    const delayMinutes = parseInt(newSchedulePreview.soPhutTre) || 0;
                                    const delayPx = (delayMinutes / 60) * HOUR_WIDTH;
                                    const widthPx = Math.max(60, baseWidth + delayPx);
                                    return (
                                        <SchedulePreviewBlock
                                            preview={newSchedulePreview}
                                            leftPx={leftPx}
                                            widthPx={widthPx}
                                        />
                                    );
                                })()}

                                {/* Selected badge */}
                                {isSelected && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            right: '8px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'var(--navy-800)',
                                            color: 'var(--white)',
                                            padding: '2px 10px',
                                            borderRadius: '20px',
                                            fontSize: '9px',
                                            fontWeight: 700,
                                            letterSpacing: '0.5px',
                                            zIndex: 5
                                        }}
                                    >
                                        ĐANG CHỌN
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
