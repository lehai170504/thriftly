package com.ecommerce.thriftauction.features.media.validator;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.Set;

@Component
public class MediaUploadValidator {

    private static final long MAX_IMAGE_SIZE = 10L * 1024L * 1024L;
    private static final long MAX_VIDEO_SIZE = 50L * 1024L * 1024L;

    private static final Set<String> ALLOWED_IMAGE_MIME_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif");

    private static final Set<String> ALLOWED_VIDEO_MIME_TYPES = Set.of(
            "video/mp4",
            "video/webm",
            "video/quicktime");

    public void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File tải lên không được để trống.");
        }
        if (file.getSize() > MAX_IMAGE_SIZE) {
            throw new IllegalArgumentException("Kích thước file ảnh vượt quá giới hạn tối đa 10MB.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Định dạng ảnh không được hỗ trợ. Chỉ chấp nhận JPEG, PNG, WEBP, GIF.");
        }

        byte[] header = readHeader(file, 16);
        if (!isJpeg(header) && !isPng(header) && !isGif(header) && !isWebp(header)) {
            throw new IllegalArgumentException("Chữ ký nội dung file ảnh không hợp lệ.");
        }
    }

    public void validateVideo(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File tải lên không được để trống.");
        }
        if (file.getSize() > MAX_VIDEO_SIZE) {
            throw new IllegalArgumentException("Kích thước file video vượt quá giới hạn tối đa 50MB.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_VIDEO_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException(
                    "Định dạng video không được hỗ trợ. Chỉ chấp nhận MP4, WEBM, QuickTime.");
        }

        byte[] header = readHeader(file, 16);
        if (!isMp4OrMov(header) && !isWebm(header)) {
            throw new IllegalArgumentException("Chữ ký nội dung file video không hợp lệ.");
        }
    }

    private byte[] readHeader(MultipartFile file, int bytesToRead) {
        try (InputStream inputStream = file.getInputStream()) {
            byte[] buffer = new byte[bytesToRead];
            int read = inputStream.read(buffer, 0, bytesToRead);
            if (read < Math.min(4, bytesToRead)) {
                throw new IllegalArgumentException("File không đủ độ dài hợp lệ.");
            }
            return buffer;
        } catch (IOException e) {
            throw new IllegalArgumentException("Không thể đọc nội dung file.", e);
        }
    }

    private boolean isJpeg(byte[] h) {
        return h.length >= 3 && (h[0] & 0xFF) == 0xFF && (h[1] & 0xFF) == 0xD8 && (h[2] & 0xFF) == 0xFF;
    }

    private boolean isPng(byte[] h) {
        return h.length >= 8
                && (h[0] & 0xFF) == 0x89
                && h[1] == 0x50
                && h[2] == 0x4E
                && h[3] == 0x47
                && h[4] == 0x0D
                && h[5] == 0x0A
                && h[6] == 0x1A
                && h[7] == 0x0A;
    }

    private boolean isGif(byte[] h) {
        return h.length >= 6
                && h[0] == 'G' && h[1] == 'I' && h[2] == 'F' && h[3] == '8'
                && (h[4] == '7' || h[4] == '9') && h[5] == 'a';
    }

    private boolean isWebp(byte[] h) {
        return h.length >= 12
                && h[0] == 'R' && h[1] == 'I' && h[2] == 'F' && h[3] == 'F'
                && h[8] == 'W' && h[9] == 'E' && h[10] == 'B' && h[11] == 'P';
    }

    private boolean isMp4OrMov(byte[] h) {
        if (h.length < 8)
            return false;
        return h[4] == 'f' && h[5] == 't' && h[6] == 'y' && h[7] == 'p';
    }

    private boolean isWebm(byte[] h) {
        return h.length >= 4
                && (h[0] & 0xFF) == 0x1A
                && (h[1] & 0xFF) == 0x45
                && (h[2] & 0xFF) == 0xDF
                && (h[3] & 0xFF) == 0xA3;
    }
}
