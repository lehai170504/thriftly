import { PageResponse, NormalizedPage } from '@/types/pagination';

export function normalizePageResponse<T>(response?: PageResponse<T> | null): NormalizedPage<T> {
  const content = Array.isArray(response?.content) ? response.content : [];
  const pageMeta = response?.page;
  const pageNumber = typeof pageMeta?.number === 'number' ? pageMeta.number : 0;
  const pageSize = typeof pageMeta?.size === 'number' && pageMeta.size > 0 ? pageMeta.size : 20;
  const totalElements = typeof pageMeta?.totalElements === 'number' ? pageMeta.totalElements : content.length;
  const totalPages = typeof pageMeta?.totalPages === 'number'
    ? pageMeta.totalPages
    : Math.max(1, Math.ceil(totalElements / pageSize));

  const isFirst = pageNumber <= 0;
  const isLast = pageNumber >= totalPages - 1;

  return {
    content,
    pageNumber,
    pageSize,
    totalElements,
    totalPages,
    isFirst,
    isLast,
    hasNext: !isLast,
    hasPrevious: !isFirst,
  };
}
