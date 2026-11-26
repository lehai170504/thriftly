'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCategories } from '@/features/products/hooks/useProducts';
import type { Category } from '@/features/products/types/product';

interface EditorialCategory {
  key: string;
  title: string;
  subtitle: string;
  keywords: string[];
  fallbackQuery: string;
  imageUrl: string;
  spanClass: string;
}

const EDITORIAL_CATEGORIES: EditorialCategory[] = [
  {
    key: 'vintage-fashion',
    title: 'Thời trang Vintage',
    subtitle: 'Áo khoác, denim, đồ thiết kế pre-loved',
    keywords: ['thời trang', 'fashion', 'vintage', 'quần áo', 'áo'],
    fallbackQuery: 'vintage',
    imageUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=900&q=80',
    spanClass: 'md:col-span-2 lg:col-span-2',
  },
  {
    key: 'sneakers',
    title: 'Giày & Streetwear',
    subtitle: 'Sneaker tuyển chọn và trang phục đường phố',
    keywords: ['giày', 'sneaker', 'streetwear', 'dép'],
    fallbackQuery: 'giày',
    imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',
    spanClass: 'md:col-span-1 lg:col-span-1',
  },
  {
    key: 'electronics',
    title: 'Thiết bị điện tử',
    subtitle: 'Máy ảnh, âm thanh, công nghệ đã qua sử dụng',
    keywords: ['điện tử', 'công nghệ', 'máy ảnh', 'electronics', 'laptop'],
    fallbackQuery: 'máy ảnh',
    imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
    spanClass: 'md:col-span-1 lg:col-span-1',
  },
  {
    key: 'collectibles',
    title: 'Đồ sưu tầm',
    subtitle: 'Đĩa than, mô hình, kỷ vật có giá trị lưu giữ',
    keywords: ['sưu tầm', 'collectible', 'đồ cổ', 'vinyl'],
    fallbackQuery: 'sưu tầm',
    imageUrl: 'https://images.unsplash.com/photo-1461784121038-f088ca1e7714?auto=format&fit=crop&w=800&q=80',
    spanClass: 'md:col-span-1 lg:col-span-1',
  },
  {
    key: 'accessories',
    title: 'Phụ kiện',
    subtitle: 'Đồng hồ, túi xách, kính mát, trang sức',
    keywords: ['phụ kiện', 'đồng hồ', 'túi', 'accessories'],
    fallbackQuery: 'đồng hồ',
    imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
    spanClass: 'md:col-span-1 lg:col-span-1',
  },
  {
    key: 'lifestyle',
    title: 'Phong cách sống',
    subtitle: 'Đồ gia dụng tinh giản, nội thất nhỏ, sách',
    keywords: ['đời sống', 'gia dụng', 'nội thất', 'lifestyle', 'sách'],
    fallbackQuery: 'nội thất',
    imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80',
    spanClass: 'md:col-span-2 lg:col-span-2',
  },
];

const EDITORIAL_EASE = [0.22, 1, 0.36, 1] as const;

function flattenCategories(list: Category[]): Category[] {
  const result: Category[] = [];
  for (const cat of list) {
    result.push(cat);
    if (cat.subCategories && cat.subCategories.length > 0) {
      result.push(...flattenCategories(cat.subCategories));
    }
  }
  return result;
}

export function ProductCategories() {
  const { data: categories } = useCategories();

  const flatCategories = useMemo(() => {
    if (!categories || !Array.isArray(categories)) return [];
    return flattenCategories(categories);
  }, [categories]);

  const resolveCategoryHref = (item: EditorialCategory) => {
    const matched = flatCategories.find((cat) => {
      const normalized = cat.name.toLowerCase();
      return item.keywords.some((kw) => normalized.includes(kw));
    });
    if (matched) {
      return `/products?category=${encodeURIComponent(matched.id)}`;
    }
    return `/products?query=${encodeURIComponent(item.fallbackQuery)}`;
  };

  return (
    <section className="py-16 lg:py-24 bg-white dark:bg-card border-t border-[#E5E0D7] dark:border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.45, ease: EDITORIAL_EASE }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10"
        >
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[#244C3A] dark:text-primary mb-3">
              Danh mục chọn lọc
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-tight text-[#191919] dark:text-foreground leading-tight">
              Tìm Thấy Những Món Đồ Xứng Đáng Lưu Giữ.
            </h2>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#244C3A] dark:text-primary hover:underline underline-offset-4 shrink-0"
          >
            Xem toàn bộ danh mục
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {EDITORIAL_CATEGORIES.map((category, index) => (
            <motion.div
              key={category.key}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: index * 0.05, ease: EDITORIAL_EASE }}
              className={category.spanClass}
            >
              <Link
                href={resolveCategoryHref(category)}
                className="group editorial-card relative block h-64 sm:h-72 w-full overflow-hidden rounded-2xl border border-[#E5E0D7] dark:border-border bg-[#F5F2EC] dark:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#244C3A] hover:shadow-elevated"
              >
                <img
                  src={category.imageUrl}
                  alt={category.title}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent transition-opacity duration-300 group-hover:opacity-90" />

                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 flex items-end justify-between gap-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-1">
                      {category.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/80 line-clamp-1">
                      {category.subtitle}
                    </p>
                  </div>
                  <span className="size-9 rounded-full bg-white/95 text-[#191919] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
