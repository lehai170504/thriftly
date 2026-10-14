'use client';

import { Gavel, ArrowRightLeft, ShieldCheck, Clock } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      icon: Gavel,
      title: 'Chọn sản phẩm',
      description: 'Duyệt qua hàng ngàn sản phẩm đang diễn ra đấu giá với giá khởi điểm hấp dẫn.',
    },
    {
      icon: ArrowRightLeft,
      title: 'Đặt giá thầu',
      description: 'Nhập số tiền bạn sẵn sàng trả và theo dõi giá thầu real-time qua hệ thống.',
    },
    {
      icon: Clock,
      title: 'Theo dõi trực tiếp',
      description: 'Trải nghiệm sự kịch tính khi giá cập nhật từng giây trong phòng đấu giá.',
    },
    {
      icon: ShieldCheck,
      title: 'Thanh toán an toàn',
      description: 'Tiền được giữ an toàn trong ví Escrow, chỉ chuyển đi khi bạn đã xác nhận hàng.',
    }
  ];

  return (
    <div className="w-full relative overflow-hidden py-2">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <p className="text-xs font-bold tracking-[0.2em] text-blue-600 uppercase mb-3 flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-blue-600/50"></span>
            Quy trình
            <span className="w-8 h-px bg-blue-600/50"></span>
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 tracking-tight leading-tight font-sans">
            Cách Thức Hoạt Động
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed font-medium">
            Trải nghiệm mua sắm minh bạch và chuyên nghiệp chỉ với 4 bước tiêu chuẩn.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          <div className="hidden lg:block absolute top-[44px] left-[10%] right-[10%] h-[1px] bg-border z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, i) => (
              <div key={i} className="relative group flex flex-col items-center text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-card border border-border flex items-center justify-center mb-5 group-hover:bg-primary group-hover:border-primary group-hover:-translate-y-1.5 transition-all duration-300 shadow-md relative z-10">
                  <step.icon className="w-8 h-8 text-foreground group-hover:text-primary-foreground transition-colors duration-300" />
                </div>

                <div className="text-primary font-mono text-xs font-bold mb-2 tracking-[0.15em]">BƯỚC 0{i + 1}</div>
                <h3 className="text-lg font-bold text-foreground mb-2 font-sans">{step.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed px-2">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 max-w-4xl mx-auto border-t border-border pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { value: '500+', label: 'Phiên đấu giá mỗi ngày' },
              { value: '99.9%', label: 'Giao dịch an toàn' },
              { value: '10k+', label: 'Người dùng tin tưởng' }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center text-center cursor-default">
                <span className="text-3xl md:text-4xl font-bold text-foreground mb-1 font-sans">{stat.value}</span>
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
