'use client';

import { MessageSquare, Radio, ShieldAlert, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

const capabilities = [
  {
    icon: Radio,
    eyebrow: 'Đấu giá & Phát sóng',
    title: 'Cập nhật giá thầu thời gian thực',
    description:
      'Phòng đấu giá đồng bộ trạng thái tức thì qua WebSocket, hỗ trợ theo dõi trực tiếp và đặt giá nhanh chóng.',
  },
  {
    icon: Wallet,
    eyebrow: 'Ví & Ký quỹ',
    title: 'Quản lý dòng tiền ngay trên nền tảng',
    description:
      'Theo dõi số dư ví, lịch sử giao dịch, khoản tiền đang tạm giữ Escrow và trạng thái giải ngân rõ ràng.',
  },
  {
    icon: MessageSquare,
    eyebrow: 'Kết nối trực tiếp',
    title: 'Trao đổi với người bán trước khi mua',
    description:
      'Hộp thoại trò chuyện tích hợp giúp bạn hỏi thêm về tình trạng thực tế, kích thước và thỏa thuận giao nhận.',
  },
  {
    icon: ShieldAlert,
    eyebrow: 'Hậu mãi & Minh bạch',
    title: 'Đánh giá người bán và báo cáo vi phạm',
    description:
      'Sau mỗi đơn hàng hoàn tất, người mua có thể để lại đánh giá công khai hoặc gửi báo cáo khi phát sinh sai phạm.',
  },
];

const EDITORIAL_EASE = [0.22, 1, 0.36, 1] as const;

export function PlatformHighlights() {
  return (
    <section className="py-16 lg:py-24 bg-white dark:bg-card border-t border-[#E5E0D7] dark:border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.45, ease: EDITORIAL_EASE }}
          className="max-w-2xl mb-12"
        >
          <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[#244C3A] dark:text-primary mb-3">
            Trải nghiệm thực tế
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#191919] dark:text-foreground leading-tight mb-4">
            Được Xây Dựng Để Mỗi Giao Dịch Đều Rõ Ràng.
          </h2>
          <p className="text-sm sm:text-base text-[#77736D] dark:text-muted-foreground leading-relaxed">
            Mọi công cụ cần thiết cho việc mua, bán và đấu giá đồ secondhand đều được tích hợp liền mạch trong một nền tảng thống nhất.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {capabilities.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.4, delay: index * 0.06, ease: EDITORIAL_EASE }}
              className="group editorial-card flex flex-col justify-between rounded-2xl bg-[#F5F2EC] dark:bg-muted/40 border border-[#E5E0D7] dark:border-border p-6 hover:border-[#244C3A]/40 dark:hover:border-primary/40 hover:shadow-elevated"
            >
              <div>
                <div className="size-11 rounded-xl bg-white dark:bg-card border border-[#E5E0D7] dark:border-border flex items-center justify-center text-[#244C3A] dark:text-primary mb-5 shadow-surface transition-transform duration-200 group-hover:-translate-y-0.5">
                  <item.icon className="w-5 h-5" />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#77736D] dark:text-muted-foreground mb-2">
                  {item.eyebrow}
                </p>
                <h3 className="text-base font-semibold text-[#191919] dark:text-foreground mb-2.5">
                  {item.title}
                </h3>
                <p className="text-sm text-[#77736D] dark:text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
