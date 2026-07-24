# ThriftSwap - AI Knowledge Base & Context

Tài liệu này dùng để lưu trữ toàn bộ ngữ cảnh (Context), quy chuẩn giao diện (UI/UX Guidelines), và luồng logic (Business Logic Flow) của dự án ThriftSwap. Khi AI bắt đầu một phiên làm việc mới, hãy đọc file này để nắm bắt hiện trạng dự án.

## 1. Kiến Trúc Hệ Thống (Architecture)
- **Backend:** Spring Boot (Cổng 8081). Phục vụ RESTful APIs tại `/api/v1/*` và WebSocket tại `/ws`.
- **Frontend:** Next.js (Cổng 3000). Dùng App Router. Gọi API thông qua `axios.ts` (đã config sẵn `baseURL` và tự đính kèm JWT Token).

## 2. Các Luồng Nghiệp Vụ Cốt Lõi (Business Logic Flows)

### A. Luồng Đấu Giá (Auction Flow)
1. User tạo sản phẩm với `sellType = AUCTION`, set `startingPrice` và thời gian kết thúc (EndTime).
2. Khi đến giờ, hệ thống mở phiên Đấu giá (`AuctionSession`).
3. Trong phòng đấu giá (`AuctionRoomPage`), Client kết nối WebSocket `/topic/auctions/{id}` để nhận giá thầu (Bids) real-time.
4. Khi đồng hồ đếm ngược về 0 (`onEnd`), Client (hoặc cronjob BE) gửi request `POST /auctions/{id}/end`.
5. Backend xác định người trả giá cao nhất -> Đóng phiên đấu giá -> Chuyển Product status sang `SOLD` -> Tạo `Order` trạng thái `PENDING_PAYMENT` cho người thắng.

### B. Luồng Thanh Toán Escrow (Escrow Hold & Release)
Đây là "linh hồn" của hệ thống, giúp chống lừa đảo 100%.
1. **Nạp tiền:** User nạp tiền (giả lập) vào Wallet (`POST /wallets/deposit`). Tiền vào `balance`.
2. **Hold (Tạm giữ):** Người thắng đấu giá hoặc người Mua Ngay vào trang Đơn Hàng -> Bấm "Thanh toán bằng ví". 
   - Tiền được trừ khỏi `balance` của người mua và cộng vào `heldBalance` (Tạm giữ) của chính người mua đó.
   - Lịch sử Transaction ghi nhận loại `ESCROW_HOLD`.
   - Trạng thái Order chuyển thành `PAID` (Đã thanh toán Escrow).
3. **Release (Nhả tiền):** Người bán giao hàng. Người mua nhận hàng thành công và bấm "Đã nhận được hàng" (`POST /orders/{id}/confirm-receipt`).
   - Tiền bị trừ khỏi `heldBalance` của người mua và cộng thẳng vào `balance` của người bán.
   - Transaction ghi nhận loại `ESCROW_RELEASE`.
   - Trạng thái Order chuyển thành `COMPLETED`.

### C. Luồng Chat Real-time (Messenger-style)
Hệ thống chat 1-1 theo thời gian thực hoạt động hoàn toàn qua STOMP WebSocket.
1. **Gửi tin nhắn:** Frontend push lên `/app/chat.sendMessage`. Backend bắt tại `@MessageMapping`, lưu DB, và gửi broadcast tới `receiver` và `sender` qua `/user/queue/messages`.
2. **Double Message Prevention:** Vì frontend có 2 component (GlobalChatWidget và ChatPage) cùng subscribe chung 1 kênh, cache React Query phải áp dụng thuật toán deduplicate (khử trùng lặp qua `timestamp`, `content` và `senderUsername`).
3. **Read Receipts (Đã xem/Đã gửi):** 
   - `ChatMessage` mặc định có trường `isRead = false`.
   - Lưu ý Java/Lombok + Jackson: Field `boolean isRead` sẽ bị serialize thành JSON `{"read": false}`. Phải dùng `@JsonProperty("isRead")` để Frontend nhận đúng.
   - Khi Receiver mở chat hoặc nhận tin nhắn khi đang mở chat, gọi `PUT /api/v1/chat/read/{username}`.
   - Backend đánh dấu `isRead = true` trong DB và gửi sự kiện STOMP `{"type": "READ_RECEIPT"}` về cho Sender.
   - Sender nhận STOMP, invalidate `chatHistory` cache -> UI nhảy ngay từ "Đã gửi" sang "Đã xem" real-time.
