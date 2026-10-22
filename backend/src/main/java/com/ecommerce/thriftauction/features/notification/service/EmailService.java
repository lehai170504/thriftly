package com.ecommerce.thriftauction.features.notification.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final String fromEmail;

    public EmailService(
            JavaMailSender mailSender,
            @Value("${spring.mail.username:}") String fromEmail) {
        this.mailSender = mailSender;
        this.fromEmail = fromEmail;
    }

    @Async
    public void sendOtpEmail(String to, String otp) {
        log.info("Sending OTP email to {}", maskEmail(to));
        if (!StringUtils.hasText(fromEmail)) {
            log.error("Cannot send OTP email: SPRING_MAIL_USERNAME must be configured.");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Mã xác nhận Thriftly");
            message.setText("Xin chào,\n\nMã xác nhận (OTP) của bạn là: " + otp
                    + "\n\nMã này sẽ hết hạn trong 15 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.\n\n"
                    + "Trân trọng,\nĐội ngũ Thriftly.");
            mailSender.send(message);
            log.info("OTP email sent successfully to {}", maskEmail(to));
        } catch (MailException e) {
            log.error("Failed to send OTP email to {} through SMTP.", maskEmail(to), e);
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
