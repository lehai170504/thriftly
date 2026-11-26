'use client';

import { Search, Gavel, ShieldCheck, PackageCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Khám phá',
    description: 'Tìm kiếm những món đồ secondhand độc bản từ cộng đồng người bán trên toàn quốc.',
  },
  {
    number: '02',
    icon: Gavel,
    title: 'Đặt giá thầu',
    description: 'Tham gia các phiên đấu giá trực tiếp và cạnh tranh mức giá bạn mong muốn theo thời gian thực.',
  },
  {
    number: '03',
    icon: ShieldCheck,
    title: 'Thanh toán an toàn',
    description: 'Khoản thanh toán của bạn được giữ bảo vệ thông qua quy trình ký quỹ Escrow của nền tảng.',
  },
  {
    number: '04',
    icon: PackageCheck,
    title: 'Nhận món đồ của bạn',
    description: 'Kiểm tra hàng khi nhận, xác nhận hoàn tất đơn và tận hưởng món đồ mới tìm được.',
  },
];

const EDITORIAL_EASE = [0.22, 1, 0.36, 1] as const;

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-16 lg:py-24 bg-white dark:bg-card border-t border-[#E5E0D7] dark:border-border scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.45, ease: EDITORIAL_EASE }}
          className="max-w-2xl mb-12 lg:mb-16"
        >
          <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[#244C3A] dark:text-primary mb-3">
            Quy trình mua &amp; đấu giá
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-tight text-[#191919] dark:text-foreground leading-tight mb-4">
            Kho Báu Tiếp Theo Chỉ Cách Bạn Vài Bước.
          </h2>
          <p className="text-sm sm:text-base text-[#77736D] dark:text-muted-foreground leading-relaxed">
            Từ lúc tìm thấy món đồ ưng ý đến khi nhận hàng trên tay, mọi bước đều được thiết kế rõ ràng và minh bạch.
          </p>
        </motion.div>

        <div className="relative">
          <motion.div
            aria-hidden="true"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, ease: EDITORIAL_EASE }}
            style={{ originX: 0 }}
            className="hidden lg:block absolute top-7 left-[8%] right-[8%] h-px bg-[#E5E0D7] dark:bg-border z-0"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: index * 0.08, ease: EDITORIAL_EASE }}
                className="group relative flex lg:flex-col items-start gap-4 lg:gap-0 pl-2 lg:pl-0"
              >
                <div className="flex items-center gap-3 lg:mb-6 shrink-0">
                  <div className="size-14 rounded-2xl bg-[#F5F2EC] dark:bg-muted border border-[#E5E0D7] dark:border-border flex items-center justify-center text-[#244C3A] dark:text-primary shadow-surface transition-all duration-300 group-hover:-translate-y-1 group-hover:border-[#244C3A]/50 group-hover:bg-[#244C3A] group-hover:text-white dark:group-hover:bg-primary dark:group-hover:text-primary-foreground">
                    <step.icon className="w-6 h-6" />
                  </div>
                </div>

                <div>
                  <span className="inline-block font-numeric text-xs font-semibold tracking-[0.14em] text-[#244C3A] dark:text-primary mb-1.5">
                    {step.number}
                  </span>
                  <h3 className="text-lg font-semibold text-[#191919] dark:text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#77736D] dark:text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
