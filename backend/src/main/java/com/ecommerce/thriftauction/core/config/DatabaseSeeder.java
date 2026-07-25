package com.ecommerce.thriftauction.core.config;

import com.ecommerce.thriftauction.features.product.entity.Category;
import com.ecommerce.thriftauction.features.product.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    @Override
    public void run(String... args) throws Exception {
        log.info("Kiểm tra và khởi tạo dữ liệu danh mục chuẩn...");
        seedCategories();
        log.info("Hoàn tất kiểm tra dữ liệu danh mục.");
    }

    private Category getOrCreateCategory(String name, String icon, Category parent) {
        return categoryRepository.findByName(name).orElseGet(() -> {
            Category newCat = Category.builder()
                    .name(name)
                    .icon(icon)
                    .parent(parent)
                    .build();
            return categoryRepository.save(newCat);
        });
    }

    private void seedCategories() {
        // 1. Thời trang
        Category fashion = getOrCreateCategory("Thời trang", "shirt", null);
        getOrCreateCategory("Áo nam", "https://images.unsplash.com/photo-1516826957135-700ede19c6ce?w=200&q=80",
                fashion);
        getOrCreateCategory("Áo nữ", "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=200&q=80",
                fashion);
        getOrCreateCategory("Quần nam", "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=200&q=80",
                fashion);
        getOrCreateCategory("Quần nữ", "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=200&q=80",
                fashion);
        getOrCreateCategory("Phụ kiện, túi xách",
                "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=200&q=80", fashion);

        // 2. Đồ điện tử
        Category electronics = getOrCreateCategory("Đồ điện tử", "laptop", null);
        getOrCreateCategory("Điện thoại", "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&q=80",
                electronics);
        getOrCreateCategory("Máy tính bảng", "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=200&q=80",
                electronics);
        getOrCreateCategory("Laptop", "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&q=80",
                electronics);
        getOrCreateCategory("Linh kiện máy tính",
                "https://images.unsplash.com/photo-1591405351990-4726e331f141?w=200&q=80", electronics);
        getOrCreateCategory("Thiết bị âm thanh", "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=200&q=80",
                electronics);

        // 3. Đồ gia dụng
        Category home = getOrCreateCategory("Đồ gia dụng", "sofa", null);
        getOrCreateCategory("Bếp & Phòng ăn", "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=200&q=80",
                home);
        getOrCreateCategory("Nội thất phòng khách",
                "https://images.unsplash.com/photo-1583847268964-b28ce8f30fbb?w=200&q=80", home);
        getOrCreateCategory("Nội thất phòng ngủ",
                "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=200&q=80", home);
        getOrCreateCategory("Điện gia dụng", "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=200&q=80",
                home);

        // 4. Phương tiện
        Category vehicle = getOrCreateCategory("Phương tiện", "car", null);
        getOrCreateCategory("Xe máy", "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=200&q=80", vehicle);
        getOrCreateCategory("Ô tô", "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200&q=80", vehicle);
        getOrCreateCategory("Xe đạp", "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=200&q=80",
                vehicle);
        getOrCreateCategory("Phụ tùng, phụ kiện xe",
                "https://images.unsplash.com/photo-1600713794158-b61ad60212f4?w=200&q=80", vehicle);

        // 5. Đồ cổ & Sưu tầm
        Category collectibles = getOrCreateCategory("Đồ cổ & Sưu tầm", "gem", null);
        getOrCreateCategory("Đồng hồ cổ", "https://images.unsplash.com/photo-1587836374828-f4384912fa5d?w=200&q=80",
                collectibles);
        getOrCreateCategory("Tiền xu, tiền giấy",
                "https://images.unsplash.com/photo-1621804368595-671cb0a9eb83?w=200&q=80", collectibles);
        getOrCreateCategory("Tranh ảnh nghệ thuật",
                "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=200&q=80", collectibles);
        getOrCreateCategory("Gốm sứ cổ", "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=200&q=80",
                collectibles);

        // 6. Khác
        Category others = getOrCreateCategory("Khác", "more-horizontal", null);
        getOrCreateCategory("Sách báo, Tạp chí",
                "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=200&q=80", others);
        getOrCreateCategory("Nhạc cụ", "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=200&q=80",
                others);
        getOrCreateCategory("Đồ dùng thú cưng",
                "https://images.unsplash.com/photo-1516453734593-8d198ae84bcf?w=200&q=80", others);
        getOrCreateCategory("Đồ chơi mô hình",
                "https://images.unsplash.com/photo-1535303311164-664fc9ec6532?w=200&q=80", others);
    }
}
