'use client';

import { Camera, ShieldCheck, Mail, Calendar, Users } from 'lucide-react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { IMAGE_ACCEPT } from '@/features/media/validation/mediaValidation';

interface ProfileSidebarProps {
  profile: any;
  followerCount: number;
  followersList: any[];
  currentAvatar: string | null;
  handleAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export function ProfileSidebar({
  profile,
  followerCount,
  followersList,
  currentAvatar,
  handleAvatarChange,
  fileInputRef
}: ProfileSidebarProps) {
  const getTierInfo = () => {
    switch (profile.tier) {
      case 'DIAMOND':
        return { label: '💎 KIM CƯƠNG', color: 'text-cyan-500', max: 50000000 };
      case 'GOLD':
        return { label: '🏆 VÀNG', color: 'text-yellow-500', max: 50000000 };
      case 'SILVER':
        return { label: '🥈 BẠC', color: 'text-slate-400', max: 20000000 };
      default:
        return { label: '🥉 ĐỒNG', color: 'text-amber-600', max: 5000000 };
    }
  };

  const tierInfo = getTierInfo();
  const progressPercent = Math.min(100, ((profile.totalPoints || 0) / tierInfo.max) * 100);
  const remainingPoints = tierInfo.max - (profile.totalPoints || 0);

  return (
    <div className="p-6 md:p-8 rounded-2xl border border-border bg-card flex flex-col items-center h-fit shadow-sm">
      <div className="relative group mb-5">
        <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-background shadow-md bg-muted flex items-center justify-center">
          {currentAvatar ? (
            <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl md:text-5xl font-black text-muted-foreground">
              {profile.username?.substring(0, 2).toUpperCase() || 'U'}
            </span>
          )}
        </div>
        <div
          className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm"
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera className="w-8 h-8 text-white" />
          <span className="sr-only">Đổi ảnh đại diện</span>
        </div>
        <input type="file" ref={fileInputRef as React.RefObject<HTMLInputElement>} className="hidden" accept={IMAGE_ACCEPT} onChange={handleAvatarChange} />
      </div>

      <h2 className="text-xl md:text-2xl font-bold text-foreground text-center line-clamp-1">{profile.fullName || profile.username}</h2>
      <p className="text-muted-foreground font-medium mt-1 text-sm md:text-base">@{profile.username}</p>

      {profile.role === 'ADMIN' && (
        <div className="mt-3 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold flex items-center">
          <ShieldCheck className="w-4 h-4 mr-1.5" /> Quản trị viên
        </div>
      )}

      {/* Gamification Tier */}
      <div className="mt-6 w-full bg-muted/50 border border-border/50 rounded-xl p-4">
        <div className="flex justify-between items-center mb-2 text-xs font-bold">
          <span className="uppercase tracking-widest text-muted-foreground">Hạng</span>
          <span className={`${tierInfo.color} font-bold flex items-center`}>
            {tierInfo.label}
          </span>
        </div>

        {profile.tier !== 'DIAMOND' && (
          <>
            <div className="w-full h-2 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-1000 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center font-medium">
              Còn <span className="font-bold text-foreground">{new Intl.NumberFormat('vi-VN').format(remainingPoints)} điểm</span> để thăng hạng
            </p>
          </>
        )}
        {profile.tier === 'DIAMOND' && (
          <p className="text-xs text-cyan-500 mt-2 text-center font-bold">
            Hạng cao nhất!
          </p>
        )}
      </div>

      <div className="w-full h-px bg-border my-6"></div>

      <div className="w-full space-y-3">
        <div className="flex items-center text-sm">
          <Mail className="w-4 h-4 text-muted-foreground mr-3 flex-shrink-0" />
          <span className="text-foreground font-medium truncate">{profile.email}</span>
        </div>
        <div className="flex items-center text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground mr-3 flex-shrink-0" />
          <span className="text-foreground font-medium">Tham gia {new Date(profile.createdAt).toLocaleDateString('vi-VN')}</span>
        </div>

        <Dialog>
          <DialogTrigger
            render={
              <button className="flex items-center text-sm hover:text-primary transition-colors cursor-pointer w-full text-left" />
            }
          >
            <Users className="w-4 h-4 text-muted-foreground mr-3 flex-shrink-0" />
            <span className="text-foreground font-medium">
              {followerCount} Người theo dõi
            </span>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-center">Người theo dõi ({followerCount})</DialogTitle>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto pr-2 mt-4 space-y-2">
              {followersList && followersList.length > 0 ? (
                followersList.map((follower: any) => (
                  <div key={follower.id} className="flex items-center justify-between gap-3 p-2 hover:bg-muted rounded-xl transition-colors">
                    <Link href={`/users/${follower.username}`} className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border border-border">
                        <AvatarImage src={follower.avatar} alt={follower.fullName || follower.username} className="object-cover" />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {(follower.fullName || follower.username || 'U').substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm text-foreground line-clamp-1">{follower.fullName || follower.username}</p>
                        <p className="text-xs text-muted-foreground">@{follower.username}</p>
                      </div>
                    </Link>
                    <Link href={`/users/${follower.username}`}>
                      <Button variant="outline" size="sm" className="rounded-lg h-8 text-xs">
                        Xem
                      </Button>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-8 h-8 mx-auto text-muted mb-2" />
                  <p className="text-sm">Chưa có người theo dõi.</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
