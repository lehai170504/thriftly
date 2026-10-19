package com.ecommerce.thriftauction.features.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Set;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String id;
    private String username;
    private String email;
    private String role;
    private String fullName;
    private String avatar;
    private String phone;
    private String address;
    private Set<String> interests;
    private BigDecimal totalPoints;
    private String tier;
    private boolean requires2FA;
    private boolean hasPassword;
}
