import { AdComponent } from "../../../components/Content/Ads/ads_component";
import { useAdListQuery } from "../../../Composable/Query/content/useAdListQuery";

export default function AdsPage() {
  const { adListData, isLoading } = useAdListQuery();
  return (
    <div className="w-full mx-auto px-5 ">
      {isLoading ? <p className="items-center justify-center text-center my-auto">Loading.....</p> : <AdComponent data={adListData ?? []}/> }
    </div>
  )
}
