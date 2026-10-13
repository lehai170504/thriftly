package com.ecommerce.thriftauction.features.chat.repository;

import com.ecommerce.thriftauction.features.auth.entity.User;
import com.ecommerce.thriftauction.features.chat.entity.ChatMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, String> {
        @Query("SELECT m FROM ChatMessage m WHERE " +
                        "(m.sender.id = :currentUser AND m.receiver.id = :otherUser AND m.deletedBySender = false) " +
                        "OR " +
                        "(m.sender.id = :otherUser AND m.receiver.id = :currentUser AND m.deletedByReceiver = false) " +
                        "ORDER BY m.timestamp ASC")
        List<ChatMessage> findChatHistory(String currentUser, String otherUser);

        @Query("SELECT u FROM User u WHERE " +
                        "u.id IN (SELECT m.receiver.id FROM ChatMessage m WHERE m.sender.id = :userId AND m.deletedBySender = false) "
                        +
                        "OR " +
                        "u.id IN (SELECT m.sender.id FROM ChatMessage m WHERE m.receiver.id = :userId AND m.deletedByReceiver = false)")
        List<User> findConversations(String userId);

        @Query("SELECT m FROM ChatMessage m WHERE " +
                        "(m.sender.id = :currentUser AND m.receiver.id = :otherUser AND m.deletedBySender = false) " +
                        "OR " +
                        "(m.sender.id = :otherUser AND m.receiver.id = :currentUser AND m.deletedByReceiver = false) " +
                        "ORDER BY m.timestamp DESC")
        List<ChatMessage> findLastMessages(String currentUser, String otherUser,
                        Pageable pageable);

        @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.sender.id = :otherUserId AND m.receiver.id = :currentUserId AND m.isRead = false AND m.deletedByReceiver = false")
        long countUnreadMessages(String currentUserId, String otherUserId);

        @Modifying
        @Transactional
        @Query("UPDATE ChatMessage m SET m.isRead = true WHERE m.sender.id = :otherUserId AND m.receiver.id = :currentUserId AND m.isRead = false AND m.deletedByReceiver = false")
        void markMessagesAsRead(String currentUserId, String otherUserId);

        @Modifying
        @Transactional
        @Query("UPDATE ChatMessage m SET m.deletedBySender = true WHERE m.sender.id = :currentUser AND m.receiver.id = :otherUser")
        void deleteForSender(String currentUser, String otherUser);

        @Modifying
        @Transactional
        @Query("UPDATE ChatMessage m SET m.deletedByReceiver = true WHERE m.receiver.id = :currentUser AND m.sender.id = :otherUser")
        void deleteForReceiver(String currentUser, String otherUser);
}