4. **Soft Delete (Xóa 1 phía):** Dùng cờ `deletedBySender` và `deletedByReceiver` trong DB. API Query chỉ lấy những tin nhắn mà cờ tương ứng của current user bằng `false`.

## 3. Quy Chuẩn Kỹ Thuật (Technical Guidelines)

### A. Backend Rules
- **Luôn trả về DTO:** Tuyệt đối không return Entity (như `Product`, `Order`) trực tiếp từ Controller vì sẽ dính lỗi vòng lặp JSON (StackOverflow/Cyclic Reference) do quan hệ `@ManyToOne`. Phải map qua `XResponse` (VD: `OrderResponse`).
- **Tìm User:** Trong Services, khi extract username từ Security Context (JWT), dùng `userRepository.findByEmail(username).or(() -> userRepository.findByUsername(username))` vì claims token có thể lưu email thay vì username.
- **Xử lý Đồng thời (Concurrency):** Để giải quyết bài toán "2 người cùng click Mua Ngay vào cùng 1 thời điểm", sử dụng Pessimistic Locking bằng `@Lock(LockModeType.PESSIMISTIC_WRITE)` trong `ProductRepository.findByIdForUpdate()`. Điều này đảm bảo Request thứ 2 sẽ bị chặn chờ Request 1 hoàn tất, nếu Request 1 đã đổi trạng thái thành `SOLD` thì Request 2 sẽ văng Exception, tránh double-buy.

### B. Frontend UI/UX Rules
- **Aesthetics (Thẩm mỹ):** Giao diện phải mang phong cách Modern, Premium. Không dùng màu nguyên bản (như plain red/blue) mà dùng màu HSL/Tailwind xịn (như slate, neutral, emerald, rose).
- **Icons:** Tuyệt đối không sử dụng Emoji (như ✨, 🚀, 📦) để làm icon trên giao diện Web vì thiếu tính chuyên nghiệp và render không đồng nhất trên các HĐH. Phải sử dụng thư viện icon chuyên nghiệp (như `lucide-react`) cho toàn bộ UI.
- **Trạng thái rỗng (Empty States):** Mọi danh sách (Đơn hàng, Sản phẩm) phải có giao diện "Empty State" thiết kế đẹp mắt (Kèm Icon Lucide bự, màu nhạt) khi không có dữ liệu.
- **Loading States:** Sử dụng `min-h-[60vh]` kết hợp spinner để layout không bị vỡ/giật khi chuyển trang. Không dùng text "Đang tải..." thô thiển.
- **Hình ảnh:** Nếu sản phẩm chưa có ảnh (null), luôn dùng ảnh placeholder từ Unsplash kết hợp với seed (VD: `https://images.unsplash.com/photo-1523275335684-37898b6baf30?seed=${id}`).

### C. Clean Architecture Rules (Frontend)
- **Không bao giờ gọi `useQuery` / `useMutation` trực tiếp trong file `page.tsx` hoặc các components dùng chung.**
- Quy định các API call phải được wrap trong các Custom Hook (VD: `useGetProducts`, `useCreateOrder`) và đặt tại `src/features/[feature-name]/hooks/`.
- Nếu có component lớn, phải bóc tách (refactor) ra đặt vào `src/features/[feature-name]/components/`.
- `page.tsx` chỉ nên đóng vai trò là Controller/Container, nhận state từ custom hook và truyền xuống cho các Child Components.

## 4. Tình Trạng Hiện Tại & Việc Cần Làm (Next Steps)

