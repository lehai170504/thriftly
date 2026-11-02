import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email là bắt buộc').email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  fullName: z.string().min(1, 'Họ và tên là bắt buộc'),
  username: z.string().min(3, 'Tên người dùng phải có ít nhất 3 ký tự').max(50, 'Tên người dùng tối đa 50 ký tự'),
  email: z.string().min(1, 'Email là bắt buộc').email('Email không hợp lệ'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email là bắt buộc').email('Email không hợp lệ'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  otp: z.string().min(6, 'Mã OTP gồm 6 số').max(6, 'Mã OTP gồm 6 số'),
  newPassword: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
