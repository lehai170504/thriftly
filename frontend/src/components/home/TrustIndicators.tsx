'use client';

import { ShieldCheck, Gavel, Eye, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';

const indicators = [
  {
    icon: ShieldCheck,
    title: 'Giao dịch ký quỹ an toàn',
    description: 'Tiền thanh toán được tạm giữ trong hệ thống Escrow cho đến khi bạn xác nhận nhận hàng.',
  },
  {
    icon: Gavel,
    title: 'Đấu giá thời gian thực',
    description: 'Giá thầu cập nhật tức thì qua kết nối trực tiếp, minh bạch từng lượt trả giá.',
  },
  {
    icon: Eye,
    title: 'Thông tin minh bạch',
    description: 'Tình trạng món đồ, hình ảnh thực tế và hồ sơ người bán được hiển thị rõ ràng.',
  },
  {
    icon: Leaf,
    title: 'Mua sắm bền vững',
    description: 'Trao vòng đời thứ hai cho những món đồ chất lượng, giảm thiểu lãng phí tiêu dùng.',
  },
];

export function TrustIndicators() {
  return (
    <section
      aria-label="Giá trị cốt lõi của Thriftly"
      className="w-full bg-white dark:bg-card border-y border-[#E5E0D7] dark:border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {indicators.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.35, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="group flex items-start gap-3.5"
            >
              <div className="size-10 rounded-xl bg-[#F5F2EC] dark:bg-muted border border-[#E5E0D7] dark:border-border flex items-center justify-center text-[#244C3A] dark:text-primary shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5">
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#191919] dark:text-foreground mb-1">
                  {item.title}
                </h2>
                <p className="text-xs sm:text-sm text-[#77736D] dark:text-muted-foreground leading-relaxed">
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
