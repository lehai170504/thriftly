'use client';

import { useState, useMemo } from 'react';
import { Tags, Plus, Trash2, Settings2, Search, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdminCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/features/admin/hooks/useAdminCategories';
import { CategoryIcon } from '@/components/ui/category-icon';
import { useUploadImage } from '@/features/media/hooks/useMedia';

export default function AdminCategoriesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: categories = [], isLoading } = useAdminCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const uploadImageMutation = useUploadImage();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadImageMutation.mutate(file, {
        onSuccess: (url) => {
          setFormData(prev => ({ ...prev, icon: url }));
          toast.success('Tải ảnh lên thành công!');
        },
        onError: () => toast.error('Lỗi tải ảnh lên.')
      });
    }
  };

  const handleCreate = (data: any) => {
    const payload = { ...data, parentId: data.parentId === 'root' ? null : data.parentId };
    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Thêm danh mục thành công!');
        setCreateModalOpen(false);
        resetForm();
      },
      onError: () => toast.error('Lỗi khi thêm danh mục.')
    });
  };

  const handleUpdate = (id: string, data: any) => {
    const payload = { ...data, parentId: data.parentId === 'root' ? null : data.parentId };
    updateMutation.mutate({ id, data: payload }, {
      onSuccess: () => {
        toast.success('Cập nhật danh mục thành công!');
        setEditModalOpen(false);
        resetForm();
      },
      onError: () => toast.error('Lỗi khi cập nhật danh mục.')
    });
  };

  const handleDelete = () => {
    if (!selectedId) return;
    deleteMutation.mutate(selectedId, {
      onSuccess: () => {
        toast.success('Xóa danh mục thành công!');
        setDeleteModalOpen(false);
      },
      onError: () => toast.error('Lỗi khi xóa. Đảm bảo danh mục không chứa sản phẩm.')
    });
  };

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{ name: string; description: string; icon: string; parentId: string }>({ name: '', description: '', icon: '', parentId: 'root' });

  const resetForm = () => setFormData({ name: '', description: '', icon: '', parentId: 'root' });

  const handleOpenEdit = (cat: any) => {
    setSelectedId(cat.id);
    setFormData({ name: cat.name, description: cat.description || '', icon: cat.icon || '', parentId: cat.parentId || 'root' });
    setEditModalOpen(true);
  };

  const handleOpenDelete = (id: string) => {
    setSelectedId(id);
    setDeleteModalOpen(true);
  };

  const flattenedCategories = useMemo(() => {
    const flat: any[] = [];
    categories.forEach((cat: any) => {
      flat.push({ ...cat, isSub: false });
      if (cat.subCategories && cat.subCategories.length > 0) {
        cat.subCategories.forEach((sub: any) => {
          flat.push({ ...sub, isSub: true, parentName: cat.name });
        });
      }
    });
    return flat;
  }, [categories]);

  const filteredCategories = flattenedCategories.filter((c: any) => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-fuchsia-500/10 rounded-[24px] glass border border-fuchsia-500/20">
            <Tags className="w-7 h-7 text-fuchsia-400" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Quản lý Danh Mục</h1>
            <p className="text-muted-foreground text-sm">Tổng cộng <span className="font-bold text-foreground">{flattenedCategories.length}</span> danh mục</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full rounded-[24px] bg-background/50 border-border glass"
            />
          </div>
          <Button onClick={() => { resetForm(); setCreateModalOpen(true); }} className="rounded-[24px] shrink-0">
            <Plus className="w-4 h-4 mr-2" />
            Thêm mới
          </Button>
        </div>
      </div>

      <div className="bg-background/50 rounded-[24px] border border-border shadow-lg glass backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[600px]">
            <thead className="bg-muted text-muted-foreground border-b border-border uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-5 py-4 w-16 text-center">Icon</th>
                <th className="px-5 py-4">Tên danh mục</th>
                <th className="px-5 py-4">Mô tả</th>
                <th className="px-5 py-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {isLoading ? (
                <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">Đang tải...</td></tr>
              ) : filteredCategories.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">Chưa có danh mục nào</td></tr>
              ) : (
                filteredCategories.map((cat: any) => (
                  <tr key={cat.id} className="hover:bg-accent transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex justify-center">
                        {cat.icon && (cat.icon.startsWith('http') || cat.icon.startsWith('/')) ? (
                          <div className="w-10 h-10 rounded-md border border-border overflow-hidden bg-background flex items-center justify-center p-1 shadow-sm">
                            <img src={cat.icon} alt={cat.name} className="w-full h-full object-contain" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-md border border-border flex items-center justify-center bg-muted/50 shadow-sm">
                            <CategoryIcon name={cat.icon} className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {cat.isSub ? (
                        <div className="flex items-center text-muted-foreground ml-4 border-l-2 border-border pl-2">
                          ↳ <span className="ml-2 font-medium text-foreground">{cat.name}</span>
                        </div>
                      ) : (
                        <span className="font-bold text-foreground">{cat.name}</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{cat.description || 'Không có mô tả'}</td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenEdit(cat)} className="h-8 w-8 p-0 rounded-full border-blue-500/20 text-blue-400 hover:bg-blue-500/10">
                          <Settings2 className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleOpenDelete(cat.id)} className="h-8 w-8 p-0 rounded-full border-red-500/20 text-red-400 hover:bg-red-500/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-[425px] glass border-border bg-background/90 backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle>Thêm Danh Mục Mới</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tên danh mục *</label>
              <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="bg-muted border-border" placeholder="VD: Điện thoại" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tên Icon (Lucide) hoặc Tải ảnh lên</label>
              <div className="flex gap-2 items-center">
                {formData.icon && (formData.icon.startsWith('http') || formData.icon.startsWith('/')) ? (
                  <div className="w-10 h-10 rounded-md border border-border overflow-hidden shrink-0 bg-background flex items-center justify-center p-1 shadow-sm">
                    <img src={formData.icon} alt="preview" className="w-full h-full object-contain" />
                  </div>
                ) : formData.icon ? (
                  <div className="w-10 h-10 rounded-md border border-border flex items-center justify-center bg-muted shrink-0 shadow-sm">
                    <CategoryIcon name={formData.icon} className="w-5 h-5 text-muted-foreground" />
                  </div>
                ) : null}
                <Input value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })} className="bg-muted border-border flex-1 h-10" placeholder="VD: Laptop hoặc URL ảnh..." />
                <input type="file" id="icon-upload-create" className="hidden" accept="image/*" onChange={handleImageUpload} />
                <Button variant="outline" size="icon" onClick={() => document.getElementById('icon-upload-create')?.click()} disabled={uploadImageMutation.isPending} className="h-10 w-10 shrink-0">
                  {uploadImageMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mô tả</label>
              <Input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="bg-muted border-border" placeholder="Mô tả ngắn..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Danh mục cha</label>
              <Select value={formData.parentId} onValueChange={v => setFormData({ ...formData, parentId: v || 'root' })}>
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue placeholder="Chọn danh mục cha (Tùy chọn)">
                    {formData.parentId === 'root'
                      ? '-- Không có (Danh mục gốc) --'
                      : categories.find((c: any) => c.id === formData.parentId)?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="root">-- Không có (Danh mục gốc) --</SelectItem>
                  {categories.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>Hủy</Button>
            <Button disabled={!formData.name || createMutation.isPending} onClick={() => handleCreate(formData)}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT MODAL */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[425px] glass border-border bg-background/90 backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle>Cập Nhật Danh Mục</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tên danh mục *</label>
              <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="bg-muted border-border" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tên Icon (Lucide) hoặc Tải ảnh lên</label>
              <div className="flex gap-2 items-center">
                {formData.icon && (formData.icon.startsWith('http') || formData.icon.startsWith('/')) ? (
                  <div className="w-10 h-10 rounded-md border border-border overflow-hidden shrink-0 bg-background flex items-center justify-center p-1 shadow-sm">
                    <img src={formData.icon} alt="preview" className="w-full h-full object-contain" />
                  </div>
                ) : formData.icon ? (
                  <div className="w-10 h-10 rounded-md border border-border flex items-center justify-center bg-muted shrink-0 shadow-sm">
                    <CategoryIcon name={formData.icon} className="w-5 h-5 text-muted-foreground" />
                  </div>
                ) : null}
                <Input value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })} className="bg-muted border-border flex-1 h-10" placeholder="VD: Laptop hoặc URL ảnh..." />
                <input type="file" id="icon-upload-edit" className="hidden" accept="image/*" onChange={handleImageUpload} />
                <Button variant="outline" size="icon" onClick={() => document.getElementById('icon-upload-edit')?.click()} disabled={uploadImageMutation.isPending} className="h-10 w-10 shrink-0">
                  {uploadImageMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mô tả</label>
              <Input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="bg-muted border-border" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Danh mục cha</label>
              <Select value={formData.parentId} onValueChange={v => setFormData({ ...formData, parentId: v || 'root' })}>
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue placeholder="Chọn danh mục cha (Tùy chọn)">
                    {formData.parentId === 'root'
                      ? '-- Không có (Danh mục gốc) --'
                      : categories.find((c: any) => c.id === formData.parentId)?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="root">-- Không có (Danh mục gốc) --</SelectItem>
                  {categories.filter((c: any) => c.id !== selectedId).map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>Hủy</Button>
            <Button disabled={!formData.name || updateMutation.isPending} onClick={() => handleUpdate(selectedId!, formData)}>Cập nhật</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE MODAL */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Xóa danh mục"
        description="Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác và có thể gây lỗi nếu có sản phẩm đang sử dụng danh mục này."
        onConfirm={handleDelete}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
