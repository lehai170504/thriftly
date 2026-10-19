package com.ecommerce.thriftauction.features.payment.service;

import com.ecommerce.thriftauction.core.config.properties.PayosProperties;
import com.ecommerce.thriftauction.features.auth.entity.User;
import com.ecommerce.thriftauction.features.auth.repository.UserRepository;
import com.ecommerce.thriftauction.features.payment.dto.DepositRequest;
import com.ecommerce.thriftauction.features.payment.dto.PaymentIntentStatusResponse;
import com.ecommerce.thriftauction.features.payment.entity.PaymentIntent;
import com.ecommerce.thriftauction.features.payment.entity.PaymentIntentStatus;
import com.ecommerce.thriftauction.features.payment.repository.PaymentIntentRepository;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.v2.paymentRequests.PaymentLinkItem;
import vn.payos.model.webhooks.WebhookData;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PayOS payOS;
    private final PayosProperties payosProperties;
    private final WalletService walletService;
    private final PaymentIntentRepository paymentIntentRepository;
    private final UserRepository userRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public Map<String, String> createPaymentLink(String username, DepositRequest request) {
        User user = userRepository.findByEmail(username)
                .or(() -> userRepository.findByUsername(username))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        long orderCode = Long
                .parseLong(String.valueOf(System.currentTimeMillis() / 1000) + (secureRandom.nextInt(90) + 10));

        PaymentIntent intent = PaymentIntent.builder()
                .user(user)
                .orderCode(orderCode)
                .amount(request.getAmount())
                .currency("VND")
                .status(PaymentIntentStatus.PENDING)
                .build();
        paymentIntentRepository.save(intent);

        String itemName = "Nạp tiền Thriftly: " + username;
        PaymentLinkItem item = PaymentLinkItem.builder()
                .name(itemName)
                .quantity(1)
                .price(request.getAmount().longValue())
                .build();
        List<PaymentLinkItem> itemList = new ArrayList<>();
        itemList.add(item);

        CreatePaymentLinkRequest paymentData = CreatePaymentLinkRequest.builder()
                .orderCode(orderCode)
                .amount(request.getAmount().longValue())
                .description("THRIFTLY")
                .returnUrl(payosProperties.getReturnUrl() + "?orderCode=" + orderCode)
                .cancelUrl(payosProperties.getCancelUrl())
                .items(itemList)
                .build();

        try {
            CreatePaymentLinkResponse data = payOS.paymentRequests().create(paymentData);
            Map<String, String> result = new HashMap<>();
            result.put("paymentUrl", data.getCheckoutUrl());
            return result;
        } catch (Exception e) {
            log.error("Failed to create PayOS payment link", e);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to create PayOS payment link");
        }
    }

    @Transactional(readOnly = true)
    public PaymentIntentStatusResponse getPaymentIntentStatus(Long orderCode, String username) {
        PaymentIntent intent = paymentIntentRepository.findOwnedByOrderCode(orderCode, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment intent not found"));
        return new PaymentIntentStatusResponse(
                intent.getOrderCode(),
                intent.getStatus(),
                intent.getAmount(),
                intent.getCurrency(),
                intent.getUpdatedAt());
    }

    @Transactional
    public void processWebhook(ObjectNode body) throws Exception {
        WebhookData data = payOS.webhooks().verify(body);
        if (data != null) {
            walletService.processPaymentIntentWebhook(data);
        }
    }
}
