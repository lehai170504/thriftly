/* eslint-disable react-hooks/incompatible-library */
'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { ShoppingBag, Gavel, Upload, X, Image as ImageIcon, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useCategories, useCreateProduct } from '../hooks/useProducts';
import { useGenerateDescription, useSuggestPrice } from '@/features/ai/api/aiApi';
import { useUploadImage, useUploadVideo } from '@/features/media/hooks/useMedia';
import { useState } from 'react';
import { CreateProductRequest } from '@/features/products/types/product';
import { createProductSchema, CreateProductFormData } from '../schemas';
import { LocationSelector } from '@/components/ui/LocationSelector';

interface CreateProductFormProps {
  onSuccess?: () => void;
}

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
    } catch (error) {
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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full flex-1 overflow-hidden min-h-0">
      <div className="flex-1 overflow-y-auto p-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Stepper Progress */}
        <div className="flex items-center justify-between mb-8 relative px-2">
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-muted/80 rounded-full z-0"></div>
          <div
            className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full z-0 transition-all duration-500 ease-out"
            style={{ width: `calc(${((currentStep - 1) / (steps.length - 1)) * 100}% - 3rem)` }}
          ></div>
          {steps.map((step) => (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${currentStep >= step.id ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.5)] scale-110' : 'bg-background border-2 border-border text-muted-foreground'}`}>
                {step.id}
              </div>
              <span className={`text-xs font-medium transition-colors duration-300 ${currentStep >= step.id ? 'text-primary' : 'text-muted-foreground'}`}>{step.title}</span>
            </div>
          ))}
        </div>

        <div className="relative overflow-x-hidden min-h-[420px] pb-12">
          {/* Step 1: Basic Info */}
          <div className={`space-y-6 transition-all duration-500 w-full animate-in fade-in slide-in-from-right-4 ${currentStep === 1 ? 'block' : 'hidden'}`}>
            <div>
              <h3 className="text-lg font-heading font-bold border-b border-border pb-2 text-foreground">Thông tin cơ bản</h3>
              <p className="text-sm text-muted-foreground mt-2">Điền đầy đủ và chính xác thông tin giúp sản phẩm của bạn dễ dàng tiếp cận người mua hơn.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Tên sản phẩm <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                placeholder="VD: Áo khoác da thật 100% (Ghi rõ thương hiệu, loại sản phẩm...)"
                {...register('title')}
                className={`h-12 focus-visible:ring-primary ${errors.title ? 'border-red-500' : ''}`}
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Danh mục <span className="text-red-500">*</span></Label>
                <Controller
                  name="categoryId"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-12 focus:ring-primary">
                        <span className="flex flex-1 text-left">
                          {field.value
                            ? categories?.find((c) => c.id === field.value)?.name
                            : (isLoadingCategories ? "Đang tải..." : "Chọn danh mục phù hợp")}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Tình trạng <span className="text-red-500">*</span></Label>
                <Controller
                  name="condition"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-12 focus:ring-primary">
                        <span className="flex flex-1 text-left">
                          {field.value === 'NEW' && 'Mới 100% (New)'}
                          {field.value === 'LIKE_NEW' && 'Như mới (Like New)'}
                          {field.value === 'GOOD' && 'Tốt (Good)'}
                          {field.value === 'FAIR' && 'Khá (Fair)'}
                          {!field.value && 'Đánh giá tình trạng thực tế'}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NEW">Mới 100% (New)</SelectItem>
                        <SelectItem value="LIKE_NEW">Như mới (Like New)</SelectItem>
                        <SelectItem value="GOOD">Tốt (Good)</SelectItem>
                        <SelectItem value="FAIR">Khá (Fair)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.condition && <p className="text-red-500 text-xs mt-1">{errors.condition.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <Label htmlFor="description">Mô tả chi tiết <span className="text-red-500">*</span></Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-primary border-primary/50 hover:bg-primary/10 gap-2 h-8 w-fit"
                  onClick={handleGenerateDescription}
                  disabled={generateDescMutation.isPending}
                >
                  <Sparkles className="w-4 h-4" />
                  {generateDescMutation.isPending ? 'Đang viết...' : 'Viết bằng AI'}
                </Button>
              </div>
              <Textarea
                id="description"
                placeholder="Mô tả chi tiết về tình trạng hiện tại, thương hiệu, kích thước, màu sắc, xuất xứ, thời gian đã sử dụng, và các lỗi (nếu có) để người mua yên tâm giao dịch..."
                {...register('description')}
                className={`min-h-[140px] focus-visible:ring-primary resize-y ${errors.description ? 'border-red-500' : ''}`}
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Khu vực giao dịch <span className="text-red-500">*</span></Label>
              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <LocationSelector value={field.value} onChange={field.onChange} mode="full" />
                )}
              />
              {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
            </div>
          </div>

          {/* Step 2: Media */}
          <div className={`space-y-6 transition-all duration-500 w-full animate-in fade-in slide-in-from-right-4 ${currentStep === 2 ? 'block' : 'hidden'}`}>
            <div>
              <h3 className="text-lg font-heading font-bold border-b border-border pb-2 text-foreground">Hình ảnh & Video</h3>
              <p className="text-sm text-muted-foreground mt-2">Hình ảnh chân thực, rõ nét giúp sản phẩm bán nhanh hơn gấp 3 lần.</p>
            </div>

            <div className="space-y-4">
              <Label>Hình ảnh sản phẩm (Tối đa 5 ảnh) <span className="text-red-500">*</span></Label>
              <div className="flex flex-wrap items-start gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative w-32 h-32 rounded-[16px] overflow-hidden border border-border group flex-shrink-0 shadow-sm">
                    <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    {index === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-primary/90 text-primary-foreground text-[10px] font-bold text-center py-0.5 z-10">
                        Ảnh bìa
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setImageFiles(prev => prev.filter((_, i) => i !== index));
                        setImagePreviews(prev => prev.filter((_, i) => i !== index));
                      }}
                      className="absolute top-1 right-1 bg-background/80 text-foreground rounded-full p-1 hover:bg-destructive hover:text-destructive-foreground transition-colors z-20 opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                
                {imagePreviews.length < 5 && (
                  <label className="w-32 h-32 flex-shrink-0 border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 rounded-[16px] flex flex-col items-center justify-center cursor-pointer transition-colors bg-background/50 group">
                    <Upload className="w-6 h-6 text-muted-foreground mb-2 group-hover:text-primary transition-colors" />
                    <span className="text-xs text-muted-foreground font-medium group-hover:text-primary text-center px-2">Thêm ảnh<br/>({imagePreviews.length}/5)</span>
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
                
                <div className="text-sm text-muted-foreground flex flex-col justify-center gap-1.5 ml-2">
                  <p>• Hỗ trợ JPG, PNG, WEBP</p>
                  <p>• Kích thước tối đa 5MB/ảnh</p>
                  <p>• Chọn nhiều ảnh cùng lúc</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 mt-6">
              <Label>Video sản phẩm (Tùy chọn)</Label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {videoPreview ? (
                  <div className="relative w-40 h-40 rounded-[24px] overflow-hidden border border-border bg-background group flex-shrink-0">
                    <video src={videoPreview} className="w-full h-full object-cover opacity-80" controls />
                    <button
                      type="button"
                      onClick={() => {
                        setVideoFile(null);
                        setVideoPreview(null);
                      }}
                      className="absolute top-2 right-2 bg-background/50 text-foreground rounded-full p-1.5 hover:bg-destructive hover:text-destructive-foreground transition-colors z-10 opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="w-40 h-40 flex-shrink-0 border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 rounded-[24px] flex flex-col items-center justify-center cursor-pointer transition-colors bg-background/50 group">
                    <Upload className="w-8 h-8 text-muted-foreground mb-2 group-hover:text-primary transition-colors" />
                    <span className="text-sm text-muted-foreground font-medium group-hover:text-primary">Tải video lên</span>
                    <input
                      type="file"
                      accept="video/mp4,video/webm"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 30 * 1024 * 1024) {
                            toast.error('Video phải nhỏ hơn 30MB');
                            return;
                          }
                          setVideoFile(file);
                          setVideoPreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>
                )}
                <div className="text-sm text-muted-foreground flex flex-col gap-1.5">
                  <p>• Quay góc 360 độ hoặc chỗ có lỗi</p>
                  <p>• Tối đa 30MB, MP4/WEBM</p>
                  <p>• Giúp người mua tin tưởng hơn</p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Pricing & Format */}
          <div className={`space-y-6 transition-all duration-500 w-full animate-in fade-in slide-in-from-right-4 ${currentStep === 3 ? 'block' : 'hidden'}`}>
            <div>
              <h3 className="text-lg font-heading font-bold border-b border-border pb-2 text-foreground">Hình thức & Định giá</h3>
              <p className="text-sm text-muted-foreground mt-2">Chọn hình thức bán phù hợp với mục tiêu của bạn.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div
                className={`border-2 rounded-[24px] p-6 cursor-pointer transition-all flex flex-col items-center justify-center gap-3 text-center ${sellType === 'BUY_NOW' ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(var(--primary),0.15)]' : 'border-border bg-background/50 hover:border-primary/40'}`}
                onClick={() => setValue('sellType', 'BUY_NOW')}
              >
                <div className={`p-3 rounded-full ${sellType === 'BUY_NOW' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <div>
                  <div className="font-bold text-lg text-foreground">Mua Ngay</div>
                  <div className="text-xs text-muted-foreground mt-1">Bán nhanh với giá cố định</div>
                </div>
              </div>

              <div
                className={`border-2 rounded-[24px] p-6 cursor-pointer transition-all flex flex-col items-center justify-center gap-3 text-center ${sellType === 'AUCTION' ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(var(--primary),0.15)]' : 'border-border bg-background/50 hover:border-primary/40'}`}
                onClick={() => setValue('sellType', 'AUCTION')}
              >
                <div className={`p-3 rounded-full ${sellType === 'AUCTION' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  <Gavel className="h-8 w-8" />
                </div>
                <div>
                  <div className="font-bold text-lg text-foreground">Đấu Giá</div>
                  <div className="text-xs text-muted-foreground mt-1">Để người mua trả giá cao nhất</div>
                </div>
              </div>
            </div>

            <div className="space-y-3 mt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <Label htmlFor="price" className="text-base">
                  {sellType === 'BUY_NOW' ? 'Giá bán' : 'Giá khởi điểm'} <span className="text-red-500">*</span>
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-primary border-primary/50 hover:bg-primary/10 gap-2 h-8 w-fit"
                  onClick={handleSuggestPrice}
                  disabled={suggestPriceMutation.isPending}
                >
                  <Sparkles className="w-4 h-4" />
                  {suggestPriceMutation.isPending ? 'Đang phân tích...' : 'AI Gợi ý giá'}
                </Button>
              </div>
              <div className="relative">
                <Input
                  id="price"
                  type="number"
                  placeholder="VD: 500000"
                  {...register('price', { valueAsNumber: true })}
                  className={`h-14 pl-4 pr-16 focus-visible:ring-primary text-xl font-mono font-bold tracking-tight ${errors.price ? 'border-red-500' : ''}`}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">
                  VNĐ
                </div>
              </div>
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
              {Number(priceWatch) > 0 && (
                <p className="text-sm text-primary font-medium flex items-center gap-1.5 mt-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                  Sẽ hiển thị: {formatCurrency(priceWatch)}
                </p>
              )}
              {suggestedPriceText && (
                <div className="mt-3 p-4 bg-primary/10 border border-primary/20 rounded-xl text-sm text-foreground leading-relaxed glass">
                  <span className="font-bold text-primary flex items-center gap-2 mb-2"><Sparkles className="w-4 h-4" /> AI Phân tích giá:</span>
                  {suggestedPriceText}
                </div>
              )}
            </div>

            {sellType === 'BUY_NOW' && (
              <div className="space-y-3 mt-6">
                <Label htmlFor="quantity" className="text-base">Số lượng <span className="text-red-500">*</span></Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="VD: 1"
                  min="1"
                  {...register('quantity', { valueAsNumber: true })}
                  className={`h-12 focus-visible:ring-primary font-mono text-lg ${errors.quantity ? 'border-red-500' : ''}`}
                />
                {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>}
              </div>
            )}

            {sellType === 'AUCTION' && (
              <div className="space-y-3 mt-6">
                <Label className="text-base">Thời gian đấu giá <span className="text-red-500">*</span></Label>
                <Controller
                  name="auctionDurationDays"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={(val) => field.onChange(Number(val))} value={String(field.value || 3)}>
                      <SelectTrigger className="h-12 focus:ring-primary font-medium text-base">
                        <span className="flex flex-1 text-left">
                          {field.value === 1 && '1 ngày (Nhanh chóng)'}
                          {field.value === 3 && '3 ngày (Tiêu chuẩn)'}
                          {field.value === 5 && '5 ngày'}
                          {field.value === 7 && '7 ngày (Tối đa lợi nhuận)'}
                          {!field.value && 'Chọn thời gian'}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 ngày (Nhanh chóng)</SelectItem>
                        <SelectItem value="3">3 ngày (Tiêu chuẩn)</SelectItem>
                        <SelectItem value="5">5 ngày</SelectItem>
                        <SelectItem value="7">7 ngày (Tối đa lợi nhuận)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <p className="text-xs text-muted-foreground mt-1">Đảm bảo người mua có đủ thời gian tham gia trả giá.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row items-center gap-4 p-6 pt-4 border-t border-border bg-background/50 backdrop-blur z-20">
        {currentStep > 1 && (
          <Button type="button" variant="outline" onClick={handlePrevStep} className="w-full sm:w-1/3 h-14 rounded-2xl text-base font-bold bg-background/50 hover:bg-accent hover:text-accent-foreground border-border">
            Quay lại
          </Button>
        )}
        {currentStep < 3 ? (
          <Button type="button" onClick={handleNextStep} className="w-full sm:flex-1 h-14 rounded-2xl text-base font-bold bg-primary hover:bg-primary/90 neon-glow transition-all">
            Tiếp tục
          </Button>
        ) : (
          <Button
            type="submit"
            className="w-full sm:flex-1 h-14 rounded-2xl text-base font-bold bg-primary hover:bg-primary/90 neon-glow transition-all shadow-lg"
            disabled={mutation.isPending || uploadImageMutation.isPending || uploadVideoMutation.isPending}
          >
            {(uploadImageMutation.isPending || uploadVideoMutation.isPending) ? 'Đang tải media...' : mutation.isPending ? 'Đang xử lý...' : 'Hoàn tất & Đăng bán'}
          </Button>
        )}
      </div>
    </form>
  );
};
