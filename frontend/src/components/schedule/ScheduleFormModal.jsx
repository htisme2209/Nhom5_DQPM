import Modal from '../Modal';
import GanttTimeline from './GanttTimeline';
import { ROLE_LABELS } from '../../constants/scheduleConstants';
import { BUFFER_MINUTES } from '../../utils/timeUtils';
import { useMemo } from 'react';

/**
 * Schedule Form Modal Component
 * Form for creating/editing schedules with Gantt visualization
 */
export default function ScheduleFormModal({
    isOpen,
    onClose,
    editItem,
    form,
    setForm,
    selectedCT,
    chuyenTau,
    duongRay,
    lichTrinh,
    bufferInfo,
    formConflictWarning,
    onSelectChuyenTau,
    onSave,
    formLoading
}) {
    // Filter chuyến tàu theo ngày chạy đã chọn
    const filteredChuyenTau = useMemo(() => {
        if (!form.ngayChay) return chuyenTau;

        return chuyenTau.filter(ct => {
            if (!ct.ngayChay) return false;
            const ctNgayChay = new Date(ct.ngayChay).toISOString().split('T')[0];
            return ctNgayChay === form.ngayChay;
        });
    }, [chuyenTau, form.ngayChay]);

    // Validation: Kiểm tra thời gian tạo trước 24 giờ
    const timeValidation = useMemo(() => {
        if (!form.gioDenDuKien && !form.gioDiDuKien) return null;
        if (!form.ngayChay) return null; // Cần có ngày chạy

        const now = new Date();

        // Sử dụng ngày chạy từ form thay vì ngày hôm nay
        const ngayChay = form.ngayChay; // Format: YYYY-MM-DD

        // Tạo datetime từ form với NGÀY CHẠY
        const gioDenDuKien = form.gioDenDuKien ? new Date(`${ngayChay}T${form.gioDenDuKien}`) : null;
        const gioDiDuKien = form.gioDiDuKien ? new Date(`${ngayChay}T${form.gioDiDuKien}`) : null;

        // Lấy thời gian sớm nhất
        const earliestTime = gioDenDuKien && gioDiDuKien
            ? (gioDenDuKien < gioDiDuKien ? gioDenDuKien : gioDiDuKien)
            : (gioDenDuKien || gioDiDuKien);

        if (!earliestTime) return null;

        // Kiểm tra quá khứ
        if (earliestTime < now) {
            return {
                type: 'error',
                message: 'Không thể tạo lịch trình trong quá khứ',
                detail: `Thời gian đã chọn (${earliestTime.toLocaleDateString('vi-VN')} ${earliestTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}) đã qua`
            };
        }

        // Kiểm tra 24 giờ
        const hoursUntil = (earliestTime - now) / (1000 * 60 * 60);

        if (hoursUntil < 24) {
            return {
                type: 'warning',
                message: 'Lịch trình phải được tạo trước ít nhất 24 giờ',
                detail: `Hiện tại chỉ còn ${Math.floor(hoursUntil)} giờ ${Math.floor((hoursUntil % 1) * 60)} phút. Vui lòng chuyển sang luồng xử lý sự cố nếu cần tạo gấp.`,
                hoursRemaining: hoursUntil
            };
        }

        return {
            type: 'success',
            message: `Còn ${Math.floor(hoursUntil)} giờ đến giờ chạy`,
            hoursRemaining: hoursUntil
        };
    }, [form.gioDenDuKien, form.gioDiDuKien, form.ngayChay]);

    // Validation: Kiểm tra khoảng cách 10 phút giữa các tàu
    const departureConflict = useMemo(() => {
        if (!form.gioDiDuKien || !form.ngayChay) return null;

        // Sử dụng ngày chạy từ form
        const ngayChay = form.ngayChay;
        const newDeparture = new Date(`${ngayChay}T${form.gioDiDuKien}`);

        // Tìm các tàu xuất phát trong khoảng +/- 10 phút
        const conflicts = lichTrinh.filter(lt => {
            if (editItem && lt.maLichTrinh === editItem.maLichTrinh) return false;
            if (!lt.gioDiDuKien) return false;

            const ltDeparture = new Date(lt.gioDiDuKien);
            const diffMinutes = Math.abs((newDeparture - ltDeparture) / (1000 * 60));

            return diffMinutes < 10;
        });

        if (conflicts.length > 0) {
            const conflict = conflicts[0];
            const conflictTime = new Date(conflict.gioDiDuKien);
            const diffMinutes = Math.abs((newDeparture - conflictTime) / (1000 * 60));

            return {
                train: conflict.maChuyenTau,
                time: conflictTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                gap: Math.floor(diffMinutes),
                ray: conflict.maRay
            };
        }

        return null;
    }, [form.gioDiDuKien, form.ngayChay, lichTrinh, editItem]);
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editItem ? 'Chỉnh sửa Lịch trình' : 'Thêm Lịch Trình Mới'}
            subtitle="Lập và điều chỉnh lịch trình chi tiết tại Ga Đà Nẵng"
            size="lg"
        >
            {/* Row 1: Date Selection */}
            {/* Row 1: Date and Train Code */}
            <div className="form-row" style={{ marginBottom: '20px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">NGÀY CHẠY</label>
                    <div style={{ position: 'relative' }}>
                        <span style={{
                            position: 'absolute',
                            left: '14px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '16px',
                            opacity: 0.5
                        }}>
                            📅
                        </span>
                        <input
                            type="date"
                            className="form-control"
                            style={{ paddingLeft: '42px' }}
                            value={form.ngayChay}
                            onChange={(e) => {
                                // Reset mã tàu khi đổi ngày
                                setForm({ ...form, ngayChay: e.target.value, maChuyenTau: '', gioDenDuKien: '', gioDiDuKien: '' });
                            }}
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                    {form.ngayChay && (
                        <div style={{
                            marginTop: '6px',
                            fontSize: '11px',
                            color: 'var(--gray-600)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            <span>📊</span>
                            <span>
                                Có <strong>{filteredChuyenTau.length}</strong> chuyến tàu
                            </span>
                        </div>
                    )}
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">MÃ TÀU</label>
                    <div style={{ position: 'relative' }}>
                        <span style={{
                            position: 'absolute',
                            left: '14px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '16px',
                            opacity: 0.5
                        }}>
                            🚂
                        </span>
                        <select
                            className="form-control"
                            style={{ paddingLeft: '42px' }}
                            value={form.maChuyenTau}
                            onChange={(e) => onSelectChuyenTau(e.target.value)}
                            disabled={!form.ngayChay}
                        >
                            <option value="">
                                {!form.ngayChay
                                    ? 'Chọn ngày trước...'
                                    : filteredChuyenTau.length === 0
                                        ? 'Không có tàu'
                                        : 'Chọn mã tàu...'}
                            </option>
                            {filteredChuyenTau.map(ct => (
                                <option key={ct.maChuyenTau} value={ct.maChuyenTau}>
                                    {ct.maChuyenTau} —{' '}
                                    {ct.vaiTroTaiDaNang === 'TRUNG_GIAN'
                                        ? 'Trung gian'
                                        : ct.vaiTroTaiDaNang === 'XUAT_PHAT'
                                            ? 'Xuất phát'
                                            : 'Điểm cuối'}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Role Info Badge */}
            {selectedCT && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '16px',
                    padding: '10px 16px',
                    borderRadius: 'var(--radius)',
                    background: ROLE_LABELS[selectedCT.vaiTroTaiDaNang]?.bg || 'var(--gray-100)',
                    border: `1px solid ${ROLE_LABELS[selectedCT.vaiTroTaiDaNang]?.color || 'var(--gray-300)'}20`
                }}>
                    <span style={{
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: ROLE_LABELS[selectedCT.vaiTroTaiDaNang]?.color,
                        color: 'white'
                    }}>
                        {ROLE_LABELS[selectedCT.vaiTroTaiDaNang]?.text}
                    </span>
                    <span style={{
                        fontSize: '12px',
                        color: ROLE_LABELS[selectedCT.vaiTroTaiDaNang]?.color,
                        fontWeight: 500
                    }}>
                        {ROLE_LABELS[selectedCT.vaiTroTaiDaNang]?.desc}
                    </span>
                    <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--gray-500)' }}>
                        Mã tàu: <strong>{selectedCT.maTau}</strong> · Tuyến: <strong>{selectedCT.maTuyen}</strong> · Ngày chạy: <strong>{selectedCT.ngayChay ? new Date(selectedCT.ngayChay).toLocaleDateString('vi-VN') : 'N/A'}</strong>
                    </span>
                </div>
            )}

            {/* Time Section */}
            <div style={{
                background: 'var(--navy-50)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                marginBottom: '16px',
                border: '1px solid var(--navy-100)'
            }}>
                {/* Validation Warning - 24 Hours Rule */}
                {timeValidation && timeValidation.type !== 'success' && (
                    <div style={{
                        marginBottom: '16px',
                        padding: '14px 16px',
                        borderRadius: 'var(--radius)',
                        background: timeValidation.type === 'error' ? '#FEF2F2' : '#FFF7ED',
                        border: `1px solid ${timeValidation.type === 'error' ? '#FCA5A5' : '#FED7AA'}`,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px'
                    }}>
                        <span style={{ fontSize: '20px', marginTop: '2px' }}>
                            {timeValidation.type === 'error' ? '🚫' : '⚠️'}
                        </span>
                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontWeight: 700,
                                fontSize: '13px',
                                color: timeValidation.type === 'error' ? '#991B1B' : '#C2410C',
                                marginBottom: '4px'
                            }}>
                                {timeValidation.message}
                            </div>
                            <div style={{
                                fontSize: '12px',
                                color: timeValidation.type === 'error' ? '#7F1D1D' : '#9A3412',
                                lineHeight: '1.5'
                            }}>
                                {timeValidation.detail}
                            </div>
                        </div>
                    </div>
                )}

                <div className="form-row">
                    <div className="form-group" style={{ marginBottom: '8px' }}>
                        <label className="form-label">
                            {selectedCT?.vaiTroTaiDaNang === 'XUAT_PHAT'
                                ? 'THỜI GIAN LÊN TÀU (= Giờ đi − 30\')'
                                : selectedCT?.vaiTroTaiDaNang === 'DIEM_CUOI'
                                    ? 'THỜI GIAN ĐẾN (ARRIVAL)'
                                    : 'GIỜ ĐẾN (ARRIVAL)'}
                        </label>
                        <div style={{ position: 'relative' }}>
                            <span style={{
                                position: 'absolute',
                                left: '14px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                fontSize: '18px'
                            }}>
                                {selectedCT?.vaiTroTaiDaNang === 'XUAT_PHAT' ? '🧳' : '➡️'}
                            </span>
                            <input
                                type="time"
                                className="form-control"
                                style={{
                                    paddingLeft: '44px',
                                    fontSize: '18px',
                                    fontWeight: 600,
                                    letterSpacing: '1px',
                                    height: '48px',
                                    background: selectedCT?.vaiTroTaiDaNang === 'XUAT_PHAT' ? 'var(--gray-100)' : 'var(--white)',
                                    borderColor: timeValidation?.type === 'error' ? '#EF4444' : undefined
                                }}
                                value={form.gioDenDuKien}
                                onChange={(e) => setForm({ ...form, gioDenDuKien: e.target.value })}
                                disabled={selectedCT?.vaiTroTaiDaNang === 'XUAT_PHAT'}
                            />
                        </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: '8px' }}>
                        <label className="form-label">
                            {selectedCT?.vaiTroTaiDaNang === 'XUAT_PHAT'
                                ? 'THỜI GIAN ĐI (DEPARTURE)'
                                : selectedCT?.vaiTroTaiDaNang === 'DIEM_CUOI'
                                    ? 'THỜI GIAN RỜI RAY (= Giờ đến + 15\')'
                                    : 'GIỜ ĐI (DEPARTURE)'}
                        </label>
                        <div style={{ position: 'relative' }}>
                            <span style={{
                                position: 'absolute',
                                left: '14px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                fontSize: '18px'
                            }}>
                                {selectedCT?.vaiTroTaiDaNang === 'DIEM_CUOI' ? '🚪' : '⬅️'}
                            </span>
                            <input
                                type="time"
                                className="form-control"
                                style={{
                                    paddingLeft: '44px',
                                    fontSize: '18px',
                                    fontWeight: 600,
                                    letterSpacing: '1px',
                                    height: '48px',
                                    background: selectedCT?.vaiTroTaiDaNang === 'DIEM_CUOI' ? 'var(--gray-100)' : 'var(--white)',
                                    borderColor: timeValidation?.type === 'error' || departureConflict ? '#EF4444' : undefined
                                }}
                                value={form.gioDiDuKien}
                                onChange={(e) => setForm({ ...form, gioDiDuKien: e.target.value })}
                                disabled={selectedCT?.vaiTroTaiDaNang === 'DIEM_CUOI'}
                            />
                        </div>
                    </div>
                </div>

                {/* Departure Conflict Warning - 10 Minutes Rule */}
                {departureConflict && (
                    <div style={{
                        marginTop: '12px',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius)',
                        background: '#FEF2F2',
                        border: '1px solid #FCA5A5',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px'
                    }}>
                        <span style={{ fontSize: '18px', marginTop: '2px' }}>🚦</span>
                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontWeight: 700,
                                fontSize: '13px',
                                color: '#991B1B',
                                marginBottom: '4px'
                            }}>
                                Khoảng cách giữa các tàu xuất phát phải ≥ 10 phút
                            </div>
                            <div style={{
                                fontSize: '12px',
                                color: '#7F1D1D',
                                lineHeight: '1.5'
                            }}>
                                Tàu <strong>{departureConflict.train}</strong> (Ray {departureConflict.ray}) đã có lịch xuất phát lúc{' '}
                                <strong>{departureConflict.time}</strong> (cách <strong>{departureConflict.gap} phút</strong>).
                                Vui lòng chọn thời gian khác.
                            </div>
                        </div>
                    </div>
                )}

                {/* Buffer Info */}
                {bufferInfo && (
                    <div style={{
                        padding: '12px 16px',
                        background: bufferInfo.delayMinutes > 0 ? 'var(--orange-50)' : 'var(--white)',
                        borderRadius: 'var(--radius)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        border: bufferInfo.delayMinutes > 0 ? '1px solid var(--orange-300)' : '1px solid var(--gray-200)'
                    }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: bufferInfo.delayMinutes > 0 ? 'var(--orange-100)' : 'var(--navy-100)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px'
                        }}>
                            {bufferInfo.delayMinutes > 0 ? '⚠️' : '🕐'}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontSize: '11px',
                                color: bufferInfo.delayMinutes > 0 ? 'var(--orange-700)' : 'var(--gray-500)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                fontWeight: 600
                            }}>
                                CỬA SỔ CHIẾM RAY (+ {BUFFER_MINUTES} PHÚT BUFFER
                                {bufferInfo.delayMinutes > 0 && ` + ${bufferInfo.delayMinutes} PHÚT TRỄ`})
                            </div>
                            <div style={{ fontWeight: 700, fontSize: '15px', color: bufferInfo.delayMinutes > 0 ? 'var(--orange-800)' : 'var(--navy-800)', marginTop: '2px' }}>
                                {bufferInfo.bufferStart} — {bufferInfo.bufferEnd}
                                <span style={{ fontWeight: 400, color: 'var(--gray-500)', marginLeft: '10px', fontSize: '12px' }}>
                                    ({bufferInfo.total > 0 ? `${bufferInfo.total} phút tổng cộng` : 'Kiểm tra thời gian'})
                                </span>
                            </div>
                            {bufferInfo.delayMinutes > 0 && (
                                <div style={{
                                    marginTop: '6px',
                                    fontSize: '11px',
                                    color: 'var(--orange-700)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    <span style={{
                                        padding: '2px 8px',
                                        background: 'var(--orange-200)',
                                        borderRadius: '12px',
                                        fontWeight: 600
                                    }}>
                                        TRỄ {bufferInfo.delayMinutes} PHÚT
                                    </span>
                                    <span>Cửa sổ chiếm ray đã được mở rộng để bù trễ</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Actual Times (Edit mode only) */}
            {editItem && (
                <>
                    {/* Delay Input - Moved up for better UX */}
                    <div style={{
                        background: 'var(--orange-50)',
                        borderRadius: 'var(--radius-md)',
                        padding: '16px 20px',
                        marginBottom: '16px',
                        border: '1px solid var(--orange-200)'
                    }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ color: 'var(--orange-800)' }}>
                                SỐ PHÚT TRỄ (ẢNH HƯỞNG ĐẾN CỬA SỔ CHIẾM RAY)
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <input
                                    type="number"
                                    className="form-control"
                                    min="0"
                                    value={form.soPhutTre}
                                    onChange={(e) => setForm({ ...form, soPhutTre: e.target.value })}
                                    style={{
                                        fontSize: '18px',
                                        fontWeight: 600,
                                        height: '48px',
                                        maxWidth: '150px'
                                    }}
                                />
                                <span style={{ fontSize: '13px', color: 'var(--gray-600)' }}>
                                    phút · Cửa sổ chiếm ray sẽ tự động mở rộng thêm {form.soPhutTre || 0} phút
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actual Times Section */}
                    <div style={{
                        background: 'var(--gray-50)',
                        borderRadius: 'var(--radius-md)',
                        padding: '20px',
                        marginBottom: '16px',
                        border: '1px solid var(--gray-200)'
                    }}>
                        <div style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: 'var(--gray-500)',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            marginBottom: '12px'
                        }}>
                            THỜI GIAN THỰC TẾ
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">GIỜ ĐẾN THỰC TẾ</label>
                                <input
                                    type="time"
                                    className="form-control"
                                    value={form.gioDenThucTe}
                                    onChange={(e) => setForm({ ...form, gioDenThucTe: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">GIỜ ĐI THỰC TẾ</label>
                                <input
                                    type="time"
                                    className="form-control"
                                    value={form.gioDiThucTe}
                                    onChange={(e) => setForm({ ...form, gioDiThucTe: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">TRẠNG THÁI</label>
                            <select
                                className="form-control"
                                value={form.trangThai}
                                onChange={(e) => setForm({ ...form, trangThai: e.target.value })}
                            >
                                <option value="CHO_XAC_NHAN">Chờ xác nhận</option>
                                <option value="DA_XAC_NHAN">Đã xác nhận</option>
                                <option value="DUNG_TAI_GA">Đang ở ga</option>
                                <option value="DA_ROI_GA">Đã rời ga</option>
                                <option value="BI_HUY">Bị hủy</option>
                            </select>
                        </div>
                    </div>
                </>
            )}

            {/* Gantt Timeline */}
            <div style={{ marginBottom: '16px' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px'
                }}>
                    <span style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: 'var(--gray-600)',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}>
                        TRẠNG THÁI CHIẾM DỤNG & CHỌN RAY
                    </span>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: 'var(--gray-500)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: 'var(--gray-300)',
                                display: 'inline-block'
                            }} />
                            TRỐNG
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: '#EF4444',
                                display: 'inline-block'
                            }} />
                            ĐANG CHIẾM
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{
                                width: '12px',
                                height: '8px',
                                background: 'rgba(239, 68, 68, 0.15)',
                                border: '1px dashed rgba(239, 68, 68, 0.4)',
                                display: 'inline-block'
                            }} />
                            VÙNG 10 PHÚT
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: 'var(--navy-600)',
                                display: 'inline-block'
                            }} />
                            ĐANG CHỌN
                        </span>
                    </div>
                </div>

                {/* Info box - Validation Rules */}
                <div style={{
                    marginBottom: '12px',
                    padding: '10px 14px',
                    background: 'var(--blue-50)',
                    border: '1px solid var(--blue-200)',
                    borderRadius: 'var(--radius)',
                    fontSize: '11px',
                    color: 'var(--blue-800)',
                    lineHeight: '1.6'
                }}>
                    <div style={{ fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>ℹ️</span>
                        <span>QUY TẮC TẠO LỊCH TRÌNH</span>
                    </div>
                    <div style={{ paddingLeft: '22px' }}>
                        • Phải tạo trước <strong>ít nhất 24 giờ</strong> so với giờ chạy<br />
                        • Các tàu xuất phát phải cách nhau <strong>≥ 10 phút</strong> (vùng đỏ trên timeline)<br />
                        • Không được tạo lịch trình trong quá khứ
                    </div>
                </div>

                <GanttTimeline
                    duongRay={duongRay}
                    lichTrinh={lichTrinh}
                    selectedRay={form.maRay}
                    onSelectRay={(maRay) => setForm({ ...form, maRay })}
                    editItem={editItem}
                    targetDate={form.ngayChay || null}
                    newSchedulePreview={
                        form.gioDenDuKien && form.gioDiDuKien
                            ? {
                                maChuyenTau: form.maChuyenTau,
                                gioDenDuKien: form.gioDenDuKien,
                                gioDiDuKien: form.gioDiDuKien,
                                soPhutTre: form.soPhutTre || 0
                            }
                            : null
                    }
                />

                {/* Conflict Warning */}
                {formConflictWarning && (
                    <div style={{
                        marginTop: '8px',
                        padding: '12px 20px',
                        borderRadius: 'var(--radius)',
                        background: '#FEF2F2',
                        border: '1px solid #FECACA',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '13px',
                        color: '#991B1B'
                    }}>
                        <span style={{ fontSize: '20px' }}>⚠️</span>
                        <div>
                            <strong>Phát hiện xung đột:</strong> Ray {form.maRay} hiện đang được chiếm dụng bởi tàu{' '}
                            {formConflictWarning}. Vui lòng chọn đường ray khác hoặc thay đổi thời gian.
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Buttons */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '12px',
                paddingTop: '16px',
                borderTop: '1px solid var(--gray-200)'
            }}>
                <button className="btn btn-secondary" onClick={onClose} style={{ minWidth: '100px' }}>
                    Hủy
                </button>
                <button
                    className="btn btn-primary btn-lg"
                    onClick={onSave}
                    disabled={
                        formLoading ||
                        timeValidation?.type === 'error' ||
                        timeValidation?.type === 'warning' ||
                        departureConflict ||
                        formConflictWarning
                    }
                    style={{
                        minWidth: '180px',
                        background: (timeValidation?.type === 'error' || departureConflict || formConflictWarning)
                            ? 'var(--red-500)'
                            : timeValidation?.type === 'warning'
                                ? 'var(--orange-500)'
                                : undefined,
                        opacity: (timeValidation?.type === 'error' || timeValidation?.type === 'warning' || departureConflict || formConflictWarning)
                            ? 0.5
                            : 1
                    }}
                >
                    {formLoading
                        ? '⏳ Đang lưu...'
                        : (timeValidation?.type === 'error' || departureConflict || formConflictWarning)
                            ? '🚫 Không thể lưu'
                            : timeValidation?.type === 'warning'
                                ? '⚠️ Cần > 24h'
                                : `🔒 ${editItem ? 'Cập nhật' : 'Lưu lịch trình'}`
                    }
                </button>
            </div>
        </Modal>
    );
}
