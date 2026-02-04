import { AdvertisersComponent } from "../../components/Advertisers/advertisers_component";
import { useAdvertisersQuery } from "../../Composable/Query/advertiser/useAdvertisersQuery";

export default function Advertisers() {
  const { advertisersList, isLoading } = useAdvertisersQuery();
  return (
    <div className="w-full mx-auto px-5 ">
      {isLoading ? <p className="items-center justify-center text-center my-auto">Loading.....</p> : <AdvertisersComponent data={advertisersList ?? []}/> }
    </div>
  )
}
