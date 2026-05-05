import { formatTime } from '../../utils/timeUtils';
import { STATUS_MAP } from '../../constants/scheduleConstants';

// ─── Cấu hình badge theo vai trò tàu ─────────────────────────────────────────
const VAI_TRO_MAP = {
    XUAT_PHAT: { label: 'Xuất phát', icon: '🚀', bg: '#F0FDF4', color: '#166534', border: '#BBF7D0' },
    TRUNG_GIAN: { label: 'Trung gian', icon: '🔀', bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
    DIEM_CUOI: { label: 'Điểm cuối', icon: '🏁', bg: '#FFF7ED', color: '#9A3412', border: '#FDBA74' },
};

function VaiTroBadge({ vaiTro }) {
    const cfg = VAI_TRO_MAP[vaiTro];
    if (!cfg) return <span style={{ color: 'var(--gray-400)', fontSize: '12px' }}>---</span>;
    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: '999px',
            fontSize: '11px',
            fontWeight: 600,
            background: cfg.bg,
            color: cfg.color,
            border: `1px solid ${cfg.border}`,
            whiteSpace: 'nowrap'
        }}>
            {cfg.icon} {cfg.label}
        </span>
    );
}

const TABLE_HEADERS = (
    <tr>
        <th>Mã LT</th>
        <th>Chuyến tàu</th>
        <th>Vai trò</th>
        <th>Đường ray</th>
        <th>Giờ đến DK</th>
        <th>Giờ đi DK</th>
        <th>Giờ đến TT</th>
        <th>Giờ đi TT</th>
        <th>Trễ</th>
        <th>Sự cố</th>
        <th>Trạng thái</th>
        <th style={{ width: '100px' }}>Thao tác</th>
    </tr>
);

/**
 * Schedule Table Component
 * Displays list of schedules in table format with train role badges
 */
