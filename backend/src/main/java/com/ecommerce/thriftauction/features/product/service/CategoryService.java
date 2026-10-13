package com.ecommerce.thriftauction.features.product.service;

import com.ecommerce.thriftauction.core.config.CacheConfig;
import com.ecommerce.thriftauction.features.product.dto.CategoryDto;
import com.ecommerce.thriftauction.features.product.entity.Category;
import com.ecommerce.thriftauction.features.product.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @CacheEvict(value = CacheConfig.CACHE_CATEGORIES, allEntries = true)
    public CategoryDto createCategory(CategoryDto request) {
        Category parent = null;
        if (request.getParentId() != null) {
            parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent category not found"));
        }

        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .icon(request.getIcon())
                .parent(parent)
                .build();

        return mapToDto(categoryRepository.save(category));
    }

    @Transactional(readOnly = true)
    @Cacheable(value = CacheConfig.CACHE_CATEGORIES, key = "'all'")
    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findByParentIsNull().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @CacheEvict(value = CacheConfig.CACHE_CATEGORIES, allEntries = true)
    public CategoryDto updateCategory(String id, CategoryDto request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Category parent = null;
        if (request.getParentId() != null) {
            parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent category not found"));
        }

        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setIcon(request.getIcon());
        category.setParent(parent);
        return mapToDto(categoryRepository.save(category));
    }

    @CacheEvict(value = CacheConfig.CACHE_CATEGORIES, allEntries = true)
    public void deleteCategory(String id) {
        categoryRepository.deleteById(id);
    }

    private CategoryDto mapToDto(Category category) {
        return CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .icon(category.getIcon())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .subCategories(category.getSubCategories() != null
                        ? category.getSubCategories().stream().map(this::mapToDto).collect(Collectors.toList())
                        : null)
                .build();
    }
}
