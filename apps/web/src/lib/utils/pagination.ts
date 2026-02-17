export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;

type ParamSource =
  | URLSearchParams
  | Record<string, string | string[] | undefined>;

export function parsePaginationParams(params: ParamSource): {
  page: number;
  pageSize: number;
} {
  let rawPage: string | null | undefined;
  let rawPageSize: string | null | undefined;

  if (params instanceof URLSearchParams) {
    rawPage = params.get('page');
    rawPageSize = params.get('pageSize');
  } else {
    const p = params.page;
    rawPage = Array.isArray(p) ? p[0] : p;
    const ps = params.pageSize;
    rawPageSize = Array.isArray(ps) ? ps[0] : ps;
  }

  const page = Math.max(1, parseInt(rawPage ?? '1', 10) || 1);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, parseInt(rawPageSize ?? String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE),
  );

  return { page, pageSize };
}

export function toSupabaseRange({ page, pageSize }: { page: number; pageSize: number }) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { from, to };
}

export function computeTotalPages(total: number, pageSize: number) {
  return Math.max(1, Math.ceil(total / pageSize));
}
