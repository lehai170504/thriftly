export function extractError(error: unknown, defaultMessage: string = 'Có lỗi xảy ra'): string {
  if (!error) return defaultMessage;

  const err = error as { response?: { data?: unknown }; message?: unknown };
  const data = err.response?.data;

  if (data) {
    if (typeof data === 'string') return data;

    if (typeof data === 'object' && data !== null) {
      const dataObj = data as { fieldErrors?: Record<string, unknown>; message?: unknown; error?: unknown };
      if (dataObj.fieldErrors && typeof dataObj.fieldErrors === 'object') {
        const firstFieldError = Object.values(dataObj.fieldErrors)[0];
        if (typeof firstFieldError === 'string') return firstFieldError;
      }

      if (typeof dataObj.message === 'string') return dataObj.message;
      if (typeof dataObj.error === 'string') return dataObj.error;
    }
  }

  if (typeof err.message === 'string') return err.message;

  return defaultMessage;
}

export function extractFieldErrors(error: unknown): Record<string, string> | null {
  const err = error as { response?: { data?: { fieldErrors?: unknown } } };
  const data = err?.response?.data;
  if (data && typeof data === 'object' && data.fieldErrors && typeof data.fieldErrors === 'object') {
    return data.fieldErrors as Record<string, string>;
  }
  return null;
}
