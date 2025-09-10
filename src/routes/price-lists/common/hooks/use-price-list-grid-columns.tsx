import { HttpTypes } from "@medusajs/types";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Thumbnail } from "../../../../components/common/thumbnail";
import {
  createDataGridHelper,
  DataGrid,
} from "../../../../components/data-grid";
import { createPercentablePriceColumns } from "../../price-list-create/components/data-grid/helpers/create-percentable-price-columns";
import { PricingCreateSchemaType } from "../../price-list-create/components/price-list-create-form/schema";
import { isProductRow } from "../utils";

const columnHelper = createDataGridHelper<
  HttpTypes.AdminProduct | HttpTypes.AdminProductVariant,
  PricingCreateSchemaType
>();

export const usePriceListGridColumns = ({
  currencies = [],
  regions = [],
  pricePreferences = [],
}: {
  currencies?: HttpTypes.AdminStoreCurrency[];
  regions?: HttpTypes.AdminRegion[];
  pricePreferences?: HttpTypes.AdminPricePreference[];
}) => {
  const { t } = useTranslation();

  const colDefs: ColumnDef<
    HttpTypes.AdminProduct | HttpTypes.AdminProductVariant
  >[] = useMemo(() => {
    return [
      columnHelper.column({
        id: t("fields.title"),
        header: t("fields.title"),
        cell: (context) => {
          const entity = context.row.original;
          if (isProductRow(entity)) {
            return (
              <DataGrid.ReadonlyCell context={context}>
                <div className="flex h-full w-full items-center gap-x-2 overflow-hidden">
                  <Thumbnail src={entity.thumbnail} size="small" />
                  <span className="truncate">{entity.title}</span>
                </div>
              </DataGrid.ReadonlyCell>
            );
          }

          return (
            <DataGrid.ReadonlyCell context={context} color="normal">
              <div className="flex h-full w-full items-center gap-x-2 overflow-hidden">
                <span className="truncate">{entity.title}</span>
              </div>
            </DataGrid.ReadonlyCell>
          );
        },
        disableHiding: true,
      }),
      ...createPercentablePriceColumns<
        HttpTypes.AdminProduct | HttpTypes.AdminProductVariant,
        PricingCreateSchemaType
      >({
        currencies: currencies.map((c) => c.currency_code),
        isReadOnly: (context) => {
          const entity = context.row.original;
          return isProductRow(entity);
        },
        getBaseAmount: (row) => {
          return (row as any)?.base_price ?? 0;
        },
        getBasePath: (row, kind, key) => {
          const entity: any = row;
          const productId = isProductRow(entity)
            ? entity.id
            : entity.product_id;
          let variantId: string | undefined;

          if (!isProductRow(entity)) {
            variantId = entity.id;
          }

          if (isProductRow(entity)) {
            return `products.${productId}.variants`;
          }

          if (kind === "currency") {
            return `products.${productId}.variants.${variantId}.currency_prices.${key}`;
          }
          return `products.${productId}.variants.${variantId}.region_prices.${key}`;
        },
        getCurrencySymbol: (code) => code,
      }),
    ];
  }, [t, currencies, regions, pricePreferences]);

  return colDefs;
};
