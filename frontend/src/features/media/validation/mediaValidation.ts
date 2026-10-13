export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';
export const VIDEO_ACCEPT = 'video/mp4,video/webm,video/quicktime';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const IMAGE_TYPES = new Set(IMAGE_ACCEPT.split(','));
const VIDEO_TYPES = new Set(VIDEO_ACCEPT.split(','));

const validateFile = (file: File, allowedTypes: Set<string>, maxBytes: number, label: string): void => {
  if (file.size === 0) throw new Error(`File ${label} không được để trống.`);
  if (!allowedTypes.has(file.type.toLowerCase())) {
    throw new Error(`Định dạng ${label} không được hỗ trợ.`);
  }
  if (file.size > maxBytes) {
    throw new Error(`Kích thước ${label} vượt quá giới hạn ${maxBytes / 1024 / 1024}MB.`);
  }
};

export const validateImageFile = (file: File): void =>
  validateFile(file, IMAGE_TYPES, MAX_IMAGE_BYTES, 'ảnh');

export const validateVideoFile = (file: File): void =>
  validateFile(file, VIDEO_TYPES, MAX_VIDEO_BYTES, 'video');
