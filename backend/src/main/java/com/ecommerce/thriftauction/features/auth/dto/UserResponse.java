package com.ecommerce.thriftauction.features.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {
    private String id;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private String address;
    private String avatar;
    private Set<String> interests;
    private String role;
    @JsonProperty("isActive")
    private boolean isActive;
    private BigDecimal totalPoints;
    private String tier;
    private LocalDateTime createdAt;
    @JsonProperty("hasPassword")
    private boolean hasPassword;
}