export default function ScheduleTable({
    schedules,
    loading,
    conflicts,
    chuyenTaus = [],
    onEdit,
    onDelete,
    onCreate
}) {
    // Tạo map maChuyenTau → vaiTroTaiDaNang để tra nhanh
    const vaiTroMap = {};
    chuyenTaus.forEach(ct => { vaiTroMap[ct.maChuyenTau] = ct.vaiTroTaiDaNang; });

    if (loading) {
        return (
            <div className="card">
                <div className="table-container">
                    <table><thead>{TABLE_HEADERS}</thead>
                        <tbody>
                            <tr><td colSpan="12" className="text-center text-muted" style={{ padding: '40px' }}>
                                ⏳ Đang tải dữ liệu...
                            </td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    if (schedules.length === 0) {
        return (
            <div className="card">
                <div className="table-container">
                    <table><thead>{TABLE_HEADERS}</thead>
                        <tbody>
                            <tr><td colSpan="12" className="text-center text-muted" style={{ padding: '60px' }}>
                                <div style={{ fontSize: '40px', marginBottom: '8px' }}>📋</div>
                                Không có lịch trình nào cho ngày này
                                <br />
                                <button className="btn btn-primary btn-sm" style={{ marginTop: '12px' }} onClick={onCreate}>
                                    + Thêm mới
                                </button>
                            </td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    // Tính đếm theo vai trò để hiển thị legend
    const counts = { XUAT_PHAT: 0, TRUNG_GIAN: 0, DIEM_CUOI: 0 };
    schedules.forEach(lt => {
        const vt = vaiTroMap[lt.maChuyenTau];
        if (vt && counts[vt] !== undefined) counts[vt]++;
    });

    return (
        <div className="card">
            {/* Legend header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderBottom: '1px solid var(--gray-100)',
                flexWrap: 'wrap'
            }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Phân loại tàu:
                </span>
                {Object.entries(VAI_TRO_MAP).map(([key, cfg]) => (
                    <span key={key} style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
                        background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`
                    }}>
                        {cfg.icon} {cfg.label}
                        <span style={{
                            background: cfg.color, color: '#fff',
                            borderRadius: '999px', padding: '0 6px', fontSize: '11px', minWidth: '18px', textAlign: 'center'
                        }}>{counts[key]}</span>
                    </span>
                ))}

            </div>

            <div className="table-container">
                <table>
                    <thead>{TABLE_HEADERS}</thead>
                    <tbody>
                        {schedules.map(lt => {
                            const st = STATUS_MAP[lt.trangThai] || { label: lt.trangThai, cls: 'badge-gray' };
                            const vaiTro = vaiTroMap[lt.maChuyenTau];
                            const hasConflict = conflicts.some(
                                c => lt.maRay && c.ray === lt.maRay &&
                                    (c.a === lt.maChuyenTau || c.b === lt.maChuyenTau)
                            );
                            const hasSuCo = lt.maSuCoAnhHuong != null;
                            const phuongAn = lt.phuongAnXuLy;
                            const isPending = hasSuCo && (phuongAn === 'CHO_RAY' || !phuongAn);
                            const isDone = hasSuCo && (phuongAn === 'DOI_RAY' || phuongAn === 'DIEU_CHINH_GIO' || phuongAn === 'HUY_CHUYEN');

                            // Màu nền hàng theo vai trò (nhạt) hoặc đỏ nếu có sự cố
                            const vaiTroCfg = VAI_TRO_MAP[vaiTro];
                            const rowStyle = isPending
                                ? { background: 'var(--red-50)', borderLeft: '4px solid var(--red-500)' }
                                : vaiTroCfg
                                    ? { borderLeft: `3px solid ${vaiTroCfg.border}` }
                                    : {};

                            return (
                                <tr key={lt.maLichTrinh} style={rowStyle}>
                                    <td className="font-semibold text-navy" style={{ fontSize: '12px' }}>{lt.maLichTrinh}</td>
                                    <td>
                                        <div className="font-bold text-navy">{lt.maChuyenTau}</div>
                                    </td>
                                    <td>
                                        <VaiTroBadge vaiTro={vaiTro} />
                                    </td>
                                    <td>
                                        <span className={`ray-badge ${hasConflict ? 'conflict' : ''}`}>
                                            {lt.maRay || '---'}{hasConflict && ' ⚠️'}
                                        </span>
                                    </td>
                                    <td className="time-display">
                                        {vaiTro === 'XUAT_PHAT'
                                            ? <span style={{ color: 'var(--gray-300)', fontSize: '11px' }}>—</span>
                                            : formatTime(lt.gioDenDuKien)}
                                    </td>
                                    <td className="time-display">
                                        {vaiTro === 'DIEM_CUOI'
                                            ? <span style={{ color: 'var(--gray-300)', fontSize: '11px' }}>—</span>
                                            : formatTime(lt.gioDiDuKien)}
                                    </td>
                                    <td>
                                        {lt.gioDenThucTe ? (
                                            <span className={lt.soPhutTre > 0 ? 'text-danger font-bold' : ''}>
                                                {formatTime(lt.gioDenThucTe)}
                                            </span>
                                        ) : (
                                            <span className="text-muted">---</span>
                                        )}
                                    </td>
                                    <td>
                                        {lt.gioDiThucTe ? formatTime(lt.gioDiThucTe) : <span className="text-muted">---</span>}
                                    </td>
                                    <td>
                                        {lt.soPhutTre > 0 ? (
                                            <span className="badge badge-danger">-{lt.soPhutTre}p</span>
                                        ) : (
                                            <span className="text-success font-semibold">⬤ 0</span>
                                        )}
                                    </td>
                                    <td>
                                        {!hasSuCo ? (
                                            <span className="text-muted">---</span>
                                        ) : isPending ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <span className="badge badge-danger" style={{ fontSize: '11px' }}
                                                    title={`Sự cố: ${lt.maSuCoAnhHuong}`}>
                                                    ⚠️ {lt.maSuCoAnhHuong}
                                                </span>
                                                <span className="badge badge-warning" style={{ fontSize: '10px' }}>⏳ Chờ xử lý</span>
                                            </div>
                                        ) : isDone ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <span style={{ fontSize: '11px', color: 'var(--gray-400)' }}
                                                    title={`Sự cố: ${lt.maSuCoAnhHuong}`}>
                                                    {lt.maSuCoAnhHuong}
                                                </span>
                                                <span className="badge badge-success" style={{ fontSize: '10px' }}>
                                                    {phuongAn === 'DOI_RAY' ? '🔄 Đổi ray' :
                                                        phuongAn === 'DIEU_CHINH_GIO' ? '⏰ Đ.chỉnh giờ' : '❌ Hủy chuyến'}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-muted">---</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`badge ${st.cls}`}>{st.label}</span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <button className="btn btn-secondary btn-sm" onClick={() => onEdit(lt)} title="Chỉnh sửa">✏️</button>
                                            <button className="btn btn-secondary btn-sm" onClick={() => onDelete(lt)} title="Xóa" style={{ color: 'var(--red-500)' }}>🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
