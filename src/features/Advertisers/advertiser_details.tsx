import { Link, useParams } from "react-router-dom";
import AdvertiserDetail from "../../components/Advertisers/advertiser_detail";
import { useAdvertiserDetailQuery } from "../../Composable/Query/advertiser/useAdvertiserDetailQuery";

export default function AdvertiserDetailsPage() {
  const { id } = useParams();
  const { advertiserDetail, isLoading } = useAdvertiserDetailQuery(id as string);

  return (
    <div className="flex w-full flex-col gap-5 px-4 py-6 lg:px-6">
      <Link to="/advertisers" className="self-start text-[13px] text-primary hover:underline">← Advertisers</Link>
      {isLoading ? (
        <div role="status" aria-label="Loading advertiser" className="flex flex-col gap-5">
          <div className="flex flex-wrap gap-4">
            <div className="h-44 flex-[2_1_480px] animate-pulse rounded-2xl bg-muted" />
            <div className="h-44 flex-[1_1_300px] animate-pulse rounded-2xl bg-muted" />
          </div>
          <div className="h-9 animate-pulse rounded-lg bg-muted/70" />
          <div className="h-64 animate-pulse rounded-[14px] bg-muted" />
        </div>
      ) : advertiserDetail ? (
        <AdvertiserDetail key={advertiserDetail.id} data={advertiserDetail} />
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-[14px] border bg-card px-5 py-12 text-center">
          <span className="font-medium">Advertiser not found</span>
          <span className="text-sm text-muted-foreground">It may have been deleted. Go back to the list to pick another.</span>
        </div>
      )}
    </div>
  )
}
