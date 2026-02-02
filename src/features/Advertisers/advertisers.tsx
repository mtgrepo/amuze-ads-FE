import { AdvertisersComponent } from "../../components/Advertisers/advertisers_component";
import { useAdvertisersQuery } from "../../Composable/Query/useAdvertisersQuery";

export default function Advertisers() {
  const { advertisersList } = useAdvertisersQuery();
  return (
    <AdvertisersComponent data={advertisersList ?? []}/>
  )
}
