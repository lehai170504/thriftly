'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { ShoppingBag, Gavel, Upload, X, TrendingUp, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useCategories, useCreateProduct } from '../hooks/useProducts';
import { useGenerateDescription, useSuggestPrice } from '@/features/ai/api/aiApi';
import { useUploadImage, useUploadVideo } from '@/features/media/hooks/useMedia';
import { IMAGE_ACCEPT, VIDEO_ACCEPT } from '@/features/media/validation/mediaValidation';
import { useState } from 'react';
import { CreateProductRequest } from '@/features/products/types/product';
import { createProductSchema, CreateProductFormData } from '../schemas';
import { LocationSelector } from '@/components/ui/LocationSelector';
import { ProductFormSectionHeader } from './ProductFormSectionHeader';

interface CreateProductFormProps {
  onSuccess?: () => void;
}

const CONDITIONS = [
  { value: 'NEW', label: 'Mới 100%', desc: 'Chưa dùng, nguyên tag/hộp' },
  { value: 'LIKE_NEW', label: 'Như mới', desc: 'Dùng lướt, không trầy xước' },
  { value: 'GOOD', label: 'Tốt', desc: 'Đã dùng, hao mòn nhẹ' },
  { value: 'FAIR', label: 'Khá', desc: 'Có vết xước, dùng bình thường' },
] as const;

const PHOTO_HINTS = [
  'Toàn cảnh mặt trước',
  'Mặt sau sản phẩm',
  'Tem mác / Mã seri',
  'Chỗ xước / Khuyết điểm',
  'Phụ kiện đi kèm'
];

