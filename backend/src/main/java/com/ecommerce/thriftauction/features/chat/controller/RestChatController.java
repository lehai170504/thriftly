package com.ecommerce.thriftauction.features.chat.controller;

import com.ecommerce.thriftauction.features.chat.dto.ChatMessageDto;
import com.ecommerce.thriftauction.features.chat.dto.ConversationResponse;
import com.ecommerce.thriftauction.features.chat.entity.ChatMessage;
import com.ecommerce.thriftauction.features.auth.entity.User;
import com.ecommerce.thriftauction.features.chat.repository.ChatMessageRepository;
import com.ecommerce.thriftauction.features.auth.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
@Tag(name = "Chat", description = "Quản lý tin nhắn và hội thoại trao đổi giữa người mua và người bán")
public class RestChatController {

        private final ChatMessageRepository chatMessageRepository;
        private final UserRepository userRepository;
        private final SimpMessagingTemplate messagingTemplate;

        @Operation(summary = "Lấy lịch sử tin nhắn", description = "Lấy toàn bộ lịch sử tin nhắn trò chuyện giữa người dùng hiện tại và một người dùng khác.")
        @SecurityRequirement(name = "Bearer Authentication")
        @GetMapping("/history/{username}")
        public ResponseEntity<List<ChatMessageDto>> getChatHistory(@PathVariable String username,
                        Authentication authentication) {
                String currentUsername = authentication.getName();
                User currentUser = userRepository.findByEmail(currentUsername)
                                .or(() -> userRepository.findByUsername(currentUsername))
                                .orElseThrow(() -> new RuntimeException("Current user not found"));
                User otherUser = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                List<ChatMessage> messages = chatMessageRepository.findChatHistory(currentUser.getId(),
                                otherUser.getId());

                List<ChatMessageDto> dtos = messages.stream().map(msg -> {
                        ChatMessageDto dto = new ChatMessageDto();
                        dto.setSenderUsername(msg.getSender().getUsername());
                        dto.setReceiverUsername(msg.getReceiver().getUsername());
                        dto.setContent(msg.getContent());
                        dto.setImageUrl(msg.getImageUrl());
                        dto.setTimestamp(msg.getTimestamp());
                        dto.setRead(msg.isRead());
                        return dto;
                }).collect(Collectors.toList());

                return ResponseEntity.ok(dtos);
        }

        @Operation(summary = "Danh sách cuộc trò chuyện", description = "Lấy danh sách các cuộc hội thoại gần đây kèm tin nhắn mới nhất và số lượng chưa đọc.")
        @SecurityRequirement(name = "Bearer Authentication")
        @GetMapping("/conversations")
        public ResponseEntity<List<ConversationResponse>> getConversations(
                        Authentication authentication) {
                String currentUsername = authentication.getName();
                User currentUser = userRepository.findByEmail(currentUsername)
                                .or(() -> userRepository.findByUsername(currentUsername))
                                .orElseThrow(() -> new RuntimeException("Current user not found"));

                List<User> users = chatMessageRepository.findConversations(currentUser.getId());
                List<ConversationResponse> dtos = users.stream()
                                .map(u -> {
                                        List<ChatMessage> lastMsgs = chatMessageRepository.findLastMessages(
                                                        currentUser.getId(),
                                                        u.getId(),
                                                        PageRequest.of(0, 1));
                                        ChatMessage lastMsg = lastMsgs.isEmpty() ? null : lastMsgs.get(0);
                                        long unreadCount = chatMessageRepository
                                                        .countUnreadMessages(currentUser.getId(), u.getId());

                                        return ConversationResponse
                                                        .builder()
                                                        .id(u.getId())
                                                        .username(u.getUsername())
                                                        .fullName(u.getFullName())
                                                        .avatar(u.getAvatar())
                                                        .lastMessage(lastMsg != null ? lastMsg.getContent() : null)
                                                        .lastMessageTime(
                                                                        lastMsg != null ? lastMsg.getTimestamp() : null)
                                                        .unreadCount(unreadCount)
                                                        .lastActiveAt(u.getLastActiveAt())
                                                        .build();
                                }).sorted((a, b) -> {
                                        if (a.getLastMessageTime() == null)
                                                return 1;
                                        if (b.getLastMessageTime() == null)
                                                return -1;
                                        return b.getLastMessageTime().compareTo(a.getLastMessageTime());
                                }).collect(Collectors.toList());

                return ResponseEntity.ok(dtos);
        }

        @Operation(summary = "Đánh dấu tin nhắn đã đọc", description = "Đánh dấu tất cả tin nhắn từ người dùng được chỉ định là đã đọc và gửi biên nhận qua WebSocket.")
        @SecurityRequirement(name = "Bearer Authentication")
        @PutMapping("/read/{username}")
        public ResponseEntity<Void> markAsRead(@PathVariable String username, Authentication authentication) {
                String currentUsername = authentication.getName();
                User currentUser = userRepository.findByEmail(currentUsername)
                                .or(() -> userRepository.findByUsername(currentUsername))
                                .orElseThrow(() -> new RuntimeException("Current user not found"));
                User otherUser = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                chatMessageRepository.markMessagesAsRead(currentUser.getId(), otherUser.getId());

                messagingTemplate.convertAndSendToUser(
                                otherUser.getEmail(),
                                "/queue/messages",
                                "{\"type\": \"READ_RECEIPT\", \"reader\": \"" + currentUser.getUsername() + "\"}");

                return ResponseEntity.ok().build();
        }

        @Operation(summary = "Xóa cuộc trò chuyện", description = "Xóa toàn bộ lịch sử tin nhắn của cuộc trò chuyện với người dùng được chỉ định.")
        @SecurityRequirement(name = "Bearer Authentication")
        @DeleteMapping("/conversations/{username}")
        public ResponseEntity<Void> deleteConversation(@PathVariable String username, Authentication authentication) {
                String currentUsername = authentication.getName();
                User currentUser = userRepository.findByEmail(currentUsername)
                                .or(() -> userRepository.findByUsername(currentUsername))
                                .orElseThrow(() -> new RuntimeException("Current user not found"));
                User otherUser = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                chatMessageRepository.deleteForSender(currentUser.getId(), otherUser.getId());
                chatMessageRepository.deleteForReceiver(currentUser.getId(), otherUser.getId());

                return ResponseEntity.ok().build();
        }
}
