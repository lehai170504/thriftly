package com.ecommerce.thriftauction.core.config;

import com.ecommerce.thriftauction.features.auction.entity.AuctionSession;
import com.ecommerce.thriftauction.features.auction.entity.AuctionStatus;
import com.ecommerce.thriftauction.features.auction.repository.AuctionSessionRepository;
import com.ecommerce.thriftauction.features.auth.entity.Role;
import com.ecommerce.thriftauction.features.auth.entity.User;
import com.ecommerce.thriftauction.features.auth.repository.UserRepository;
import com.ecommerce.thriftauction.features.payment.entity.Wallet;
import com.ecommerce.thriftauction.features.payment.repository.WalletRepository;
import com.ecommerce.thriftauction.features.product.entity.Category;
import com.ecommerce.thriftauction.features.product.entity.Product;
import com.ecommerce.thriftauction.features.product.entity.ProductCondition;
import com.ecommerce.thriftauction.features.product.entity.ProductStatus;
import com.ecommerce.thriftauction.features.product.entity.SellType;
import com.ecommerce.thriftauction.features.product.repository.CategoryRepository;
import com.ecommerce.thriftauction.features.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.cache.CacheManager;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
@Profile("!prod")
public class DatabaseSeeder implements CommandLineRunner {

        private final CategoryRepository categoryRepository;
        private final ProductRepository productRepository;
        private final UserRepository userRepository;
        private final WalletRepository walletRepository;
        private final AuctionSessionRepository auctionSessionRepository;
        private final PasswordEncoder passwordEncoder;
        private final CacheManager cacheManager;
        private final JdbcTemplate jdbcTemplate;

        @Override
        public void run(String... args) throws Exception {
                cleanupMockTestData();
                log.info("Khoi tao du lieu danh muc tieu chuan...");
                Map<String, Category> categories = seedCategories();
                log.info("Khoi tao du lieu san pham tieu chuan...");
                seedProducts(categories);
                if (cacheManager.getCache(CacheConfig.CACHE_CATEGORIES) != null) {
                        cacheManager.getCache(CacheConfig.CACHE_CATEGORIES).clear();
                }
                log.info("Hoan tat khoi tao du lieu mau.");
        }

        private void cleanupMockTestData() {
                try {
                        jdbcTemplate.execute("DELETE FROM voucher_usages");
                        jdbcTemplate.execute("DELETE FROM review_likes");
                        jdbcTemplate.execute("DELETE FROM reviews");
                        jdbcTemplate.execute("DELETE FROM transactions WHERE order_id IS NOT NULL");
                        jdbcTemplate.execute("DELETE FROM orders");
                        jdbcTemplate.execute("DELETE FROM auction_bids");
                        jdbcTemplate.execute("DELETE FROM auction_deposits");
                        jdbcTemplate.execute("DELETE FROM auction_sessions");
                        jdbcTemplate.execute("DELETE FROM product_favorites");
                        jdbcTemplate.execute("DELETE FROM product_view_history");
                        jdbcTemplate.execute("DELETE FROM product_images");
                        jdbcTemplate.execute("DELETE FROM reports");
                        jdbcTemplate.execute("DELETE FROM products");
                        jdbcTemplate.execute(
                                        "DELETE FROM categories WHERE parent_id IS NOT NULL AND parent_id NOT IN (SELECT id FROM categories WHERE name IN ('Thời trang', 'Đồ điện tử', 'Đồ gia dụng', 'Phương tiện', 'Đồ cổ & Sưu tầm', 'Khác'))");
                        jdbcTemplate.execute(
                                        "DELETE FROM categories WHERE parent_id IS NULL AND name NOT IN ('Thời trang', 'Đồ điện tử', 'Đồ gia dụng', 'Phương tiện', 'Đồ cổ & Sưu tầm', 'Khác')");
                        jdbcTemplate.execute(
                                        "DELETE FROM user_interests WHERE user_id IN (SELECT id FROM users WHERE username LIKE 'perf_user_%')");
                        jdbcTemplate.execute("DELETE FROM users WHERE username LIKE 'perf_user_%'");
                        if (cacheManager.getCache(CacheConfig.CACHE_CATEGORIES) != null) {
                                cacheManager.getCache(CacheConfig.CACHE_CATEGORIES).clear();
                        }
                } catch (Exception e) {
                        log.error("Loi khi don dep du lieu test: ", e);
                }
        }