### ✅ Đã hoàn thành (Backend + Frontend)
- Luồng Auth (Đăng ký/Đăng nhập), Luồng Sản phẩm, Ví điện tử (Nạp tiền).
- UI Trang Chủ, `/about`, `/escrow` (Marketing pages).
- Toàn bộ luồng Đấu giá Realtime (WebSocket), Luồng Escrow (Hold/Release) cho Đơn Hàng.
- Khóa bi quan (Pessimistic Lock) chống lỗi mua trùng đơn hàng.
- Hệ thống Thông báo (Notification Bell + STOMP WebSocket real-time, click to read, unread badge).
- Giao diện Kho hàng Người bán (`/seller/orders`) quản lý đơn cần giao.
- Nút Khiếu nại (Dispute) trên trang quản lý đơn hàng.
- Live Search Dropdown trên `AppHeader`.
- Tự động attach token vào `axios.ts` interceptor để xử lý lỗi 403.
- Xử lý Khiếu nại & Admin Panel (Dashboard `/admin/disputes` cho Admin phán quyết hoàn tiền/giao tiền).
- Hồ sơ người dùng & Chỉnh sửa (Profile Modal). Có thể xem và cập nhật Họ tên, SĐT, Địa chỉ.
  - Cập nhật mã vận đơn (API ship order và UI).
  - Đánh giá & Uy tín (Review API).
  - **[PHIÊN 2026-07-05]** Toàn bộ hạ tầng Admin Panel – chi tiết xem Mục 5.
  - **[PHIÊN 2026-07-06]** Ban/Unban User + Review UI hoàn chỉnh.
  - **[PHIÊN 2026-07-06 (Chat)]** Xây dựng hạ tầng Chat Real-time chuẩn Messenger: Soft Delete 1 chiều, STOMP WebSockets cho luồng chat và Read Receipts (Đã xem/Đã gửi), khử trùng lặp cache.
  - **[PHIÊN 2026-07-06 (Thanh toán)]** Đã tích hợp cổng thanh toán thực tế VNPAY cho luồng nạp tiền vào ví.
  - **[PHIÊN 2026-07-06 (Hoàn thiện Admin)]** 
    - Tối ưu hiệu năng Admin (Debounce search 500ms, `keepPreviousData` chống giật lag).
    - Hoàn thiện Trang Dashboard thống kê (AreaChart doanh thu, BarChart đơn hàng lấy API thật từ BE).
    - Hoàn thiện `AdminProductsPage`: Quản lý, tìm kiếm toàn bộ sản phẩm và xóa sản phẩm vi phạm.
    - Sửa các lỗi UI của `DropdownMenuTrigger` trong `@base-ui/react`.
  - **[PHIÊN 2026-07-07 (Auth & Security)]** 
    - Nâng cấp giao diện Đăng nhập/Đăng ký sang dạng Split-screen sang trọng, hiện đại.
    - Triển khai hệ thống **Refresh Token**: Thời hạn Access Token còn 15 phút (bảo mật cao), tích hợp Axios Interceptor tự động catch lỗi 401 để gọi ngầm cấp lại token mà không văng ứng dụng.
    - Xây dựng **Quên & Khôi phục mật khẩu**: Tích hợp `spring-boot-starter-mail` gửi OTP qua email, thiết lập 2 trang `/forgot-password` và `/reset-password`. Backend chặn việc đổi mật khẩu mới trùng với mật khẩu cũ.
    - Xây dựng **Đổi mật khẩu trong Profile**: Refactor giao diện `/profile` thành 2 Tabs (Thông tin chung & Đổi mật khẩu) xịn xò. Validate cả ở Frontend và Backend chặn việc người dùng đặt lại mật khẩu cũ.
    - Xây dựng **Quản lý & Sửa Sản Phẩm (Kho hàng Seller)**: Trang `/seller/products` cho phép người bán xem, tìm kiếm, xóa và **Sửa** (Edit) thông tin sản phẩm. Có logic Backend chặn không cho phép sửa thông tin nếu đó là phiên Đấu Giá (AUCTION) đã có lượt bid.
    - **[PHIÊN 2026-07-07 (Tạm hoãn PayOS)]**: Đã phát triển hoàn thiện tính năng thanh toán thực tế PayOS, tuy nhiên do User chưa có tài khoản ngân hàng để cấp API Key nên đã **Rollback PayOS** và giữ lại bản **VNPay Test** để tiếp tục quá trình phát triển. Việc tích hợp PayOS sẽ được thực hiện sau.
  - **[PHIÊN 2026-07-12 (Tích hợp PayOS chính thức)]**
    - Hoàn tất di chuyển từ VNPAY sang cổng thanh toán **PayOS** cho luồng nạp tiền vào ví điện tử.
    - Cấu hình PayOS SDK (`payos-java`), fix triệt để lỗi description/orderCode length.
    - Xử lý hoàn thiện Frontend, tạo `/payment/payos-return` kiểm tra thanh toán qua Webhook/Return URL và xử lý UI rút tiền/duyệt tiền trong Admin.
  - **[PHIÊN 2026-07-07 (AI Generative)]**
    - Tích hợp **Google Gemini API** (`gemini-1.5-flash`) vào Backend: Thêm `spring-boot-starter-webflux`, tạo `AiConfig.java`, `AiService.java` và `AiController.java`.
    - Endpoint `POST /api/v1/ai/generate-description`: Nhận `productName` + `condition`, trả về mô tả sản phẩm hấp dẫn do AI sinh ra.
    - Endpoint `POST /api/v1/ai/suggest-price`: Nhận `productName` + `condition`, trả về gợi ý mức giá khởi điểm phù hợp.
    - Tích hợp vào cả 2 form Frontend: `CreateProductForm.tsx` và `EditProductForm.tsx`. Thêm 2 nút sử dụng icon `Sparkles` từ `lucide-react` (không dùng emoji) cạnh Label của ô Mô tả và Giá khởi điểm.
  - **[PHIÊN 2026-07-10 (AI Provider Switch)]**
    - Chuyển đổi API cung cấp AI từ **Google Gemini** sang **Groq API** do Gemini giới hạn Rate Limit cực kỳ gắt gao.
    - Chỉnh sửa `AiService.java` và `application.yml` theo chuẩn giao tiếp OpenAI (`messages`, `role`, `content`).
    - Sử dụng model `llama-3.1-8b-instant` của Meta thông qua GroqCloud giúp tăng tốc độ phản hồi lên gấp nhiều lần.
  - **[PHIÊN 2026-07-09 (Live Auction & Agora)]**
    - Xây dựng toàn bộ hệ thống API và WebSockets (`LiveSessionController`, `LiveSessionChatController`, `useLiveSocket.ts`) quản lý phiên Live.
    - Tích hợp thành công **SDK Agora RTC (`agora-rtc-react`)** với Authentication Mechanism là **App ID (Testing Mode)**. Đã xử lý lỗi xin quyền Camera (`NotReadableError: Device in use`) bằng cách giới hạn quyền publish cho Host, còn Audience chỉ làm viewer.
    - Xây dựng giao diện Split-screen hiện đại tại route `/auctions/[id]/live`, gộp chung Video Streaming (trái), Live Chat Real-time và Khung đặt giá `useAuctionSocket` (phải).
    - Đồng bộ tham số giữa Frontend và Backend: Chuyển toàn bộ identifier trong Live APIs từ `auctionSessionId` sang `productId` (`findByProductId`) để Frontend lấy dữ liệu dễ dàng hơn từ object `product`.
  - **[PHIÊN 2026-07-10 (Fix Auth & Checkout Refactor)]**
    - Đã cấp quyền Public (`permitAll`) cho các endpoints GET (`/products`, `/categories`, `/auctions`) trong Spring Security để Guest (Khách) có thể xem trang thoải mái mà không bị văng về Login (401 Redirect).
    - Tối ưu lại Component nhập Thông tin giao hàng (Họ tên, SĐT, Địa chỉ, Map) thành `ShippingInfoForm` dùng chung cho `ProfilePage` và `MissingInfoModal`.
    - Bắt buộc cập nhật Thông tin giao hàng tại các chốt kiểm soát giao dịch: "Mua ngay", "Đặt giá" (trong phòng Live), và "Đăng tin". Nếu thiếu sẽ hiển thị popup điền và tự động thực hiện tiếp hành động (`pendingAction`) sau khi lưu thành công.
