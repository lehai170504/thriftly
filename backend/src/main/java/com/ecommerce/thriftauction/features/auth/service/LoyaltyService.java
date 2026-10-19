package com.ecommerce.thriftauction.features.auth.service;

import com.ecommerce.thriftauction.features.auth.entity.User;
import com.ecommerce.thriftauction.features.auth.entity.UserTier;
import com.ecommerce.thriftauction.features.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
@Slf4j
public class LoyaltyService {

    private final UserRepository userRepository;

    @Transactional
    public void awardPoints(User user, BigDecimal orderValue) {
        if (user == null || orderValue == null || orderValue.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        BigDecimal pointsToAdd = orderValue.divide(new BigDecimal("10000"), 2, RoundingMode.HALF_DOWN);
        BigDecimal newTotalPoints = user.getTotalPoints().add(pointsToAdd);
        user.setTotalPoints(newTotalPoints);

        UserTier oldTier = user.getTier();
        UserTier newTier = determineTier(newTotalPoints);

        if (oldTier != newTier) {
            user.setTier(newTier);
            log.info("User {} upgraded from {} to {}!", user.getUsername(), oldTier, newTier);
        }

        userRepository.save(user);
    }

    private UserTier determineTier(BigDecimal points) {
        if (points.compareTo(new BigDecimal("10000")) >= 0) {
            return UserTier.DIAMOND;
        } else if (points.compareTo(new BigDecimal("5000")) >= 0) {
            return UserTier.GOLD;
        } else if (points.compareTo(new BigDecimal("1000")) >= 0) {
            return UserTier.SILVER;
        } else {
            return UserTier.BRONZE;
        }
    }

    public BigDecimal calculateDiscountedPlatformFee(BigDecimal baseFee, UserTier tier) {
        if (baseFee == null || tier == null) {
            return baseFee;
        }

        BigDecimal discountRatio = BigDecimal.ZERO;
        switch (tier) {
            case SILVER:
                discountRatio = new BigDecimal("0.10");
                break;
            case GOLD:
                discountRatio = new BigDecimal("0.30");
                break;
            case DIAMOND:
                discountRatio = new BigDecimal("0.50");
                break;
            default:
                discountRatio = BigDecimal.ZERO;
        }

        BigDecimal discountedFee = baseFee.multiply(BigDecimal.ONE.subtract(discountRatio));

        if (discountedFee.compareTo(BigDecimal.ZERO) < 0) {
            return BigDecimal.ZERO;
        }

        return discountedFee;
    }
}
