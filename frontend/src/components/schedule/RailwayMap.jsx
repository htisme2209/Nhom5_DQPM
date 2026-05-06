import React, { useMemo } from 'react';

// Dữ liệu bộ ghi mặc định (dựa trên data.sql) để vẽ sơ đồ
const DEFAULT_SWITCHES = [
    { id: 'BG-01-02', r1: 1, r2: 2, km: 790.8 },
    { id: 'BG-01-05', r1: 1, r2: 5, km: 790.9 },
    { id: 'BG-02-04', r1: 2, r2: 4, km: 791.1 },
    { id: 'BG-04-05', r1: 4, r2: 5, km: 791.2 },
];

export default function RailwayMap({ 
    duongRay = [], 
    lichTrinh = [], 
    selectedLichTrinh = null,
    suCoActive = null
}) {
    // Kích thước SVG
    const width = 800;
    const height = 300;
    
    // Mapping km sang X coordinate (Giả sử map từ 790.0 đến 792.0 km)
    const kmMin = 790.0;
    const kmMax = 792.0;
    const mapX = (km) => ((km - kmMin) / (kmMax - kmMin)) * width;
    
    // Mapping ray sang Y coordinate (5 đường ray)
    const mapY = (soRay) => 40 + (soRay - 1) * 50;

    // Các điểm mốc quan trọng
    const gaX = mapX(791.0); // Tâm Ga Đà Nẵng

    // Sắp xếp ray để vẽ từ 1 đến 5
    const tracks = useMemo(() => {
        let sorted = [...duongRay].sort((a, b) => a.soRay - b.soRay);
        if (sorted.length === 0) {
            // Mock data if empty
            sorted = [1, 2, 3, 4, 5].map(i => ({ maRay: `RAY-0${i}`, soRay: i, trangThai: 'SAN_SANG' }));
        }
        return sorted;
    }, [duongRay]);

    return (
        <div style={{ 
            background: '#111827', // Dark mode background cho bản đồ nhìn xịn xò
            borderRadius: '12px', 
            padding: '20px', 
            overflowX: 'auto',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
            <h3 style={{ color: '#E5E7EB', margin: '0 0 16px 0', fontSize: '15px', fontWeight: 600 }}>
                🗺️ Sơ Đồ Đường Ray & Điểm Ghi - Ga Đà Nẵng
            </h3>
            
            <svg width={width} height={height} style={{ minWidth: '800px' }}>
                {/* 1. Vẽ Vùng Ga Đà Nẵng (Nhà Ga) */}
                <rect 
                    x={mapX(790.95)} y={20} 
                    width={mapX(791.05) - mapX(790.95)} height={height - 40} 
                    fill="#374151" rx="8" opacity="0.5"
                />
                <text x={gaX} y={25} fill="#9CA3AF" fontSize="12" textAnchor="middle" fontWeight="bold">
                    KHU VỰC GA ĐÀ NẴNG (Km 791)
                </text>

                {/* 2. Vẽ các đường ray */}
                {tracks.map(ray => {
                    const y = mapY(ray.soRay);
                    const isBlocked = ray.trangThai === 'PHONG_TOA_CUNG' || ray.trangThai === 'PHONG_TOA_TAM' || suCoActive?.maRay === ray.maRay;
                    
                    return (
                        <g key={ray.maRay}>
                            {/* Đường ray chính */}
                            <line 
                                x1={0} y1={y} x2={width} y2={y} 
                                stroke={isBlocked ? '#EF4444' : '#4B5563'} 
                                strokeWidth={isBlocked ? "4" : "2"} 
                                strokeDasharray={isBlocked ? "8 4" : "none"}
                            />
                            {/* Nhãn đường ray */}
                            <text x={10} y={y - 8} fill={isBlocked ? '#FCA5A5' : '#9CA3AF'} fontSize="11" fontWeight="bold">
                                Ray {ray.soRay} {isBlocked && '(PHONG TỎA)'}
                            </text>
                        </g>
                    );
                })}

                {/* 3. Vẽ các bộ ghi (Switch Points) */}
                {DEFAULT_SWITCHES.map(sw => {
                    const x = mapX(sw.km);
                    const y1 = mapY(sw.r1);
                    const y2 = mapY(sw.r2);
                    
                    return (
                        <g key={sw.id}>
                            <line 
                                x1={x - 15} y1={y1} x2={x + 15} y2={y2} 
                                stroke="#10B981" strokeWidth="3" opacity="0.8"
                            />
                            <circle cx={x - 15} cy={y1} r="4" fill="#10B981" />
                            <circle cx={x + 15} cy={y2} r="4" fill="#10B981" />
                            <text x={x} y={y1 < y2 ? y1 - 10 : y2 - 10} fill="#6EE7B7" fontSize="10" textAnchor="middle">
                                {sw.id}
                            </text>
                        </g>
                    );
                })}

                {/* 4. Vẽ Tàu (Lịch trình) */}
                {lichTrinh.map((lt, idx) => {
                    // Giả lập vị trí: Nếu đã đến ga -> 791.0, nếu sắp đến -> 790.5
                    const isTrongGa = !!lt.gioDenThucTe || (!lt.gioDenDuKien && !!lt.gioDiDuKien);
                    const km = isTrongGa ? 791.0 + (idx * 0.01) : 790.5 + (idx * 0.02);
                    
                    const ray = tracks.find(r => r.maRay === lt.maRay) || tracks[0];
                    const x = mapX(km);
                    const y = mapY(ray?.soRay || 1);
                    
                    const isSelected = selectedLichTrinh?.maLichTrinh === lt.maLichTrinh;

                    return (
                        <g key={lt.maLichTrinh} style={{ cursor: 'pointer', transition: 'all 0.3s' }}>
                            <rect 
                                x={x - 30} y={y - 12} 
                                width="60" height="24" rx="4"
                                fill={isSelected ? '#3B82F6' : '#F59E0B'} 
                                stroke={isSelected ? '#DBEAFE' : '#FEF3C7'}
                                strokeWidth={isSelected ? "2" : "1"}
                            />
                            <text x={x} y={y + 4} fill="#111827" fontSize="10" fontWeight="bold" textAnchor="middle">
                                {lt.maChuyenTau}
                            </text>
                            
                            {/* Hiển thị tooltip logic */}
                            {isSelected && (
                                <>
                                    <line x1={x} y1={y - 12} x2={x} y2={y - 30} stroke="#9CA3AF" strokeDasharray="2 2" />
                                    <rect x={x - 60} y={y - 55} width="120" height="25" fill="#1F2937" rx="4" stroke="#4B5563" />
                                    <text x={x} y={y - 38} fill="#E5E7EB" fontSize="10" textAnchor="middle">
                                        {isTrongGa ? '🔒 Đã vào ga (Không thể đổi)' : '🟢 Đang đến (Có thể đổi ray)'}
                                    </text>
                                </>
                            )}
                        </g>
                    );
                })}
            </svg>
            
            {/* Chú thích */}
            <div style={{ display: 'flex', gap: '20px', marginTop: '16px', fontSize: '12px', color: '#9CA3AF' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '20px', height: '4px', background: '#4B5563' }} /> Ray Sẵn Sàng
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '20px', height: '4px', background: '#EF4444', borderBottom: '2px dashed #B91C1C' }} /> Ray Phong Tỏa
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '20px', height: '4px', background: '#10B981', transform: 'rotate(-20deg)' }} /> Bộ Ghi (Switch)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '16px', height: '12px', background: '#F59E0B', borderRadius: '2px' }} /> Tàu
                </div>
            </div>
        </div>
    );
}
