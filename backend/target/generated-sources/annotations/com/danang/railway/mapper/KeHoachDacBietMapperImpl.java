package com.danang.railway.mapper;

import com.danang.railway.dto.request.KeHoachDacBietRequest;
import com.danang.railway.dto.response.KeHoachDacBietResponse;
import com.danang.railway.entity.KeHoachDacBiet;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-12T17:00:18+0700",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.0.v20260407-0427, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class KeHoachDacBietMapperImpl implements KeHoachDacBietMapper {

    @Override
    public KeHoachDacBiet toKeHoachDacBiet(KeHoachDacBietRequest request) {
        if ( request == null ) {
            return null;
        }

        KeHoachDacBiet.KeHoachDacBietBuilder keHoachDacBiet = KeHoachDacBiet.builder();

        keHoachDacBiet.maLichTrinh( request.getMaLichTrinh() );
        keHoachDacBiet.mucDoUuTien( request.getMucDoUuTien() );
        keHoachDacBiet.noiDung( request.getNoiDung() );
        keHoachDacBiet.tieuDe( request.getTieuDe() );

        return keHoachDacBiet.build();
    }

    @Override
    public KeHoachDacBietResponse toKeHoachDacBietResponse(KeHoachDacBiet keHoachDacBiet) {
        if ( keHoachDacBiet == null ) {
            return null;
        }

        KeHoachDacBietResponse keHoachDacBietResponse = new KeHoachDacBietResponse();

        keHoachDacBietResponse.setMaKeHoach( keHoachDacBiet.getMaKeHoach() );
        keHoachDacBietResponse.setMaLichTrinh( keHoachDacBiet.getMaLichTrinh() );
        keHoachDacBietResponse.setMucDoUuTien( keHoachDacBiet.getMucDoUuTien() );
        keHoachDacBietResponse.setNgayDuyet( keHoachDacBiet.getNgayDuyet() );
        keHoachDacBietResponse.setNgayGui( keHoachDacBiet.getNgayGui() );
        keHoachDacBietResponse.setNoiDung( keHoachDacBiet.getNoiDung() );
        keHoachDacBietResponse.setTieuDe( keHoachDacBiet.getTieuDe() );
        keHoachDacBietResponse.setTrangThai( keHoachDacBiet.getTrangThai() );
        keHoachDacBietResponse.setYKienDuyet( keHoachDacBiet.getYKienDuyet() );

        return keHoachDacBietResponse;
    }
}
