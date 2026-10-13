import { describe, it, expect } from 'vitest';
import { normalizePageResponse } from '../lib/pagination';

describe('normalizePageResponse', () => {
  it('correctly normalizes Spring Boot VIA_DTO page serialization format', () => {
    const rawResponse = {
      content: [{ id: 'p1', name: 'Item 1' }, { id: 'p2', name: 'Item 2' }],
      page: {
        size: 10,
        number: 1,
        totalElements: 25,
        totalPages: 3,
      },
    };

    const result = normalizePageResponse(rawResponse);

    expect(result.content).toHaveLength(2);
    expect(result.content[0].id).toBe('p1');
    expect(result.pageNumber).toBe(1);
    expect(result.pageSize).toBe(10);
    expect(result.totalPages).toBe(3);
    expect(result.totalElements).toBe(25);
    expect(result.isLast).toBe(false);
  });

  it('correctly handles legacy Spring Boot pagination format', () => {
    const rawLegacyResponse = {
      content: [{ id: 'p1', name: 'Item 1' }],
      totalPages: 1,
      totalElements: 1,
      number: 0,
      size: 10,
      last: true,
    };

    const result = normalizePageResponse(rawLegacyResponse);

    expect(result.content).toHaveLength(1);
    expect(result.pageNumber).toBe(0);
    expect(result.totalPages).toBe(1);
    expect(result.totalElements).toBe(1);
    expect(result.isLast).toBe(true);
  });

  it('safely handles null, undefined, or empty data', () => {
    const emptyResult = normalizePageResponse(undefined);

    expect(emptyResult.content).toEqual([]);
    expect(emptyResult.pageNumber).toBe(0);
    expect(emptyResult.pageSize).toBe(20);
    expect(emptyResult.totalPages).toBe(1);
    expect(emptyResult.totalElements).toBe(0);
    expect(emptyResult.isLast).toBe(true);
  });
});
