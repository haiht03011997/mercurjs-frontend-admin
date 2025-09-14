import { useParams } from "react-router-dom";

import { PriceListConfigurationSection } from "./components/price-list-configuration-section";
import { PriceListGeneralSection } from "./components/price-list-general-section";
import { PriceListProductSection } from "./components/price-list-product-section";

import { TwoColumnPageSkeleton } from "../../../components/common/skeleton";
import { TwoColumnPage } from "../../../components/layout/pages";
import { useDashboardExtension } from "../../../extensions";
import { usePriceList } from "../../../hooks/api/queries/price-lists";

export const PriceListDetails = () => {
  const { id } = useParams();

  const { data: price_list, isLoading, isError, error } = usePriceList(id!);
  const { getWidgets } = useDashboardExtension();
  console.log("data", price_list);

  if (isLoading || !price_list) {
    return (
      <TwoColumnPageSkeleton mainSections={2} sidebarSections={1} showJSON />
    );
  }

  if (isError) {
    throw error;
  }

  return (
    <TwoColumnPage
      widgets={{
        after: getWidgets("price_list.details.after"),
        before: getWidgets("price_list.details.before"),
        sideAfter: getWidgets("price_list.details.side.after"),
        sideBefore: getWidgets("price_list.details.side.before"),
      }}
      data={price_list}
      showJSON
    >
      <TwoColumnPage.Main>
        <PriceListGeneralSection priceList={price_list} />
        <PriceListProductSection priceList={price_list} />
      </TwoColumnPage.Main>
      <TwoColumnPage.Sidebar>
        <PriceListConfigurationSection priceList={price_list} />
      </TwoColumnPage.Sidebar>
    </TwoColumnPage>
  );
};
