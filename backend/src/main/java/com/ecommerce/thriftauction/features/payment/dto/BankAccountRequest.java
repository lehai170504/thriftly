package com.ecommerce.thriftauction.features.payment.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class BankAccountRequest {
    @NotBlank(message = "Tên ngân hàng không được để trống")
    private String bankName;

    @NotBlank(message = "Số tài khoản không được để trống")
    private String accountNumber;

    @NotBlank(message = "Tên chủ tài khoản không được để trống")
    private String accountName;
}