        private Category getOrCreateCategory(String name, String icon, Category parent, Map<String, Category> map) {
                Category cat = categoryRepository.findByName(name).orElseGet(() -> {
                        Category newCat = Category.builder()
                                        .name(name)
                                        .icon(icon)
                                        .parent(parent)
                                        .build();
                        return categoryRepository.save(newCat);
                });
                map.put(name, cat);
                return cat;
        }

        private Map<String, Category> seedCategories() {
                Map<String, Category> map = new HashMap<>();

                Category fashion = getOrCreateCategory("Thời trang", "shirt", null, map);
                getOrCreateCategory("Áo nam", "https://images.unsplash.com/photo-1516826957135-700ede19c6ce?w=200&q=80",
                                fashion, map);
                getOrCreateCategory("Áo nữ", "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=200&q=80",
                                fashion, map);
                getOrCreateCategory("Quần nam",
                                "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=200&q=80", fashion,
                                map);
                getOrCreateCategory("Quần nữ",
                                "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=200&q=80", fashion,
                                map);
                getOrCreateCategory("Phụ kiện, túi xách",
                                "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=200&q=80", fashion,
                                map);

                Category electronics = getOrCreateCategory("Đồ điện tử", "laptop", null, map);
                getOrCreateCategory("Điện thoại",
                                "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&q=80", electronics,
                                map);
                getOrCreateCategory("Máy tính bảng",
                                "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=200&q=80", electronics,
                                map);
                getOrCreateCategory("Laptop", "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&q=80",
                                electronics, map);
                getOrCreateCategory("Linh kiện máy tính",
                                "https://images.unsplash.com/photo-1591405351990-4726e331f141?w=200&q=80", electronics,
                                map);
                getOrCreateCategory("Thiết bị âm thanh",
                                "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=200&q=80", electronics,
                                map);

                Category home = getOrCreateCategory("Đồ gia dụng", "sofa", null, map);
                getOrCreateCategory("Bếp & Phòng ăn",
                                "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=200&q=80", home, map);
                getOrCreateCategory("Nội thất phòng khách",
                                "https://images.unsplash.com/photo-1583847268964-b28ce8f30fbb?w=200&q=80", home, map);
                getOrCreateCategory("Nội thất phòng ngủ",
                                "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=200&q=80", home, map);
                getOrCreateCategory("Điện gia dụng",
                                "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=200&q=80", home, map);

                Category vehicle = getOrCreateCategory("Phương tiện", "car", null, map);
                getOrCreateCategory("Xe máy", "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=200&q=80",
                                vehicle, map);
                getOrCreateCategory("Ô tô", "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200&q=80",
                                vehicle, map);
                getOrCreateCategory("Xe đạp", "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=200&q=80",
                                vehicle, map);
                getOrCreateCategory("Phụ tùng, phụ kiện xe",
                                "https://images.unsplash.com/photo-1600713794158-b61ad60212f4?w=200&q=80", vehicle,
                                map);

                Category collectibles = getOrCreateCategory("Đồ cổ & Sưu tầm", "gem", null, map);
                getOrCreateCategory("Đồng hồ cổ",
                                "https://images.unsplash.com/photo-1587836374828-f4384912fa5d?w=200&q=80", collectibles,
                                map);
                getOrCreateCategory("Tiền xu, tiền giấy",
                                "https://images.unsplash.com/photo-1621804368595-671cb0a9eb83?w=200&q=80", collectibles,
                                map);
                getOrCreateCategory("Tranh ảnh nghệ thuật",
                                "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=200&q=80", collectibles,
                                map);
                getOrCreateCategory("Gốm sứ cổ",
                                "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=200&q=80", collectibles,
                                map);

                Category others = getOrCreateCategory("Khác", "more-horizontal", null, map);
                getOrCreateCategory("Sách báo, Tạp chí",
                                "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=200&q=80", others, map);
                getOrCreateCategory("Nhạc cụ",
                                "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=200&q=80", others, map);
                getOrCreateCategory("Đồ dùng thú cưng",
                                "https://images.unsplash.com/photo-1516453734593-8d198ae84bcf?w=200&q=80", others, map);
                getOrCreateCategory("Đồ chơi mô hình",
                                "https://images.unsplash.com/photo-1535303311164-664fc9ec6532?w=200&q=80", others, map);

                return map;
        }

