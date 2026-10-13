package com.ecommerce.thriftauction.core.security;

import com.ecommerce.thriftauction.features.admin.service.AuditLogService;
import com.ecommerce.thriftauction.features.media.validator.MediaUploadValidator;
import com.ecommerce.thriftauction.features.order.controller.WebhookController;
import com.ecommerce.thriftauction.features.order.entity.Order;
import com.ecommerce.thriftauction.features.order.entity.OrderStatus;
import com.ecommerce.thriftauction.features.order.repository.OrderRepository;
import com.ecommerce.thriftauction.features.notification.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.util.ReflectionTestUtils;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthorizationPerimeterTests {

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private MessageChannel messageChannel;

    private StompSecurityChannelInterceptor stompInterceptor;
    private MediaUploadValidator mediaUploadValidator;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private NotificationService notificationService;

    private WebhookController webhookController;

    @BeforeEach
    void setUp() {
        stompInterceptor = new StompSecurityChannelInterceptor(auditLogService);
        mediaUploadValidator = new MediaUploadValidator();
        webhookController = new WebhookController(orderRepository, notificationService, auditLogService);
        ReflectionTestUtils.setField(webhookController, "ghnWebhookSecret", "test-secret-token");
    }

    @Test
    void stompConnectWithoutAuthThrowsAccessDenied() {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.CONNECT);
        Message<?> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        assertThatThrownBy(() -> stompInterceptor.preSend(message, messageChannel))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("WebSocket connection requires an authenticated session");
    }

    @Test
    void stompConnectWithAuthSucceeds() {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.CONNECT);
        Principal principal = () -> "buyer@example.com";
        accessor.setUser(principal);
        Message<?> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        Message<?> result = stompInterceptor.preSend(message, messageChannel);
        assertThat(result).isNotNull();
    }

    @Test
    void stompSubscribeUnauthorizedDestinationThrowsAccessDenied() {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.SUBSCRIBE);
        accessor.setDestination("/topic/admin/secret");
        Principal principal = () -> "buyer@example.com";
        accessor.setUser(principal);
        Message<?> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        assertThatThrownBy(() -> stompInterceptor.preSend(message, messageChannel))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Unauthorized subscription destination");
    }

    @Test
    void stompSubscribeWhitelistedDestinationsSucceeds() {
        Principal principal = () -> "buyer@example.com";

        StompHeaderAccessor accessorTopic = StompHeaderAccessor.create(StompCommand.SUBSCRIBE);
        accessorTopic.setDestination("/topic/auction/123");
        accessorTopic.setUser(principal);
        Message<?> topicMsg = MessageBuilder.createMessage(new byte[0], accessorTopic.getMessageHeaders());
        assertThat(stompInterceptor.preSend(topicMsg, messageChannel)).isNotNull();

        StompHeaderAccessor accessorUser = StompHeaderAccessor.create(StompCommand.SUBSCRIBE);
        accessorUser.setDestination("/user/queue/notifications");
        accessorUser.setUser(principal);
        Message<?> userMsg = MessageBuilder.createMessage(new byte[0], accessorUser.getMessageHeaders());
        assertThat(stompInterceptor.preSend(userMsg, messageChannel)).isNotNull();
    }

    @Test
    void stompSendWithoutAuthThrowsAccessDenied() {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.SEND);
        accessor.setDestination("/app/auction/bid");
        Message<?> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        assertThatThrownBy(() -> stompInterceptor.preSend(message, messageChannel))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("STOMP send requires an authenticated session");
    }

    @Test
    void stompSendUnauthorizedDestinationThrowsAccessDenied() {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.SEND);
        accessor.setDestination("/app/admin/dangerous");
        Principal principal = () -> "buyer@example.com";
        accessor.setUser(principal);
        Message<?> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        assertThatThrownBy(() -> stompInterceptor.preSend(message, messageChannel))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Unauthorized send destination");
    }

    @Test
    void stompSendWhitelistedDestinationSucceeds() {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.SEND);
        accessor.setDestination("/app/auction/bid");
        Principal principal = () -> "buyer@example.com";
        accessor.setUser(principal);
        Message<?> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        Message<?> result = stompInterceptor.preSend(message, messageChannel);
        assertThat(result).isNotNull();
    }

    @Test
    void mediaUploadEmptyFileFails() {
        MockMultipartFile emptyFile = new MockMultipartFile("file", "test.jpg", "image/jpeg", new byte[0]);
        assertThatThrownBy(() -> mediaUploadValidator.validateImage(emptyFile))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("File tải lên không được để trống");
    }

    @Test
    void mediaUploadImageExceedsMaxSizeFails() {
        byte[] largeBytes = new byte[11 * 1024 * 1024];
        largeBytes[0] = (byte) 0xFF;
        largeBytes[1] = (byte) 0xD8;
        largeBytes[2] = (byte) 0xFF;
        MockMultipartFile largeFile = new MockMultipartFile("file", "large.jpg", "image/jpeg", largeBytes);

        assertThatThrownBy(() -> mediaUploadValidator.validateImage(largeFile))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("vượt quá giới hạn");
    }

    @Test
    void mediaUploadFakeMimeTypeFails() {
        byte[] textBytes = "This is a plain text file pretending to be jpg".getBytes();
        MockMultipartFile fakeFile = new MockMultipartFile("file", "fake.jpg", "image/jpeg", textBytes);

        assertThatThrownBy(() -> mediaUploadValidator.validateImage(fakeFile))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("không hợp lệ");
    }

    @Test
    void mediaUploadValidJpegSucceeds() {
        byte[] jpegBytes = new byte[] { (byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0x00, 0x10, 0x4A, 0x46 };
        MockMultipartFile validFile = new MockMultipartFile("file", "valid.jpg", "image/jpeg", jpegBytes);

        mediaUploadValidator.validateImage(validFile);
    }

    @Test
    void mediaUploadValidPngSucceeds() {
        byte[] pngBytes = new byte[] { (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A };
        MockMultipartFile validFile = new MockMultipartFile("file", "valid.png", "image/png", pngBytes);

        mediaUploadValidator.validateImage(validFile);
    }

    @Test
    void webhookGhnWithoutSecretReturnsUnauthorized() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("OrderCode", "GHN12345");
        payload.put("Status", "delivered");

        ResponseEntity<?> response = webhookController.handleGhnWebhook(null, null, null, payload);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void webhookGhnWithInvalidSecretReturnsUnauthorized() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("OrderCode", "GHN12345");
        payload.put("Status", "delivered");

        ResponseEntity<?> response = webhookController.handleGhnWebhook("wrong-secret", null, null, payload);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void webhookGhnWithValidSecretAndNonexistentOrderReturnsNotFound() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("OrderCode", "GHN99999");
        payload.put("Status", "delivered");

        when(orderRepository.findByTrackingCode("GHN99999")).thenReturn(Optional.empty());

        ResponseEntity<?> response = webhookController.handleGhnWebhook("test-secret-token", null, null, payload);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void webhookGhnCannotModifyTerminalCompletedOrder() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("OrderCode", "GHN12345");
        payload.put("Status", "delivered");

        Order order = new Order();
        order.setStatus(OrderStatus.COMPLETED);
        when(orderRepository.findByTrackingCode("GHN12345")).thenReturn(Optional.of(order));

        ResponseEntity<?> response = webhookController.handleGhnWebhook("test-secret-token", null, null, payload);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    void webhookGhnValidTransitionUpdatesStatus() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("OrderCode", "GHN12345");
        payload.put("Status", "delivered");

        Order order = new Order();
        order.setStatus(OrderStatus.SHIPPED);
        when(orderRepository.findByTrackingCode("GHN12345")).thenReturn(Optional.of(order));

        ResponseEntity<?> response = webhookController.handleGhnWebhook("test-secret-token", null, null, payload);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(order.getStatus()).isEqualTo(OrderStatus.DELIVERED);
        verify(orderRepository).save(order);
    }
}
