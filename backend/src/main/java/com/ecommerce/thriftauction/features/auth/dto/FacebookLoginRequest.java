package com.ecommerce.thriftauction.features.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FacebookLoginRequest {
    @NotBlank(message = "Facebook access token không được để trống")
    private String accessToken;
}
