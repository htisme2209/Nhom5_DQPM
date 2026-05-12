import { useState, useEffect } from 'react';
import { lichTrinhAPI, chuyenTauAPI, duongRayAPI } from '../../services/api';
import Modal from '../../components/Modal';
import ScheduleFilters from '../../components/schedule/ScheduleFilters';
import ScheduleTable from '../../components/schedule/ScheduleTable';
import ScheduleFormModal from '../../components/schedule/ScheduleFormModal';
import { useScheduleForm } from '../../hooks/useScheduleForm';
import { useScheduleConflicts, useFormConflictWarning } from '../../hooks/useScheduleConflicts';
import { buildDateTime, parseDateTimeToTime } from '../../utils/timeUtils';

/**
 * Lịch Trình Page - Main Schedule Management Page
 * Refactored for better maintainability and reusability
 */
export default function LichTrinhPage() {
  // Data state
  const [lichTrinh, setLichTrinh] = useState([]);
  const [chuyenTau, setChuyenTau] = useState([]);
  const [duongRay, setDuongRay] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    ngay: new Date().toISOString().split('T')[0]
  });

  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [showDelete, setShowDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Custom hooks
  const {
    form,
    setForm,
    selectedCT,
    handleSelectChuyenTau,
    bufferInfo,
    resetForm
  } = useScheduleForm(chuyenTau);

  const conflicts = useScheduleConflicts(lichTrinh);
  const formConflictWarning = useFormConflictWarning(form, lichTrinh, editItem);

  // Load data
  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ltRes, ctRes, drRes] = await Promise.all([
        lichTrinhAPI.getAll(filter),
        chuyenTauAPI.getAll(),
        duongRayAPI.getAll(),
      ]);

      let fetchedLichTrinh = ltRes.data?.data || ltRes.data || [];
      if (filter.trangThai) {
        fetchedLichTrinh = fetchedLichTrinh.filter(lt => lt.trangThai === filter.trangThai);
      }
      if (filter.maRay) {
        fetchedLichTrinh = fetchedLichTrinh.filter(lt => lt.maRay === filter.maRay);
      }

      setLichTrinh(fetchedLichTrinh);
      setChuyenTau(ctRes.data?.data || ctRes.data || []);
      setDuongRay(drRes.data?.data || drRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // CRUD operations
  const openCreate = () => {
    setEditItem(null);
    resetForm();
    setShowForm(true);
  };

  const openEdit = (lt) => {
    setEditItem(lt);
    const ct = chuyenTau.find(c => c.maChuyenTau === lt.maChuyenTau);
    handleSelectChuyenTau(lt.maChuyenTau);
    setForm({
      maLichTrinh: lt.maLichTrinh,
      maChuyenTau: lt.maChuyenTau,
      maRay: lt.maRay || '',
      ngayChay: lt.ngayChay ? lt.ngayChay.substring(0, 10) : '',
      gioDenDuKien: parseDateTimeToTime(lt.gioDenDuKien),
      gioDiDuKien: parseDateTimeToTime(lt.gioDiDuKien),
      gioDenThucTe: parseDateTimeToTime(lt.gioDenThucTe),
      gioDiThucTe: parseDateTimeToTime(lt.gioDiThucTe),
      soPhutTre: lt.soPhutTre || 0,
      trangThai: lt.trangThai,
      phuongAnXuLy: lt.phuongAnXuLy || ''
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.maChuyenTau) {
      showToast('Vui lòng chọn chuyến tàu', 'error');
      return;
    }

    // Lấy ngày chạy từ chuyến tàu đã chọn để build datetime
    const selectedChuyenTau = chuyenTau.find(ct => ct.maChuyenTau === form.maChuyenTau);
    if (!selectedChuyenTau || !selectedChuyenTau.ngayChay) {
      showToast('Chuyến tàu chưa có ngày chạy', 'error');
      return;
    }

    const ngayChay = selectedChuyenTau.ngayChay.substring(0, 10);

    setFormLoading(true);
    try {
      const payload = {
        maLichTrinh: form.maLichTrinh,
        maChuyenTau: form.maChuyenTau,
        maRay: form.maRay,
        // Không gửi ngayChay - sẽ lấy từ ChuyenTau
        gioDenDuKien: buildDateTime(ngayChay, form.gioDenDuKien),
        gioDiDuKien: buildDateTime(ngayChay, form.gioDiDuKien),
        gioDenThucTe: form.gioDenThucTe ? buildDateTime(ngayChay, form.gioDenThucTe) : null,
        gioDiThucTe: form.gioDiThucTe ? buildDateTime(ngayChay, form.gioDiThucTe) : null,
        soPhutTre: parseInt(form.soPhutTre) || 0,
        trangThai: form.trangThai,
        phuongAnXuLy: form.phuongAnXuLy || null
      };
      if (editItem) {
        await lichTrinhAPI.update(editItem.maLichTrinh, payload);
        showToast('Cập nhật lịch trình thành công!');
      } else {
        await lichTrinhAPI.create(payload);
        showToast('Thêm lịch trình mới thành công!');
      }
      setShowForm(false);
      loadData();
    } catch (e) {
      const errorData = e.response?.data;
      if (errorData?.code === 'ERR_LEAD_TIME_24H') {
        showToast(
          '⚠️ Quy tắc 24h: ' + errorData.message +
          ' (Hãy dùng luồng xử lý sự cố nếu cần tạo lịch trình khẩn cấp)',
          'error'
        );
      } else {
        showToast(errorData?.message || 'Lỗi khi lưu lịch trình', 'error');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await lichTrinhAPI.delete(showDelete.maLichTrinh);
      showToast('Đã xóa lịch trình thành công!');
      setShowDelete(null);
      loadData();
    } catch (e) {
      showToast(e.response?.data?.message || 'Lỗi khi xóa', 'error');
    }
  };

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-actions">
          <div>
            <p style={{
              fontSize: '11px',
              color: 'var(--gray-500)',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              QUẢN LÝ LỊCH TRÌNH
            </p>
            <h1>Bảng Lịch trình Tổng hợp</h1>
            <p>Quản lý và giám sát lịch trình các chuyến tàu qua Ga Đà Nẵng</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary">📥 Xuất CSV</button>
            <button className="btn btn-primary" onClick={openCreate}>
              + Thêm lịch trình
            </button>
          </div>
        </div>
      </div>

      {/* Conflict Warning */}
      {conflicts.length > 0 && (
        <div style={{
          background: 'var(--red-100)',
          border: '1px solid var(--red-500)',
          borderRadius: 'var(--radius)',
          padding: '12px 20px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13px',
          color: '#991B1B'
        }}>
          ⚠️ <strong>Phát hiện xung đột:</strong>{' '}
          {conflicts.map(c => `Ray ${c.ray}: ${c.a} ↔ ${c.b}`).join('; ')}
        </div>
      )}

      {/* Filters */}
      <ScheduleFilters
        filter={filter}
        onFilterChange={setFilter}
        onRefresh={loadData}
        totalCount={lichTrinh.length}
        duongRay={duongRay}
      />

      {/* Schedule Table */}
      <ScheduleTable
        schedules={lichTrinh}
        loading={loading}
        conflicts={conflicts}
        chuyenTaus={chuyenTau}
        onEdit={openEdit}
        onDelete={setShowDelete}
        onCreate={openCreate}
      />

      <ScheduleFormModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        editItem={editItem}
        form={form}
        setForm={setForm}
        selectedCT={selectedCT}
        chuyenTau={chuyenTau}
        duongRay={duongRay}
        lichTrinh={lichTrinh}
        bufferInfo={bufferInfo}
        formConflictWarning={formConflictWarning}
        onSelectChuyenTau={handleSelectChuyenTau}
        onSave={handleSave}
        formLoading={formLoading}
      />

      {/* Delete Confirmation */}
      {showDelete && (
        <div className="confirm-overlay" onClick={() => setShowDelete(null)}>
          <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon danger">🗑️</div>
            <h3>Xác nhận xóa lịch trình?</h3>
            <p>
              Lịch trình <strong>{showDelete.maLichTrinh}</strong> ({showDelete.maChuyenTau})
              sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
            </p>
            <div className="confirm-actions">
              <button className="btn btn-secondary" onClick={() => setShowDelete(null)}>
                Hủy bỏ
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                🗑️ Xóa lịch trình
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
