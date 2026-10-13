package com.ecommerce.thriftauction.features.social.service;

import com.ecommerce.thriftauction.features.auth.dto.UserResponse;
import com.ecommerce.thriftauction.features.notification.service.NotificationService;
import com.ecommerce.thriftauction.features.notification.entity.NotificationType;
import com.ecommerce.thriftauction.features.social.entity.Follow;
import com.ecommerce.thriftauction.features.auth.entity.User;
import com.ecommerce.thriftauction.features.social.repository.FollowRepository;
import com.ecommerce.thriftauction.features.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public Map<String, Object> toggleFollow(String followerUsername, String followingUsername) {
        if (followerUsername.equals(followingUsername)) {
            throw new RuntimeException("Bạn không thể tự theo dõi chính mình.");
        }

        User follower = userRepository.findByEmail(followerUsername)
                .or(() -> userRepository.findByUsername(followerUsername))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người theo dõi"));

        User following = userRepository.findByUsername(followingUsername)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng để theo dõi"));

        Optional<Follow> existingFollow = followRepository.findByFollowerAndFollowing(follower, following);

        Map<String, Object> response = new HashMap<>();
        if (existingFollow.isPresent()) {
            followRepository.delete(existingFollow.get());
            response.put("isFollowing", false);
            response.put("message", "Đã bỏ theo dõi " + followingUsername);
        } else {
            Follow follow = Follow.builder()
                    .follower(follower)
                    .following(following)
                    .build();
            followRepository.save(follow);

            notificationService.createAndSendNotification(
                    following,
                    "Có người theo dõi mới!",
                    follower.getFullName() + " vừa nhấn theo dõi bạn.",
                    NotificationType.SYSTEM,
                    follower.getId());

            response.put("isFollowing", true);
            response.put("message", "Đã theo dõi " + followingUsername);
        }

        response.put("followerCount", followRepository.countByFollowing(following));
        return response;
    }

    @Transactional(readOnly = true)
    public boolean checkFollowStatus(String followerUsername, String followingUsername) {
        if (followerUsername == null || followingUsername == null || followerUsername.equals(followingUsername)) {
            return false;
        }

        User follower = userRepository.findByEmail(followerUsername)
                .or(() -> userRepository.findByUsername(followerUsername))
                .orElse(null);

        User following = userRepository.findByUsername(followingUsername)
                .orElse(null);

        if (follower == null || following == null) {
            return false;
        }

        return followRepository.existsByFollowerAndFollowing(follower, following);
    }

    @Transactional(readOnly = true)
    public long getFollowerCount(String username) {
        User following = userRepository.findByUsername(username)
                .orElse(null);
        if (following == null)
            return 0;
        return followRepository.countByFollowing(following);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getFollowers(String username) {
        User following = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return followRepository.findByFollowing(following).stream()
                .map(f -> {
                    User u = f.getFollower();
                    return UserResponse.builder()
                            .id(u.getId())
                            .username(u.getUsername())
                            .fullName(u.getFullName())
                            .avatar(u.getAvatar())
                            .email(u.getEmail())
                            .role(u.getRole().name())
                            .build();
                })
                .toList();
    }
}
