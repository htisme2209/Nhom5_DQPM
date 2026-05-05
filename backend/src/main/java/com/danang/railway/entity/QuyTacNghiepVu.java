package com.danang.railway.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Table(name = "QUY_TAC_NGHIEP_VU")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuyTacNghiepVu {
    @Id
    String maQuyTac;
    
    String tenQuyTac;
    
    String giaTri;
    
    String kieuDuLieu; // VD: NUMBER, TEXT, TIME
    
    String moTa;
    
    String nhomQuyTac; // Phân nhóm hiển thị trên UI
    
    LocalDateTime capNhatLanCuoi;
}
