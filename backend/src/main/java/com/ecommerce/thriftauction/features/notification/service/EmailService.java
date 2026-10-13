package com.ecommerce.thriftauction.features.notification.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Async;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async
    public void sendOtpEmail(String to, String otp) {
        log.info("Sending OTP email to {}", maskEmail(to));
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Mã xác nhận quên mật khẩu - Thriftly");
            message.setText("Xin chào,\n\nMã xác nhận (OTP) để khôi phục mật khẩu của bạn là: " + otp
                    + "\n\nMã này sẽ hết hạn trong 15 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.\n\nTrân trọng,\nĐội ngũ Thriftly.");

            mailSender.send(message);
            log.info("OTP email sent successfully to {}", maskEmail(to));
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}. Check the SMTP configuration.", maskEmail(to), e);
        }
    }

    private String maskEmail(String email) {
        if (email == null || email.isBlank()) {
            return "<unknown>";
        }
        int separator = email.indexOf('@');
        if (separator <= 1) {
            return "***" + (separator >= 0 ? email.substring(separator) : "");
        }
        return email.charAt(0) + "***" + email.substring(separator);
    }
}
