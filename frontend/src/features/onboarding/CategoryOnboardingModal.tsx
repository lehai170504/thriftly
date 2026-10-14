'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCategories } from '@/features/products/hooks/useProducts';
import { useUpdateProfile } from '@/features/users/hooks/useUsers';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CategoryIcon } from '@/components/ui/category-icon';
import { CheckCircle2, Compass } from 'lucide-react';
import { toast } from 'sonner';

export function CategoryOnboardingModal() {
  const { user, isAuthenticated, login } = useAuth();
  const { data: categories } = useCategories();
  const updateProfileMutation = useUpdateProfile();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (!user.interests || user.interests.length === 0) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    }
  }, [isAuthenticated, user]);

  const toggleInterest = (categoryId: string) => {
    setSelectedInterests(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      }
      return [...prev, categoryId];
    });
  };

  const handleSave = async () => {
    if (selectedInterests.length === 0) {
      toast.error('Vui lòng chọn ít nhất một danh mục');
      return;
    }

    setIsSaving(true);
    updateProfileMutation.mutate({
      fullName: user?.fullName || '',
      phone: user?.phone || '',
      address: user?.address || '',
      avatar: user?.avatar,
      interests: selectedInterests
    }, {
      onSuccess: () => {
        toast.success('Đã lưu danh mục yêu thích!');
        if (user) {
          login({ ...user, interests: selectedInterests });
        }
        setIsOpen(false);
        setIsSaving(false);
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu sở thích');
        setIsSaving(false);
      }
    });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      return;
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto [&>button:last-child]:hidden bg-card border-border rounded-2xl shadow-xl p-6">
        <DialogHeader>
          <div className="w-11 h-11 bg-primary/10 rounded-full flex items-center justify-center mb-3 mx-auto">
            <Compass className="w-5 h-5 text-primary" />
          </div>
          <DialogTitle className="text-xl font-heading font-bold text-center text-foreground">
            Chào mừng bạn đến với Thriftly!
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground">
            Chọn những danh mục bạn quan tâm để chúng tôi gợi ý sản phẩm phù hợp nhất.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 py-4">
          {categories?.map((cat) => {
            const isSelected = selectedInterests.includes(cat.id);
            return (
              <div
                key={cat.id}
                onClick={() => toggleInterest(cat.id)}
                className={`relative flex flex-col items-center justify-center p-3.5 rounded-xl border cursor-pointer transition-all ${isSelected
                  ? 'border-primary bg-primary/5 shadow-2xs'
                  : 'border-border bg-card hover:border-border/80 hover:bg-muted/40'
                  }`}
              >
                <CategoryIcon name={cat.icon} className={`w-6 h-6 mb-2 transition-colors ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-xs font-semibold text-center transition-colors ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                  {cat.name}
                </span>
                {isSelected && (
                  <div className="absolute top-2 right-2 text-primary">
                    <CheckCircle2 size={16} className="fill-primary text-primary-foreground" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <DialogFooter className="sm:justify-center mt-2">
          <Button
            onClick={handleSave}
            disabled={isSaving || selectedInterests.length === 0}
            className="w-full sm:w-auto min-w-[180px] h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 shadow-xs"
          >
            {isSaving ? "Đang lưu..." : "Bắt đầu khám phá"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
