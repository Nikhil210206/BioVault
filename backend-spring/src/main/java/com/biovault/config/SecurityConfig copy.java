
package com.biovault.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Configuration class for Spring Security related beans.
 */
@Configuration
public class SecurityConfig {

    /**
     * Provides a PasswordEncoder bean to the Spring application context.
     * This allows us to securely hash and verify passwords using the BCrypt algorithm,
     * which is the industry standard.
     *
     * @return A PasswordEncoder instance that can be injected into other services.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
 SecurityConfig {
    
}