- **Hoàn thành hệ thống Social Commerce (Ngày 10/07/2026):**
    - Tích hợp tính năng Theo dõi (Follow) gian hàng.
    - Gửi thông báo Real-time STOMP (Rung chuông + Popup) ngay khi Seller đăng bán sản phẩm mới hoặc khi có người ấn theo dõi.
    - Bổ sung Popup Danh sách người theo dõi (Followers) hiển thị Avatar, Username tại trang cá nhân và trang của người bán, giống thiết kế của Instagram.
    - Cập nhật Badge "Gian hàng uy tín" dựa trên điểm đánh giá trung bình.
  - **[PHIÊN 2026-07-10 (Logistics & GHN API)]**
    - Tích hợp thành công API Giao Hàng Nhanh (GHN Sandbox) tạo luồng vận chuyển hoàn toàn tự động.
    - Tự động sinh Mã vận đơn (Tracking Code) khi người mua thanh toán tiền vào ví Escrow (Trạng thái `PAID`).
    - Xây dựng cổng Webhook `/api/v1/webhooks/ghn` (Public) để lắng nghe sự kiện từ tài xế GHN. Tự động chuyển trạng thái đơn hàng sang `SHIPPED` (Đang giao) và `DELIVERED` (Đã giao hàng).
    - Cập nhật UI hiển thị huy hiệu `DELIVERED` (Đã giao hàng) và điều chỉnh lại nút bấm (Chỉ cho phép Xác nhận/Khiếu nại khi đã thanh toán, đang giao hoặc đã giao xong).
  - **[PHIÊN 2026-07-12 (Responsive & Tables)]**
    - Đã fix toàn bộ lỗi hiển thị trên thiết bị di động.
    - Xây dựng thanh Navbar Responsive với Component Sheet (Hamburger menu).
    - Fix lỗi Table bị tràn viền (overflow) bằng cách set min-w và overflow-x-auto cho toàn bộ trang Seller và Admin.
  - **[Các tính năng Anti-abuse & AI đã hoàn thiện]**
    - Đã triển khai AI Gợi ý sản phẩm (Recommendation) dựa trên lịch sử duyệt web.
    - Đã thiết lập tính năng Xác thực SĐT / Cọc tiền chống phá giá phòng Đấu giá.
    - Hoàn thành cơ chế chống spam/lạm dụng số lượng sử dụng Voucher.
    - Triển khai thành công Skeleton Loading và Global Search (Cmd+K).
  - **[PHIÊN 2026-07-12 (Fintech Security)]**
    - Kiểm tra và đảm bảo 100% không có lỗ hổng IDOR trong các luồng Thanh toán, Rút tiền và Hủy đơn.
    - Cấu hình @Transactional Rollback cho mọi giao dịch Ví điện tử (Escrow).
    - Tích hợp thành công **Bucket4j** Rate Limiting (50 req/phút/IP) bảo vệ các Endpoint nhạy cảm (Auth, Wallet, Orders) khỏi tấn công DDoS và Brute-force.
    - Kích hoạt phòng thủ CSRF bằng `CookieCsrfTokenRepository.withHttpOnlyFalse()` và thiết lập `CsrfCookieFilter` buộc trình duyệt gửi kèm `X-XSRF-TOKEN` trên các request thay đổi trạng thái hệ thống. 
    - Đã ngăn chặn XSS/CSRF rủi ro cao ở mức tối đa mà không làm phá vỡ logic Stateless của dự án.
  - **[PHIÊN 2026-07-14 (Audit Log & Error Handling)]**
    - Xây dựng hệ thống **Audit Log** toàn diện: Entity `AuditLog`, Repository, Service (`@Async` không blocking), Controller `GET /api/v1/admin/audit-logs`.
    - Tích hợp audit vào 5 hành động admin quan trọng: Duyệt/Từ chối rút tiền, Điều chỉnh số dư, Xóa sản phẩm vi phạm, Phán quyết khiếu nại.
    - Xây dựng trang Frontend `/admin/audit-logs` với filter theo loại action, search full-text, phân trang, badge màu theo severity.
    - Nâng cấp `GlobalExceptionHandler`: từ 4 handler trả `String` thô → 14 handler trả **JSON object chuẩn** `{timestamp, status, error, message, fieldErrors?}`.
    - Refactor `extractError()` và thêm `extractFieldErrors()` trong `utils.ts` làm source of truth duy nhất cho toàn FE.
    - Fix toàn bộ các file đang dùng pattern `typeof error.response?.data === 'string'` (8 files).
  - **[PHIÊN 2026-07-20 (Wishlist & Marketing Tracking)]**
    - Hoàn thiện luồng Danh sách Yêu thích (Wishlist). Xử lý ẩn nút thả tim đối với sản phẩm do chính current user đăng bán. Thêm bộ lọc khoảng giá (Min-Max) vào trang Khám phá.
    - Xây dựng **Announcement Banner** và **Cookie Consent** (tuân thủ luật quyền riêng tư) với Framer Motion mượt mà.
    - Chỉnh sửa luồng AI Recommendation & View History Backend (`ProductService`): Chỉ lưu lịch sử xem sản phẩm khi Header `X-Cookie-Consent: accepted` được truyền từ Frontend.
    - Tích hợp hạ tầng Google Analytics (GA4) và Facebook Pixel qua Component `AnalyticsManager.tsx` gắn ở tầng `layout.tsx`, chỉ trigger load script sau khi người dùng chấp nhận Cookie.
    - Sửa lỗi cảnh báo JSON serialization `PageImpl` của Spring Boot 3.3.x bằng annotation `@EnableSpringDataWebSupport(pageSerializationMode = VIA_DTO)` tại root class.
  - **[PHIÊN 2026-07-20 (Live Commerce & TikTok-style Feed)]**
    - **Floating Live Widget:** Đã xây dựng tính năng Picture-in-Picture thu nhỏ video phòng Live ở góc phải màn hình, giúp người dùng vừa xem Live vừa lướt web (bỏ qua khi đang ở trang Live/Đấu giá). Widget có hiệu ứng Hover, nút "Vào xem ngay" và hiện giá đấu theo Real-time (sử dụng `agora-rtc-react` và Socket).
    - **TikTok-Style Live Feed:** Đã hoàn thành trang `/live` giúp lướt các phòng đấu giá bằng thao tác cuộn (Snap Scroll). Tích hợp thuật toán Intersection Observer để tối ưu hiệu năng: chỉ load Video/Chat/Websocket cho phòng Live chiếm >60% màn hình, các phòng bị khuất sẽ tạm ngưng.
    - **Live Bugfixes:** Fix lỗi hiển thị giá 0đ khi chưa có người trả giá bằng cách trả thêm field `currentPrice` trong DTO, fix lỗi 400 truyền sai ProductID và xử lý cảnh báo Hydration SSR của `agora-rtc-react` và `next-themes`.
  - **[PHIÊN 2026-07-24 (Admin UI & Clean Architecture)]**
    - Refactor kiến trúc Backend theo Clean Architecture: bóc tách các file service lớn (`ProductService`) thành các domain layer chuyên biệt, xử lý triệt để lỗi dependency injection (`SystemConfigService`) và config các enum (`ProductStatus.BANNED`).
    - Nâng cấp và đồng bộ UI toàn bộ các trang Admin (Reports, Withdrawals, Categories, Orders, Disputes) theo phong cách Glassmorphism chuyên nghiệp, bo góc mềm mại và đính kèm bộ đếm Real-time.
    - Đại tu Admin Dashboard: Thêm Component Giao dịch gần đây (Recent Orders), sửa lỗi UI Header bị che khuất và thêm Entrance Animations.
    - Cập nhật interface `PageResponse<T>` để hỗ trợ Native JSON Pagination format của Spring Boot 3.3 (nằm trong object `page`), loại bỏ hoàn toàn các đoạn code ép kiểu `(data as any)` nguy hiểm trên Frontend.
  - **[PHIÊN 2026-07-24 (Performance & Bugfix)]**
    - Sửa lỗi Login form bị "treo" (pending) khi gửi Email OTP: JavaMailSender gửi mail đồng bộ (Synchronous) gây block main thread khi kết nối SMTP bị chậm. Giải quyết triệt để bằng cách áp dụng cơ chế Asynchronous (`@EnableAsync`, `@Async` trong `EmailService`), giúp UI chuyển màn hình tức thời trong khi mail được gửi ngầm.
    - Cập nhật lại UI màn hình đăng nhập Admin: fix lỗi màu chữ tiêu đề bị trùng màu nền (hiển thị màu đen trên nền đen) ở chế độ Light Mode.
  - **[PHIÊN 2026-07-24 (Chat UI, Block User & Seller Layout)]**
    - **Nâng cấp Chat UI:** Tinh chỉnh bong bóng chat (message bubbles) bo góc tròn mềm mại có 'đuôi' (tails) theo chuẩn iMessage/Messenger, tối ưu khoảng cách tin nhắn, sửa thanh Header chat thực tế hơn. Tích hợp tính năng Upload Ảnh vào Chat (Upload qua Cloudinary) và hiển thị modal xem ảnh.
    - **Tính năng Chặn Người Dùng (Block User):** Backend xây dựng luồng chặn (Entity `BlockedUser`, check blocked list để drop tin nhắn gửi đi). Frontend tích hợp Component `ConfirmDialog` và Dropdown Header Chat để Chặn/Bỏ chặn, tự động ẩn khung gõ khi bị chặn.
    - **Typing Indicator (WebSockets):** Bắt sự kiện gõ phím (`handleTyping`), debounce và gửi STOMP message qua kênh `/topic/typing`, xử lý UI dấu 3 chấm nhấp nháy 3D bằng Framer Motion mượt mà. Đã fix lỗi Infinite Re-render vòng lặp vô tận bằng `useCallback` do hàm `handleTyping` tạo mới liên tục.
    - **Hạ tầng Kênh Người Bán (Seller Dashboard):** Xây dựng Layout chung (`seller/layout.tsx`) và `SellerSidebar.tsx` gom tất cả các tính năng của người bán (Thống kê, Đơn bán, Sản phẩm, Mã giảm giá) vào một Dashboard thống nhất chuyên nghiệp thay vì để dropdown lộn xộn trên Header.

