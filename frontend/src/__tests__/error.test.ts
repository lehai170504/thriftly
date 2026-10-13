import { describe, it, expect } from 'vitest';
import { extractError, extractFieldErrors } from '../lib/error';

describe('extractError and extractFieldErrors', () => {
  it('extracts first fieldError if present', () => {
    const error = {
      response: {
        data: {
          message: 'Validation failed',
          fieldErrors: {
            title: 'Tiêu đề không được để trống',
            price: 'Giá phải lớn hơn 0',
          },
        },
      },
    };

    const message = extractError(error);
    expect(message).toBe('Tiêu đề không được để trống');

    const fieldErrors = extractFieldErrors(error);
    expect(fieldErrors).toEqual({
      title: 'Tiêu đề không được để trống',
      price: 'Giá phải lớn hơn 0',
    });
  });

  it('extracts message when fieldErrors is missing', () => {
    const error = {
      response: {
        data: {
          message: 'Số dư ví không đủ để thực hiện giao dịch',
        },
      },
    };

    expect(extractError(error)).toBe('Số dư ví không đủ để thực hiện giao dịch');
  });

  it('extracts string response data directly', () => {
    const error = {
      response: {
        data: 'Tài khoản đã bị tạm khóa',
      },
    };

    expect(extractError(error)).toBe('Tài khoản đã bị tạm khóa');
  });

  it('falls back to default message for empty or unrecognized error', () => {
    expect(extractError(null, 'Lỗi mặc định')).toBe('Lỗi mặc định');
    expect(extractError({}, 'Lỗi mặc định')).toBe('Lỗi mặc định');
    expect(extractFieldErrors({})).toBeNull();
  });
});
