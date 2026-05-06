package com.danang.railway.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;

/**
 * AOP Configuration
 * Kích hoạt AspectJ auto-proxy để support @Aspect annotation
 */
@Configuration
@EnableAspectJAutoProxy
public class AopConfig {
    // Configuration for AOP aspects
}
