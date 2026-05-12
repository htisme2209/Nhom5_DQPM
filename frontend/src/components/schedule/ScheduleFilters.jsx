import { STATUS_OPTIONS } from '../../constants/scheduleConstants';

/**
 * Schedule Filters Component
 * Date and status filters for schedule list
 */
export default function ScheduleFilters({ filter, onFilterChange, onRefresh, totalCount, duongRay = [] }) {
    return (
        <div className="filter-bar" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
                type="text"
                className="form-control"
                style={{ width: '250px' }}
                placeholder="🔍 Tìm mã lịch trình, mã chuyến tàu..."
                value={filter.search || ''}
                onChange={(e) => onFilterChange({ ...filter, search: e.target.value })}
            />
            <input
                type="date"
                className="form-control"
                style={{ width: 'auto' }}
                value={filter.ngay}
                onChange={(e) => onFilterChange({ ...filter, ngay: e.target.value })}
            />
            <select
                className="form-control"
                style={{ width: 'auto' }}
                value={filter.trangThai || ''}
                onChange={(e) => onFilterChange({ ...filter, trangThai: e.target.value || undefined })}
            >
                {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <select
                className="form-control"
                style={{ width: 'auto' }}
                value={filter.maRay || ''}
                onChange={(e) => onFilterChange({ ...filter, maRay: e.target.value || undefined })}
            >
                <option value="">Tất cả đường ray</option>
                {duongRay.map(ray => (
                    <option key={ray.maRay} value={ray.maRay}>{ray.tenRay || ray.maRay}</option>
                ))}
            </select>
            <button className="btn btn-secondary btn-sm" onClick={onRefresh}>
                🔄 Làm mới
            </button>
            <span className="text-sm text-muted" style={{ marginLeft: 'auto' }}>
                Tổng: {totalCount} lịch trình
            </span>
        </div>
    );
}
