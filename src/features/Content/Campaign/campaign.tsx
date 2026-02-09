import { CampaignComponent } from "../../../components/Content/Campaign/campaign_component";
import { useCampaignListQuery } from "../../../Composable/Query/content/useCampaignListQuery";

export default function CampaignPage() {
    const { campaignList, isLoading} = useCampaignListQuery();
  return (
    <div className="w-full mx-auto px-5 ">
      {isLoading ? <p className="items-center justify-center text-center my-auto">Loading.....</p> : <CampaignComponent data={campaignList ?? []}/> }
    </div>
  )
}
