package com.ecommerce.thriftauction.features.payment.controller;

import com.ecommerce.thriftauction.core.config.properties.PayosProperties;
import com.ecommerce.thriftauction.features.payment.dto.DepositRequest;
import com.ecommerce.thriftauction.features.payment.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.v2.paymentRequests.PaymentLinkItem;
import vn.payos.model.v2.paymentRequests.PaymentLink;
import vn.payos.model.v2.paymentRequests.PaymentLinkStatus;

import java.util.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/v1/payment/payos")
@RequiredArgsConstructor
@Tag(name = "Payment (PayOS)", description = "Tích hợp cổng thanh toán PayOS để nạp tiền vào ví điện tử")
public class PaymentController {

    private final PayOS payOS;
    private final PayosProperties payosProperties;
    private final WalletService walletService;

    @Operation(summary = "Tạo URL Thanh toán PayOS", description = "Tạo đường link PayOS để người dùng tiến hành nạp tiền.")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/create-payment")
    public ResponseEntity<Map<String, String>> createPayment(@RequestBody DepositRequest request,
            Authentication authentication) {
        try {
            String username = authentication.getName();

            // Tên item (có thể dài hơn 9 ký tự)
            String itemName = "Nạp tiền Thriftly: " + username;
            PaymentLinkItem item = PaymentLinkItem.builder().name(itemName).quantity(1)
                    .price(request.getAmount().longValue()).build();
            List<PaymentLinkItem> itemList = new ArrayList<>();
            itemList.add(item);

            // Tạo mã đơn hàng độc nhất (Order Code)
            // System.currentTimeMillis() có thể trùng nếu có 2 request cùng lúc, nên nối
            // thêm số ngẫu nhiên
            long orderCode = Long
                    .parseLong(String.valueOf(System.currentTimeMillis() / 1000) + (int) (Math.random() * 100));

            // Description cho PayOS có giới hạn độ dài (thường là <= 25 ký tự, hoặc khắt
            // khe hơn là <= 9 ký tự)
            String payosDescription = "THRIFTLY";

            CreatePaymentLinkRequest paymentData = CreatePaymentLinkRequest.builder()
                    .orderCode(orderCode)
                    .amount(request.getAmount().longValue())
                    .description(payosDescription)
                    .returnUrl(payosProperties.getReturnUrl() + "?orderCode=" + orderCode)
                    .cancelUrl(payosProperties.getCancelUrl())
                    .items(itemList)
                    .build();

            CreatePaymentLinkResponse data = payOS.paymentRequests().create(paymentData);

            Map<String, String> result = new HashMap<>();
            result.put("paymentUrl", data.getCheckoutUrl());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(summary = "Xác minh thanh toán", description = "URL để PayOS trả kết quả về (Return URL).")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyPayment(@RequestParam Map<String, String> params,
            Authentication authentication) {
        Map<String, Object> result = new HashMap<>();
        try {
            String code = params.get("code");
            String orderCodeStr = params.get("orderCode");
            String status = params.get("status");
            String cancel = params.get("cancel");

            if ("true".equals(cancel)) {
                result.put("success", false);
                result.put("message", "Đã hủy thanh toán");
                return ResponseEntity.badRequest().body(result);
            }

            if ("00".equals(code) || "PAID".equals(status)) {
                PaymentLink paymentLinkInfo = payOS.paymentRequests().get(Long.parseLong(orderCodeStr));
                if (PaymentLinkStatus.PAID.equals(paymentLinkInfo.getStatus())) {
                    String username = authentication.getName();
                    long amount = paymentLinkInfo.getAmountPaid();

                    DepositRequest depositRequest = new DepositRequest();
                    depositRequest.setAmount(java.math.BigDecimal.valueOf(amount));
                    depositRequest.setReferenceId(orderCodeStr);
                    depositRequest.setDescription("Nạp tiền (PayOS - " + orderCodeStr + ")");

                    walletService.deposit(username, depositRequest);

                    result.put("success", true);
                    result.put("message", "Thanh toán thành công");
                    return ResponseEntity.ok(result);
                }
            }

            result.put("success", false);
            result.put("message", "Thanh toán chưa hoàn tất");
            return ResponseEntity.badRequest().body(result);
        } catch (Exception e) {
            e.printStackTrace();
            result.put("success", false);
            result.put("message", "Lỗi xác minh thanh toán");
            return ResponseEntity.badRequest().body(result);
        }
    }
}
