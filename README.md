# Thriftly

Thriftly is a premium vintage and second-hand fashion E-Commerce platform that integrates **Real-time Bidding (Auction)**, **Escrow Payment**, and **Live Commerce**. The project completely resolves the issues of scams, order cancellations, and price squeezing in the traditional second-hand market in Vietnam, delivering an authentic luxury shopping experience.

## Core Features

1. **Real-time Auction (WebSocket & Agora):**
   - Live auction rooms with countdowns and instant bid updates via WebSocket without page reloads. Automated order closing when the timer ends.
   - Integrated **Agora RTC** for ultra-smooth Live Video Streaming featuring a modern Split-screen layout and a Picture-in-Picture Floating Widget.

2. **Escrow Payment & Fintech:**
   - Integrated with the **PayOS** payment gateway.
   - Escrow mechanism: Funds deposited by the buyer are "Held" by the system upon payment and are only "Released" to the seller after successful delivery.
   - Integrated **Bucket4j Rate Limiting** and bank-grade **CSRF/IDOR** protection systems.

3. **1-to-1 Real-time Chat (Messenger Style):**
   - Built with **STOMP WebSocket**. Features include Read Receipts (Sent/Seen), Typing Indicators, One-way Message Deletion (Soft Delete), and Image Uploads via Cloudinary.

4. **Premium User Experience (Luxury Vibe):**
   - **Framer Motion Animations:** Smooth Scroll Reveal, Staggered Domino effects, and Ken Burns transitions.
   - **Glassmorphism:** Sophisticated frosted glass effects.
   - **Typography:** Fully optimized for Vietnamese with the `Be Vietnam Pro` font.
   - **Design:** Dark Mode Pro Max, Bento Box layout (Apple-esque), and fully responsive on all devices.

5. **Generative AI Integration:**
   - Powered by **Meta LLaMA 3.1** (via Groq API) for ultra-fast price analysis, automated bidding suggestions, and SEO-optimized product descriptions.

6. **Logistics & Comprehensive Admin Panel:**
   - Integrated with **Giao Hang Nhanh (GHN) API & Webhooks** for automated order status tracking.
   - Admin Dashboard to monitor cash flow, approve withdrawals, and resolve disputes backed by a comprehensive Audit Log system.

## Tech Stack

### Frontend (Next.js)
- **Framework:** Next.js 15 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS v4, shadcn/ui, Lucide Icons
- **State/API:** React Query, Zustand, Axios (with JWT Interceptors)
- **Real-time:** SockJS & StompJS, Agora RTC React SDK, Framer Motion

### Backend (Spring Boot)
- **Framework:** Spring Boot 3.3.x, Java 17, Clean Architecture
- **Database:** PostgreSQL (Spring Data JPA, Hibernate)
- **Security:** Spring Security 6, JWT (Refresh/Access Tokens), Bucket4j, CSRF Cookie
- **Real-time & AI:** Spring WebSocket + STOMP, Groq API (LLaMA 3)
- **Concurrency:** Pessimistic Locking to prevent double-buy conditions.

## Local Development Guide

### 1. Start the Backend (Spring Boot)
Prerequisites: Java 17+, PostgreSQL running on port 5432.
Create a database named `thrift_auction` in PostgreSQL.
```bash
cd backend
./mvnw clean spring-boot:run
```
The backend will be available at `http://localhost:8081`.

### 2. Start the Frontend (Next.js)
Prerequisites: Node.js 18+
```bash
cd frontend
npm install
npm run dev
```
The frontend will be available at `http://localhost:3000`.

## Project Structure
- `/backend`: Spring Boot API following Domain-driven/Clean Architecture (Controllers, Entities, Services, WebSocket Config).
- `/frontend`: Next.js UI source code (App Router, Components, Hooks, API Clients, Contexts).
- `/docs`: Technical documentation and AI Context (`AI_KNOWLEDGE_BASE.md`) to maintain project logic.

## License
Developed by the Thriftly community (2026). A high-quality graduation / practical project.
