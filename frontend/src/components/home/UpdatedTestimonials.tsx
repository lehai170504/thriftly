'use client';

import { Card } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';

interface Review {
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
}

const reviews: Review[] = [
  {
    name: 'Hoàng Long',
    role: 'Người mua',
    content: 'Từ ngày dùng Thriftly, tôi săn được rất nhiều đồ công nghệ hiếm với giá rẻ nhờ chức năng đấu giá siêu tốc.',
    rating: 5,
    avatar: 'https://i.pravatar.cc/150?img=11'
  },
  {
    name: 'Minh Thư',
    role: 'Chủ cửa hàng đồ cổ',
    content: 'Thanh toán Escrow quá xịn, bán đồ không sợ bị boom hàng. Tiền về ví rất nhanh và minh bạch.',
    rating: 5,
    avatar: 'https://i.pravatar.cc/150?img=44'
  },
  {
    name: 'Thanh Tùng',
    role: 'Người sưu tầm',
    content: 'Giao diện mượt mà, cộng đồng thân thiện. Tính năng đấu giá real-time nhảy giá từng giây cực kỳ nảy lửa.',
    rating: 5,
    avatar: 'https://i.pravatar.cc/150?img=68'
  },
  {
    name: 'Anh Dũng',
    role: 'Sinh viên',
    content: 'Mình mua máy ảnh cũ đấu giá được giảm 60% so với giá mới. Escrow bảo vệ tiền hoàn hảo, nhận hàng đúng mô tả.',
    rating: 5,
    avatar: 'https://i.pravatar.cc/150?img=32'
  }
];

export function UpdatedTestimonials() {
  return (
    <div className="w-full relative overflow-hidden py-2">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase mb-3 flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-primary/50"></span>
            Đánh giá
            <span className="w-8 h-px bg-primary/50"></span>
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 tracking-tight leading-tight font-sans">
            Cộng Đồng Tin Tưởng
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed font-medium">
            Hàng ngàn người dùng đã tin tưởng Thriftly cho các giao dịch mua bán đồ cũ.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {reviews.map((review, i) => (
            <Card key={i} className="bg-card p-6 rounded-2xl border border-border shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative group">
              <div className="absolute top-6 right-6 text-muted/30 group-hover:text-primary/20 transition-colors">
                <Quote className="w-8 h-8" />
              </div>

              <div>
                <div className="flex gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} className={`w-3.5 h-3.5 ${idx < review.rating ? 'fill-current' : 'text-muted'}`} />
                  ))}
                </div>

                <p className="text-foreground font-medium text-xs leading-relaxed mb-6 line-clamp-3 relative z-10">
                  "{review.content}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="w-10 h-10 rounded-full object-cover border border-border shadow-sm"
                />
                <div>
                  <div className="font-bold text-xs text-foreground">{review.name}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">{review.role}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
