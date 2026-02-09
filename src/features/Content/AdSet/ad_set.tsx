import { AdSetComponent } from "../../../components/Content/Ad_Sets/ad_set_component";
import { useAdSetListQuery } from "../../../Composable/Query/content/useAdSetListQuery";

export default function AdSetPage() {
    const { adSetData, isLoading} = useAdSetListQuery();
  return (
    <div className="w-full mx-auto px-5 ">
      {isLoading ? <p className="items-center justify-center text-center my-auto">Loading.....</p> : <AdSetComponent data={adSetData ?? []}/> }
    </div>
  )
}
