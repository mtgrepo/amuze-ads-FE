import { useParams } from "react-router-dom";
import AdvertiserDetails from "../../components/AdvertiserProfiles/advertiser_details";
import { useAdvertiserDetailQuery } from "../../Composable/Query/advertiser/useAdvertiserDetailQuery";

export default function AdvertiserDetailsPage() {
    const { id } = useParams();
   const { advertiserDetail } = useAdvertiserDetailQuery(id as string);
  return (
    <AdvertiserDetails data={advertiserDetail} />
  )
}
