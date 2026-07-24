package com.ecommerce.thriftauction.features.chat.entity;

import com.ecommerce.thriftauction.features.auth.entity.User;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "image_url")
    private String imageUrl;

    private LocalDateTime timestamp;

    @Builder.Default
    @Column(name = "is_read", columnDefinition = "boolean default false")
    private boolean isRead = false;

    @Builder.Default
    @Column(columnDefinition = "boolean default false")
    private boolean deletedBySender = false;

    @Builder.Default
    @Column(columnDefinition = "boolean default false")
    private boolean deletedByReceiver = false;

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }
}
