import { z } from 'zod';

export const createProductSchema = z.object({
  title: z.string().min(5, 'Tên sản phẩm phải có ít nhất 5 ký tự').max(100, 'Tên sản phẩm tối đa 100 ký tự'),
  categoryId: z.string().min(1, 'Vui lòng chọn danh mục'),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR'], {
    message: 'Tình trạng không hợp lệ',
  }),
  description: z.string().min(20, 'Mô tả chi tiết phải có ít nhất 20 ký tự').max(2000, 'Mô tả không được vượt quá 2000 ký tự'),
  sellType: z.enum(['BUY_NOW', 'AUCTION'], {
    message: 'Hình thức bán không hợp lệ',
  }),
  price: z.number({ message: 'Vui lòng nhập số tiền' }).min(1000, 'Giá tiền phải lớn hơn 1000 VNĐ'),
  quantity: z.number().min(1, 'Số lượng ít nhất là 1'),
  auctionDurationDays: z.number().optional(),
  imageUrl: z.string().optional(),
  images: z.array(z.string()).optional(),
  videoUrl: z.string().optional(),
  location: z.string().min(1, 'Vui lòng chọn khu vực'),
});

export type CreateProductFormData = z.infer<typeof createProductSchema>;
