package com.ecommerce.thriftauction.features.notification.dto;

import com.ecommerce.thriftauction.features.notification.entity.NotificationType;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {
    private String id;
    private String title;
    private String message;
    private NotificationType type;
    private String relatedEntityId;
    @JsonProperty("isRead")
    private boolean isRead;
    private LocalDateTime createdAt;
}
