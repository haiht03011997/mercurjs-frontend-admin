// services/price-lists.ts

import { PriceListStatus, PriceListType } from "@medusajs/types/dist/pricing";
import { api } from "../../../lib/client";
import { toSearch } from "../../../lib/client/http";

export type PriceList = {
  id: string;
  title: string;
  schedule_mode?: "range" | "specific_dates";
  starts_at?: string | null;
  ends_at?: string | null;
  specific_dates?: string[] | null;
  description: string;
  rules: Record<string, any>;
  status: PriceListStatus;
  type: PriceListType;
  prices: AdminPriceListPrice[];
  created_at: string;
  updated_at: string;
};

export interface AdminPriceListPrice {
  currency_code?: string;
  amount?: number;
  mode?: string;
  variant_id: string;
  min_quantity?: number | null;
  max_quantity?: number | null;
  rules?: Record<string, string>;
}

export interface AdminPriceListResponse {
  /**
   * The price list's details.
   */
  price_list: PriceList;
}

export async function fetchPriceList(
  id: string,
  query?: Record<string, any>,
  signal?: AbortSignal
): Promise<PriceList> {
  const { data } = await api.get<{ price_list: PriceList }>(
    `/admin/price-lists-v2/${id}${toSearch(query)}`,
    { signal }
  );
  return data.price_list;
}

export async function createPriceList(
  payload: any,
  signal?: AbortSignal
): Promise<PriceList> {
  const { data } = await api.post<{ price_list: PriceList }>(
    `/admin/price-lists-v2`,
    payload,
    { signal }
  );
  return data.price_list;
}