### 🏆 Đã hoàn thành 100% mục tiêu Đồ Án! 
Hệ thống hiện tại đã sở hữu đủ các chức năng phức tạp của một sàn TMĐT đấu giá chuyên nghiệp, đồng thời được gia cố bảo mật kỹ càng.

---

## 5. Hạ Tầng Admin Panel (Admin Infrastructure) – Cập nhật phiên 2026-07-05

### Kiến Trúc Routing Admin

| Route | Vai trò | Ghi chú |
|---|---|---|
| `/admin/login` | Trang đăng nhập Admin độc lập | Không có Sidebar; chỉ tài khoản ROLE=ADMIN mới vào được |
| `/admin` | Dashboard tổng quan | Hiển thị: Tổng Users, Tổng Orders, Pending Withdrawals, Tổng Escrow đang giữ |
| `/admin/users` | Quản lý người dùng | Chỉ hiển thị User (ẩn Admin), có nút Khóa/Kích hoạt (UI) |
| `/admin/orders` | Quản lý đơn hàng toàn hệ thống | Xem trạng thái, bộ lọc theo page |
| `/admin/withdrawals` | Duyệt lệnh rút tiền | Approve / Reject |
| `/admin/disputes` | Xử lý khiếu nại | Phán quyết hoàn tiền / chuyển tiền cho Seller |
| `/admin/categories` | Quản lý danh mục sản phẩm | CRUD Category |
| `/admin/audit-logs` | Xem audit log hệ thống | Filter theo action type, search, phân trang |

