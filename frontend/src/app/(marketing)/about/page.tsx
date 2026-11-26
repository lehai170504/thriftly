'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Handshake,
  Heart,
  RefreshCw,
  Shield,
  ShieldCheck,
  Target,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const EDITORIAL_EASE = [0.22, 1, 0.36, 1] as const;

const values = [
  {
    icon: Shield,
    title: 'An toàn ký quỹ',
    desc: 'Quy trình thanh toán Escrow giữ tiền trung gian cho đến khi bạn kiểm tra và xác nhận hài lòng với sản phẩm nhận được.',
  },
  {
    icon: RefreshCw,
    title: 'Phát triển bền vững',
    desc: 'Kéo dài vòng đời cho những món đồ chất lượng, giảm thiểu lãng phí và thúc đẩy thói quen tiêu dùng tuần hoàn.',
  },
  {
    icon: Handshake,
    title: 'Đấu giá công bằng',
    desc: 'Cơ chế đấu giá thời gian thực minh bạch từng lượt trả giá, giúp người mua và người bán gặp nhau ở mức giá hợp lý.',
  },
  {
    icon: Heart,
    title: 'Cộng đồng tin cậy',
    desc: 'Xây dựng môi trường trao đổi văn minh với hồ sơ người bán, đánh giá sau đơn hàng và cơ chế báo cáo vi phạm rõ ràng.',
  },
];

const milestones = [
  {
    year: '2023',
    title: 'Ý tưởng khởi nguồn',
    desc: 'Thriftly hình thành từ trăn trở về tình trạng thiếu minh bạch và rủi ro khi giao dịch đồ cũ trên các kênh tự phát.',
    icon: Target,
  },
  {
    year: '2024',
    title: 'Tích hợp quy trình Escrow',
    desc: 'Thiết kế luồng thanh toán trung gian giữ tiền theo trạng thái đơn hàng, bảo vệ đồng thời cả người mua và người bán.',
    icon: Shield,
  },
  {
    year: '2025',
    title: 'Đấu giá thời gian thực',
    desc: 'Ứng dụng kết nối WebSocket giúp cập nhật giá thầu tức thì, kết hợp phát sóng trực tiếp và trò chuyện ngay trên sàn.',
    icon: TrendingUp,
  },
  {
    year: '2026',
    title: 'Trải nghiệm tuyển chọn mới',
    desc: 'Hoàn thiện giao diện editorial tối giản, tối ưu trải nghiệm tìm kiếm, ví điện tử và quản lý đơn hàng liền mạch.',
    icon: Award,
  },
];

