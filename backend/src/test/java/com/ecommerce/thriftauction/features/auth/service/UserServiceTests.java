package com.ecommerce.thriftauction.features.auth.service;

import com.ecommerce.thriftauction.core.security.SessionRevocationService;
import com.ecommerce.thriftauction.features.auth.dto.ChangePasswordRequest;
import com.ecommerce.thriftauction.features.auth.dto.SetPasswordRequest;
import com.ecommerce.thriftauction.features.auth.dto.UserResponse;
import com.ecommerce.thriftauction.features.auth.entity.Role;
import com.ecommerce.thriftauction.features.auth.entity.User;
import com.ecommerce.thriftauction.features.auth.entity.UserTier;
import com.ecommerce.thriftauction.features.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTests {

        @Mock
        private UserRepository userRepository;
        @Mock
        private PasswordEncoder passwordEncoder;
        @Mock
        private SessionRevocationService sessionRevocationService;

        private UserService userService;

        @BeforeEach
        void setUp() {
                userService = new UserService(userRepository, passwordEncoder, sessionRevocationService);
        }

        @Test
        void getCurrentUserReturnsValidUserResponse() {
                User user = User.builder()
                                .id("u1")
                                .username("testuser")
                                .email("test@example.com")
                                .fullName("Test User")
                                .role(Role.USER)
                                .isActive(true)
                                .hasPassword(true)
                                .totalPoints(BigDecimal.valueOf(100))
                                .tier(UserTier.SILVER)
                                .createdAt(LocalDateTime.now())
                                .build();

                when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

                UserResponse response = userService.getCurrentUser("test@example.com");

                assertThat(response).isNotNull();
                assertThat(response.getId()).isEqualTo("u1");
                assertThat(response.getUsername()).isEqualTo("testuser");
                assertThat(response.isHasPassword()).isTrue();
                assertThat(response.getTier()).isEqualTo("SILVER");
        }

        @Test
        void setPasswordUpdatesPasswordAndSetsHasPasswordTrue() {
                User user = User.builder()
                                .id("u2")
                                .email("google@example.com")
                                .password("old-random-pass")
                                .role(Role.USER)
                                .hasPassword(false)
                                .build();

                when(userRepository.findByEmail("google@example.com")).thenReturn(Optional.of(user));
                when(passwordEncoder.encode("newpass123")).thenReturn("encoded-newpass123");
                when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

                SetPasswordRequest request = SetPasswordRequest.builder().newPassword("newpass123").build();
                UserResponse response = userService.setPassword("google@example.com", request);

                assertThat(response.isHasPassword()).isTrue();
                assertThat(user.getPassword()).isEqualTo("encoded-newpass123");
                verify(userRepository).save(user);
        }

        @Test
        void changePasswordFailsWhenOldPasswordIsIncorrect() {
                User user = User.builder()
                                .id("u3")
                                .email("user@example.com")
                                .password("encoded-real")
                                .role(Role.USER)
                                .build();

                when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
                when(passwordEncoder.matches("wrong-old", "encoded-real")).thenReturn(false);

                ChangePasswordRequest request = ChangePasswordRequest.builder()
                                .oldPassword("wrong-old")
                                .newPassword("newpass123")
                                .build();

                assertThatThrownBy(() -> userService.changePassword("user@example.com", request))
                                .isInstanceOf(IllegalArgumentException.class)
                                .hasMessageContaining("Mật khẩu cũ không chính xác");

                verify(userRepository, never()).save(any());
                verify(sessionRevocationService, never()).revokeAll(any());
        }

        @Test
        void changePasswordFailsWhenNewPasswordMatchesOld() {
                User user = User.builder()
                                .id("u3")
                                .email("user@example.com")
                                .password("encoded-pass")
                                .role(Role.USER)
                                .build();

                when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
                when(passwordEncoder.matches("pass123", "encoded-pass")).thenReturn(true);

                ChangePasswordRequest request = ChangePasswordRequest.builder()
                                .oldPassword("pass123")
                                .newPassword("pass123")
                                .build();

                assertThatThrownBy(() -> userService.changePassword("user@example.com", request))
                                .isInstanceOf(IllegalArgumentException.class)
                                .hasMessageContaining("Mật khẩu mới không được trùng");

                verify(userRepository, never()).save(any());
        }

        @Test
        void banUserSetsInactiveAndRevokesSessions() {
                User user = User.builder()
                                .id("u4")
                                .email("baduser@example.com")
                                .role(Role.USER)
                                .isActive(true)
                                .build();

                when(userRepository.findById("u4")).thenReturn(Optional.of(user));
                when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

                UserResponse response = userService.banUser("u4");

                assertThat(response.isActive()).isFalse();
                verify(sessionRevocationService).revokeAll("baduser@example.com");
        }

        @Test
        void updateUserRoleRejectsAdminModification() {
                User admin = User.builder()
                                .id("admin1")
                                .email("admin@example.com")
                                .role(Role.ADMIN)
                                .build();

                when(userRepository.findById("admin1")).thenReturn(Optional.of(admin));

                assertThatThrownBy(() -> userService.updateUserRole("admin1", "STAFF"))
                                .isInstanceOf(IllegalArgumentException.class)
                                .hasMessageContaining("Không thể thay đổi quyền của tài khoản ADMIN");
        }
}