### Cấu trúc Component Admin (Frontend)
```
src/components/admin/
├── AdminSidebar.tsx   – Sidebar cố định bên trái, light mode, active state dùng text-primary
├── AdminHeader.tsx    – Header cố định bên trên, có Search, Bell, Avatar, Logout
└── AdminFooter.tsx    – Footer copyright đơn giản
```

### Layout Pattern (layout.tsx)
- Dùng `h-screen overflow-hidden` ở root để toàn trang không scroll.
- Dùng `flex-1 overflow-y-auto` ở `<main>` để **chỉ vùng nội dung cuộn**, sidebar và header đứng yên.
- Route `/admin/login` được render riêng, không có Sidebar/Header.
- Auth Guard: Nếu chưa đăng nhập → redirect về `/admin/login`. Nếu đã đăng nhập nhưng role không phải ADMIN → redirect về `/`.

### Quy Chuẩn UI Admin
- **Theme:** Light mode hoàn toàn (`bg-white`, `border-neutral-100`), nhất quán với giao diện User.
- **Active state Sidebar:** `bg-primary/10 text-primary font-bold` (không dùng nền tối).
- **Table không có scrollbar ngang:** Dùng `table-fixed` + `<colgroup>` để chia tỉ lệ cột cố định, không dùng `overflow-x-auto`.
- **DropdownMenu:** Dùng `@base-ui/react` (không phải Radix), `DropdownMenuTrigger` **không hỗ trợ prop `asChild`**. Phải style trực tiếp bằng `className`.

