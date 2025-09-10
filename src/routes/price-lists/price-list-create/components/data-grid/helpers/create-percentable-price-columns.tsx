// components/data-grid/helpers/create-percentable-price-columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { FieldValues, Path } from "react-hook-form";
import PriceCellWithMode from "../price-cell-with-mode";

type MakeColsArgs<TRow, TForm extends FieldValues> = {
  currencies: string[];
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
        return <div />;
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

  return [...currencyCols];
}
