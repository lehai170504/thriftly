package com.ecommerce.thriftauction.features.chat.controller;

import com.ecommerce.thriftauction.features.chat.dto.ChatMessageDto;
import com.ecommerce.thriftauction.features.chat.entity.ChatMessage;
import com.ecommerce.thriftauction.features.auth.entity.User;
import com.ecommerce.thriftauction.features.chat.repository.ChatMessageRepository;
import com.ecommerce.thriftauction.features.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
@io.swagger.v3.oas.annotations.tags.Tag(name = "RestChat")
public class RestChatController {

        private final ChatMessageRepository chatMessageRepository;
        private final UserRepository userRepository;
        private final SimpMessagingTemplate messagingTemplate;

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

        @GetMapping("/conversations")
        public ResponseEntity<List<com.ecommerce.thriftauction.features.chat.dto.ConversationResponse>> getConversations(
                        Authentication authentication) {
                String currentUsername = authentication.getName();
                User currentUser = userRepository.findByEmail(currentUsername)
                                .or(() -> userRepository.findByUsername(currentUsername))
                                .orElseThrow(() -> new RuntimeException("Current user not found"));

                List<User> users = chatMessageRepository.findConversations(currentUser.getId());
                List<com.ecommerce.thriftauction.features.chat.dto.ConversationResponse> dtos = users.stream()
                                .map(u -> {
                                        List<ChatMessage> lastMsgs = chatMessageRepository.findLastMessages(
                                                        currentUser.getId(),
                                                        u.getId(),
                                                        org.springframework.data.domain.PageRequest.of(0, 1));
                                        ChatMessage lastMsg = lastMsgs.isEmpty() ? null : lastMsgs.get(0);
                                        long unreadCount = chatMessageRepository
                                                        .countUnreadMessages(currentUser.getId(), u.getId());

                                        return com.ecommerce.thriftauction.features.chat.dto.ConversationResponse
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
