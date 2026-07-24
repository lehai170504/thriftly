'use client';

import { useState, useEffect, useRef } from 'react';
import { useProfile, useUpdateProfile } from '@/features/users/hooks/useUsers';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import { uploadImage } from '@/features/media/api/mediaApi';
import Link from 'next/link';
import { ProfileSkeleton } from '@/components/ui/loading-skeletons';
import { ShippingInfoForm } from '@/components/ui/ShippingInfoForm';
import { useFollow } from '@/features/users/hooks/useFollow';
import { ProfileSidebar } from '@/features/users/components/ProfileSidebar';
import { ChangePasswordForm } from '@/features/users/components/ChangePasswordForm';
import { BankAccountManager } from '@/features/wallet/components/BankAccountManager';

export default function ProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const updateMutation = useUpdateProfile();
  const { followerCount, followersList } = useFollow(profile?.username || '');

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setPhone(profile.phone || '');
      setAddress(profile.address || '');
      setAvatarPreview(profile.avatar || null);
    }
  }, [profile]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    let avatarUrl = profile?.avatar;
    try {
      if (avatarFile) {
        avatarUrl = await uploadImage(avatarFile);
      }
      updateMutation.mutate(
        { fullName, phone, address, avatar: avatarUrl },
        {
          onSuccess: () => {
            toast.success('Lưu thông tin thành công!');
            setAvatarFile(null);
          },
          onError: () => {
            toast.error('Có lỗi xảy ra khi lưu thông tin');
          }
        }
      );
    } catch (error) {
      toast.error('Lỗi upload ảnh');
    }
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!profile) return null;

  const currentAvatar = avatarPreview || profile.avatar || null;
  const isChanged = fullName !== (profile.fullName || '') ||
    phone !== (profile.phone || '') ||
    address !== (profile.address || '') ||
    avatarFile !== null;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Banner */}
      <div className="h-40 md:h-48 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl h-full flex flex-col pt-6 relative z-10">
          <Link href="/">
            <Button variant="ghost" className="text-primary-foreground hover:bg-black/10 rounded-xl w-fit px-3 h-8 text-sm">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Trang chủ
            </Button>
          </Link>

          <div className="mt-4 md:mt-6">
            <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground tracking-tight">
              Hồ sơ cá nhân
            </h1>
            <p className="text-primary-foreground/80 mt-1.5 font-medium max-w-lg text-sm">
              Quản lý thông tin liên hệ và cập nhật tài khoản của bạn.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
          {/* Sidebar Left: Profile summary & Nav */}
          <div className="sticky top-24">
            <ProfileSidebar
              profile={profile}
              followerCount={followerCount}
              followersList={followersList}
              currentAvatar={currentAvatar}
              handleAvatarChange={handleAvatarChange}
              fileInputRef={fileInputRef}
            />
          </div>

          {/* Main Right: Forms and Settings */}
          <div className="p-6 md:p-8 lg:col-span-2 rounded-2xl border border-border bg-card shadow-sm">
            <Tabs defaultValue="info" className="w-full flex flex-col gap-6">
              <TabsList className="w-fit p-1 bg-muted rounded-xl">
                <TabsTrigger value="info" className="rounded-lg px-6 py-2 text-sm font-semibold transition-all">
                  Thông tin chung
                </TabsTrigger>
                <TabsTrigger value="password" className="rounded-lg px-6 py-2 text-sm font-semibold transition-all">
                  Đổi mật khẩu
                </TabsTrigger>
                <TabsTrigger value="bank" className="rounded-lg px-6 py-2 text-sm font-semibold transition-all">
                  Ngân hàng
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="focus-visible:outline-none data-[state=active]:animate-in data-[state=active]:fade-in duration-300">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-foreground">Thông tin liên hệ & Địa chỉ</h2>
                </div>

                <div className="space-y-6">
                  <ShippingInfoForm
                    fullName={fullName}
                    onChangeFullName={setFullName}
                    phone={phone}
                    onChangePhone={setPhone}
                    address={address}
                    onChangeAddress={setAddress}
                    showMap={true}
                  />

                  <div className="pt-4 flex justify-end">
                    <Button
                      size="lg"
                      className="rounded-xl px-8 font-bold shadow-sm"
                      onClick={handleSave}
                      disabled={updateMutation.isPending || !isChanged}
                    >
                      {updateMutation.isPending ? (
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-5 h-5 mr-2" />
                      )}
                      {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="password" className="focus-visible:outline-none data-[state=active]:animate-in data-[state=active]:fade-in duration-300">
                <ChangePasswordForm />
              </TabsContent>

              <TabsContent value="bank" className="focus-visible:outline-none data-[state=active]:animate-in data-[state=active]:fade-in duration-300">
                <BankAccountManager />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
