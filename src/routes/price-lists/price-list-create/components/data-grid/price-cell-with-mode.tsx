import { Input, Select } from "@medusajs/ui";
import type { CellContext } from "@tanstack/react-table";
import { useMemo } from "react";
import { FieldValues, Path, PathValue, useFormContext } from "react-hook-form";

export type PriceInput = {
  amount: number | null;
  mode?: "amount" | "percent";
  percent?: number | null;
};

export type PriceCellProps<TForm extends FieldValues, TRow> = {
  context: CellContext<TRow, unknown>;
  getBaseAmount: (row: TRow) => number;
  getPaths: (ctx: CellContext<TRow, unknown>) => {
    amount: Path<TForm>;
    mode: Path<TForm>;
    percent: Path<TForm>;
  };
  currencySymbol?: string;
};

const PriceCellWithMode = <TForm extends FieldValues, TRow>({
  context,
  getBaseAmount,
  getPaths,
  currencySymbol,
}: PriceCellProps<TForm, TRow>) => {
  const { watch, setValue } = useFormContext<TForm>();
  const paths = useMemo(() => getPaths(context), [context, getPaths]);
  console.log("currencySymbol", currencySymbol);

  const set = <P extends Path<TForm>>(name: P, value: PathValue<TForm, P>) =>
    setValue(name, value, { shouldDirty: true });

  type AmountPath = typeof paths.amount;
  type ModePath = typeof paths.mode;
  type PercentPath = typeof paths.percent;

  const mode =
    (watch(paths.mode as ModePath) as "amount" | "percent" | undefined) ??
    "amount";
  const amount = (watch(paths.amount as AmountPath) as number | null) ?? null;
  const percent =
    (watch(paths.percent as PercentPath) as number | null) ?? null;

  const onModeChange = (next: "amount" | "percent") => {
    set(paths.mode as ModePath, next as unknown as PathValue<TForm, ModePath>);
    if (next === "percent" && (percent == null || Number.isNaN(percent))) {
      set(
        paths.percent as PercentPath,
        0 as unknown as PathValue<TForm, PercentPath>
      );
      set(
        paths.amount as AmountPath,
        0 as unknown as PathValue<TForm, AmountPath>
      );
    }
  };

  const onValueChange = (raw: string) => {
    if (raw === "") {
      if (mode === "amount") {
        set(
          paths.amount as AmountPath,
          null as unknown as PathValue<TForm, AmountPath>
        );
      } else {
        set(
          paths.percent as PercentPath,
          null as unknown as PathValue<TForm, PercentPath>
        );
        set(
          paths.amount as AmountPath,
          null as unknown as PathValue<TForm, AmountPath>
        );
      }
      return;
    }

    const normalized = raw.replace(",", ".");
    const v = Number(normalized);
    if (Number.isNaN(v)) {
      return;
    }

    if (mode === "amount") {
      set(
        paths.amount as AmountPath,
        v as unknown as PathValue<TForm, AmountPath>
      );
    } else {
      set(
        paths.percent as PercentPath,
        v as unknown as PathValue<TForm, PercentPath>
      );
      const base = getBaseAmount(context.row.original);
      const computed = (base * v) / 100;
      set(
        paths.amount as AmountPath,
        computed as unknown as PathValue<TForm, AmountPath>
      );
    }
  };

  const displayValue = mode === "amount" ? (amount ?? "") : (percent ?? "");

  return (
    <div className="flex items-center gap-2 px-2 pt-1">
      <Select
        value={mode}
        onValueChange={(v) => onModeChange(v as "amount" | "percent")}
      >
        <Select.Trigger className=" min-w-[64px]">
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="amount">{currencySymbol}</Select.Item>
          <Select.Item value="percent">%</Select.Item>
        </Select.Content>
      </Select>

      <Input
        type="number"
        inputMode="decimal"
        step="any"
        min={0}
        max={mode === "percent" ? 100 : undefined}
        value={(displayValue as any) ?? ""}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={mode === "amount" ? `${currencySymbol} 0` : "%"}
        className="h-8 w-full text-right"
      />
    </div>
  );
};
export default PriceCellWithMode;
