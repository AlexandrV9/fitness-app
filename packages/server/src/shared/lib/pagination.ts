export type PaginationMeta = {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type PaginationParams = { page: number; size: number };

export type PaginatedResult<T> = { data: T[]; pagination: PaginationMeta };

export const buildPaginationMeta = (
  page: number,
  limit: number,
  totalCount: number,
): PaginationMeta => {
  if (limit <= 0) {
    throw new Error("Limit must be > 0");
  }

  const totalPages = Math.ceil(totalCount / limit);

  return {
    page,
    limit,
    totalCount,
    totalPages,
    hasNext: page < totalPages - 1,
    hasPrev: page > 0,
  };
};
