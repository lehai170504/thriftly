import Link from 'next/link';
import {
  ArrowLeft,
  ArrowUpRight,
  FileText,
  Flag,
  HelpCircle,
  Scale,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Trung tâm trợ giúp | Thriftly',
  description: 'Hỗ trợ và giải đáp thắc mắc cho người dùng Thriftly.',
};

const topics = [
  {
    icon: FileText,
    title: 'Tài khoản & Hồ sơ',
    description: 'Quản lý thông tin cá nhân, bảo mật đăng nhập và theo dõi sản phẩm yêu thích.',
    href: '/profile',
    cta: 'Đi tới tài khoản',
  },
  {
    icon: ShoppingBag,
    title: 'Mua & Đấu giá trực tiếp',
    description: 'Cách thức đặt giá thầu, tự động gia hạn cuối phiên và mua ngay sản phẩm.',
    href: '/how-it-works',
    cta: 'Xem hướng dẫn',
  },
  {
    icon: ShieldCheck,
    title: 'Thanh toán & Ví Escrow',
    description: 'Hướng dẫn nạp rút ví, cơ chế tạm giữ tiền và xác nhận nhận hàng.',
    href: '/escrow',
    cta: 'Tìm hiểu Escrow',
  },
  {
    icon: Scale,
    title: 'Quy chế & Chính sách',
    description: 'Điều khoản sử dụng, phí dịch vụ nền tảng, quy chế đấu giá và chính sách hoàn tiền.',
    href: '/policies',
    cta: 'Xem chính sách',
  },
  {
    icon: Flag,
    title: 'Báo cáo vi phạm',
    description: 'Gửi báo cáo khi phát hiện hành vi gian lận, hàng giả hoặc nội dung vi phạm.',
    href: '/report',
    cta: 'Gửi báo cáo',
  },
  {
    icon: HelpCircle,
    title: 'Giải quyết tranh chấp',
    description: 'Quy trình cung cấp bằng chứng và xử lý khiếu nại đơn hàng qua Escrow.',
    href: '/policies?tab=dispute-resolution',
    cta: 'Xem quy trình',
  },
];

export default function HelpPage() {
  return (
    <div className="w-full bg-[#F5F2EC] dark:bg-background text-[#191919] dark:text-foreground">
      <section className="pt-8 pb-16 border-b border-[#E5E0D7] dark:border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-block mb-8">
            <Button
              variant="ghost"
              className="rounded-xl px-3 text-[#77736D] dark:text-muted-foreground hover:text-[#191919] dark:hover:text-foreground hover:bg-white/70 dark:hover:bg-accent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Về trang chủ
            </Button>
          </Link>

          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[#244C3A] dark:text-primary mb-3">
              Hỗ trợ người dùng
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.12] mb-5">
              Chúng Tôi Có Thể Giúp Gì Cho Bạn?
            </h1>
            <p className="text-base sm:text-lg text-[#77736D] dark:text-muted-foreground leading-relaxed">
              Tổng hợp hướng dẫn nhanh về tài khoản, đấu giá trực tiếp, ví Escrow và các quy định giao dịch trên Thriftly.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-white dark:bg-card border-b border-[#E5E0D7] dark:border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[#244C3A] dark:text-primary mb-2">
              Danh mục hướng dẫn
            </p>
            <h2 className="font-serif text-3xl font-semibold tracking-tight">Chủ Đề Phổ Biến</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {topics.map((topic) => (
              <Link
                key={topic.title}
                href={topic.href}
                className="group editorial-card rounded-2xl bg-[#F5F2EC] dark:bg-muted/40 border border-[#E5E0D7] dark:border-border p-6 flex flex-col justify-between hover:border-[#244C3A]/40 dark:hover:border-primary/40 hover:shadow-elevated"
              >
                <div>
                  <div className="size-11 rounded-xl bg-white dark:bg-card border border-[#E5E0D7] dark:border-border flex items-center justify-center text-[#244C3A] dark:text-primary mb-5 shadow-surface">
                    <topic.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-[#244C3A] dark:group-hover:text-primary transition-colors">
                    {topic.title}
                  </h3>
                  <p className="text-sm text-[#77736D] dark:text-muted-foreground leading-relaxed mb-6">
                    {topic.description}
                  </p>
                </div>

                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#244C3A] dark:text-primary">
                  {topic.cta}
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-[#F5F2EC] dark:bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="rounded-3xl bg-white dark:bg-card border border-[#E5E0D7] dark:border-border p-8 sm:p-12 shadow-surface">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold mb-3">
              Cần Báo Cáo Hoặc Tra Cứu Chi Tiết?
            </h2>
            <p className="text-sm sm:text-base text-[#77736D] dark:text-muted-foreground mb-8 max-w-xl mx-auto">
              Nếu bạn gặp sự cố giao dịch hoặc phát hiện sản phẩm vi phạm, hãy gửi báo cáo trực tiếp hoặc xem quy trình xử lý khiếu nại.
            </p>
            <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
              <Link href="/report">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-12 px-7 rounded-xl bg-[#244C3A] hover:bg-[#1D3E2F] text-white dark:bg-primary dark:text-primary-foreground font-medium"
                >
                  <Flag className="w-4 h-4 mr-2" />
                  Báo cáo vi phạm
                </Button>
              </Link>
              <Link href="/policies">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto h-12 px-7 rounded-xl border-[#E5E0D7] dark:border-border bg-white dark:bg-card text-[#191919] dark:text-foreground hover:bg-[#F5F2EC] dark:hover:bg-accent font-medium"
                >
                  Xem toàn bộ chính sách
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
