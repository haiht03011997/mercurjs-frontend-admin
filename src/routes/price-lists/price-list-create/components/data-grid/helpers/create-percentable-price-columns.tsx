// components/data-grid/helpers/create-percentable-price-columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import type { HttpTypes } from "@medusajs/types";
import { FieldValues, Path } from "react-hook-form";
import PriceCellWithMode from "../price-cell-with-mode";

type MakeColsArgs<TRow, TForm extends FieldValues> = {
  currencies: string[];
  regions: HttpTypes.AdminRegion[];
  isReadOnly: (ctx: any) => boolean;
  getBaseAmount: (
    row: TRow,
    kind: "currency" | "region",
    key: string
  ) => number;
  getCurrencySymbol?: (code: string) => string;
  getBasePath: (row: TRow, kind: "currency" | "region", key: string) => string;
};

export function createPercentablePriceColumns<TRow, TForm extends FieldValues>({
  currencies,
  regions,
  isReadOnly,
  getBaseAmount,
  getCurrencySymbol = (code) => code,
  getBasePath,
}: MakeColsArgs<TRow, TForm>): ColumnDef<TRow>[] {
  const makePaths = (
    row: TRow,
    kind: "currency" | "region",
    key: string
  ): { amount: Path<TForm>; percent: Path<TForm>; mode: Path<TForm> } => {
    const base = getBasePath(row, kind, key);
    return {
      amount: `${base}.amount` as unknown as Path<TForm>,
      percent: `${base}.percent` as unknown as Path<TForm>,
      mode: `${base}.mode` as unknown as Path<TForm>,
    };
  };

  const currencyCols: ColumnDef<TRow>[] = currencies.map((code) => ({
    id: `currency_prices.${code}`,
    header: code,
    meta: { kind: "currency", code },
    cell: (ctx) => {
      if (isReadOnly(ctx)) {
        const paths = makePaths(ctx.row.original, "currency", code);
        const form = (ctx.table.options.meta as any)?.form as
          | { getValues: (p: Path<TForm>) => any }
          | undefined;
        const amount = form?.getValues?.(paths.amount);
        return (
          <div className="px-2 text-right">
            {getCurrencySymbol(code)} {amount ?? ""}
          </div>
        );
      }

      return (
        <PriceCellWithMode<TForm, TRow>
          context={ctx}
          currencySymbol={getCurrencySymbol(code)}
          getBaseAmount={(row) => getBaseAmount(row as TRow, "currency", code)}
          getPaths={(ictx) => makePaths(ictx.row.original, "currency", code)}
        />
      );
    },
  }));

  const regionCols: ColumnDef<TRow>[] = regions.map((r) => ({
    id: `region_prices.${r.id}`,
    header: r.name,
    meta: { kind: "region", id: r.id },
    cell: (ctx) => {
      if (isReadOnly(ctx)) {
        const paths = makePaths(ctx.row.original, "region", r.id!);
        const form = (ctx.table.options.meta as any)?.form as
          | { getValues: (p: Path<TForm>) => any }
          | undefined;
        const amount = form?.getValues?.(paths.amount);
        return <div className="px-2 text-right">{amount ?? ""}</div>;
      }

      return (
        <PriceCellWithMode<TForm, TRow>
          context={ctx}
          getBaseAmount={(row) => getBaseAmount(row as TRow, "region", r.id!)}
          getPaths={(ictx) => makePaths(ictx.row.original, "region", r.id!)}
        />
      );
    },
  }));

  return [...currencyCols, ...regionCols];
}
