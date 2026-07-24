package com.ecommerce.thriftauction.features.social.controller;

import com.ecommerce.thriftauction.features.auth.entity.User;
import com.ecommerce.thriftauction.features.auth.repository.UserRepository;
import com.ecommerce.thriftauction.features.social.entity.BlockedUser;
import com.ecommerce.thriftauction.features.social.repository.BlockedUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/users/block")
@RequiredArgsConstructor
@io.swagger.v3.oas.annotations.tags.Tag(name = "Block User")
public class BlockController {

        private final BlockedUserRepository blockedUserRepository;
        private final UserRepository userRepository;

        @PostMapping("/{username}")
        public ResponseEntity<Void> blockUser(@PathVariable String username, Authentication authentication) {
                String currentUsername = authentication.getName();
                User blocker = userRepository.findByEmail(currentUsername)
                                .or(() -> userRepository.findByUsername(currentUsername))
                                .orElseThrow(() -> new RuntimeException("Current user not found"));
                User blocked = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("Target user not found"));

                if (!blockedUserRepository.existsByBlockerIdAndBlockedId(blocker.getId(), blocked.getId())) {
                        BlockedUser blockedUser = BlockedUser.builder()
                                        .blocker(blocker)
                                        .blocked(blocked)
                                        .build();
                        blockedUserRepository.save(blockedUser);
                }

                return ResponseEntity.ok().build();
        }

        @DeleteMapping("/{username}")
        public ResponseEntity<Void> unblockUser(@PathVariable String username, Authentication authentication) {
                String currentUsername = authentication.getName();
                User blocker = userRepository.findByEmail(currentUsername)
                                .or(() -> userRepository.findByUsername(currentUsername))
                                .orElseThrow(() -> new RuntimeException("Current user not found"));
                User blocked = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("Target user not found"));

                blockedUserRepository.findByBlockerIdAndBlockedId(blocker.getId(), blocked.getId())
                                .ifPresent(blockedUserRepository::delete);

                return ResponseEntity.ok().build();
        }

        @GetMapping("/status/{username}")
        public ResponseEntity<Map<String, String>> getBlockStatus(@PathVariable String username,
                        Authentication authentication) {
                String currentUsername = authentication.getName();
                User currentUser = userRepository.findByEmail(currentUsername)
                                .or(() -> userRepository.findByUsername(currentUsername))
                                .orElseThrow(() -> new RuntimeException("Current user not found"));
                User targetUser = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("Target user not found"));

                boolean isBlockedByMe = blockedUserRepository.existsByBlockerIdAndBlockedId(currentUser.getId(),
                                targetUser.getId());
                boolean hasBlockedMe = blockedUserRepository.existsByBlockerIdAndBlockedId(targetUser.getId(),
                                currentUser.getId());

                String status = "NONE";
                if (isBlockedByMe)
                        status = "IS_BLOCKED_BY_ME";
                else if (hasBlockedMe)
                        status = "HAS_BLOCKED_ME";

                return ResponseEntity.ok(Map.of("status", status));
        }
}
