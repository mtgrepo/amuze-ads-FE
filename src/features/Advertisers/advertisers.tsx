import { AdvertisersComponent } from "../../components/Advertisers/advertisers_component";
import { TableSkeleton } from "../../components/Common/Skeleton/table_skeleton";
import { useAdvertisersQuery } from "../../Composable/Query/advertiser/useAdvertisersQuery";

export default function Advertisers() {
  const { advertisersList, isLoading } = useAdvertisersQuery();
  return (
    <div className="w-full mx-auto px-5 ">
      {isLoading ? <TableSkeleton filters={1} /> : <AdvertisersComponent data={advertisersList ?? []}/> }
    </div>
  )
}
