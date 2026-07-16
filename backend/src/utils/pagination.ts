import { Request } from 'express';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  search?: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function parsePagination(req: Request): PaginationParams {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const skip = (page - 1) * limit;
  const search = (req.query.search as string) || undefined;
  const sortBy = (req.query.sortBy as string) || 'createdAt';
  const sortOrder = (req.query.sortOrder as 'asc' | 'desc') === 'asc' ? 'asc' : 'desc';

  return { page, limit, skip, search, sortBy, sortOrder };
}

export function buildSearchClause(fields: string[], search?: string): any[] | undefined {
  if (!search || search.trim().length === 0) return undefined;
  const term = search.trim();
  return fields.map((field) => ({ [field]: { contains: term, mode: 'insensitive' as const } }));
}

export async function paginate<T>(
  findManyPromise: Promise<T[]>,
  countPromise: Promise<number>,
  params: PaginationParams
): Promise<PaginatedResult<T>> {
  const [data, total] = await Promise.all([findManyPromise, countPromise]);
  return {
    data,
    total,
    page: params.page,
    limit: params.limit,
    totalPages: Math.ceil(total / params.limit),
  };
}
