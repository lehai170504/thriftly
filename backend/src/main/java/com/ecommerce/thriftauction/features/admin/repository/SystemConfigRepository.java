package com.ecommerce.thriftauction.features.admin.repository;

import com.ecommerce.thriftauction.features.admin.entity.SystemConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SystemConfigRepository extends JpaRepository<SystemConfig, Long> {
    Optional<SystemConfig> findFirstByOrderByIdAsc();
}
