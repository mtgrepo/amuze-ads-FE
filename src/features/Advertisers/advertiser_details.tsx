import { useParams } from "react-router-dom";
import AdvertiserDetails from "../../components/AdvertiserProfiles/advertiser_details";
import { AdvertiserDetailsSkeleton } from "../../components/Common/Skeleton/advertiser_detail_skeleton";
import { useAdvertiserDetailQuery } from "../../Composable/Query/advertiser/useAdvertiserDetailQuery";

export default function AdvertiserDetailsPage() {
    const { id } = useParams();
   const { advertiserDetail, isLoading } = useAdvertiserDetailQuery(id as string);

  if (isLoading) return <AdvertiserDetailsSkeleton />;

  return (
    <AdvertiserDetails data={advertiserDetail} />
  )
}
