// queries/price-lists.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { priceListsQueryKeys } from "./keys";
import { createPriceList, fetchPriceList } from "../services/price-lists";

export const usePriceList = (
  id: string,
  query?: Record<string, any>,
  options?: any
) =>
  useQuery({
    queryKey: priceListsQueryKeys.detail(id, query),
    queryFn: ({ signal }) => fetchPriceList(id, query, signal), // ✅ abort-friendly
    enabled: !!id,
    keepPreviousData: true,
    staleTime: 30_000,
    ...options,
  });

export const useCreatePriceList = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => createPriceList(payload),
    onSuccess: (pl) => {
      qc.invalidateQueries({ queryKey: priceListsQueryKeys.list() });
      qc.setQueryData(priceListsQueryKeys.detail(pl.id), pl);
    },
  });
};
