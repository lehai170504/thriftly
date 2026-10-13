import { useMutation } from '@tanstack/react-query';
import { uploadImage, uploadVideo } from '@/features/media/api/mediaApi';
import { toast } from 'sonner';
import { extractError } from '@/lib/utils';

export const useUploadImage = () => {
  return useMutation({
    mutationFn: (file: File) => uploadImage(file),
    onError: (error) => {
      toast.error(extractError(error, 'Lỗi khi tải ảnh lên'));
    },
  });
};

export const useUploadVideo = () => {
  return useMutation({
    mutationFn: (file: File) => uploadVideo(file),
    onError: (error) => {
      toast.error(extractError(error, 'Lỗi khi tải video lên'));
    },
  });
};
