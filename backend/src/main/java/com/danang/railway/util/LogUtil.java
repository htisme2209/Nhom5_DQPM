package com.danang.railway.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;

/**
 * Utility class cho việc ghi log
 */
@Slf4j
public class LogUtil {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Convert object to JSON string (safely)
     */
    public static String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            log.warn("Lỗi khi convert object to JSON: {}", e.getMessage());
            return obj != null ? obj.toString() : null;
        }
    }

    /**
     * Lấy giá trị field từ object
     */
    public static String getFieldValue(Object obj, String fieldName) {
        try {
            if (obj == null) return null;
            java.lang.reflect.Field field = obj.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            Object value = field.get(obj);
            return value != null ? value.toString() : null;
        } catch (Exception e) {
            return null;
        }
    }
}
