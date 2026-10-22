package com.ecommerce.thriftauction.features.notification.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class EmailServiceTests {

    @Mock
    private JavaMailSender mailSender;

    @Test
    void sendsOtpThroughConfiguredSmtpSender() {
        EmailService emailService = new EmailService(mailSender, "mailer@gmail.com");

        emailService.sendOtpEmail("admin@example.com", "123456");

        ArgumentCaptor<SimpleMailMessage> message = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(message.capture());
        assertThat(message.getValue().getFrom()).isEqualTo("mailer@gmail.com");
        assertThat(message.getValue().getTo()).containsExactly("admin@example.com");
        assertThat(message.getValue().getSubject()).isEqualTo("Mã xác nhận Thriftly");
        assertThat(message.getValue().getText()).contains("123456", "15 phút");
    }

    @Test
    void logsSmtpFailureWithoutThrowingToAsyncCaller() {
        EmailService emailService = new EmailService(mailSender, "mailer@gmail.com");
        doThrow(new MailSendException("SMTP connection failed"))
                .when(mailSender).send(any(SimpleMailMessage.class));

        emailService.sendOtpEmail("admin@example.com", "123456");

        verify(mailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void doesNotAttemptSendingWithoutConfiguredSenderAddress() {
        EmailService emailService = new EmailService(mailSender, "");

        emailService.sendOtpEmail("admin@example.com", "123456");

        verify(mailSender, never()).send(any(SimpleMailMessage.class));
    }
}
