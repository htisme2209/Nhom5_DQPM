// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS & RULE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** 
 * Trích xuất giá trị quy tắc từ danh sách quy tắc nghiệp vụ
 * @param {Array} quyTacs 
 * @param {string} maQuyTac 
 * @param {number} defaultValue 
 */
function getRuleValue(quyTacs, maQuyTac, defaultValue) {
    if (!quyTacs || !Array.isArray(quyTacs)) return defaultValue;
    const rule = quyTacs.find(r => r.maQuyTac === maQuyTac);
    return rule ? parseInt(rule.giaTri) : defaultValue;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** "HH:mm[:ss]" → phút từ 00:00 */
function timeToMinutes(timeStr) {
    if (!timeStr) return null;
    // Nếu dạng ISO datetime lấy phần giờ phút
    const timePart = timeStr.includes('T') ? timeStr.split('T')[1] : timeStr;
    const [h, m] = timePart.split(':').map(Number);
    return h * 60 + (m || 0);
}

/** Phút → "HH:mm" (normalize qua ngày) */
function minutesToTime(mins) {
    if (mins == null) return null;
    const normalized = ((mins % 1440) + 1440) % 1440;
    const h = Math.floor(normalized / 60);
    const m = normalized % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Thời điểm đại diện để sort chuyến tàu (phút từ 00:00) */
function getEarliestTime(train, rules) {
    const boardingMin = getRuleValue(rules, 'QT-02', 30);
    const role = train.vaiTroTaiDaNang;
    if (role === 'XUAT_PHAT') {
        const dep = timeToMinutes(train.gioDiDuKien);
        return dep != null ? dep - boardingMin : Infinity;
    }
    const arr = timeToMinutes(train.gioDenDuKien);
    return arr != null ? arr : Infinity;
}

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATE
// ─────────────────────────────────────────────────────────────────────────────

function validateTrain(train) {
    const role = train.vaiTroTaiDaNang;
    if (role === 'XUAT_PHAT') {
        if (!train.gioDiDuKien)
            return { valid: false, reason: 'Tàu xuất phát thiếu giờ đi (gioDiDuKien)' };
    } else if (role === 'DIEM_CUOI') {
        if (!train.gioDenDuKien)
            return { valid: false, reason: 'Tàu điểm cuối thiếu giờ đến (gioDenDuKien)' };
    } else {
        // TRUNG_GIAN
        if (!train.gioDenDuKien || !train.gioDiDuKien)
            return {
                valid: false,
                reason: `Tàu trung gian thiếu ${!train.gioDenDuKien ? 'giờ đến' : 'giờ đi'}`
            };
    }
    return { valid: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// TRACK WINDOW (cửa sổ chiếm ray)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Tính [start, end] (phút) cho cửa sổ chiếm ray theo quy tắc nghiệp vụ.
 */
function calculateTrackWindow(train, rules) {
    const role = train.vaiTroTaiDaNang;
    const bufferMin   = getRuleValue(rules, 'QT-01', 15);
    const boardingMin = getRuleValue(rules, 'QT-02', 30);
    const dwellMin    = getRuleValue(rules, 'QT-03', 20);
    const arrivalPrep = 1; // 1p chuẩn bị trước giờ đến

    if (role === 'XUAT_PHAT') {
        const dep = timeToMinutes(train.gioDiDuKien);
        if (dep == null) return null;
        return {
            start: dep - boardingMin, 
            end:   dep + bufferMin    
        };
    }

    if (role === 'DIEM_CUOI') {
        const arr = timeToMinutes(train.gioDenDuKien);
        if (arr == null) return null;
        const leaveTrack = arr + dwellMin; // Giờ rời ray = giờ đến + thời gian dừng đỗ (dwell)
        return {
            start: arr - arrivalPrep,
            end:   leaveTrack + bufferMin // Giờ rời ray + đệm an toàn sau khi rời
        };
    }

    // TRUNG_GIAN
    const arr = timeToMinutes(train.gioDenDuKien);
    const dep = timeToMinutes(train.gioDiDuKien);
    if (arr == null || dep == null) return null;
    return {
        start: arr - arrivalPrep,
        end:   dep + bufferMin
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFLICT CHECKS
// ─────────────────────────────────────────────────────────────────────────────

/** Hai cửa sổ thời gian có chồng nhau không? */
function hasWindowConflict(w1, w2) {
    if (!w1 || !w2) return false;
    return !(w1.end <= w2.start || w2.end <= w1.start);
}

/**
 * Kiểm tra xung đột giờ xuất phát TOÀN MẠNG.
 */
function findDepartureConflict(train, assignedSchedules, rules) {
    const role = train.vaiTroTaiDaNang;
    if (role === 'DIEM_CUOI') return null;

    const minGap = getRuleValue(rules, 'QT-10', 10); // QT-10 cho khoảng cách xuất phát
    const trainDep = timeToMinutes(train.gioDiDuKien);
    if (trainDep == null) return null;

    for (const s of assignedSchedules) {
        if (s.vaiTroTaiDaNang === 'DIEM_CUOI') continue;
        const sDep = timeToMinutes(s.gioDiDuKien);
        if (sDep == null) continue;

        const gap = Math.abs(trainDep - sDep);
        if (gap < minGap) {
            return { conflictWith: s.maChuyenTau, gap, existingDep: s.gioDiDuKien };
        }
    }
    return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// TRACK ASSIGNMENT & TIME SHIFTING
// ─────────────────────────────────────────────────────────────────────────────

/** 
 * Tìm ray khả dụng. Nếu không có, thử dời giờ (Time Shifting) để tìm khe.
 */
function findBestSlot(train, assignedSchedules, tracks, rules) {
    const maxShift = 30; // Thử dời tối đa 30 phút
    const shifts = [0]; // Ưu tiên giờ gốc
    for (let i = 5; i <= maxShift; i += 5) {
        shifts.push(i);  // Thử dời muộn hơn
        shifts.push(-i); // Thử dời sớm hơn
    }

    const originalArr = timeToMinutes(train.gioDenDuKien);
    const originalDep = timeToMinutes(train.gioDiDuKien);

    for (let shift of shifts) {
        // Tạo tàu tạm thời với giờ đã dời
        const testTrain = { ...train };
        if (originalArr != null) testTrain.gioDenDuKien = minutesToTime(originalArr + shift);
        if (originalDep != null) testTrain.gioDiDuKien  = minutesToTime(originalDep + shift);

        // Kiểm tra xem giờ mới có vi phạm khoảng cách xuất phát 10p không
        if (findDepartureConflict(testTrain, assignedSchedules, rules)) continue;

        const testWindow = calculateTrackWindow(testTrain, rules);
        if (!testWindow) continue;

        // Chỉ xem xét ray đang sẵn sàng
        const availableTracks = tracks.filter(t => !t.trangThai || t.trangThai === 'SAN_SANG');

        for (const track of availableTracks) {
            const trackSchedules = assignedSchedules.filter(s => s.maRay === track.maRay);
            
            let hasConflict = false;
            for (const s of trackSchedules) {
                const sw = calculateTrackWindow(s, rules);
                if (hasWindowConflict(testWindow, sw)) {
                    hasConflict = true;
                    break;
                }
            }

            if (!hasConflict) {
                return { train: testTrain, maRay: track.maRay, shift };
            }
        }
    }

    return null; // Không tìm được slot
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export function optimizeSchedule(trains, tracks, rules = []) {
    const result = {
        success:  [],
        failed:   [],
        warnings: [],
        stats: { total: trains.length, assigned: 0, failed: 0, adjusted: 0 }
    };

    if (!trains || trains.length === 0) return result;
    if (!tracks || tracks.length === 0) {
        result.failed = trains.map(t => ({ train: t.maChuyenTau, reason: 'Không có đường ray nào' }));
        result.stats.failed = trains.length;
        return result;
    }

    // Sắp xếp: ưu tiên tàu đến sớm nhất
    const sortedTrains = [...trains].sort((a, b) => getEarliestTime(a, rules) - getEarliestTime(b, rules));
    const assignedSchedules = [];

    for (const rawTrain of sortedTrains) {
        const validation = validateTrain(rawTrain);
        if (!validation.valid) {
            result.failed.push({ train: rawTrain.maChuyenTau, reason: validation.reason });
            result.stats.failed++;
            continue;
        }

        const slot = findBestSlot(rawTrain, assignedSchedules, tracks, rules);

        if (slot) {
            const { train, maRay, shift } = slot;
            const schedule = {
                maLichTrinh:     `LT-${train.maChuyenTau}-${Date.now()}`,
                maChuyenTau:     train.maChuyenTau,
                maRay:           maRay,
                ngayChay:        train.ngayChay,
                gioDenDuKien:    train.vaiTroTaiDaNang !== 'XUAT_PHAT' ? train.gioDenDuKien : null,
                gioDiDuKien:     train.vaiTroTaiDaNang !== 'DIEM_CUOI' ? train.gioDiDuKien : null,
                vaiTroTaiDaNang: train.vaiTroTaiDaNang,
                trangThai:       'CHO_XAC_NHAN',
                soPhutTre:       0
            };

            if (shift !== 0) {
                result.stats.adjusted++;
                result.warnings.push({
                    train:   train.maChuyenTau,
                    message: `Tự động dời ${shift > 0 ? 'muộn' : 'sớm'} ${Math.abs(shift)} phút để tránh xung đột.`
                });
            }

            assignedSchedules.push(schedule);
            result.success.push(schedule);
            result.stats.assigned++;
        } else {
            result.failed.push({
                train:  rawTrain.maChuyenTau,
                reason: 'Không tìm được ray trống hoặc slot xuất phát phù hợp (đã thử dời ±30p)',
                role:   rawTrain.vaiTroTaiDaNang
            });
            result.stats.failed++;
        }
    }

    return result;
}

export function calculateOptimizationScore(schedules, tracks, rules = []) {
    let score = 100;
    const usedTracks = new Set(schedules.map(s => s.maRay));
    score -= (tracks.length - usedTracks.size) * 5; 

    const trackUsage = {};
    tracks.forEach(t => (trackUsage[t.maRay] = []));
    schedules.forEach(s => {
        const w = calculateTrackWindow(s, rules);
        if (w && trackUsage[s.maRay]) trackUsage[s.maRay].push(w);
    });
    Object.values(trackUsage).forEach(windows => {
        windows.sort((a, b) => a.start - b.start);
        for (let i = 1; i < windows.length; i++) {
            if (windows[i].start - windows[i - 1].end > 60) score -= 2;
        }
    });
    return Math.max(0, score);
}

export function generateOptimizationReport(result, tracks, rules = []) {
    const score = calculateOptimizationScore(result.success, tracks, rules);
    return {
        score,
        summary: {
            total:       result.stats.total,
            assigned:    result.stats.assigned,
            failed:      result.stats.failed,
            adjusted:    result.stats.adjusted,
            successRate: result.stats.total > 0 ? ((result.stats.assigned / result.stats.total) * 100).toFixed(1) : '0'
        },
        warnings: result.warnings,
        failures: result.failed
    };
}
