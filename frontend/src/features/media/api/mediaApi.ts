import api from '@/lib/axios';
import { validateImageFile, validateVideoFile } from '@/features/media/validation/mediaValidation';

export const uploadImage = async (file: File): Promise<string> => {
  validateImageFile(file);
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.url;
};
export const uploadVideo = async (file: File): Promise<string> => {
  validateVideoFile(file);
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/media/upload-video', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.url;
};
