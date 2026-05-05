import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { suCoAPI, duongRayAPI } from '../../services/api';

// ===== CONFIG =====
const LOAI_SU_CO_OPTIONS = [
  { value: 'SU_CO_DUONG_RAY', label: '🛤️ Sự cố đường ray', moTaGoi: 'Đường ray bị hỏng, biến dạng hoặc có vật cản' },
  { value: 'SU_CO_KY_THUAT',  label: '⚙️ Sự cố kỹ thuật',  moTaGoi: 'Lỗi thiết bị điện, tín hiệu, hệ thống' },
  { value: 'SU_CO_TAU',       label: '🚂 Sự cố tàu',        moTaGoi: 'Tàu gặp sự cố cơ học, không thể di chuyển' },
  { value: 'MAT_LIEN_LAC',   label: '📡 Mất liên lạc',     moTaGoi: 'Mất liên lạc với tàu hoặc trạm' },
  { value: 'AN_NINH',        label: '🚨 Sự cố an ninh',    moTaGoi: 'Tình huống an ninh, cần ứng phó khẩn cấp' },
  { value: 'KHAC',           label: '📝 Khác',              moTaGoi: 'Mô tả rõ trong phần ghi chú' },
];

const MUC_DO_OPTIONS = [
  { value: 'THAP',    label: '🟢 Bình thường', desc: 'Có thể xử lý trong vài phút', color: '#10B981', bg: '#ECFDF5' },
  { value: 'TRUNG_BINH', label: '🟡 Đáng lo',  desc: 'Cần hỗ trợ của Điều hành',    color: '#F59E0B', bg: '#FFFBEB' },
  { value: 'CAO',    label: '🔴 Khẩn cấp',   desc: 'Ảnh hưởng nghiêm trọng, cần xử lý ngay', color: '#EF4444', bg: '#FEF2F2' },
];

// Nhãn trạng thái sự cố để hiển thị trong "Báo cáo của tôi"
const TRANG_THAI_CONFIG = {
  CHO_TIEP_NHAN: { label: 'Chờ tiếp nhận', color: '#F59E0B', bg: '#FFFBEB', icon: '⏳' },
  DANG_XU_LY:    { label: 'Đang xử lý',   color: '#3B82F6', bg: '#EFF6FF', icon: '🔧' },
  DA_XU_LY:      { label: 'Đã xử lý',     color: '#10B981', bg: '#ECFDF5', icon: '✅' },
};