        private void seedProducts(Map<String, Category> categories) {
                User seller = userRepository.findByEmail("store@thriftly.com").orElseGet(() -> {
                        User u = User.builder()
                                        .username("thriftly_store")
                                        .email("store@thriftly.com")
                                        .password(passwordEncoder.encode("store123"))
                                        .fullName("Thriftly Official Store")
                                        .phone("0988776655")
                                        .address("Quận 1, TP. Hồ Chí Minh")
                                        .role(Role.USER)
                                        .avatar("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80")
                                        .build();
                        User saved = userRepository.save(u);
                        walletRepository.save(Wallet.builder().user(saved).balance(new BigDecimal("10000000"))
                                        .heldBalance(BigDecimal.ZERO).build());
                        return saved;
                });

                createProduct(
                                "Áo khoác Bomber da vintage 90s cao cấp",
                                "Hàng hiệu chuẩn Auth phong cách Retro Vintage 90s, chất da dày dặn lên form cực đẹp. Khóa kéo đồng nguyên bản mượt mà, bao check form.",
                                categories.get("Áo nam"),
                                ProductCondition.GOOD,
                                SellType.AUCTION,
                                new BigDecimal("450000"),
                                new BigDecimal("50000"),
                                1,
                                "Quận 1, TP. Hồ Chí Minh",
                                "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80",
                                Arrays.asList("https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80",
                                                "https://images.unsplash.com/photo-1520975954732-57dd22299614?w=800&q=80"),
                                seller);

                createProduct(
                                "Áo măng tô dạ dáng dài Hàn Quốc màu be",
                                "Áo dạ cừu 2 lớp siêu ấm và đứng dáng, form dài chuẩn ulzzang Hàn Quốc. Mới mặc chụp ảnh 1 lần còn nguyên tag cúc phụ.",
                                categories.get("Áo nữ"),
                                ProductCondition.LIKE_NEW,
                                SellType.BUY_NOW,
                                new BigDecimal("680000"),
                                null,
                                1,
                                "Cầu Giấy, Hà Nội",
                                "https://images.unsplash.com/photo-1539533018447-63fcce667883?w=800&q=80",
                                List.of("https://images.unsplash.com/photo-1539533018447-63fcce667883?w=800&q=80"),
                                seller);

                createProduct(
                                "Quần Jean Levi's 501 Original Fit chính hãng",
                                "Levi's 501 kinh điển khuy cài nguyên bản, chất denim dày dặn phai màu tự nhiên cực chất. Size 31 chuẩn eo 80-82cm.",
                                categories.get("Quần nam"),
                                ProductCondition.GOOD,
                                SellType.BUY_NOW,
                                new BigDecimal("550000"),
                                null,
                                2,
                                "Hải Châu, Đà Nẵng",
                                "https://images.unsplash.com/photo-1542272604-780c96856592?w=800&q=80",
                                List.of("https://images.unsplash.com/photo-1542272604-780c96856592?w=800&q=80"),
                                seller);

                createProduct(
                                "Quần tây ống suông cạp cao xếp ly vải tuyết mưa",
                                "Quần vải tuyết mưa cao cấp không nhăn, cạp cao tôn dáng hack chân cực đỉnh. Phù hợp phối đồ đi làm hoặc đi chơi.",
                                categories.get("Quần nữ"),
                                ProductCondition.NEW,
                                SellType.BUY_NOW,
                                new BigDecimal("250000"),
                                null,
                                3,
                                "Đống Đa, Hà Nội",
                                "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80",
                                List.of("https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80"),
                                seller);

                createProduct(
                                "Túi xách đeo chéo da bò thủ công Classic Messenger",
                                "Túi may thủ công từ da sáp ngựa điên (Crazy Horse Leather) cao cấp, càng dùng lâu da càng bóng đẹp. Vừa iPad 11 inch và sổ tay.",
                                categories.get("Phụ kiện, túi xách"),
                                ProductCondition.LIKE_NEW,
                                SellType.AUCTION,
                                new BigDecimal("600000"),
                                new BigDecimal("50000"),
                                1,
                                "Quận 3, TP. Hồ Chí Minh",
                                "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80",
                                List.of("https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80"),
                                seller);

                createProduct(
                                "iPhone 13 Pro Max 128GB Sierra Blue quốc tế",
                                "Máy đẹp 99% không vết xước, pin 88%, face ID nhạy 3uTools xanh toàn bộ. Bao test 1 tháng hoàn tiền nếu phát hiện sửa chữa.",
                                categories.get("Điện thoại"),
                                ProductCondition.LIKE_NEW,
                                SellType.BUY_NOW,
                                new BigDecimal("13800000"),
                                null,
                                1,
                                "Thanh Xuân, Hà Nội",
                                "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&q=80",
                                Arrays.asList("https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&q=80",
                                                "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80"),
                                seller);

                createProduct(
                                "Samsung Galaxy S23 Ultra 512GB Phantom Black",
                                "Bản chính hãng SSVN 2 sim vật lý, bút S-Pen tiện lợi, camera zoom 100x sắc nét. Ngoại hình đẹp keng dán PPF toàn thân.",
                                categories.get("Điện thoại"),
                                ProductCondition.LIKE_NEW,
                                SellType.BUY_NOW,
                                new BigDecimal("15500000"),
                                null,
                                1,
                                "Quận 1, TP. Hồ Chí Minh",
                                "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80",
                                List.of("https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80"),
                                seller);

                createProduct(
                                "MacBook Pro 14 inch M1 Pro 16GB/512GB Space Gray",
                                "Dòng máy chuyên dựng phim đồ họa, màn hình Mini-LED 120Hz siêu nét. Pin 94%, fullbox phụ kiện zin theo máy.",
                                categories.get("Laptop"),
                                ProductCondition.LIKE_NEW,
                                SellType.AUCTION,
                                new BigDecimal("25000000"),
                                new BigDecimal("500000"),
                                1,
                                "Quận 7, TP. Hồ Chí Minh",
                                "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
                                Arrays.asList("https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
                                                "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80"),
                                seller);

                createProduct(
                                "iPad Air 5 M1 64GB WiFi kèm Apple Pencil 2",
                                "Chip M1 mạnh mẽ hỗ trợ Stage Manager. Máy dùng bao da dán cường lực từ ngày đầu nên đẹp keng, tặng kèm bút Apple Pencil 2 chính hãng.",
                                categories.get("Máy tính bảng"),
                                ProductCondition.LIKE_NEW,
                                SellType.BUY_NOW,
                                new BigDecimal("11200000"),
                                null,
                                1,
                                "Ba Đình, Hà Nội",
                                "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80",
                                List.of("https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80"),
                                seller);

                createProduct(
                                "Tai nghe chống ồn Sony WH-1000XM5 Black chính hãng",
                                "Chống ồn chủ động đỉnh cao số 1 phân khúc, chất âm trầm ấm chi tiết. Pin trâu 30h nghe nhạc liên tục, đầy đủ hộp và dây cáp zin.",
                                categories.get("Thiết bị âm thanh"),
                                ProductCondition.LIKE_NEW,
                                SellType.BUY_NOW,
                                new BigDecimal("5400000"),
                                null,
                                2,
                                "Ninh Kiều, Cần Thơ",
                                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
                                List.of("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"),
                                seller);

                createProduct(
                                "Loa Bluetooth Marshall Acton II Black âm thanh cổ điển",
                                "Thiết kế vintage sang trọng bọc da viền vàng kim loại. Âm bass trầm sâu, dải mid trong trẻo phù hợp nghe nhạc Acoustic, Jazz.",
                                categories.get("Thiết bị âm thanh"),
                                ProductCondition.LIKE_NEW,
                                SellType.AUCTION,
                                new BigDecimal("3900000"),
                                new BigDecimal("100000"),
                                1,
                                "Hoàn Kiếm, Hà Nội",
                                "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80",
                                List.of("https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80"),
                                seller);

                createProduct(
                                "Bàn phím cơ Custom Keychron Q1 Pro Wireless RGB",
                                "Khung nhôm nguyên khối đầm chắc, switch Gateron Jupiter Red mượt mà, gõ êm ái. Hỗ trợ kết nối Bluetooth 3 thiết bị và Type-C.",
                                categories.get("Linh kiện máy tính"),
                                ProductCondition.GOOD,
                                SellType.BUY_NOW,
                                new BigDecimal("3200000"),
                                null,
                                1,
                                "Bình Thạnh, TP. Hồ Chí Minh",
                                "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80",
                                List.of("https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80"),
                                seller);

                createProduct(
                                "Nồi chiên không dầu Philips XXL HD9650 7.3 Lít",
                                "Công nghệ Twin TurboStar loại bỏ đến 90% dầu mỡ thừa. Dung tích lớn chiên được gà nguyên con 1.4kg, lòng nồi chống dính còn rất đẹp.",
                                categories.get("Bếp & Phòng ăn"),
                                ProductCondition.GOOD,
                                SellType.BUY_NOW,
                                new BigDecimal("2600000"),
                                null,
                                1,
                                "Hoàng Mai, Hà Nội",
                                "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80",
                                List.of("https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80"),
                                seller);

                createProduct(
                                "Bộ nồi chảo inox cao cấp Fissler 5 món nhập khẩu Đức",
                                "Chất liệu inox 18/10 sáng bóng chống oxy hóa tuyệt đối, đáy nồi 3 lớp truyền nhiệt nhanh đều. Sử dụng tốt trên mọi loại bếp.",
                                categories.get("Bếp & Phòng ăn"),
                                ProductCondition.LIKE_NEW,
                                SellType.AUCTION,
                                new BigDecimal("4200000"),
                                new BigDecimal("200000"),
                                1,
                                "Cầu Giấy, Hà Nội",
                                "https://images.unsplash.com/photo-1584990347449-a681329c3d4c?w=800&q=80",
                                List.of("https://images.unsplash.com/photo-1584990347449-a681329c3d4c?w=800&q=80"),
                                seller);

                createProduct(
                                "Ghế Sofa thư giãn bọc da bò thật phong cách Scandinavian",
                                "Khung gỗ sồi tự nhiên chống mối mọt, đệm mút D40 đàn hồi êm ái không xẹp lún. Bọc da êm mềm phong cách Bắc Âu thanh lịch.",
                                categories.get("Nội thất phòng khách"),
                                ProductCondition.GOOD,
                                SellType.BUY_NOW,
                                new BigDecimal("4800000"),
                                null,
                                1,
                                "Nam Từ Liêm, Hà Nội",
                                "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
                                List.of("https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80"),
                                seller);

                createProduct(
                                "Đèn ngủ để bàn thân gỗ phong cách tối giản Vintage",
                                "Chao đèn vải lanh khuếch tán ánh sáng vàng ấm dịu nhẹ, bóng LED tiết kiệm điện. Thân đèn gỗ tự nhiên tiện thủ công tinh xảo.",
                                categories.get("Nội thất phòng ngủ"),
                                ProductCondition.LIKE_NEW,
                                SellType.BUY_NOW,
                                new BigDecimal("420000"),
                                null,
                                3,
                                "Quận 2, TP. Hồ Chí Minh",
                                "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80",
                                List.of("https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80"),
                                seller);

                createProduct(
                                "Máy lọc không khí Xiaomi Air Purifier 4 Pro thế hệ mới",
                                "Phù hợp diện tích phòng 35-60m2, cảm biến bụi mịn laser hiển thị màn hình OLED sắc nét. Lõi lọc còn 85% thời lượng sử dụng.",
                                categories.get("Điện gia dụng"),
                                ProductCondition.LIKE_NEW,
                                SellType.BUY_NOW,
                                new BigDecimal("2750000"),
                                null,
                                1,
                                "Hà Đông, Hà Nội",
                                "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80",
                                List.of("https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80"),
                                seller);

                createProduct(
                                "Xe máy Honda Super Cub 50cc nhập khẩu Nhật nguyên bản",
                                "Dòng Cub kiểng sưu tầm, máy móc êm ru thì thầm, tiết kiệm xăng 1.5L/100km. Sơn zin tem zin nguyên bản, giấy tờ hợp lệ sang tên nhanh.",
                                categories.get("Xe máy"),
                                ProductCondition.GOOD,
                                SellType.AUCTION,
                                new BigDecimal("18000000"),
                                new BigDecimal("500000"),
                                1,
                                "Quận Phú Nhuận, TP. Hồ Chí Minh",
                                "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&q=80",
                                List.of("https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&q=80"),
                                seller);

                createProduct(
                                "Xe đạp Touring Giant Escape 2 Disc phanh đĩa dầu",
                                "Khung sườn nhôm ALUXX siêu nhẹ, bộ truyền động Shimano Altus 2x8 tốc độ mượt mà. Xe mới bảo dưỡng toàn diện về chỉ việc đạp.",
                                categories.get("Xe đạp"),
                                ProductCondition.LIKE_NEW,
                                SellType.BUY_NOW,
                                new BigDecimal("6800000"),
                                null,
                                1,
                                "Tây Hồ, Hà Nội",
                                "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80",
                                List.of("https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80"),
                                seller);

                createProduct(
                                "Mũ bảo hiểm Fullface AGV K1 S Solid Black chuẩn ECE",
                                "Kính chắn gió quang học chống trầy, form nón khí động học đầm chắc khi chạy tốc độ cao. Size L (vòng đầu 58-60cm), tặng kèm pinlock chống đọng sương.",
                                categories.get("Phụ tùng, phụ kiện xe"),
                                ProductCondition.LIKE_NEW,
                                SellType.BUY_NOW,
                                new BigDecimal("3500000"),
                                null,
                                1,
                                "Quận 10, TP. Hồ Chí Minh",
                                "https://images.unsplash.com/photo-1600713794158-b61ad60212f4?w=800&q=80",
                                List.of("https://images.unsplash.com/photo-1600713794158-b61ad60212f4?w=800&q=80"),
                                seller);

                createProduct(
                                "Đồng hồ cơ Thụy Sĩ Omega Seamaster Automatic thập niên 70",
                                "Máy cơ tự động Caliber 1020 chính hãng Omega Thụy Sĩ, mặt số trải tia nguyên bản tuyệt đẹp. Giữ giờ chuẩn xác 40h trữ cót, giá trị sưu tầm cực cao.",
                                categories.get("Đồng hồ cổ"),
                                ProductCondition.GOOD,
                                SellType.AUCTION,
                                new BigDecimal("15000000"),
                                new BigDecimal("500000"),
                                1,
                                "Hoàn Kiếm, Hà Nội",
                                "https://images.unsplash.com/photo-1587836374828-f4384912fa5d?w=800&q=80",
                                List.of("https://images.unsplash.com/photo-1587836374828-f4384912fa5d?w=800&q=80"),
                                seller);

                createProduct(
                                "Bộ sưu tập tiền giấy Đông Dương cổ thời kỳ 1940-1954",
                                "Gồm 8 tờ tiền giấy thời kỳ Banque de l'Indochine nguyên vẹn không rách nát, bảo quản trong album chống ẩm chuyên dụng.",
                                categories.get("Tiền xu, tiền giấy"),
                                ProductCondition.GOOD,
                                SellType.AUCTION,
                                new BigDecimal("1800000"),
                                new BigDecimal("100000"),
                                1,
                                "Quận 5, TP. Hồ Chí Minh",
                                "https://images.unsplash.com/photo-1621804368595-671cb0a9eb83?w=800&q=80",
                                List.of("https://images.unsplash.com/photo-1621804368595-671cb0a9eb83?w=800&q=80"),
                                seller);

                createProduct(
                                "Tranh sơn dầu phong cảnh phố cổ Hà Nội vẽ tay",
                                "Tranh vẽ tay sơn dầu trên toan hạt cao cấp, màu sắc trầm ấm phong vị Hà Nội xưa. Đã lên khung composite vân gỗ sang trọng.",
                                categories.get("Tranh ảnh nghệ thuật"),
                                ProductCondition.LIKE_NEW,
                                SellType.BUY_NOW,
                                new BigDecimal("2200000"),
                                null,
                                1,
                                "Hoàn Kiếm, Hà Nội",
                                "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=80",
                                List.of("https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=80"),
                                seller);

                createProduct(
                                "Bình gốm hoa lam Chu Đậu cổ men rạn họa tiết sen",
                                "Đường men rạn tự nhiên theo thời gian, nét vẽ tay hoa lam tinh xảo mang đậm dấu ấn làng nghề truyền thống. Dùng trưng bày phòng khách cực sang.",
                                categories.get("Gốm sứ cổ"),
                                ProductCondition.FAIR,
                                SellType.AUCTION,
                                new BigDecimal("4500000"),
                                new BigDecimal("200000"),
                                1,
                                "Bát Tràng, Hà Nội",
                                "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=80",
                                List.of("https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=80"),
                                seller);

                createProduct(
                                "Đàn Guitar Acoustic Yamaha FG800 Solid Top gỗ vân sam",
                                "Mặt top gỗ Solid Spruce nguyên tấm cho âm thanh vang sáng và trầm ấm. Action thấp bấm êm tay không đau ngón, tặng kèm bao da 3 lớp và capo.",
                                categories.get("Nhạc cụ"),
                                ProductCondition.LIKE_NEW,
                                SellType.BUY_NOW,
                                new BigDecimal("3800000"),
                                null,
                                1,
                                "Quận 1, TP. Hồ Chí Minh",
                                "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&q=80",
                                List.of("https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&q=80"),
                                seller);

                createProduct(
                                "Trọn bộ tiểu thuyết Harry Potter 7 tập bìa cứng",
                                "Bản dịch của nhà văn Lý Lan chuẩn NXB Trẻ, chất giấy xốp vàng chống mỏi mắt. Sách được bọc màng bảo vệ còn mới 98%.",
                                categories.get("Sách báo, Tạp chí"),
                                ProductCondition.LIKE_NEW,
                                SellType.BUY_NOW,
                                new BigDecimal("1200000"),
                                null,
                                1,
                                "Cầu Giấy, Hà Nội",
                                "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&q=80",
                                List.of("https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&q=80"),
                                seller);

                createProduct(
                                "Mô hình Bandai RG 1/144 Hi-Nu Gundam chính hãng",
                                "Hàng Bandai fullbox chưa ráp runner nguyên seal, độ chi tiết siêu cao thuộc hàng top của dòng RG. Khớp nối linh hoạt biên độ cử động rộng.",
                                categories.get("Đồ chơi mô hình"),
                                ProductCondition.NEW,
                                SellType.AUCTION,
                                new BigDecimal("950000"),
                                new BigDecimal("50000"),
                                2,
                                "Tân Bình, TP. Hồ Chí Minh",
                                "https://images.unsplash.com/photo-1535303311164-664fc9ec6532?w=800&q=80",
                                List.of("https://images.unsplash.com/photo-1535303311164-664fc9ec6532?w=800&q=80"),
                                seller);

                createProduct(
                                "Nhà cây cào móng cho mèo Cat Tree đa tầng",
                                "Chất liệu gỗ MDF bọc nỉ nhung êm ái, cột quấn dây thừng đay tự nhiên siêu bền cho mèo cào móng và leo trèo thoải mái.",
                                categories.get("Đồ dùng thú cưng"),
                                ProductCondition.LIKE_NEW,
                                SellType.BUY_NOW,
                                new BigDecimal("650000"),
                                null,
                                2,
                                "Quận 7, TP. Hồ Chí Minh",
                                "https://images.unsplash.com/photo-1516453734593-8d198ae84bcf?w=800&q=80",
                                List.of("https://images.unsplash.com/photo-1516453734593-8d198ae84bcf?w=800&q=80"),
                                seller);
        }

