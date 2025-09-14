// queries/keys.ts
export const priceListsQueryKeys = {
  all: ["price-lists"] as const,
  list: (q?: any) => ["price-lists", "list", q] as const,
  detail: (id: string, q?: any) => ["price-lists", "detail", id, q] as const,
};
