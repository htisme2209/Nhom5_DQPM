import { useState } from 'react';
import { duongRayAPI, gaAPI, tuyenDuongAPI, tauAPI, chuyenTauAPI } from '../services/api';
import {
    DEFAULT_RAY_FORM,
    DEFAULT_TAU_FORM,
    DEFAULT_GA_FORM,
    DEFAULT_TUYEN_FORM,
    DEFAULT_CHUYEN_TAU_FORM
} from '../constants/infrastructureConstants';

export default function useInfrastructureForm(type, onSuccess, onError) {
    const [form, setForm] = useState(getDefaultForm(type));
    const [editItem, setEditItem] = useState(null);
    const [loading, setLoading] = useState(false);

    function getDefaultForm(type) {
        const forms = {
            ray: DEFAULT_RAY_FORM,
            tau: DEFAULT_TAU_FORM,
            ga: DEFAULT_GA_FORM,
            tuyen: DEFAULT_TUYEN_FORM,
            'chuyen-tau': DEFAULT_CHUYEN_TAU_FORM
        };
        return forms[type] || {};
    }

    const openCreate = (type) => {
        setEditItem(null);
        const timestamp = Date.now().toString();
        const forms = {
            ray: { ...DEFAULT_RAY_FORM, maRay: 'RAY' + timestamp.slice(-4) },
            tau: { ...DEFAULT_TAU_FORM, maTau: 'TAU' + timestamp.slice(-4) },
            ga: { ...DEFAULT_GA_FORM, maGa: 'GA' + timestamp.slice(-6) },
            tuyen: { ...DEFAULT_TUYEN_FORM, maTuyen: 'TUY' + timestamp.slice(-6) },
            'chuyen-tau': { ...DEFAULT_CHUYEN_TAU_FORM, maChuyenTau: 'SE' + timestamp.slice(-4) }
        };
        setForm(forms[type] || {});
    };

    const openEdit = (item, type) => {
        setEditItem(item);
        if (type === 'ray') {
            setForm({
                maRay: item.maRay,
                soRay: item.soRay?.toString() || '',
                chieuDaiRay: item.chieuDaiRay?.toString() || '',
                loaiRay: item.loaiRay || 'Đường chính',
                trangThai: item.trangThai
            });
        } else if (type === 'tau') {
            setForm({
                maTau: item.maTau,
                tenTau: item.tenTau,
                loaiTau: item.loaiTau || 'Tàu khách',
                soToa: item.soToa?.toString() || '',
                sucChua: item.sucChua?.toString() || '',
                trangThai: item.trangThai
            });
        } else if (type === 'ga') {
            setForm({
                maGa: item.maGa,
                tenGa: item.tenGa,
                diaChi: item.diaChi || '',
                loaiGa: item.loaiGa || 'Ga hành khách',
                thuTuTrenTuyen: item.thuTuTrenTuyen?.toString() || '',
                trangThai: item.trangThai
            });
        } else if (type === 'tuyen') {
            setForm({
                maTuyen: item.maTuyen,
                tenTuyen: item.tenTuyen,
                maGaDau: item.maGaDau,
                maGaCuoi: item.maGaCuoi,
                gaGiua: item.gaGiua || [],
                khoangCachKm: item.khoangCachKm?.toString() || '',
                trangThai: item.trangThai
            });
        } else if (type === 'chuyen-tau') {
            setForm({
                maChuyenTau: item.maChuyenTau,
                maTau: item.maTau,
                maTuyen: item.maTuyen,
                vaiTroTaiDaNang: item.vaiTroTaiDaNang,
                gioDenDuKien: item.gioDenDuKien || '',
                gioDiDuKien: item.gioDiDuKien || '',
                ngayChay: item.ngayChay,
                trangThai: item.trangThai
            });
        }
    };

    const handleSave = async (type) => {
        setLoading(true);
        try {
            let payload = { ...form };
            let api, id, successMsg;

            if (type === 'ray') {
                payload = { ...form, soRay: parseInt(form.soRay), chieuDaiRay: parseFloat(form.chieuDaiRay) };
                api = duongRayAPI;
                id = editItem?.maRay;
                successMsg = editItem ? 'Cập nhật đường ray thành công!' : 'Thêm đường ray thành công!';
            } else if (type === 'tau') {
                payload = { ...form, soToa: parseInt(form.soToa), sucChua: parseInt(form.sucChua) };
                api = tauAPI;
                id = editItem?.maTau;
                successMsg = editItem ? 'Cập nhật tàu thành công!' : 'Thêm tàu thành công!';
            } else if (type === 'ga') {
                payload = { ...form, thuTuTrenTuyen: form.thuTuTrenTuyen ? parseInt(form.thuTuTrenTuyen) : null };
                api = gaAPI;
                id = editItem?.maGa;
                successMsg = editItem ? 'Cập nhật ga thành công!' : 'Thêm ga mới thành công!';
            } else if (type === 'tuyen') {
                const { gaGiua, ...tuyenDuongData } = form;
                if (editItem) {
                    payload = { ...form, khoangCachKm: parseFloat(form.khoangCachKm) }; // Dành cho PUT (nếu có API)
                } else {
                    payload = { 
                        tuyenDuong: { ...tuyenDuongData, khoangCachKm: parseFloat(form.khoangCachKm) },
                        danhSachGaGiua: gaGiua || []
                    };
                }
                api = tuyenDuongAPI;
                id = editItem?.maTuyen;
                successMsg = editItem ? 'Cập nhật tuyến thành công!' : 'Thêm tuyến mới thành công!';
            } else if (type === 'chuyen-tau') {
                // Xử lý NULL cho giờ đến/đi dựa trên vai trò
                payload = { ...form };
                if (form.vaiTroTaiDaNang === 'XUAT_PHAT') {
                    payload.gioDenDuKien = null; // Tàu xuất phát không có giờ đến
                }
                if (form.vaiTroTaiDaNang === 'DIEM_CUOI') {
                    payload.gioDiDuKien = null; // Tàu điểm cuối không có giờ đi
                }
                api = chuyenTauAPI;
                id = editItem?.maChuyenTau;
                successMsg = editItem ? 'Cập nhật chuyến tàu thành công!' : 'Thêm chuyến tàu mới thành công!';
            }

            if (editItem) {
                await api.update(id, payload);
            } else {
                await api.create(payload);
            }

            onSuccess?.(successMsg);
        } catch (e) {
            onError?.(e.response?.data?.message || 'Lỗi khi lưu');
            throw e;
        } finally {
            setLoading(false);
        }
    };

    return {
        form,
        setForm,
        editItem,
        loading,
        openCreate,
        openEdit,
        handleSave
    };
}
