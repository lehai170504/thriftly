'use client';

import { motion } from 'framer-motion';

const EDITORIAL_STILL_LIFE =
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80';

const EDITORIAL_EASE = [0.22, 1, 0.36, 1] as const;

const advantages = [
  {
    index: '01',
    title: 'Đấu giá thời gian thực kịch tính',
    description:
      'Theo dõi biến động giá thầu từng giây qua kết nối trực tiếp, đặt giá tự tin và nhận thông báo ngay khi có lượt trả giá mới.',
  },
  {
    index: '02',
    title: 'Giao dịch ký quỹ Escrow minh bạch',
    description:
      'Khoản thanh toán được tạm giữ an toàn trên hệ thống trung gian cho đến khi người mua xác nhận đã nhận sản phẩm đúng mô tả.',
  },
  {
    index: '03',
    title: 'Những món đồ secondhand độc bản',
    description:
      'Từ áo khoác vintage, máy ảnh film đến đồ sưu tầm hiếm có — mỗi sản phẩm đều mang dấu ấn riêng không đại trà.',
  },
  {
    index: '04',
    title: 'Mua sắm bền vững, có trách nhiệm',
    description:
      'Kéo dài vòng đời của những món đồ còn giá trị sử dụng, giảm rác thải tiêu dùng và tối ưu chi phí cho người mua.',
  },
  {
    index: '05',
    title: 'Cộng đồng trao đổi trực tiếp',
    description:
      'Trò chuyện trực tiếp với người bán để hỏi chi tiết tình trạng, theo dõi đánh giá thực tế và giao dịch thuận tiện.',
  },
];

export function WhyThriftly() {
  return (
    <section className="py-16 lg:py-24 bg-[#F5F2EC] dark:bg-background border-t border-[#E5E0D7] dark:border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45, ease: EDITORIAL_EASE }}
            className="lg:col-span-5 lg:sticky lg:top-28"
          >
            <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[#244C3A] dark:text-primary mb-3">
              Vì sao chọn Thriftly
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-tight text-[#191919] dark:text-foreground leading-tight mb-4">
              Hơn Cả Mua Sắm. Một Cách Giao Dịch Tốt Hơn.
            </h2>
            <p className="text-sm sm:text-base text-[#77736D] dark:text-muted-foreground leading-relaxed mb-8">
              Thriftly kết hợp sự tinh tế của sàn thời trang tuyển chọn với công nghệ đấu giá trực tiếp và cơ chế bảo vệ dòng tiền Escrow.
            </p>

            <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[#E5E0D7] dark:border-border bg-white dark:bg-card p-2 shadow-surface">
              <div className="relative h-full w-full overflow-hidden rounded-xl">
                <img
                  src={EDITORIAL_STILL_LIFE}
                  alt="Không gian tuyển chọn sản phẩm secondhand tại Thriftly"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
              </div>
            </div>
          </motion.div>

          <div className="lg:col-span-7 divide-y divide-[#E5E0D7] dark:divide-border border-y border-[#E5E0D7] dark:border-border">
            {advantages.map((item, idx) => (
              <motion.div
                key={item.index}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.35, delay: idx * 0.05, ease: EDITORIAL_EASE }}
                className="group py-6 sm:py-7 px-3 -mx-3 rounded-xl flex items-start gap-5 sm:gap-7 transition-colors duration-200 hover:bg-white/70 dark:hover:bg-card/50"
              >
                <span className="font-numeric text-xs font-semibold tracking-[0.14em] text-[#244C3A] dark:text-primary pt-1 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5">
                  {item.index}
                </span>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-[#191919] dark:text-foreground mb-2 transition-colors group-hover:text-[#244C3A] dark:group-hover:text-primary">
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
      </div>
    </section>
  );
}
