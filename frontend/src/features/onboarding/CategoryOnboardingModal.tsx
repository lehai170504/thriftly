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
    // Show modal if user is authenticated and has no interests set
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

  // prevent user from clicking outside to close
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Force user to pick categories, do not allow closing
      return;
    }
    setIsOpen(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto [&>button:last-child]:hidden glass border-border rounded-[24px]">
        <DialogHeader>
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
            <Compass className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-heading font-bold text-center flex items-center justify-center gap-2 text-foreground">
            Chào mừng bạn đến với Thriftly!
          </DialogTitle>
          <DialogDescription className="text-center text-base text-muted-foreground">
            Hãy chọn những danh mục bạn quan tâm để chúng mình gợi ý sản phẩm phù hợp nhất nhé.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 py-6">
          {categories?.map((cat) => {
            const isSelected = selectedInterests.includes(cat.id);
            return (
              <div
                key={cat.id}
                onClick={() => toggleInterest(cat.id)}
                className={`relative flex flex-col items-center justify-center p-4 rounded-[24px] border-2 cursor-pointer transition-all duration-300 group ${isSelected
                  ? 'border-primary bg-primary/10 shadow-sm scale-[1.02]'
                  : 'border-border bg-background/50 hover:border-primary/40 hover:bg-accent'
                  }`}
              >
                <CategoryIcon name={cat.icon} className={`w-8 h-8 mb-3 transition-colors ${isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-primary/70'}`} />
                <span className={`text-sm font-semibold text-center transition-colors ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                  {cat.name}
                </span>
                {isSelected && (
                  <div className="absolute top-2 right-2 text-primary animate-in zoom-in duration-300 shadow-sm rounded-full">
                    <CheckCircle2 size={18} className="fill-primary text-primary-foreground" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <DialogFooter className="sm:justify-center">
          <Button
            onClick={handleSave}
            disabled={isSaving || selectedInterests.length === 0}
            className="w-full sm:w-auto min-w-[200px] h-12 rounded-[24px] bg-primary text-primary-foreground text-lg font-bold hover:bg-primary/90"
          >
            {isSaving ? "Đang lưu..." : "Bắt đầu khám phá"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
