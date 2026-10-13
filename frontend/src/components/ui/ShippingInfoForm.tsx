'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Loader2, Map as MapIcon, Info } from 'lucide-react';
import dynamic from 'next/dynamic';

const AddressMap = dynamic(() => import('@/features/profile/components/AddressMap'), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-muted animate-pulse rounded-[24px] flex items-center justify-center text-muted-foreground"><MapIcon className="w-8 h-8 opacity-20" /></div>
});

export interface ShippingInfoFormProps {
  fullName: string;
  onChangeFullName: (val: string) => void;
  phone: string;
  onChangePhone: (val: string) => void;
  address: string;
  onChangeAddress: (val: string) => void;
  showMap?: boolean;
  errors?: {
    fullName?: string;
    phone?: string;
    address?: string;
  };
}

export function ShippingInfoForm({
  fullName, onChangeFullName,
  phone, onChangePhone,
  address, onChangeAddress,
  showMap = true,
  errors
}: ShippingInfoFormProps) {
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [mapCoordinates, setMapCoordinates] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!address || address.length < 3) {
      setAddressSuggestions([]);
      setIsSearchingAddress(false);
      return;
    }
    setIsSearchingAddress(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=vn&limit=5`);
        const data = await res.json();
        setAddressSuggestions(data);
      } catch (error) {
        console.error('Error fetching address:', error);
      } finally {
        setIsSearchingAddress(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [address]);

  useEffect(() => {
    if (address && !mapCoordinates && showMap) {
      const getCoords = async () => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=vn&limit=1`);
          const data = await res.json();
          if (data && data.length > 0) {
            setMapCoordinates([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
          }
        } catch { }
      };
      getCoords();
    }
  }, [showMap, address, mapCoordinates]);

  return (
    <div className="space-y-6">
      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-[24px] flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-200 leading-relaxed">
          <strong>Lưu ý quan trọng:</strong> Vui lòng nhập chính xác Họ tên, Số điện thoại và Địa chỉ.
          Thriftly hoạt động theo mô hình pass đồ, do đó đây sẽ là <strong>thông tin liên lạc và địa chỉ giao nhận hàng chính thức</strong> của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-foreground">Họ và tên</Label>
          <Input
            value={fullName}
            onChange={(e) => onChangeFullName(e.target.value)}
            placeholder="VD: Nguyễn Văn A"
            className={`bg-background/50 border-border h-12 rounded-xl focus-visible:ring-primary focus-visible:bg-background transition-colors text-foreground ${errors?.fullName ? 'border-red-500' : ''}`}
          />
          {errors?.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-foreground">Số điện thoại liên hệ</Label>
          <Input
            value={phone}
            onChange={(e) => onChangePhone(e.target.value)}
            placeholder="VD: 0912345678"
            className={`bg-background/50 border-border h-12 rounded-xl focus-visible:ring-primary focus-visible:bg-background transition-colors text-foreground ${errors?.phone ? 'border-red-500' : ''}`}
          />
          {errors?.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>
      </div>

      <div className="space-y-2 relative">
        <Label className="text-sm font-semibold text-foreground">Địa chỉ giao hàng</Label>
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            value={address}
            onChange={(e) => {
              onChangeAddress(e.target.value);
            }}
            placeholder="Gõ để tìm kiếm địa chỉ tự động..."
            className={`pl-11 bg-background/50 border-border h-12 rounded-xl focus-visible:ring-primary focus-visible:bg-background transition-colors text-foreground ${errors?.address ? 'border-red-500' : ''}`}
          />
          {isSearchingAddress && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            </div>
          )}
        </div>
        {errors?.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}

        {addressSuggestions.length > 0 && (
          <div className="absolute top-[80px] left-0 right-0 glass border-border shadow-2xl rounded-2xl z-[100] max-h-60 overflow-y-auto overflow-x-hidden">
            {addressSuggestions.map((s: any) => (
              <div
                key={s.place_id}
                className="px-4 py-3 text-sm text-foreground hover:bg-primary/10 hover:text-primary cursor-pointer border-b border-border last:border-0 flex items-start gap-3 transition-colors"
                onClick={() => {
                  onChangeAddress(s.display_name);
                  setMapCoordinates([parseFloat(s.lat), parseFloat(s.lon)]);
                  setAddressSuggestions([]);
                  setIsSearchingAddress(false);
                }}
              >
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary/60" />
                <span className="line-clamp-2">{s.display_name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showMap && (
        mapCoordinates ? (
          <div className="mt-4 pt-2">
            <Label className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <MapIcon className="w-4 h-4 text-primary" /> Vị trí trên bản đồ
            </Label>
            <AddressMap lat={mapCoordinates[0]} lon={mapCoordinates[1]} />
          </div>
        ) : (
          <div className="h-64 w-full bg-muted/20 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-muted-foreground mt-4">
            <MapPin className="w-10 h-10 mb-2 opacity-50" />
            <p className="text-sm font-medium">Bản đồ sẽ hiển thị khi bạn chọn địa chỉ</p>
          </div>
        )
      )}
    </div>
  );
}