        private void createProduct(
                        String title,
                        String description,
                        Category category,
                        ProductCondition condition,
                        SellType sellType,
                        BigDecimal price,
                        BigDecimal stepPrice,
                        int quantity,
                        String location,
                        String imageUrl,
                        List<String> images,
                        User seller) {
                if (category == null) {
                        return;
                }

                Product p = Product.builder()
                                .seller(seller)
                                .category(category)
                                .title(title)
                                .description(description)
                                .condition(condition)
                                .sellType(sellType)
                                .price(price)
                                .quantity(quantity)
                                .location(location)
                                .imageUrl(imageUrl)
                                .images(images)
                                .status(ProductStatus.ACTIVE)
                                .averageRating(4.9)
                                .soldCount(5)
                                .build();

                Product saved = productRepository.save(p);

                if (sellType == SellType.AUCTION) {
                        AuctionSession session = AuctionSession.builder()
                                        .product(saved)
                                        .startTime(LocalDateTime.now().minusHours(2))
                                        .endTime(LocalDateTime.now().plusDays(3))
                                        .startingPrice(price)
                                        .stepPrice(stepPrice != null ? stepPrice : new BigDecimal("50000"))
                                        .currentHighestPrice(price)
                                        .status(AuctionStatus.ONGOING)
                                        .build();
                        auctionSessionRepository.save(session);
                }
        }
}
