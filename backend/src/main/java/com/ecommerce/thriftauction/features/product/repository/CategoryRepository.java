package com.ecommerce.thriftauction.features.product.repository;

import com.ecommerce.thriftauction.features.product.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, String> {
    @EntityGraph(attributePaths = { "subCategories" })
    List<Category> findByParentIsNull();

    Optional<Category> findByName(String name);
}
