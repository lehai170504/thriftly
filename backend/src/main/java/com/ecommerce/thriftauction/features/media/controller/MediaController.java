package com.ecommerce.thriftauction.features.media.controller;

import com.ecommerce.thriftauction.features.media.service.CloudinaryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/media")
@RequiredArgsConstructor
@Tag(name = "Media", description = "Quản lý tải lên hình ảnh và video qua Cloudinary")
public class MediaController {

    private final CloudinaryService cloudinaryService;

    @Operation(summary = "Tải lên hình ảnh", description = "Tải file hình ảnh lên Cloudinary và nhận URL truy cập.")
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            String url = cloudinaryService.uploadImage(file);
            Map<String, String> response = new HashMap<>();
            response.put("url", url);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload image", e);
        }
    }

    @Operation(summary = "Tải lên video", description = "Tải file video lên Cloudinary và nhận URL truy cập.")
    @PostMapping("/upload-video")
    public ResponseEntity<Map<String, String>> uploadVideo(@RequestParam("file") MultipartFile file) {
        try {
            String url = cloudinaryService.uploadVideo(file);
            Map<String, String> response = new HashMap<>();
            response.put("url", url);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload video", e);
        }
    }
}
