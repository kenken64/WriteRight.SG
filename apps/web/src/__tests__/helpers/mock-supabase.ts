import { vi } from 'vitest';

export type MockChain = {
  select: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  not: ReturnType<typeof vi.fn>;
  gte: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  limit: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
};

export function createMockChain(data: any = null, error: any = null): MockChain {
  const chain: any = {};
  const terminal = { data, error, count: Array.isArray(data) ? data.length : data ? 1 : 0 };

  for (const method of ['select', 'insert', 'update', 'delete', 'eq', 'not', 'gte', 'order', 'limit']) {
    chain[method] = vi.fn().mockReturnValue(chain);
  }
  chain.single = vi.fn().mockReturnValue(terminal);

  // Make the chain itself awaitable for non-single queries
  Object.assign(chain, terminal);
  return chain;
}

export function createMockSupabase(overrides: Record<string, MockChain> = {}) {
  const tables: Record<string, MockChain> = {};

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123', email: 'test@test.com' } } }),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
    },
    from: vi.fn((table: string) => {
      if (overrides[table]) return overrides[table];
      if (!tables[table]) tables[table] = createMockChain();
      return tables[table];
    }),
  };
}
