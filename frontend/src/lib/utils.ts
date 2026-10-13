import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string | undefined | null) {
  if (amount === undefined || amount === null) return '0 ₫';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0 ₫';

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(num);
}

export function formatNotificationMessage(message: string): string {
  if (!message) return '';
  return message.replace(/([\d.,]+)\s*(đ|vnd|vnđ)(?![a-zA-Zàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệđìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ])/gi, (match, rawAmount) => {
    let clean = rawAmount.replace(/\.0+$/, '');
    if (/\d+\.\d{3}/.test(clean)) {
      clean = clean.replace(/\./g, '');
    }
    clean = clean.replace(/,/g, '');

    const amount = parseFloat(clean);
    if (isNaN(amount)) return match;
    return formatCurrency(amount);
  });
}

export const preventInvalidNumberInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (['.', ',', 'e', 'E', '+', '-'].includes(e.key)) {
    e.preventDefault();
  }
};

export { extractError, extractFieldErrors } from './error';

/**
 * Converts an array of objects into a CSV string and triggers a browser download.
 */
export function downloadCSV(data: any[], filename: string) {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Add headers
  csvRows.push(headers.join(','));

  // Add rows
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      const escaped = ('' + (val ?? '')).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  // Add BOM for Excel UTF-8 compatibility
  const csvString = '\uFEFF' + csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