### API Mới Thêm (Backend)

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/v1/admin/withdrawals/total-escrow` | Trả về tổng `heldBalance` của toàn hệ thống |
| GET | `/api/v1/users?page=&size=` | Chỉ trả về User (role ≠ ADMIN), dùng `findByRoleNot(Role.ADMIN, pageable)` |
| GET | `/api/v1/admin/audit-logs?page=&size=&search=&action=` | Lấy audit log, filter theo action type |

### Audit Log – Kiến Trúc
- **Entity:** `features/admin/entity/AuditLog.java` – có 3 index DB: `actor_username`, `action`, `created_at`.
- **Service:** `AuditLogService.log(...)` được annotate `@Async` → ghi log **không block** request chính.
- **Tích hợp:** Inject `AuditLogService` vào Controller, gọi sau khi action thành công.
- **Action types đã track:** `DELETE_PRODUCT`, `APPROVE_WITHDRAWAL`, `REJECT_WITHDRAWAL`, `ADJUST_BALANCE`, `RESOLVE_DISPUTE`.
- Để thêm action mới: gọi `auditLogService.log(actor, "ACTION_NAME", targetType, targetId, targetLabel, detail, ipAddress)`.

### Luồng Đăng Nhập Admin
1. Truy cập `/admin/login` → Form Email/Password.
2. Gọi API login, nếu role trả về **không phải ADMIN** → toast lỗi, dừng.
3. Nếu ADMIN → `login(data)` → `AuthContext` redirect về `/admin`.
4. `AuthContext` có guard: bất kỳ user ADMIN nào cố truy cập `/` hoặc `/products` đều bị redirect ngược về `/admin`.

---

## 6. Error Handling Convention (Cập nhật 2026-07-14)

### Backend – GlobalExceptionHandler
- Tất cả exception được xử lý tập trung tại `core/exception/GlobalExceptionHandler.java`.
- **Response format chuẩn:** JSON object `{ timestamp, status, error, message }`. Validation error có thêm `fieldErrors: Record<field, message>`.
- HTTP Status mapping: `400` (RuntimeException, IllegalArgument, validation), `401` (BadCredentials), `403` (AccessDenied, Disabled, Locked), `404` (NotFound), `405` (MethodNotAllowed), `409` (IllegalState / Conflict), `413` (MaxUploadSize), `500` (generic Exception).

### Frontend – extractError
- **Source of truth duy nhất:** `src/lib/utils.ts` → `extractError(error, defaultMsg)` và `extractFieldErrors(error)`.
- **Không bao giờ** tự parse `error.response?.data` trực tiếp hoặc dùng `typeof data === 'string'` check.
- `extractError` ưu tiên theo thứ tự: `fieldErrors[0]` → `data.message` → `data.error` → `error.message` → defaultMsg.
- `extractFieldErrors` trả về `Record<string, string>` để map lỗi từng field lên form UI (dùng khi FE cần hiển thị lỗi field-level từ BE `@Valid`).

---

## 7. Kiến Trúc Scaling Database (Tham khảo)

> Phần này ghi lại các pattern scaling để tham khảo khi hệ thống lớn dần.

### Giai đoạn hiện tại (Đồ án)
- Single PostgreSQL (Neon). Đủ cho traffic đồ án.
- Audit Log dùng cùng DB với index tối ưu (`actor_username`, `action`, `created_at`).

### Pattern A – Read Replica + PgBouncer (Production nhỏ)
- **Primary DB:** nhận toàn bộ WRITE (INSERT/UPDATE/DELETE).
- **Replica DB:** nhận READ-only queries (dashboard, analytics, search).
- **PgBouncer** = proxy trung chuyển: route request đọc sang Replica, ghi sang Primary.
- Spring Boot: dùng `@Transactional(readOnly = true)` để phân biệt, kết hợp `AbstractRoutingDataSource`.

### Pattern B – CQRS (Production trung)
- **Write Side:** API → Command Handler → PostgreSQL (Source of Truth).
- **Read Side:** Kafka Consumer feed data vào Elasticsearch / Redis.
- Dashboard và search query đọc từ Elasticsearch (nhanh hơn nhiều, không tải DB chính).

### Pattern C – Sharding (Scale lớn, hàng trăm GB)
- Dùng **Citus** (extension PostgreSQL) hoặc **Vitess** (MySQL).
- Sharding key thường là `user_id` hoặc `created_at`.
- Có một Shard Router làm trạm trung chuyển, app chỉ nói chuyện với Router.
