package com.ecommerce.thriftauction.features.notification.service;

import com.ecommerce.thriftauction.features.notification.dto.NotificationResponse;
import com.ecommerce.thriftauction.features.notification.entity.Notification;
import com.ecommerce.thriftauction.features.notification.entity.NotificationType;
import com.ecommerce.thriftauction.features.auth.entity.User;
import com.ecommerce.thriftauction.features.notification.repository.NotificationRepository;
import com.ecommerce.thriftauction.features.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

        private final NotificationRepository notificationRepository;
        private final UserRepository userRepository;
        private final SimpMessagingTemplate messagingTemplate;

        @Transactional
        public void createAndSendNotification(User user, String title, String message, NotificationType type,
                        String relatedEntityId) {
                Notification notification = Notification.builder()
                                .user(user)
                                .title(title)
                                .message(message)
                                .type(type)
                                .relatedEntityId(relatedEntityId)
                                .isRead(false)
                                .build();

                Notification saved = notificationRepository.save(notification);

                NotificationResponse response = mapToResponse(saved);
                String targetPrincipal = user.getEmail() != null ? user.getEmail() : user.getUsername();
                if (TransactionSynchronizationManager.isActualTransactionActive()) {
                        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                                @Override
                                public void afterCommit() {
                                        messagingTemplate.convertAndSendToUser(
                                                        targetPrincipal,
                                                        "/queue/notifications",
                                                        response);
                                }
                        });
                } else {
                        messagingTemplate.convertAndSendToUser(
                                        targetPrincipal,
                                        "/queue/notifications",
                                        response);
                }
        }

        public List<NotificationResponse> getMyNotifications(String username) {
                User user = userRepository.findByEmail(username)
                                .or(() -> userRepository.findByUsername(username))
                                .orElseThrow(() -> new RuntimeException("User not found"));

                return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                                .stream().map(this::mapToResponse).collect(Collectors.toList());
        }

        public long getUnreadCount(String username) {
                User user = userRepository.findByEmail(username)
                                .or(() -> userRepository.findByUsername(username))
                                .orElseThrow(() -> new RuntimeException("User not found"));
                return notificationRepository.countByUserIdAndIsReadFalse(user.getId());
        }

        @Transactional
        public void markAsRead(String notificationId, String username) {
                Notification notification = notificationRepository.findById(notificationId)
                                .orElseThrow(() -> new RuntimeException("Notification not found"));

                User user = userRepository.findByEmail(username)
                                .or(() -> userRepository.findByUsername(username))
                                .orElseThrow(() -> new RuntimeException("User not found"));

                if (!notification.getUser().getId().equals(user.getId())) {
                        throw new AccessDeniedException("Not your notification");
                }

                notification.setRead(true);
                notificationRepository.save(notification);
        }

        @Transactional
        public void markAllAsRead(String username) {
                User user = userRepository.findByEmail(username)
                                .or(() -> userRepository.findByUsername(username))
                                .orElseThrow(() -> new RuntimeException("User not found"));

                List<Notification> unread = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                                .stream().filter(n -> !n.isRead()).collect(Collectors.toList());

                unread.forEach(n -> n.setRead(true));
                notificationRepository.saveAll(unread);
        }

        @Transactional
        public void deleteNotification(String notificationId, String username) {
                Notification notification = notificationRepository.findById(notificationId)
                                .orElseThrow(() -> new RuntimeException("Notification not found"));

                User user = userRepository.findByEmail(username)
                                .or(() -> userRepository.findByUsername(username))
                                .orElseThrow(() -> new RuntimeException("User not found"));

                if (!notification.getUser().getId().equals(user.getId())) {
                        throw new AccessDeniedException("Not your notification");
                }

                notificationRepository.delete(notification);
        }

        @Transactional
        public void deleteAllNotifications(String username) {
                User user = userRepository.findByEmail(username)
                                .or(() -> userRepository.findByUsername(username))
                                .orElseThrow(() -> new RuntimeException("User not found"));

                notificationRepository.deleteByUserId(user.getId());
        }

        private NotificationResponse mapToResponse(Notification n) {
                return NotificationResponse.builder()
                                .id(n.getId())
                                .title(n.getTitle())
                                .message(n.getMessage())
                                .type(n.getType())
                                .relatedEntityId(n.getRelatedEntityId())
                                .isRead(n.isRead())
                                .createdAt(n.getCreatedAt())
                                .build();
        }
}
