export const toSearch = (q?: Record<string, any>) =>
  q ? `?${new URLSearchParams(q as any).toString()}` : "";