export const CreateProductForm = ({ onSuccess }: CreateProductFormProps) => {
  const { register, handleSubmit, control, watch, setValue, trigger, formState: { errors } } = useForm<CreateProductFormData>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      title: '',
      description: '',
      price: '' as unknown as number,
      categoryId: '',
      condition: 'GOOD',
      sellType: 'BUY_NOW',
      quantity: 1,
      auctionDurationDays: 3,
      imageUrl: '',
      location: ''
    }
  });

  const [currentStep, setCurrentStep] = useState(1);
  const steps = [
    { id: 1, title: 'Thông tin' },
    { id: 2, title: 'Hình ảnh' },
    { id: 3, title: 'Định giá' }
  ];

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [suggestedPriceText, setSuggestedPriceText] = useState<string | null>(null);

  const uploadImageMutation = useUploadImage();
  const uploadVideoMutation = useUploadVideo();

  const generateDescMutation = useGenerateDescription();
  const suggestPriceMutation = useSuggestPrice();

  const sellType = watch('sellType');
  const priceWatch = watch('price');

  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  const mutation = useCreateProduct();

  const handleGenerateDescription = () => {
    const title = watch('title');
    const condition = watch('condition');
    if (!title) {
      toast.error('Vui lòng nhập Tên sản phẩm trước');
      return;
    }
    generateDescMutation.mutate({ productName: title, condition }, {
      onSuccess: (data) => {
        setValue('description', data, { shouldValidate: true });
        toast.success('Đã tạo mô tả bằng AI');
      },
      onError: () => toast.error('Không thể tạo mô tả lúc này')
    });
  };

  const handleSuggestPrice = () => {
    const title = watch('title');
    const condition = watch('condition');
    if (!title) {
      toast.error('Vui lòng nhập Tên sản phẩm trước');
      return;
    }
    suggestPriceMutation.mutate({ productName: title, condition }, {
      onSuccess: (data) => setSuggestedPriceText(data),
      onError: () => toast.error('Không thể gợi ý giá lúc này')
    });
  };

  const onSubmit = async (data: CreateProductRequest) => {
    try {
      if (imageFiles.length > 0) {
        const urls = await Promise.all(imageFiles.map(file => uploadImageMutation.mutateAsync(file)));
        data.images = urls;
        data.imageUrl = urls[0];
      }
      if (videoFile) {
        const url = await uploadVideoMutation.mutateAsync(videoFile);
        data.videoUrl = url;
      }

      mutation.mutate(data, {
        onSuccess: () => {
          if (onSuccess) onSuccess();
        }
      });
    } catch {
      toast.error('Lỗi khi tải ảnh/video lên');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const validFiles = files.filter(f => f.size <= 5 * 1024 * 1024);
      if (validFiles.length < files.length) {
        toast.error('Một số ảnh bị bỏ qua do vượt quá 5MB');
      }
      if (validFiles.length > 0) {
        setImageFiles(prev => [...prev, ...validFiles].slice(0, 5));
        const newPreviews = validFiles.map(f => URL.createObjectURL(f));
        setImagePreviews(prev => [...prev, ...newPreviews].slice(0, 5));
      }
    }
  };

  const handleNextStep = async () => {
    let isValid = false;
    if (currentStep === 1) {
      isValid = await trigger(['title', 'categoryId', 'condition', 'description', 'location']);
    } else if (currentStep === 2) {
      if (imageFiles.length === 0) {
        toast.error('Vui lòng tải lên ít nhất 1 hình ảnh sản phẩm');
        isValid = false;
      } else {
        isValid = true;
      }
    }

    if (isValid) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full flex-1 overflow-hidden min-h-0 bg-background">
      <div className="flex-1 overflow-y-auto p-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex items-center justify-between mb-8 relative px-2">
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-border rounded-full z-0"></div>
          <div
            className="absolute left-6 top-1/2 -translate-y-1/2 h-0.5 bg-primary rounded-full z-0 transition-all duration-300 ease-out"
            style={{ width: `calc(${((currentStep - 1) / (steps.length - 1)) * 100}% - 3rem)` }}
          ></div>
          {steps.map((step) => (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all duration-200 ${currentStep >= step.id ? 'bg-primary border-primary text-primary-foreground shadow-xs' : 'bg-card border-border text-muted-foreground'}`}>
                {step.id}
              </div>
              <span className={`text-xs font-medium transition-colors ${currentStep >= step.id ? 'text-primary' : 'text-muted-foreground'}`}>{step.title}</span>
            </div>
          ))}
        </div>

        <div className="relative overflow-x-hidden min-h-[420px] pb-6">
          <div className={`space-y-6 w-full ${currentStep === 1 ? 'block' : 'hidden'}`}>
            <div>
              <ProductFormSectionHeader title="Thông tin cơ bản" />
              <p className="text-sm text-muted-foreground mt-1">Mô tả rõ ràng tình trạng thực tế để người mua yên tâm chốt đơn.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Tên sản phẩm <span className="text-destructive">*</span></Label>
              <Input
                id="title"
                placeholder="VD: Áo khoác dạ nữ dáng dài Zara size M"
                {...register('title')}
                className={`h-11 ${errors.title ? 'border-destructive ring-1 ring-destructive/30' : ''}`}
              />
              {errors.title && <p className="text-destructive text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Danh mục <span className="text-destructive">*</span></Label>
              <Controller
                name="categoryId"
                control={control}
                rules={{ required: true }}
                render={({ field }) => {
                  return (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-11">
                        <span className="flex flex-1 text-left">
                          {field.value
                            ? categories?.find(c => c.id === field.value)?.name || 'Đã chọn danh mục'
                            : (isLoadingCategories ? 'Đang tải...' : 'Chọn danh mục phù hợp')}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  );
                }}
              />
              {errors.categoryId && <p className="text-destructive text-xs mt-1">{errors.categoryId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Tình trạng sản phẩm <span className="text-destructive">*</span></Label>
              <Controller
                name="condition"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {CONDITIONS.map((cond) => {
                      const isSelected = field.value === cond.value;
                      return (
                        <div
                          key={cond.value}
                          onClick={() => field.onChange(cond.value)}
                          className={`cursor-pointer rounded-xl border p-3 transition-all ${isSelected
                              ? 'border-primary bg-primary/5 shadow-2xs'
                              : 'border-border bg-card hover:border-border/80 hover:bg-accent/30'
                            }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-foreground">{cond.label}</span>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-snug">{cond.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              />
              {errors.condition && <p className="text-destructive text-xs mt-1">{errors.condition.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <Label htmlFor="description">Mô tả chi tiết <span className="text-destructive">*</span></Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-primary border-primary/40 hover:bg-primary/10 gap-1.5 h-7 text-xs w-fit"
                  onClick={handleGenerateDescription}
                  disabled={generateDescMutation.isPending}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  {generateDescMutation.isPending ? 'Đang viết...' : 'AI Viết mô tả'}
                </Button>
              </div>
              <Textarea
                id="description"
                placeholder="Mô tả chi tiết: thương hiệu, màu sắc, kích cỡ, độ mới, khuyết điểm (nếu có)..."
                {...register('description')}
                className={`min-h-[120px] resize-y ${errors.description ? 'border-destructive ring-1 ring-destructive/30' : ''}`}
              />
              {errors.description && <p className="text-destructive text-xs mt-1">{errors.description.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Khu vực giao dịch <span className="text-destructive">*</span></Label>
              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <LocationSelector value={field.value} onChange={field.onChange} mode="full" />
                )}
              />
              {errors.location && <p className="text-destructive text-xs mt-1">{errors.location.message}</p>}
            </div>
          </div>

          <div className={`space-y-6 w-full ${currentStep === 2 ? 'block' : 'hidden'}`}>
            <div>
              <ProductFormSectionHeader title="Hình ảnh & Video kiểm định" />
              <p className="text-sm text-muted-foreground mt-1">Ảnh thật và rõ nét góc cạnh giúp người mua tin tưởng và giao dịch nhanh hơn.</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Hình ảnh sản phẩm (Tối đa 5 ảnh) <span className="text-destructive">*</span></Label>
                <span className="text-xs text-muted-foreground tabular-nums">{imagePreviews.length}/5 ảnh</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {Array.from({ length: 5 }).map((_, index) => {
                  const preview = imagePreviews[index];
                  const hint = PHOTO_HINTS[index];

                  if (preview) {
                    return (
                      <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-border bg-card group shadow-2xs">
                        <img src={preview} alt={`Ảnh ${index + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5 text-center text-[10px] text-white truncate">
                          {index === 0 ? 'Ảnh bìa' : hint}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setImageFiles(prev => prev.filter((_, i) => i !== index));
                            setImagePreviews(prev => prev.filter((_, i) => i !== index));
                          }}
                          className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-destructive transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  }

                  if (index === imagePreviews.length) {
                    return (
                      <label key={index} className="relative aspect-square border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors bg-card group p-2 text-center">
                        <Upload className="w-5 h-5 text-muted-foreground mb-1 group-hover:text-primary transition-colors" />
                        <span className="text-[11px] font-semibold text-foreground group-hover:text-primary leading-tight">{hint}</span>
                        <span className="text-[10px] text-muted-foreground mt-0.5">+ Tải lên</span>
                        <input
                          type="file"
                          multiple
                          accept={IMAGE_ACCEPT}
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>
                    );
                  }

                  return (
                    <div key={index} className="aspect-square border border-dashed border-border/60 rounded-xl flex flex-col items-center justify-center bg-muted/20 p-2 text-center text-muted-foreground/60">
                      <span className="text-[10px] leading-tight">{hint}</span>
                    </div>
                  );
                })}
              </div>

              <div className="text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 pt-1">
                <span>• Hỗ trợ định dạng JPG, PNG, WEBP</span>
                <span>• Dung lượng tối đa 5MB/ảnh</span>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-border">
              <Label>Video kiểm tra chi tiết (Tùy chọn)</Label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {videoPreview ? (
                  <div className="relative w-36 h-36 rounded-xl overflow-hidden border border-border bg-card group shrink-0">
                    <video src={videoPreview} className="w-full h-full object-cover" controls />
                    <button
                      type="button"
                      onClick={() => {
                        setVideoFile(null);
                        setVideoPreview(null);
                      }}
                      className="absolute top-1.5 right-1.5 bg-black/70 text-white rounded-full p-1 hover:bg-destructive transition-colors z-10"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="w-36 h-36 shrink-0 border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors bg-card group p-2 text-center">
                    <Upload className="w-6 h-6 text-muted-foreground mb-1.5 group-hover:text-primary transition-colors" />
                    <span className="text-xs font-semibold text-foreground group-hover:text-primary">Tải video lên</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">Tối đa 50MB</span>
                    <input
                      type="file"
                      accept={VIDEO_ACCEPT}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 50 * 1024 * 1024) {
                            toast.error('Video phải nhỏ hơn 50MB');
                            return;
                          }
                          setVideoFile(file);
                          setVideoPreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>
                )}
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Quay góc 360 độ hoặc cận cảnh các chỗ có khuyết điểm.</p>
                  <p>• Định dạng MP4, WEBM, MOV (tối đa 50MB).</p>
                </div>
              </div>
            </div>
          </div>

          <div className={`space-y-6 w-full ${currentStep === 3 ? 'block' : 'hidden'}`}>
            <div>
              <ProductFormSectionHeader title="Hình thức & Định giá" />
              <p className="text-sm text-muted-foreground mt-1">Chọn phương thức bán phù hợp với món đồ của bạn.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div
                className={`border rounded-xl p-4 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 text-center ${sellType === 'BUY_NOW' ? 'border-primary bg-primary/5 shadow-2xs' : 'border-border bg-card hover:border-border/80'}`}
                onClick={() => setValue('sellType', 'BUY_NOW')}
              >
                <div className={`p-2.5 rounded-full ${sellType === 'BUY_NOW' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-bold text-sm text-foreground">Mua ngay</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Bán giá cố định</div>
                </div>
              </div>

              <div
                className={`border rounded-xl p-4 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 text-center ${sellType === 'AUCTION' ? 'border-primary bg-primary/5 shadow-2xs' : 'border-border bg-card hover:border-border/80'}`}
                onClick={() => setValue('sellType', 'AUCTION')}
              >
                <div className={`p-2.5 rounded-full ${sellType === 'AUCTION' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  <Gavel className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-bold text-sm text-foreground">Đấu giá</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Người mua trả giá</div>
                </div>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="price">
                  {sellType === 'BUY_NOW' ? 'Giá bán mong muốn' : 'Giá khởi điểm'} <span className="text-destructive">*</span>
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-primary border-primary/40 hover:bg-primary/10 gap-1.5 h-7 text-xs w-fit"
                  onClick={handleSuggestPrice}
                  disabled={suggestPriceMutation.isPending}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  {suggestPriceMutation.isPending ? 'Đang phân tích...' : 'AI Gợi ý giá'}
                </Button>
              </div>
              <div className="relative">
                <Input
                  id="price"
                  type="number"
                  placeholder="VD: 250000"
                  {...register('price', { valueAsNumber: true })}
                  className={`h-12 pl-4 pr-14 text-lg font-bold tabular-nums ${errors.price ? 'border-destructive' : ''}`}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-bold">
                  VNĐ
                </div>
              </div>
              {errors.price && <p className="text-destructive text-xs mt-1">{errors.price.message}</p>}
              {Number(priceWatch) > 0 && (
                <p className="text-xs text-primary font-medium flex items-center gap-1.5 mt-1">
                  Sẽ hiển thị: {formatCurrency(priceWatch)}
                </p>
              )}
              {suggestedPriceText && (
                <div className="mt-2 p-3 bg-muted/40 border border-border rounded-xl text-xs text-foreground leading-relaxed">
                  <span className="font-bold text-primary flex items-center gap-1.5 mb-1"><TrendingUp className="w-3.5 h-3.5" /> AI Phân tích giá:</span>
                  {suggestedPriceText}
                </div>
              )}
            </div>

            {sellType === 'BUY_NOW' && (
              <div className="space-y-2 mt-4">
                <Label htmlFor="quantity">Số lượng <span className="text-destructive">*</span></Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="1"
                  min="1"
                  {...register('quantity', { valueAsNumber: true })}
                  className={`h-11 tabular-nums ${errors.quantity ? 'border-destructive' : ''}`}
                />
                {errors.quantity && <p className="text-destructive text-xs mt-1">{errors.quantity.message}</p>}
              </div>
            )}

            {sellType === 'AUCTION' && (
              <div className="space-y-2 mt-4">
                <Label>Thời gian diễn ra đấu giá <span className="text-destructive">*</span></Label>
                <Controller
                  name="auctionDurationDays"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={(val) => field.onChange(Number(val))} value={String(field.value || 3)}>
                      <SelectTrigger className="h-11">
                        <span className="flex flex-1 text-left text-sm">
                          {field.value === 1 && '1 ngày (Nhanh)'}
                          {field.value === 3 && '3 ngày (Tiêu chuẩn)'}
                          {field.value === 5 && '5 ngày'}
                          {field.value === 7 && '7 ngày (Tối đa)'}
                          {!field.value && 'Chọn thời gian'}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 ngày (Nhanh)</SelectItem>
                        <SelectItem value="3">3 ngày (Tiêu chuẩn)</SelectItem>
                        <SelectItem value="5">5 ngày</SelectItem>
                        <SelectItem value="7">7 ngày (Tối đa)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-3 p-4 px-6 border-t border-border bg-card">
        {currentStep > 1 && (
          <Button type="button" variant="outline" onClick={handlePrevStep} className="w-28 h-10 rounded-xl text-sm font-semibold">
            Quay lại
          </Button>
        )}
        {currentStep < 3 ? (
          <Button type="button" onClick={handleNextStep} className="flex-1 h-10 rounded-xl text-sm font-semibold bg-primary hover:bg-primary/90">
            Tiếp tục
          </Button>
        ) : (
          <Button
            type="submit"
            className="flex-1 h-10 rounded-xl text-sm font-semibold bg-primary hover:bg-primary/90"
            disabled={mutation.isPending || uploadImageMutation.isPending || uploadVideoMutation.isPending}
          >
            {(uploadImageMutation.isPending || uploadVideoMutation.isPending) ? 'Đang tải ảnh...' : mutation.isPending ? 'Đang đăng tin...' : 'Hoàn tất & Đăng bán'}
          </Button>
        )}
      </div>
    </form>
  );
};
