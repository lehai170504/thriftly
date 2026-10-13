package com.ecommerce.thriftauction.features.social.repository;

import com.ecommerce.thriftauction.features.social.entity.Follow;
import com.ecommerce.thriftauction.features.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FollowRepository extends JpaRepository<Follow, String> {
    Optional<Follow> findByFollowerAndFollowing(User follower, User following);

    List<Follow> findByFollowing(User following);

    boolean existsByFollowerAndFollowing(User follower, User following);

    long countByFollower(User follower);

    long countByFollowing(User following);
}
