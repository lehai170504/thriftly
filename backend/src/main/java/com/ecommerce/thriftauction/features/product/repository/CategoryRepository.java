package com.ecommerce.thriftauction.features.product.repository;

import com.ecommerce.thriftauction.features.product.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, String> {
    List<Category> findByParentIsNull();

    java.util.Optional<Category> findByName(String name);
}
