package com.ecommerce.thriftauction.features.auth.service;

import com.ecommerce.thriftauction.features.notification.service.EmailService;

import com.ecommerce.thriftauction.features.auth.dto.AuthRequest;
import com.ecommerce.thriftauction.features.auth.dto.AuthResponse;
import com.ecommerce.thriftauction.features.auth.dto.RegisterRequest;
import com.ecommerce.thriftauction.features.auth.dto.ResetPasswordRequest;
import com.ecommerce.thriftauction.features.auth.entity.OtpPurpose;
import com.ecommerce.thriftauction.features.auth.entity.OtpToken;
import com.ecommerce.thriftauction.features.auth.entity.Role;
import com.ecommerce.thriftauction.features.auth.entity.User;
import com.ecommerce.thriftauction.features.payment.entity.Wallet;
import com.ecommerce.thriftauction.features.auth.repository.OtpTokenRepository;
import com.ecommerce.thriftauction.features.auth.repository.UserRepository;
import com.ecommerce.thriftauction.features.payment.repository.WalletRepository;
import com.ecommerce.thriftauction.core.security.SessionRevocationService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.security.SecureRandom;
import java.util.Collections;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

        private static final SecureRandom OTP_RANDOM = new SecureRandom();

        private final UserRepository userRepository;
        private final WalletRepository walletRepository;
        private final OtpTokenRepository otpTokenRepository;
        private final PasswordEncoder passwordEncoder;
        private final AuthenticationManager authenticationManager;
        private final EmailService emailService;
        private final SessionRevocationService sessionRevocationService;

        @Value("${google.client.id}")
        private String googleClientId;

        @Transactional
        public AuthResponse register(RegisterRequest request) {
                if (userRepository.existsByUsername(request.getUsername())) {
                        throw new RuntimeException("Username is already taken!");
                }
                if (userRepository.existsByEmail(request.getEmail())) {
                        throw new RuntimeException("Email is already taken!");
                }

                var user = User.builder()
                                .username(request.getUsername())
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .fullName(request.getFullName())
                                .phone(request.getPhone())
                                .address(request.getAddress())
                                .interests(request.getInterests())
                                .role(Role.USER)
                                .isActive(true)
                                .build();

                var savedUser = userRepository.save(user);

                var wallet = Wallet.builder()
                                .user(savedUser)
                                .balance(BigDecimal.ZERO)
                                .build();
                walletRepository.save(wallet);

                return buildAuthResponse(savedUser);
        }

        @Transactional
        public AuthResponse authenticate(AuthRequest request) {
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getEmail(),
                                                request.getPassword()));
                var user = userRepository.findByEmail(request.getEmail())
                                .or(() -> userRepository.findByUsername(request.getEmail()))
                                .orElseThrow(() -> new IllegalArgumentException("Invalid username or email"));

                return buildLoginResponse(user);
        }

        @Transactional
        public AuthResponse verify2Fa(String email, String otp) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                if (!isPrivileged(user)) {
                        throw new RuntimeException("Two-factor verification is not available for this account");
                }

                OtpToken otpToken = otpTokenRepository
                                .findTopByOtpAndUserAndPurposeOrderByExpiryDateDesc(otp, user, OtpPurpose.LOGIN_2FA)
                                .orElseThrow(() -> new RuntimeException("Invalid OTP"));

                if (otpToken.isUsed()) {
                        throw new RuntimeException("OTP has already been used");
                }

                if (otpToken.getExpiryDate().isBefore(LocalDateTime.now())) {
                        throw new RuntimeException("OTP has expired");
                }

                otpToken.setUsed(true);
                otpTokenRepository.save(otpToken);

                return buildAuthResponse(user);
        }

        @Transactional
        public AuthResponse googleLogin(String credential) {
                try {
                        HttpTransport transport = new NetHttpTransport();
                        JsonFactory jsonFactory = new GsonFactory();

                        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                                        transport, jsonFactory)
                                        .setAudience(Collections.singletonList(googleClientId))
                                        .build();

                        GoogleIdToken idToken = verifier
                                        .verify(credential);
                        if (idToken != null) {
                                GoogleIdToken.Payload payload = idToken
                                                .getPayload();
                                String email = payload.getEmail();
                                String name = (String) payload.get("name");
                                String pictureUrl = (String) payload.get("picture");

                                User user = userRepository.findByEmail(email).orElseGet(() -> {
                                        User newUser = User.builder()
                                                        .username(email.split("@")[0] + "_"
                                                                        + UUID.randomUUID().toString()
                                                                                        .substring(0, 5))
                                                        .email(email)
                                                        .password(passwordEncoder
                                                                        .encode(UUID.randomUUID().toString()))
                                                        .fullName(name)
                                                        .avatar(pictureUrl)
                                                        .role(Role.USER)
                                                        .isActive(true)
                                                        .hasPassword(false)
                                                        .build();
                                        User saved = userRepository.save(newUser);
                                        Wallet wallet = Wallet.builder()
                                                        .user(saved)
                                                        .balance(BigDecimal.ZERO)
                                                        .build();
                                        walletRepository.save(wallet);
                                        return saved;
                                });

                                return buildLoginResponse(user);
                        } else {
                                throw new RuntimeException("Invalid ID token.");
                        }
                } catch (Exception e) {
                        throw new RuntimeException("Google Login failed: " + e.getMessage());
                }
        }

        @Transactional
        public AuthResponse facebookLogin(String accessToken) {
                try {
                        String url = "https://graph.facebook.com/me?fields=id,name,email,picture.type(large)";
                        RestTemplate restTemplate = new RestTemplate();
                        HttpHeaders headers = new HttpHeaders();
                        headers.setBearerAuth(accessToken);
                        ResponseEntity<Map<String, Object>> graphResponse = restTemplate.exchange(
                                        url,
                                        HttpMethod.GET,
                                        new HttpEntity<>(headers),
                                        new ParameterizedTypeReference<>() {
                                        });
                        Map<String, Object> response = graphResponse.getBody();

                        if (response == null || !response.containsKey("id")) {
                                throw new RuntimeException("Invalid Facebook access token.");
                        }

                        String fbId = (String) response.get("id");
                        String name = (String) response.get("name");
                        String email = (String) response.get("email");

                        String pictureUrl = null;
                        if (response.containsKey("picture")) {
                                Map<String, Object> picture = (Map<String, Object>) response
                                                .get("picture");
                                if (picture.containsKey("data")) {
                                        Map<String, Object> data = (Map<String, Object>) picture
                                                        .get("data");
                                        pictureUrl = (String) data.get("url");
                                }
                        }

                        if (email == null || email.isEmpty()) {
                                email = fbId + "@facebook.com";
                        }

                        String finalEmail = email;
                        String finalPictureUrl = pictureUrl;

                        User user = userRepository.findByEmail(finalEmail).orElseGet(() -> {
                                User newUser = User.builder()
                                                .username(finalEmail.split("@")[0] + "_"
                                                                + UUID.randomUUID().toString().substring(0,
                                                                                5))
                                                .email(finalEmail)
                                                .password(passwordEncoder
                                                                .encode(UUID.randomUUID().toString()))
                                                .fullName(name)
                                                .avatar(finalPictureUrl)
                                                .role(Role.USER)
                                                .isActive(true)
                                                .build();
                                User saved = userRepository.save(newUser);
                                Wallet wallet = Wallet.builder()
                                                .user(saved)
                                                .balance(BigDecimal.ZERO)
                                                .build();
                                walletRepository.save(wallet);
                                return saved;
                        });

                        return buildLoginResponse(user);
                } catch (Exception e) {
                        throw new RuntimeException("Facebook Login failed: " + e.getMessage());
                }
        }

        @Transactional
        public void forgotPassword(String email) {
                Optional<User> userResult = userRepository.findByEmail(email);
                if (userResult.isEmpty()) {
                        return;
                }
                User user = userResult.get();

                // Generate 6-digit OTP
                String otp = generateOtp();

                otpTokenRepository.invalidateUnused(user, OtpPurpose.PASSWORD_RESET);

                OtpToken otpToken = OtpToken.builder()
                                .user(user)
                                .otp(otp)
                                .purpose(OtpPurpose.PASSWORD_RESET)
                                .expiryDate(LocalDateTime.now().plusMinutes(15))
                                .build();

                otpTokenRepository.save(otpToken);

                emailService.sendOtpEmail(user.getEmail(), otp);
        }

        @Transactional
        public void resetPassword(ResetPasswordRequest request) {
                User user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                OtpToken otpToken = otpTokenRepository
                                .findTopByOtpAndUserAndPurposeOrderByExpiryDateDesc(
                                                request.getOtp(), user, OtpPurpose.PASSWORD_RESET)
                                .orElseThrow(() -> new RuntimeException("Invalid OTP"));

                if (otpToken.isUsed()) {
                        throw new RuntimeException("OTP has already been used");
                }

                if (otpToken.getExpiryDate().isBefore(LocalDateTime.now())) {
                        throw new RuntimeException("OTP has expired");
                }

                // Check if new password is the same as the old one
                if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
                        throw new RuntimeException("Mật khẩu mới không được trùng với mật khẩu cũ");
                }

                // Update password
                user.setPassword(passwordEncoder.encode(request.getNewPassword()));
                userRepository.save(user);

                // Mark OTP as used
                otpToken.setUsed(true);
                otpTokenRepository.save(otpToken);

                sessionRevocationService.revokeAll(user.getEmail());
        }

        private AuthResponse buildLoginResponse(User user) {
                if (!user.isActive()) {
                        throw new DisabledException("Account is disabled");
                }
                if (!isPrivileged(user)) {
                        return buildAuthResponse(user);
                }

                String otp = generateOtp();
                otpTokenRepository.invalidateUnused(user, OtpPurpose.LOGIN_2FA);
                otpTokenRepository.save(OtpToken.builder()
                                .user(user)
                                .otp(otp)
                                .purpose(OtpPurpose.LOGIN_2FA)
                                .expiryDate(LocalDateTime.now().plusMinutes(15))
                                .build());
                emailService.sendOtpEmail(user.getEmail(), otp);

                return AuthResponse.builder()
                                .email(user.getEmail())
                                .requires2FA(true)
                                .build();
        }

        private boolean isPrivileged(User user) {
                return user.getRole() == Role.ADMIN || user.getRole() == Role.STAFF;
        }

        private String generateOtp() {
                return String.format("%06d", OTP_RANDOM.nextInt(1_000_000));
        }

        private AuthResponse buildAuthResponse(User user) {
                return AuthResponse.builder()
                                .id(user.getId())
                                .username(user.getUsername())
                                .email(user.getEmail())
                                .role(user.getRole().name())
                                .fullName(user.getFullName())
                                .avatar(user.getAvatar())
                                .phone(user.getPhone())
                                .address(user.getAddress())
                                .interests(user.getInterests())
                                .totalPoints(user.getTotalPoints())
                                .tier(user.getTier() != null ? user.getTier().name() : "BRONZE")
                                .hasPassword(user.isHasPassword())
                                .build();
        }
}
