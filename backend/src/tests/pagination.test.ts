import { parsePagination, buildSearchClause } from '../utils/pagination';

describe('Pagination Utility', () => {
  const makeReq = (query: Record<string, string>) => ({ query }) as any;

  describe('parsePagination', () => {
    it('returns defaults for empty query', () => {
      const result = parsePagination(makeReq({}));
      expect(result).toEqual({
        page: 1,
        limit: 20,
        skip: 0,
        search: undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
    });

    it('parses page and limit', () => {
      const result = parsePagination(makeReq({ page: '3', limit: '10' }));
      expect(result.page).toBe(3);
      expect(result.limit).toBe(10);
      expect(result.skip).toBe(20);
    });

    it('clamps page to minimum 1', () => {
      expect(parsePagination(makeReq({ page: '0' })).page).toBe(1);
      expect(parsePagination(makeReq({ page: '-5' })).page).toBe(1);
    });

    it('clamps limit to 1-100', () => {
      expect(parsePagination(makeReq({ limit: '-1' })).limit).toBe(1);
      expect(parsePagination(makeReq({ limit: '0' })).limit).toBe(20);
      expect(parsePagination(makeReq({ limit: '999' })).limit).toBe(100);
      expect(parsePagination(makeReq({ limit: '50' })).limit).toBe(50);
    });

    it('parses search', () => {
      const result = parsePagination(makeReq({ search: 'honey' }));
      expect(result.search).toBe('honey');
    });

    it('parses sortBy and sortOrder', () => {
      const asc = parsePagination(makeReq({ sortBy: 'name', sortOrder: 'asc' }));
      expect(asc.sortBy).toBe('name');
      expect(asc.sortOrder).toBe('asc');

      const desc = parsePagination(makeReq({ sortOrder: 'desc' }));
      expect(desc.sortOrder).toBe('desc');

      const invalid = parsePagination(makeReq({ sortOrder: 'invalid' }));
      expect(invalid.sortOrder).toBe('desc');
    });
  });

  describe('buildSearchClause', () => {
    it('returns undefined for empty search', () => {
      expect(buildSearchClause(['name'], undefined)).toBeUndefined();
      expect(buildSearchClause(['name'], '')).toBeUndefined();
      expect(buildSearchClause(['name'], '   ')).toBeUndefined();
    });

    it('builds OR clause for single field', () => {
      const result = buildSearchClause(['name'], 'test');
      expect(result).toEqual([{ name: { contains: 'test', mode: 'insensitive' } }]);
    });

    it('builds OR clause for multiple fields', () => {
      const result = buildSearchClause(['nameAr', 'nameEn'], 'queen');
      expect(result).toEqual([
        { nameAr: { contains: 'queen', mode: 'insensitive' } },
        { nameEn: { contains: 'queen', mode: 'insensitive' } },
      ]);
    });

    it('trims whitespace from search term', () => {
      const result = buildSearchClause(['name'], '  test  ');
      expect(result![0].name.contains).toBe('test');
    });
  });
});
