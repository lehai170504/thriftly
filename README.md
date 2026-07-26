# ThriftSwap 🚀

ThriftSwap là nền tảng Thương mại điện tử Thời trang Vintage & Đồ cũ (Second-hand) cao cấp kết hợp **Đấu giá thời gian thực (Real-time Auction)**, **Thanh toán đảm bảo (Escrow Payment)**, và **Mua sắm Trực tiếp (Live Commerce)**. Dự án giải quyết triệt để vấn nạn lừa đảo, "bom hàng", và ép giá trong thị trường mua bán đồ cũ truyền thống tại Việt Nam, mang lại một trải nghiệm Luxury Vibe đích thực.

## 🌟 Tính năng nổi bật

1. **Đấu Giá Thời Gian Thực (WebSocket & Agora):**
   - Phòng đấu giá live đếm ngược, cập nhật giá thầu ngay lập tức qua WebSocket không cần tải lại trang. Tự động chốt đơn khi hết giờ.
   - Tích hợp **Agora RTC** cho luồng Video Live Streaming siêu mượt với trải nghiệm Split-screen hiện đại, có cả Floating Widget xem dạng Picture-in-Picture.

2. **Thanh Toán Đảm Bảo (Escrow) & Fintech:**
   - Tích hợp cổng thanh toán thực tế **PayOS**.
   - Cơ chế Escrow: Tiền người mua nạp vào Ví sẽ được hệ thống "Tạm giữ (Hold)" khi thanh toán đơn hàng, và chỉ "Giải phóng (Release)" cho người bán khi giao hàng thành công.
   - Tích hợp **Bucket4j Rate Limiting** và hệ thống chống **CSRF/IDOR** cấp độ ngân hàng.

3. **Chat 1-1 Real-time (Messenger Style):**
   - Hệ thống chat qua **STOMP WebSocket**. Hỗ trợ Read Receipts (Đã xem/Đã gửi), Typing Indicator (Đang gõ...), xoá tin nhắn một chiều (Soft Delete), và Gửi ảnh qua Cloudinary.

4. **Trải nghiệm Giao diện Cao cấp (Luxury Vibe):**
   - **Framer Motion Animations:** Hiệu ứng Scroll Reveal, Staggered Domino, Ken Burns mượt mà.
   - **Glassmorphism:** Hiệu ứng kính mờ xuyên thấu tinh tế.
   - **Typography:** Tối ưu hóa 100% tiếng Việt với font chữ `Be Vietnam Pro`.
   - **Thiết kế:** Dark Mode Pro Max, Bento Box (Apple-esque), hoàn toàn Responsive.

5. **AI Generative & Trí tuệ Nhân tạo:**
   - Tích hợp **Meta LLaMA 3.1** (thông qua Groq API) siêu tốc để Phân tích & Gợi ý giá thầu, Viết mô tả sản phẩm tự động chuẩn SEO.

6. **Logistics & Admin Panel Toàn Diện:**
   - Tích hợp **Giao Hàng Nhanh (GHN) API & Webhooks** tự động cập nhật trạng thái đơn hàng.
   - Bảng điều khiển Admin theo dõi dòng tiền, duyệt rút tiền, xử lý khiếu nại với hệ thống Audit Logs toàn diện.

## 🛠 Tech Stack

### 🖥 Frontend (Next.js)
- **Framework:** Next.js 15 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS v4, shadcn/ui, Lucide Icons
- **State/API:** React Query, Zustand, Axios (với JWT Interceptors)
- **Real-time:** SockJS & StompJS, Agora RTC React SDK, Framer Motion

### ⚙️ Backend (Spring Boot)
- **Framework:** Spring Boot 3.3.x, Java 17, Clean Architecture
- **Database:** PostgreSQL (Spring Data JPA, Hibernate)
- **Security:** Spring Security 6, JWT (Refresh/Access Tokens), Bucket4j, CSRF Cookie
- **Real-time & AI:** Spring WebSocket + STOMP, Groq API (LLaMA 3)
- **Concurrency:** Pessimistic Locking chống lỗi mua trùng đơn hàng (Double-buy).

## 🚀 Hướng dẫn chạy dự án

### 1. Khởi động Backend (Spring Boot)
Yêu cầu: Java 17+, PostgreSQL đang chạy ở port 5432.
Tạo database `thrift_auction` trên PostgreSQL.
```bash
cd backend
./mvnw clean spring-boot:run
```
Backend sẽ chạy ở `http://localhost:8081`.

### 2. Khởi động Frontend (Next.js)
Yêu cầu: Node.js 18+
```bash
cd frontend
npm install
npm run dev
```
Frontend sẽ chạy ở `http://localhost:3000`.

## 📁 Cấu trúc thư mục chính
- `/backend`: Mã nguồn Spring Boot theo mô hình Domain-driven/Clean Architecture (API, Entities, Services, WebSocket Config).
- `/frontend`: Mã nguồn Next.js UI (App Router, Components, Hooks, API Clients, Contexts).
- `/docs`: Tài liệu kỹ thuật, AI Context để duy trì logic dự án (`AI_KNOWLEDGE_BASE.md`).

## 🛡️ License
Phát triển bởi cộng đồng ThriftSwap (2026). Đồ án tốt nghiệp / Dự án thực tế chất lượng cao.
