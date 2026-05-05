import { useState, useEffect } from 'react';
import useInfrastructure from '../../hooks/useInfrastructure';
import useInfrastructureForm from '../../hooks/useInfrastructureForm';
import useToast from '../../hooks/useToast';
import { quyTacAPI } from '../../services/api';
import InfrastructureHeader from '../../components/infrastructure/InfrastructureHeader';
import InfrastructureTabs from '../../components/infrastructure/InfrastructureTabs';
import RayTable from '../../components/infrastructure/RayTable';
import TauTable from '../../components/infrastructure/TauTable';
import GaTable from '../../components/infrastructure/GaTable';
import TuyenTable from '../../components/infrastructure/TuyenTable';
import ChuyenTauTable from '../../components/infrastructure/ChuyenTauTable';
import Toast from '../../components/common/Toast';
import Modal from '../../components/Modal';

export default function HaTangPage() {
  const [tab, setTab] = useState('ray');
  const [showForm, setShowForm] = useState(false);
  const [rules, setRules] = useState([]);
  const { duongRay, tau, gaList, tuyenDuong, chuyenTau, loading, reload } = useInfrastructure();
  const { toast, showSuccess, showError } = useToast();

  const {
    form,
    setForm,
    editItem,
    loading: formLoading,
    openCreate,
    openEdit,
    handleSave
  } = useInfrastructureForm(
    tab,
    (msg) => {
      showSuccess(msg);
      setShowForm(false);
      reload();
    },
    (msg) => showError(msg)
  );

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const res = await quyTacAPI.getAll();
        if (res.data.success) {
          setRules(res.data.data);
        }
      } catch (err) {
        console.error('Không thể lấy quy tắc:', err);
      }
    };
    fetchRules();
  }, []);

  const getMinDays = () => {
    const rule = rules.find(r => r.maQuyTac === 'QT-07');
    return rule ? parseInt(rule.giaTri) : 30; // Fallback 30 ngày
  };

  const handleOpenCreate = (type) => {
    setTab(type);
    openCreate(type);
    setShowForm(true);
  };

  const handleOpenEdit = (item, type) => {
    setTab(type);
    openEdit(item, type);
    setShowForm(true);
  };

  const counts = {
    ray: duongRay.length,
    tau: tau.length,
    ga: gaList.length,
    tuyen: tuyenDuong.length,
    'chuyen-tau': chuyenTau.length
  };

  const calculateVaiTroTaiDaNang = (maTuyen) => {
    const tuyen = tuyenDuong.find(t => t.maTuyen === maTuyen);
    if (!tuyen) {
      console.log('Không tìm thấy tuyến:', maTuyen);
      return 'TRUNG_GIAN';
    }

    const gaDau = gaList.find(g => g.maGa === tuyen.maGaDau);
    const gaCuoi = gaList.find(g => g.maGa === tuyen.maGaCuoi);

    const isDaNangStart =
      gaDau?.maGa === 'GA-DN' ||
      gaDau?.tenGa?.toLowerCase().includes('đà nẵng') ||
      gaDau?.tenGa?.toLowerCase().includes('da nang');

    const isDaNangEnd =
      gaCuoi?.maGa === 'GA-DN' ||
      gaCuoi?.tenGa?.toLowerCase().includes('đà nẵng') ||
      gaCuoi?.tenGa?.toLowerCase().includes('da nang');

    let vaiTro;
    if (isDaNangStart && !isDaNangEnd) {
      vaiTro = 'XUAT_PHAT';
    } else if (!isDaNangStart && isDaNangEnd) {
      vaiTro = 'DIEM_CUOI';
    } else {
      vaiTro = 'TRUNG_GIAN';
    }

    return vaiTro;
  };

  const getDateConstraints = () => {
    const today = new Date();
    const minDays = getMinDays();
    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() + minDays);
    
    return {
      minDate: minDate.toISOString().split('T')[0],
      maxDate: ''
    };
  };

  const isDateWithinRange = (dateString) => {
    if (!dateString) return true;
    const selectedDate = new Date(dateString);
    const minDays = getMinDays();
    
    const minAllowedDate = new Date();
    minAllowedDate.setDate(minAllowedDate.getDate() + minDays);
    minAllowedDate.setHours(0, 0, 0, 0);
    
    return selectedDate >= minAllowedDate;
  };

  const handleTuyenChange = (maTuyen) => {
    const vaiTro = calculateVaiTroTaiDaNang(maTuyen);
    const updatedForm = {
      ...form,
      maTuyen,
      vaiTroTaiDaNang: vaiTro
    };

    if (vaiTro === 'XUAT_PHAT') {
      updatedForm.gioDenDuKien = null;
    }

    if (vaiTro === 'DIEM_CUOI') {
      updatedForm.gioDiDuKien = null;
    }

    setForm(updatedForm);
  };

  return (
    <>
      <Toast message={toast?.message} type={toast?.type} />

      <InfrastructureHeader
        activeTab={tab}
        onCreate={() => handleOpenCreate(tab)}
      />

      <InfrastructureTabs activeTab={tab} onTabChange={setTab} counts={counts} />

      {loading ? (
        <div className="card">
          <div className="text-center text-muted" style={{ padding: '40px' }}>Đang tải...</div>
        </div>
      ) : (
        <>
          {tab === 'ray' && <RayTable data={duongRay} onEdit={(r) => handleOpenEdit(r, 'ray')} />}
          {tab === 'tau' && <TauTable data={tau} onEdit={(t) => handleOpenEdit(t, 'tau')} />}
          {tab === 'ga' && <GaTable data={gaList} onEdit={(g) => handleOpenEdit(g, 'ga')} />}
          {tab === 'tuyen' && <TuyenTable data={tuyenDuong} gaList={gaList} onEdit={(t) => handleOpenEdit(t, 'tuyen')} />}
          {tab === 'chuyen-tau' && <ChuyenTauTable data={chuyenTau} tuyenDuong={tuyenDuong} onEdit={(ct) => handleOpenEdit(ct, 'chuyen-tau')} />}
        </>
      )}

      {/* Modal for Ray */}
      <Modal
        isOpen={showForm && tab === 'ray'}
        onClose={() => setShowForm(false)}
        title={editItem ? 'Chỉnh sửa Đường ray' : 'Thêm Đường ray Mới'}
        subtitle="Cấu hình thông tin đường ray tại ga"
        size="md"
      >
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">MÃ ĐƯỜNG RAY</label>
            <input
              className="form-control"
              value={form.maRay}
              onChange={(e) => setForm({ ...form, maRay: e.target.value })}
              disabled={!!editItem}
              style={editItem ? { background: 'var(--gray-100)' } : {}}
            />
          </div>
          <div className="form-group">
            <label className="form-label">SỐ RAY</label>
            <input
              type="number"
              className="form-control"
              value={form.soRay}
              onChange={(e) => setForm({ ...form, soRay: e.target.value })}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">CHIỀU DÀI (MÉT)</label>
            <input
              type="number"
              className="form-control"
              value={form.chieuDaiRay}
              onChange={(e) => setForm({ ...form, chieuDaiRay: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">LOẠI RAY</label>
            <select
              className="form-control"
              value={form.loaiRay}
              onChange={(e) => setForm({ ...form, loaiRay: e.target.value })}
            >
              <option>Đường chính</option>
              <option>Đường phụ</option>
              <option>Đường hàng hóa</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">TRẠNG THÁI</label>
          <select
            className="form-control"
            value={form.trangThai}
            onChange={(e) => setForm({ ...form, trangThai: e.target.value })}
          >
            <option value="SAN_SANG">Sẵn sàng</option>
            <option value="DANG_SU_DUNG">Đang sử dụng</option>
            <option value="BAO_TRI">Bảo trì</option>
            <option value="PHONG_TOA">Phong tỏa</option>
          </select>
        </div>
        <div className="modal-footer" style={{ padding: '16px 0 0', borderTop: '1px solid var(--gray-200)' }}>
          <button className="btn btn-secondary" onClick={() => setShowForm(false)}>
            Hủy
          </button>
          <button className="btn btn-primary" onClick={() => handleSave('ray')} disabled={formLoading}>
            {formLoading ? '⏳' : '🔒 Lưu'}
          </button>
        </div>
      </Modal>

      {/* Modal for Tau */}
      <Modal
        isOpen={showForm && tab === 'tau'}
        onClose={() => setShowForm(false)}
        title={editItem ? 'Chỉnh sửa Tàu' : 'Thêm Tàu Mới'}
        subtitle="Quản lý thông tin đoàn tàu"
        size="md"
      >
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">MÃ TÀU</label>
            <input
              className="form-control"
              value={form.maTau}
              onChange={(e) => setForm({ ...form, maTau: e.target.value })}
              disabled={!!editItem}
              style={editItem ? { background: 'var(--gray-100)' } : {}}
            />
          </div>
          <div className="form-group">
            <label className="form-label">TÊN TÀU</label>
            <input
              className="form-control"
              placeholder="Thống Nhất 1"
              value={form.tenTau}
              onChange={(e) => setForm({ ...form, tenTau: e.target.value })}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">LOẠI TÀU</label>
            <select
              className="form-control"
              value={form.loaiTau}
              onChange={(e) => setForm({ ...form, loaiTau: e.target.value })}
            >
              <option>Tàu khách</option>
              <option>Tàu hàng</option>
              <option>Tàu cao tốc</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">TRẠNG THÁI</label>
            <select
              className="form-control"
              value={form.trangThai}
              onChange={(e) => setForm({ ...form, trangThai: e.target.value })}
            >
              <option value="HOAT_DONG">Hoạt động</option>
              <option value="BAO_TRI">Bảo trì</option>
              <option value="NGUNG">Ngừng</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">SỐ TOA</label>
            <input
              type="number"
              className="form-control"
              value={form.soToa}
              onChange={(e) => setForm({ ...form, soToa: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">SỨC CHỨA</label>
            <input
              type="number"
              className="form-control"
              value={form.sucChua}
              onChange={(e) => setForm({ ...form, sucChua: e.target.value })}
            />
          </div>
        </div>
        <div className="modal-footer" style={{ padding: '16px 0 0', borderTop: '1px solid var(--gray-200)' }}>
          <button className="btn btn-secondary" onClick={() => setShowForm(false)}>
            Hủy
          </button>
          <button className="btn btn-primary" onClick={() => handleSave('tau')} disabled={formLoading}>
            {formLoading ? '⏳' : '🔒 Lưu'}
          </button>
        </div>
      </Modal>

      {/* Modal for Ga */}
      <Modal
        isOpen={showForm && tab === 'ga'}
        onClose={() => setShowForm(false)}
        title={editItem ? 'Chỉnh sửa Ga' : 'Thêm Ga Mới'}
        subtitle="Quản lý thông tin ga"
        size="md"
      >
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">MÃ GA</label>
            <input
              className="form-control"
              value={form.maGa}
              onChange={(e) => setForm({ ...form, maGa: e.target.value })}
              disabled={!!editItem}
              style={editItem ? { background: 'var(--gray-100)' } : {}}
            />
          </div>
          <div className="form-group">
            <label className="form-label">TÊN GA</label>
            <input
              className="form-control"
              placeholder="Ga Đà Nẵng"
              value={form.tenGa}
              onChange={(e) => setForm({ ...form, tenGa: e.target.value })}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">ĐỊA CHỈ</label>
          <input
            className="form-control"
            placeholder="202 Hải Phòng, Đà Nẵng"
            value={form.diaChi}
            onChange={(e) => setForm({ ...form, diaChi: e.target.value })}
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">THỨ TỰ TRÊN TUYẾN (Tùy chọn)</label>
            <input
              type="number"
              className="form-control"
              placeholder="Để trống nếu chưa xác định"
              value={form.thuTuTrenTuyen}
              onChange={(e) => setForm({ ...form, thuTuTrenTuyen: e.target.value })}
            />
            <small style={{ color: 'var(--gray-500)' }}>
              Thứ tự ga trên tuyến đường (1, 2, 3...). Có thể để trống.
            </small>
          </div>
          <div className="form-group">
            <label className="form-label">LOẠI GA</label>
            <select
              className="form-control"
              value={form.loaiGa}
              onChange={(e) => setForm({ ...form, loaiGa: e.target.value })}
            >
              <option>Ga hành khách</option>
              <option>Ga hàng hóa</option>
              <option>Ga hỗn hợp</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">TRẠNG THÁI</label>
            <select
              className="form-control"
              value={form.trangThai}
              onChange={(e) => setForm({ ...form, trangThai: e.target.value })}
            >
              <option value="HOAT_DONG">Hoạt động</option>
              <option value="DUNG">Dừng</option>
            </select>
          </div>
          <div className="form-group"></div>
        </div>
        <div className="modal-footer" style={{ padding: '16px 0 0', borderTop: '1px solid var(--gray-200)' }}>
          <button className="btn btn-secondary" onClick={() => setShowForm(false)}>
            Hủy
          </button>
          <button className="btn btn-primary" onClick={() => handleSave('ga')} disabled={formLoading}>
            {formLoading ? '⏳' : '🔒 Lưu'}
          </button>
        </div>
      </Modal>

      {/* Modal for Tuyen */}
      <Modal
        isOpen={showForm && tab === 'tuyen'}
        onClose={() => setShowForm(false)}
        title={editItem ? 'Chỉnh sửa Tuyến' : 'Thêm Tuyến Mới'}
        subtitle="Cấu hình tuyến đường"
        size="lg"
      >
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">MÃ TUYẾN</label>
            <input
              className="form-control"
              value={form.maTuyen}
              onChange={(e) => setForm({ ...form, maTuyen: e.target.value })}
              disabled={!!editItem}
              style={editItem ? { background: 'var(--gray-100)' } : {}}
            />
          </div>
          <div className="form-group">
            <label className="form-label">TÊN TUYẾN</label>
            <input
              className="form-control"
              placeholder="Hà Nội - TP.HCM"
              value={form.tenTuyen}
              onChange={(e) => setForm({ ...form, tenTuyen: e.target.value })}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">GA ĐẦU</label>
            <select
              className="form-control"
              value={form.maGaDau}
              onChange={(e) => setForm({ ...form, maGaDau: e.target.value })}
            >
              <option value="">Chọn ga đầu</option>
              {gaList.map(ga => (
                <option key={ga.maGa} value={ga.maGa}>
                  {ga.tenGa}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">GA CUỐI</label>
            <select
              className="form-control"
              value={form.maGaCuoi}
              onChange={(e) => setForm({ ...form, maGaCuoi: e.target.value })}
            >
              <option value="">Chọn ga cuối</option>
              {gaList.map(ga => (
                <option key={ga.maGa} value={ga.maGa}>
                  {ga.tenGa}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Intermediate Stations Section */}
        <div className="form-group">
          <label className="form-label">CÁC GA GIỮA (Tùy chọn)</label>
          <div style={{ background: 'var(--gray-50)', padding: '15px', borderRadius: '6px', marginBottom: '10px' }}>
            {form.gaGiua && form.gaGiua.length > 0 ? (
              <div>
                {form.gaGiua.map((maGa, idx) => {
                  const gaName = gaList.find(g => g.maGa === maGa)?.tenGa || maGa;
                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', background: 'white', padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--gray-200)' }}>
                      <span style={{ flex: 1 }}>🚩 {gaName}</span>
                      <button
                        type="button"
                        onClick={() => setForm({
                          ...form,
                          gaGiua: form.gaGiua.filter((_, i) => i !== idx)
                        })}
                        style={{
                          background: 'var(--red-100)',
                          border: 'none',
                          color: 'var(--red-700)',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}
                      >
                        ✕ Xóa
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted" style={{ margin: '0', fontSize: '13px' }}>Chưa có ga giữa nào</p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              className="form-control"
              defaultValue=""
              onChange={(e) => {
                if (e.target.value && (!form.gaGiua || !form.gaGiua.includes(e.target.value))) {
                  const newGaGiua = form.gaGiua ? [...form.gaGiua, e.target.value] : [e.target.value];
                  setForm({ ...form, gaGiua: newGaGiua });
                  e.target.value = '';
                }
              }}
              style={{ flex: 1 }}
            >
              <option value="">+ Thêm ga giữa</option>
              {gaList
                .filter(ga => ga.maGa !== form.maGaDau && ga.maGa !== form.maGaCuoi && (!form.gaGiua || !form.gaGiua.includes(ga.maGa)))
                .map(ga => (
                  <option key={ga.maGa} value={ga.maGa}>
                    {ga.tenGa}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">KHOẢNG CÁCH (KM)</label>
            <input
              type="number"
              className="form-control"
              value={form.khoangCachKm}
              onChange={(e) => setForm({ ...form, khoangCachKm: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">TRẠNG THÁI</label>
            <select
              className="form-control"
              value={form.trangThai}
              onChange={(e) => setForm({ ...form, trangThai: e.target.value })}
            >
              <option value="HOAT_DONG">Hoạt động</option>
              <option value="DUNG">Dừng</option>
            </select>
          </div>
        </div>
        <div className="modal-footer" style={{ padding: '16px 0 0', borderTop: '1px solid var(--gray-200)' }}>
          <button className="btn btn-secondary" onClick={() => setShowForm(false)}>
            Hủy
          </button>
          <button className="btn btn-primary" onClick={() => handleSave('tuyen')} disabled={formLoading}>
            {formLoading ? '⏳' : '🔒 Lưu'}
          </button>
        </div>
      </Modal>

      {/* Modal for Chuyen Tau */}
      <Modal
        isOpen={showForm && tab === 'chuyen-tau'}
        onClose={() => setShowForm(false)}
        title={editItem ? 'Chỉnh sửa Chuyến tàu' : 'Thêm Chuyến tàu Mới'}
        subtitle="Quản lý chuyến tàu với tự động phân loại vai trò"
        size="lg"
      >
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">MÃ CHUYẾN TÀU</label>
            <input
              className="form-control"
              value={form.maChuyenTau}
              onChange={(e) => setForm({ ...form, maChuyenTau: e.target.value })}
              disabled={!!editItem}
              style={editItem ? { background: 'var(--gray-100)' } : {}}
            />
          </div>
          <div className="form-group">
            <label className="form-label">MÃ TÀU</label>
            <select
              className="form-control"
              value={form.maTau}
              onChange={(e) => setForm({ ...form, maTau: e.target.value })}
            >
              <option value="">Chọn tàu</option>
              {tau
                .filter(t => t.trangThai === 'HOAT_DONG' || t.maTau === form.maTau)
                .map(t => (
                  <option key={t.maTau} value={t.maTau}>
                    {t.tenTau} {t.trangThai !== 'HOAT_DONG' ? '(Đang bảo trì/Ngừng)' : ''}
                  </option>
                ))}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">TUYẾN</label>
            <select
              className="form-control"
              value={form.maTuyen}
              onChange={(e) => handleTuyenChange(e.target.value)}
            >
              <option value="">Chọn tuyến</option>
              {tuyenDuong.map(t => (
                <option key={t.maTuyen} value={t.maTuyen}>
                  {t.tenTuyen}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">VAI TRÒ TẠI ĐÀ NẴNG</label>
            <input
              className="form-control"
              value={form.vaiTroTaiDaNang}
              disabled
              style={{ background: 'var(--gray-100)' }}
            />
            <small style={{ color: 'var(--gray-500)' }}>Tự động xác định dựa trên tuyến</small>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              GIỜ ĐẾN DỰ KIẾN
              {form.vaiTroTaiDaNang === 'XUAT_PHAT' && (
                <span style={{ color: 'var(--gray-500)', fontSize: '11px', marginLeft: '8px' }}>
                  (Không áp dụng cho tàu xuất phát)
                </span>
              )}
            </label>
            <input
              type="time"
              className="form-control"
              value={form.vaiTroTaiDaNang === 'XUAT_PHAT' ? '' : form.gioDenDuKien}
              onChange={(e) => setForm({ ...form, gioDenDuKien: e.target.value })}
              disabled={form.vaiTroTaiDaNang === 'XUAT_PHAT'}
              style={form.vaiTroTaiDaNang === 'XUAT_PHAT' ? { background: 'var(--gray-100)' } : {}}
              placeholder={form.vaiTroTaiDaNang === 'XUAT_PHAT' ? 'N/A' : ''}
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              GIỜ ĐI DỰ KIẾN
              {form.vaiTroTaiDaNang === 'DIEM_CUOI' && (
                <span style={{ color: 'var(--gray-500)', fontSize: '11px', marginLeft: '8px' }}>
                  (Không áp dụng cho tàu điểm cuối)
                </span>
              )}
            </label>
            <input
              type="time"
              className="form-control"
              value={form.vaiTroTaiDaNang === 'DIEM_CUOI' ? '' : form.gioDiDuKien}
              onChange={(e) => setForm({ ...form, gioDiDuKien: e.target.value })}
              disabled={form.vaiTroTaiDaNang === 'DIEM_CUOI'}
              style={form.vaiTroTaiDaNang === 'DIEM_CUOI' ? { background: 'var(--gray-100)' } : {}}
              placeholder={form.vaiTroTaiDaNang === 'DIEM_CUOI' ? 'N/A' : ''}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              NGÀY CHẠY
              <span style={{ color: 'var(--red-600)', marginLeft: '4px' }}>*</span>
              <span style={{ color: 'var(--gray-500)', fontSize: '11px', display: 'block', marginTop: '4px' }}>
                (Tối đa 1 tháng từ hôm nay)
              </span>
            </label>
            <input
              type="date"
              className="form-control"
              value={form.ngayChay}
              min={getDateConstraints().minDate}
              max={getDateConstraints().maxDate}
              onChange={(e) => setForm({ ...form, ngayChay: e.target.value })}
              style={
                form.ngayChay && !isDateWithinRange(form.ngayChay)
                  ? { borderColor: 'var(--red-600)', borderWidth: '2px' }
                  : {}
              }
            />
            {form.ngayChay && !isDateWithinRange(form.ngayChay) && (
              <small style={{ color: 'var(--red-600)', marginTop: '4px', display: 'block' }}>
                ⚠️ Ngày chạy phải trong vòng 1 tháng kể từ hôm nay
              </small>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">TRẠNG THÁI</label>
            <select
              className="form-control"
              value={form.trangThai}
              onChange={(e) => setForm({ ...form, trangThai: e.target.value })}
            >
              <option value="HOAT_DONG">Hoạt động</option>
              <option value="DUNG">Dừng</option>
            </select>
          </div>
        </div>
        <div className="modal-footer" style={{ padding: '16px 0 0', borderTop: '1px solid var(--gray-200)' }}>
          <button className="btn btn-secondary" onClick={() => setShowForm(false)}>
            Hủy
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => {
              if (tab === 'chuyen-tau' && form.ngayChay && !isDateWithinRange(form.ngayChay)) {
                showError('Ngày chạy phải trong vòng 1 tháng kể từ hôm nay');
                return;
              }
              handleSave(tab);
            }} 
            disabled={formLoading || (tab === 'chuyen-tau' && form.ngayChay && !isDateWithinRange(form.ngayChay))}
          >
            {formLoading ? '⏳' : '🔒 Lưu'}
          </button>
        </div>
      </Modal>
    </>
  );
}