import { useParams } from "react-router-dom";
import AdvertiserDetails from "../../components/AdvertiserProfiles/advertiser_details";
import BackButton from "../../components/Common/back_button";
import { AdvertiserDetailsSkeleton } from "../../components/Common/Skeleton/advertiser_detail_skeleton";
import { useAdvertiserDetailQuery } from "../../Composable/Query/advertiser/useAdvertiserDetailQuery";

export default function AdvertiserDetailsPage() {
    const { id } = useParams();
   const { advertiserDetail, isLoading } = useAdvertiserDetailQuery(id as string);

  if (isLoading) return <AdvertiserDetailsSkeleton />;

  return (
    <div>
      <div className="max-w-7xl mx-auto px-8 pt-6">
        <BackButton fallback="/advertisers" />
      </div>
      <AdvertiserDetails data={advertiserDetail} />
    </div>
  )
}
