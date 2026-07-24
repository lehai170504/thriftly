package com.ecommerce.thriftauction.features.social.repository;

import com.ecommerce.thriftauction.features.social.entity.BlockedUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BlockedUserRepository extends JpaRepository<BlockedUser, String> {
    boolean existsByBlockerIdAndBlockedId(String blockerId, String blockedId);

    Optional<BlockedUser> findByBlockerIdAndBlockedId(String blockerId, String blockedId);
}
