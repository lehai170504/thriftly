import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Gavel,
  PackageCheck,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Cách thức hoạt động | Thriftly',
  description: 'Hướng dẫn mua bán và đấu giá an toàn trên nền tảng Thriftly.',
};

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Khám phá & Chọn lựa',
    description:
      'Tìm kiếm sản phẩm theo danh mục, tình trạng hoặc từ khóa. Bạn có thể mua ngay với mức giá cố định hoặc tham gia các phiên đấu giá trực tiếp.',
    highlights: ['Bộ lọc chi tiết theo nhu cầu', 'Thông tin tình trạng minh bạch'],
  },
  {
    number: '02',
    icon: Gavel,
    title: 'Đặt giá thầu hoặc Mua ngay',
    description:
      'Theo dõi giá thầu cập nhật theo thời gian thực trong phòng đấu giá, hoặc tiến hành đặt hàng trực tiếp với sản phẩm mua ngay.',
    highlights: ['Cập nhật giá tức thì qua WebSocket', 'Tự động gia hạn cuối phiên'],
  },
  {
    number: '03',
    icon: ShieldCheck,
    title: 'Thanh toán qua Escrow',
    description:
      'Số tiền thanh toán được giữ an toàn trong quy trình ký quỹ trung gian của Thriftly. Người bán yên tâm đóng gói giao hàng.',
    highlights: ['Tạm giữ tiền an toàn', 'Hạn chế rủi ro giao dịch'],
  },
  {
    number: '04',
    icon: PackageCheck,
    title: 'Nhận hàng & Xác nhận',
    description:
      'Khi nhận hàng và kiểm tra đúng mô tả, bạn xác nhận hoàn tất đơn hàng để hệ thống giải ngân cho người bán và để lại đánh giá.',
    highlights: ['Xác nhận trước khi giải ngân', 'Đánh giá người bán công khai'],
  },
];

export default function HowItWorksPage() {
  return (
    <div className="w-full bg-[#F5F2EC] dark:bg-background text-[#191919] dark:text-foreground">
      <section className="pt-8 pb-16 border-b border-[#E5E0D7] dark:border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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
              Hướng dẫn sử dụng
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.12] mb-5">
              Cách Thức Hoạt Động Của{' '}
              <span className="italic font-normal text-[#244C3A] dark:text-primary">Thriftly</span>
            </h1>
            <p className="text-base sm:text-lg text-[#77736D] dark:text-muted-foreground leading-relaxed">
              Quy trình 4 bước rõ ràng giúp bạn mua, bán và tham gia đấu giá đồ secondhand an tâm trên một nền tảng thống nhất.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-white dark:bg-card border-b border-[#E5E0D7] dark:border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map((step) => (
              <div
                key={step.number}
                className="editorial-card rounded-2xl bg-[#F5F2EC] dark:bg-muted/40 border border-[#E5E0D7] dark:border-border p-7 sm:p-8 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="size-12 rounded-xl bg-white dark:bg-card border border-[#E5E0D7] dark:border-border flex items-center justify-center text-[#244C3A] dark:text-primary shadow-surface">
                      <step.icon className="w-5 h-5" />
                    </div>
                    <span className="font-numeric text-xs font-semibold tracking-[0.16em] text-[#244C3A] dark:text-primary">
                      BƯỚC {step.number}
                    </span>
                  </div>

                  <h2 className="text-xl font-semibold mb-3">{step.title}</h2>
                  <p className="text-sm text-[#77736D] dark:text-muted-foreground leading-relaxed mb-6">
                    {step.description}
                  </p>
                </div>

                <ul className="space-y-2.5 pt-4 border-t border-[#E5E0D7] dark:border-border">
                  {step.highlights.map((hl) => (
                    <li key={hl} className="flex items-center gap-2.5 text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4 text-[#244C3A] dark:text-primary shrink-0" />
                      <span>{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-[#F5F2EC] dark:bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-[#244C3A] dark:bg-card text-white dark:text-foreground border border-[#244C3A] dark:border-border px-6 py-12 sm:px-12 sm:py-16 text-center">
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
              Sẵn Sàng Trải Nghiệm Thriftly?
            </h2>
            <p className="text-sm sm:text-base text-white/80 dark:text-muted-foreground mb-8 max-w-xl mx-auto">
              Khám phá các sản phẩm và phiên đấu giá đang mở ngay hôm nay.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3.5">
              <Link href="/products">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-12 px-7 rounded-xl bg-white text-[#191919] hover:bg-[#F5F2EC] dark:bg-primary dark:text-primary-foreground font-medium group"
                >
                  Bắt đầu ngay
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/escrow">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto h-12 px-7 rounded-xl border-white/30 bg-transparent text-white hover:bg-white/10 dark:border-border dark:text-foreground dark:hover:bg-accent font-medium"
                >
                  Xem quy trình Escrow
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