export default function GhiNhanSuCoPage() {
  const navigate = useNavigate();

  // ── State form ──────────────────────────────────────────
  const [maRay, setMaRay] = useState('');
  const [loaiSuCo, setLoaiSuCo] = useState('');
  const [moTa, setMoTa] = useState('');
  const [mucDo, setMucDo] = useState('TRUNG_BINH');
  const [thoiGianXuLyUocTinh, setThoiGianXuLyUocTinh] = useState('');
  const [ngayXayRa, setNgayXayRa] = useState(
    () => new Date().toISOString().slice(0, 16)
  );

  // ── State dữ liệu ────────────────────────────────────────
  const [duongRayList, setDuongRayList] = useState([]);
  const [loadingRay, setLoadingRay] = useState(true);

  // ── State UI ─────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('form'); // 'form' | 'bao-cao'
  const [submitting, setSubmitting] = useState(false);
  const [ketQua, setKetQua] = useState(null); // null | { success, suCo }
  const [errors, setErrors] = useState({});

  // ── State "Báo cáo của tôi" ──────────────────────────────
  const [baoCaoList, setBaoCaoList] = useState([]);
  const [loadingBaoCao, setLoadingBaoCao] = useState(false);

  // ── Load đường ray ───────────────────────────────────────
  useEffect(() => {
    duongRayAPI.getAll()
      .then(res => setDuongRayList(res.data?.data || res.data || []))
      .catch(() => setDuongRayList([]))
      .finally(() => setLoadingRay(false));
  }, []);

  // ── Load báo cáo khi chuyển tab ──────────────────────────
  useEffect(() => {
    if (activeTab === 'bao-cao') loadBaoCaoCuaToi();
  }, [activeTab]);

  const loadBaoCaoCuaToi = async () => {
    setLoadingBaoCao(true);
    try {
      const res = await suCoAPI.getCuaToi();
      setBaoCaoList(res.data?.data || res.data || []);
    } catch {
      setBaoCaoList([]);
    } finally {
      setLoadingBaoCao(false);
    }
  };

  // ── Validate ─────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!maRay)     errs.maRay    = 'Vui lòng chọn đường ray xảy ra sự cố';
    if (!loaiSuCo)  errs.loaiSuCo = 'Vui lòng chọn loại sự cố';
    if (!moTa.trim()) errs.moTa   = 'Vui lòng mô tả tình trạng hiện trường';
    if (moTa.trim().length < 10) errs.moTa = 'Mô tả cần ít nhất 10 ký tự';
    if (ngayXayRa) {
      const dt = new Date(ngayXayRa);
      const now = new Date();
      const minAllowed = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24h trước
      if (dt > now) errs.ngayXayRa = 'Thời gian xảy ra không thể là tương lai';
      else if (dt < minAllowed) errs.ngayXayRa = 'Thời gian xảy ra không thể quá 24 giờ trước';
    }
    return errs;
  };

  // ── Submit ───────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    setErrors({});
    try {
      const payload = {
        // Không gửi maSuCo — backend tự sinh
        maRay,
        loaiSuCo,
        moTa: moTa.trim(),
        mucDo,
        thoiGianXuLyUocTinh: thoiGianXuLyUocTinh ? parseInt(thoiGianXuLyUocTinh, 10) : null,
        ngayXayRa: ngayXayRa ? new Date(ngayXayRa).toISOString() : new Date().toISOString(),
        // Không có kichHoatPhongToa — NVĐH quyết định
      };

      const res = await suCoAPI.ghiNhan(payload);
      const suCo = res.data?.data || res.data;
      setKetQua({ success: true, suCo });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Có lỗi xảy ra';
      setKetQua({ success: false, message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Reset form ───────────────────────────────────────────
  const handleReset = () => {
    setMaRay(''); setLoaiSuCo(''); setMoTa('');
    setMucDo('TRUNG_BINH'); setThoiGianXuLyUocTinh(''); setErrors({}); setKetQua(null);
    setNgayXayRa(new Date().toISOString().slice(0, 16));
  };

  // ── Format helpers ───────────────────────────────────────
  const formatTime = (iso) => {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleString('vi-VN'); } catch { return iso; }
  };
  const getRayLabel = (id) => {
    const r = duongRayList.find(r => r.maRay === id);
    return r ? `${r.maRay} — ${r.tenRay || ''}` : id;
  };
  const getLoaiLabel = (v) => LOAI_SU_CO_OPTIONS.find(o => o.value === v)?.label || v;

  // ============================================================
  // RENDER — Màn hình xác nhận sau submit
  // ============================================================
  if (ketQua) return (
    <div style={S.page}>
      <div style={{ ...S.card, maxWidth: 560, textAlign: 'center', padding: '48px 40px' }}>
        {ketQua.success ? (
          <>
            <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#065F46', marginBottom: 8 }}>
              Báo cáo đã được gửi!
            </h2>
            <p style={{ color: '#6B7280', marginBottom: 24 }}>
              Nhân viên Điều hành đã được thông báo và sẽ tiếp nhận sự cố.<br/>
              Vui lòng <strong>giữ nguyên hiện trường</strong> và chờ hướng dẫn.
            </p>

            <div style={S.infoBox}>
              <InfoRow label="Mã sự cố" value={ketQua.suCo?.maSuCo || '—'} />
              <InfoRow label="Đường ray" value={getRayLabel(ketQua.suCo?.maRay)} />
              <InfoRow label="Loại sự cố" value={getLoaiLabel(ketQua.suCo?.loaiSuCo)} />
              <InfoRow label="Thời gian" value={formatTime(ketQua.suCo?.ngayTao)} />
              <InfoRow label="Trạng thái" value={
                <span style={{ color: '#F59E0B', fontWeight: 600 }}>⏳ Chờ Điều hành tiếp nhận</span>
              } />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 28 }}>
              <button style={S.btnSecondary} onClick={handleReset}>
                + Ghi nhận sự cố mới
              </button>
              <button style={S.btnPrimary} onClick={() => { setActiveTab('bao-cao'); setKetQua(null); }}>
                📋 Xem báo cáo của tôi
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 64, marginBottom: 16 }}>❌</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#991B1B', marginBottom: 8 }}>
              Gửi báo cáo thất bại
            </h2>
            <p style={{ color: '#6B7280', marginBottom: 24 }}>{ketQua.message}</p>
            <button style={S.btnPrimary} onClick={() => setKetQua(null)}>
              Thử lại
            </button>
          </>
        )}
      </div>
    </div>
  );

  // ============================================================
  // RENDER CHÍNH
  // ============================================================
  return (
    <div style={S.page}>
      {/* ── Header ── */}
      <div style={S.header}>
        <div>
          <h1 style={S.headerTitle}>🚨 Ghi Nhận Sự Cố</h1>
          <p style={S.headerSub}>Báo cáo sự cố tại nhà ga — Điều hành sẽ tiếp nhận và xử lý</p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={S.tabs}>
        <button
          style={{ ...S.tab, ...(activeTab === 'form' ? S.tabActive : {}) }}
          onClick={() => setActiveTab('form')}
        >
          📝 Ghi nhận sự cố
        </button>
        <button
          style={{ ...S.tab, ...(activeTab === 'bao-cao' ? S.tabActive : {}) }}
          onClick={() => setActiveTab('bao-cao')}
        >
          📋 Báo cáo của tôi
        </button>
      </div>

      {/* ════════════════ TAB: FORM ════════════════ */}
      {activeTab === 'form' && (
        <div style={S.card}>
          <div style={S.cardTitle}>📍 Thông Tin Sự Cố</div>
          <p style={{ color: '#6B7280', fontSize: 13, marginBottom: 24 }}>
            Mô tả trung thực tình trạng hiện trường. Nhân viên Điều hành sẽ đánh giá và quyết định phương án xử lý.
          </p>

          <form onSubmit={handleSubmit}>
            {/* VỊ TRÍ XẢY RA */}
            <FieldGroup label="📍 VỊ TRÍ XẢY RA" required error={errors.maRay}>
              <select
                value={maRay}
                onChange={e => { setMaRay(e.target.value); setErrors(p => ({ ...p, maRay: null })); }}
                style={{ ...S.input, ...(errors.maRay ? S.inputError : {}) }}
                disabled={loadingRay}
              >
                <option value="">{loadingRay ? 'Đang tải...' : '-- Chọn đường ray --'}</option>
                {duongRayList.map(r => (
                  <option key={r.maRay} value={r.maRay}>
                    {r.maRay} — {r.tenRay || ''} ({r.trangThai || 'SAN_SANG'})
                  </option>
                ))}
              </select>
            </FieldGroup>

            {/* LOẠI SỰ CỐ */}
            <FieldGroup label="🚨 LOẠI SỰ CỐ" required error={errors.loaiSuCo}>
              <div style={S.radioGrid}>
                {LOAI_SU_CO_OPTIONS.map(opt => (
                  <label
                    key={opt.value}
                    style={{
                      ...S.radioCard,
                      ...(loaiSuCo === opt.value ? S.radioCardActive : {}),
                    }}
                    onClick={() => { setLoaiSuCo(opt.value); setErrors(p => ({ ...p, loaiSuCo: null })); }}
                  >
                    <input
                      type="radio" name="loaiSuCo" value={opt.value}
                      checked={loaiSuCo === opt.value} onChange={() => {}}
                      style={{ display: 'none' }}
                    />
                    <strong>{opt.label}</strong>
                    <span style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{opt.moTaGoi}</span>
                  </label>
                ))}
              </div>
            </FieldGroup>

            {/* MÔ TẢ HIỆN TRƯỜNG */}
            <FieldGroup label="📝 MÔ TẢ HIỆN TRƯỜNG" required error={errors.moTa}>
              <textarea
                value={moTa}
                onChange={e => { setMoTa(e.target.value); setErrors(p => ({ ...p, moTa: null })); }}
                placeholder="Mô tả chi tiết tình trạng hiện trường: vị trí cụ thể, biểu hiện sự cố, các yếu tố liên quan..."
                rows={4}
                style={{ ...S.input, resize: 'vertical', ...(errors.moTa ? S.inputError : {}) }}
              />
              <div style={{ textAlign: 'right', fontSize: 12, color: moTa.length < 10 ? '#EF4444' : '#9CA3AF' }}>
                {moTa.length} ký tự {moTa.length < 10 && '(tối thiểu 10)'}
              </div>
            </FieldGroup>

            {/* MỨC ĐỘ BAN ĐẦU */}
            <FieldGroup label="⚠️ MỨC ĐỘ BAN ĐẦU" hint="Điều hành sẽ xác nhận lại mức độ chính thức">
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {MUC_DO_OPTIONS.map(opt => (
                  <button
                    key={opt.value} type="button"
                    onClick={() => setMucDo(opt.value)}
                    style={{
                      ...S.mucDoBtn,
                      borderColor: mucDo === opt.value ? opt.color : '#E5E7EB',
                      background: mucDo === opt.value ? opt.bg : '#fff',
                      color: mucDo === opt.value ? opt.color : '#374151',
                      fontWeight: mucDo === opt.value ? 700 : 400,
                    }}
                  >
                    <span>{opt.label}</span>
                    <span style={{ fontSize: 11, color: '#6B7280' }}>{opt.desc}</span>
                  </button>
                ))}
              </div>
            </FieldGroup>

            {/* THỜI ĐIỂM XẢY RA */}
            <FieldGroup label="🕐 THỜI ĐIỂM XẢY RA">
              <input
                type="datetime-local"
                value={ngayXayRa}
                onChange={e => setNgayXayRa(e.target.value)}
                max={new Date().toISOString().slice(0, 16)}
                min={new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 16)}
                style={{
                  ...S.input,
                  borderColor: errors.ngayXayRa ? '#DC2626' : undefined
                }}
              />
              {errors.ngayXayRa && (
                <div style={{ color: '#DC2626', fontSize: 12, marginTop: 4 }}>{errors.ngayXayRa}</div>
              )}
            </FieldGroup>

            {/* THỜI GIAN XỬ LÝ ƯỚC TÍNH */}
            <FieldGroup label="⏳ THỜI GIAN XỬ LÝ ƯỚC TÍNH (TÙY CHỌN)" hint="Số phút dự định để khắc phục xong sự cố">
              <input
                type="number"
                min="0"
                placeholder="VD: 60"
                value={thoiGianXuLyUocTinh}
                onChange={e => setThoiGianXuLyUocTinh(e.target.value)}
                style={S.input}
              />
            </FieldGroup>

            {/* Banner thông tin */}
            <div style={S.infoBanner}>
              ℹ️ Sau khi gửi, Nhân viên Điều hành sẽ tiếp nhận, đánh giá mức độ chính thức và quyết định phương án xử lý.
              Bạn có thể theo dõi trạng thái trong tab <strong>Báo cáo của tôi</strong>.
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
              <button type="button" style={S.btnSecondary} onClick={handleReset}>
                Xóa form
              </button>
              <button type="submit" style={S.btnDanger} disabled={submitting}>
                {submitting ? '⏳ Đang gửi...' : '📢 Gửi Báo Cáo Sự Cố'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ════════════════ TAB: BÁO CÁO CỦA TÔI ════════════════ */}
      {activeTab === 'bao-cao' && (
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={S.cardTitle}>📋 Báo Cáo Sự Cố Của Tôi</div>
            <button style={S.btnSecondary} onClick={loadBaoCaoCuaToi} disabled={loadingBaoCao}>
              {loadingBaoCao ? '⏳' : '🔄'} Làm mới
            </button>
          </div>

          {loadingBaoCao ? (
            <div style={S.emptyState}>⏳ Đang tải...</div>
          ) : baoCaoList.length === 0 ? (
            <div style={S.emptyState}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>📋</div>
              <p>Bạn chưa ghi nhận sự cố nào.</p>
              <button style={S.btnPrimary} onClick={() => setActiveTab('form')}>
                + Ghi nhận sự cố đầu tiên
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {baoCaoList.map(sc => {
                const cfg = TRANG_THAI_CONFIG[sc.trangThaiXuLy] || { label: sc.trangThaiXuLy, color: '#6B7280', bg: '#F9FAFB', icon: '❓' };
                const loai = LOAI_SU_CO_OPTIONS.find(o => o.value === sc.loaiSuCo);
                return (
                  <div key={sc.maSuCo} style={S.baoCaoItem}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>
                          {loai?.label || sc.loaiSuCo} &nbsp;·&nbsp; {getRayLabel(sc.maRay)}
                        </div>
                        <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                          Mã: {sc.maSuCo} &nbsp;·&nbsp; {formatTime(sc.ngayTao)}
                        </div>
                        {sc.moTa && (
                          <div style={{ fontSize: 13, color: '#374151', marginTop: 6, whiteSpace: 'pre-wrap' }}>
                            {sc.moTa.length > 120 ? sc.moTa.slice(0, 120) + '...' : sc.moTa}
                          </div>
                        )}
                      </div>
                      <span style={{ ...S.badge, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33` }}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </div>
                    {sc.trangThaiXuLy === 'DANG_XU_LY' && (
                      <div style={{ marginTop: 8, fontSize: 12, color: '#3B82F6' }}>
                        🔧 Điều hành đang xử lý sự cố này.
                      </div>
                    )}
                    {sc.trangThaiXuLy === 'DA_XU_LY' && (
                      <div style={{ marginTop: 8, fontSize: 12, color: '#10B981' }}>
                        ✅ Sự cố đã được xử lý xong lúc {formatTime(sc.ngayXuLy)}.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Helper Components ────────────────────────────────────────
function FieldGroup({ label, required, hint, error, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={S.label}>
        {label} {required && <span style={{ color: '#EF4444' }}>*</span>}
        {hint && <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 400, marginLeft: 8 }}>({hint})</span>}
      </label>
      {children}
      {error && <div style={S.errorMsg}>⚠️ {error}</div>}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F3F4F6' }}>
      <span style={{ color: '#6B7280', fontSize: 13 }}>{label}</span>
      <span style={{ fontWeight: 600, fontSize: 13 }}>{value}</span>
    </div>
  );
}

// ── Styles ───────────────────────────────────────────────────
const S = {
  page: {
    padding: '24px',
    maxWidth: 800,
    margin: '0 auto',
    fontFamily: '"Inter", "Segoe UI", sans-serif',
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 800,
    color: '#111827',
    margin: 0,
  },
  headerSub: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  tabs: {
    display: 'flex',
    gap: 4,
    marginBottom: 20,
    borderBottom: '2px solid #E5E7EB',
  },
  tab: {
    padding: '10px 20px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
    color: '#6B7280',
    borderBottom: '2px solid transparent',
    marginBottom: -2,
    transition: 'all 0.15s',
  },
  tabActive: {
    color: '#DC2626',
    borderBottomColor: '#DC2626',
    fontWeight: 700,
  },
  card: {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid #E5E7EB',
    padding: '28px 32px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: '#111827',
    marginBottom: 4,
  },
  label: {
    display: 'block',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.05em',
    color: '#374151',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #D1D5DB',
    fontSize: 14,
    color: '#111827',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorMsg: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 4,
  },
  radioGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: 10,
  },
  radioCard: {
    display: 'flex',
    flexDirection: 'column',
    padding: '10px 14px',
    borderRadius: 8,
    border: '2px solid #E5E7EB',
    cursor: 'pointer',
    fontSize: 13,
    transition: 'all 0.15s',
    userSelect: 'none',
  },
  radioCardActive: {
    borderColor: '#DC2626',
    background: '#FEF2F2',
  },
  mucDoBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '10px 16px',
    borderRadius: 8,
    border: '2px solid',
    cursor: 'pointer',
    fontSize: 13,
    flex: 1,
    minWidth: 140,
    transition: 'all 0.15s',
    gap: 2,
  },
  infoBanner: {
    background: '#EFF6FF',
    border: '1px solid #BFDBFE',
    borderRadius: 8,
    padding: '12px 16px',
    fontSize: 13,
    color: '#1E40AF',
    marginTop: 8,
  },
  infoBox: {
    background: '#F9FAFB',
    borderRadius: 8,
    padding: '12px 16px',
    textAlign: 'left',
  },
  btnPrimary: {
    padding: '10px 20px',
    background: '#DC2626',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  btnDanger: {
    padding: '10px 24px',
    background: '#DC2626',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
  },
  btnSecondary: {
    padding: '10px 20px',
    background: '#fff',
    color: '#374151',
    border: '1px solid #D1D5DB',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '4px 10px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  baoCaoItem: {
    padding: '14px 16px',
    borderRadius: 10,
    border: '1px solid #E5E7EB',
    background: '#FAFAFA',
  },
  emptyState: {
    textAlign: 'center',
    padding: '48px 24px',
    color: '#9CA3AF',
    fontSize: 14,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
};
