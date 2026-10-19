package com.ecommerce.thriftauction.features.auth.service;

import com.ecommerce.thriftauction.core.security.SessionRevocationService;
import com.ecommerce.thriftauction.features.auth.dto.ChangePasswordRequest;
import com.ecommerce.thriftauction.features.auth.dto.SetPasswordRequest;
import com.ecommerce.thriftauction.features.auth.dto.UserRequest;
import com.ecommerce.thriftauction.features.auth.dto.UserResponse;
import com.ecommerce.thriftauction.features.auth.entity.Role;
import com.ecommerce.thriftauction.features.auth.entity.User;
import com.ecommerce.thriftauction.features.auth.entity.UserTier;
import com.ecommerce.thriftauction.features.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SessionRevocationService sessionRevocationService;

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return mapToResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return mapToResponse(user);
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(String search, Pageable pageable) {
        Page<User> users;
        if (search != null && !search.trim().isEmpty()) {
            users = userRepository.findByRoleNotAndSearch(Role.ADMIN, search.trim(), pageable);
        } else {
            users = userRepository.findByRoleNot(Role.ADMIN, pageable);
        }
        return users.map(this::mapToResponse);
    }

    @Transactional
    public UserResponse updateProfile(String email, UserRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        if (request.getAvatar() != null) {
            user.setAvatar(request.getAvatar());
        }
        if (request.getInterests() != null) {
            user.setInterests(request.getInterests());
        }
        return mapToResponse(userRepository.save(user));
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Mật khẩu cũ không chính xác.");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Mật khẩu mới không được trùng với mật khẩu cũ.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        sessionRevocationService.revokeAll(user.getEmail());
    }

    @Transactional
    public UserResponse setPassword(String email, SetPasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setHasPassword(true);
        return mapToResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse banUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setActive(false);
        userRepository.save(user);
        sessionRevocationService.revokeAll(user.getEmail());
        return mapToResponse(user);
    }

    @Transactional
    public UserResponse unbanUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setActive(true);
        return mapToResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse updateUserTier(String id, String tier) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        try {
            UserTier newTier = UserTier.valueOf(tier.toUpperCase());
            user.setTier(newTier);
            return mapToResponse(userRepository.save(user));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Hạng thành viên không hợp lệ: " + tier);
        }
    }

    @Transactional
    public UserResponse updateUserRole(String id, String role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getRole() == Role.ADMIN) {
            throw new IllegalArgumentException("Không thể thay đổi quyền của tài khoản ADMIN tối cao.");
        }

        try {
            Role newRole = Role.valueOf(role.toUpperCase());
            if (newRole == Role.ADMIN) {
                throw new IllegalArgumentException("Không thể cấp quyền ADMIN qua API này.");
            }
            user.setRole(newRole);
            userRepository.save(user);
            sessionRevocationService.revokeAll(user.getEmail());
            return mapToResponse(user);
        } catch (IllegalArgumentException e) {
            if (e.getMessage() != null && e.getMessage().startsWith("Không thể")) {
                throw e;
            }
            throw new IllegalArgumentException("Role không hợp lệ. Chỉ chấp nhận USER hoặc STAFF.");
        }
    }

    public UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .address(user.getAddress())
                .avatar(user.getAvatar())
                .interests(user.getInterests())
                .role(user.getRole().name())
                .isActive(user.isActive())
                .totalPoints(user.getTotalPoints())
                .tier(user.getTier() != null ? user.getTier().name() : "BRONZE")
                .createdAt(user.getCreatedAt())
                .hasPassword(user.isHasPassword())
                .build();
    }
}