export default function AboutPage() {
  return (
    <div className="w-full bg-[#F5F2EC] dark:bg-background text-[#191919] dark:text-foreground">
      <section className="pt-8 pb-16 lg:pb-24 border-b border-[#E5E0D7] dark:border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-block mb-8">
            <Button
              variant="ghost"
              className="rounded-xl px-3 text-[#77736D] dark:text-muted-foreground hover:text-[#191919] dark:hover:text-foreground hover:bg-white/70 dark:hover:bg-accent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Về trang chủ
            </Button>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EDITORIAL_EASE }}
              className="lg:col-span-7"
            >
              <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[#244C3A] dark:text-primary mb-4">
                Tầm nhìn &amp; Sứ mệnh
              </p>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.12] mb-6">
                Tái sinh giá trị.{' '}
                <span className="block italic font-normal text-[#244C3A] dark:text-primary mt-1">
                  Kết nối cộng đồng.
                </span>
              </h1>
              <p className="text-base sm:text-lg text-[#77736D] dark:text-muted-foreground leading-relaxed max-w-2xl mb-8">
                Chúng tôi tin rằng mỗi món đồ đều mang một câu chuyện riêng và xứng đáng có cơ hội thứ hai. Thriftly ra đời để biến việc mua bán đồ secondhand và đấu giá trực tuyến trở nên minh bạch, an toàn và tinh tế hơn.
              </p>
              <div className="flex flex-wrap gap-3.5">
                <Link href="/products">
                  <Button
                    size="lg"
                    className="h-12 px-7 rounded-xl bg-[#244C3A] hover:bg-[#1D3E2F] text-white dark:bg-primary dark:text-primary-foreground font-medium group transition-all duration-200 active:scale-[0.98]"
                  >
                    Khám phá sàn giao dịch
                    <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/escrow">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 px-7 rounded-xl border-[#E5E0D7] dark:border-border bg-white dark:bg-card text-[#191919] dark:text-foreground hover:bg-[#E5E0D7]/40 dark:hover:bg-accent font-medium"
                  >
                    Tìm hiểu Escrow
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.55, delay: 0.1, ease: EDITORIAL_EASE }}
              className="lg:col-span-5 relative"
            >
              <div className="rounded-2xl bg-white dark:bg-card border border-[#E5E0D7] dark:border-border p-3 shadow-elevated">
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[#E5E0D7]/30 dark:bg-muted">
                  <img
                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=900"
                    alt="Không gian thời trang tuyển chọn tại Thriftly"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-3 absolute -left-6 bottom-8 rounded-xl bg-white dark:bg-card border border-[#E5E0D7] dark:border-border px-4 py-3 shadow-elevated animate-float-slow">
                <div className="size-9 rounded-lg bg-[#244C3A]/10 dark:bg-primary/15 text-[#244C3A] dark:text-primary flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#191919] dark:text-foreground">Bảo vệ Escrow</p>
                  <p className="text-[11px] text-[#77736D] dark:text-muted-foreground">Giao dịch trung gian an toàn</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-white dark:bg-card border-b border-[#E5E0D7] dark:border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45, ease: EDITORIAL_EASE }}
            className="max-w-2xl mb-12"
          >
            <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[#244C3A] dark:text-primary mb-3">
              Nguyên tắc hoạt động
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
              Giá Trị Cốt Lõi
            </h2>
            <p className="text-sm sm:text-base text-[#77736D] dark:text-muted-foreground leading-relaxed">
              Những nền tảng định hình cách Thriftly thiết kế sản phẩm và bảo vệ trải nghiệm của từng thành viên.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.4, delay: i * 0.06, ease: EDITORIAL_EASE }}
                className="editorial-card rounded-2xl bg-[#F5F2EC] dark:bg-muted/40 border border-[#E5E0D7] dark:border-border p-6"
              >
                <div className="size-11 rounded-xl bg-white dark:bg-card border border-[#E5E0D7] dark:border-border flex items-center justify-center text-[#244C3A] dark:text-primary mb-5 shadow-surface">
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-[#77736D] dark:text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-[#F5F2EC] dark:bg-background border-b border-[#E5E0D7] dark:border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, ease: EDITORIAL_EASE }}
              className="lg:col-span-6 space-y-5"
            >
              <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[#244C3A] dark:text-primary">
                Câu chuyện của Thriftly
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
                Định Hình Lại Cách Giao Dịch Đồ Cũ
              </h2>
              <p className="text-sm sm:text-base text-[#77736D] dark:text-muted-foreground leading-relaxed">
                Thriftly bắt đầu từ một câu hỏi đơn giản: làm thế nào để những món đồ còn giá trị sử dụng được chuyển giao văn minh, không còn nỗi lo lừa đảo hay bom hàng?
              </p>
              <p className="text-sm sm:text-base text-[#77736D] dark:text-muted-foreground leading-relaxed">
                Bằng cách kết hợp quy trình{' '}
                <strong className="font-semibold text-[#191919] dark:text-foreground">thanh toán ký quỹ Escrow</strong>{' '}
                và{' '}
                <strong className="font-semibold text-[#191919] dark:text-foreground">đấu giá thời gian thực</strong>
                , Thriftly mang lại cấu trúc rõ ràng cho mọi giao dịch giữa người mua và người bán.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                <div className="rounded-2xl bg-white dark:bg-card border border-[#E5E0D7] dark:border-border p-4">
                  <p className="text-xs uppercase tracking-[0.12em] text-[#77736D] dark:text-muted-foreground font-semibold mb-1">
                    Thanh toán
                  </p>
                  <p className="text-sm font-semibold">Ví Thriftly &amp; PayOS tích hợp</p>
                </div>
                <div className="rounded-2xl bg-white dark:bg-card border border-[#E5E0D7] dark:border-border p-4">
                  <p className="text-xs uppercase tracking-[0.12em] text-[#77736D] dark:text-muted-foreground font-semibold mb-1">
                    Tương tác
                  </p>
                  <p className="text-sm font-semibold">Chat trực tiếp &amp; Đấu giá Live</p>
                </div>
              </div>
            </motion.div>

            <div className="lg:col-span-6 grid grid-cols-2 gap-4 sm:gap-5">
              <div className="pt-8">
                <div className="rounded-2xl overflow-hidden border border-[#E5E0D7] dark:border-border bg-white dark:bg-card p-2 shadow-surface">
                  <div className="aspect-[4/5] overflow-hidden rounded-xl">
                    <img
                      src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=700"
                      alt="Đóng gói sản phẩm cẩn thận"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
              <div>
                <div className="rounded-2xl overflow-hidden border border-[#E5E0D7] dark:border-border bg-white dark:bg-card p-2 shadow-surface">
                  <div className="aspect-[4/5] overflow-hidden rounded-xl">
                    <img
                      src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=700"
                      alt="Thời trang bền vững"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-white dark:bg-card border-b border-[#E5E0D7] dark:border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[#244C3A] dark:text-primary mb-3">
              Cột mốc phát triển
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
              Hành Trình Của Thriftly
            </h2>
            <p className="text-sm sm:text-base text-[#77736D] dark:text-muted-foreground">
              Từng bước xây dựng hạ tầng giao dịch đồ cũ an toàn và hiện đại.
            </p>
          </div>

          <div className="divide-y divide-[#E5E0D7] dark:divide-border border-y border-[#E5E0D7] dark:border-border">
            {milestones.map((item, index) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.35, delay: index * 0.06, ease: EDITORIAL_EASE }}
                className="py-7 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8"
              >
                <div className="flex items-center gap-4 sm:w-44 shrink-0">
                  <div className="size-11 rounded-xl bg-[#F5F2EC] dark:bg-muted border border-[#E5E0D7] dark:border-border flex items-center justify-center text-[#244C3A] dark:text-primary shrink-0">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="font-numeric text-xl font-bold text-[#244C3A] dark:text-primary">
                    {item.year}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-[#77736D] dark:text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-[#F5F2EC] dark:bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-[#244C3A] dark:bg-card text-white dark:text-foreground border border-[#244C3A] dark:border-border px-6 py-12 sm:px-12 sm:py-16 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
                Sẵn Sàng Khám Phá Thriftly?
              </h2>
              <p className="text-sm sm:text-base text-white/80 dark:text-muted-foreground mb-8 leading-relaxed">
                Tìm kiếm món đồ bạn yêu thích hoặc bắt đầu đăng bán những món đồ xứng đáng có chủ nhân mới.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3.5">
                <Link href="/products">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto h-12 px-7 rounded-xl bg-white text-[#191919] hover:bg-[#F5F2EC] dark:bg-primary dark:text-primary-foreground font-medium group"
                  >
                    Khám phá ngay
                    <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/help">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto h-12 px-7 rounded-xl border-white/30 bg-transparent text-white hover:bg-white/10 dark:border-border dark:text-foreground dark:hover:bg-accent font-medium"
                  >
                    Trung tâm trợ giúp
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
