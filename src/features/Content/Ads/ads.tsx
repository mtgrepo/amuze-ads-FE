import { AdComponent } from "../../../components/Content/Ads/ads_component";
import { useAdListQuery } from "../../../Composable/Query/content/useAdListQuery";

function AdsLoading() {
  return (
    <div role="status" aria-label="Loading ads" className="flex flex-col gap-5">
      <div className="h-8 w-40 animate-pulse rounded-lg bg-muted" />
      <div className="h-10 animate-pulse rounded-lg bg-muted/70" />
      <div className="overflow-hidden rounded-xl border bg-card">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b px-4 py-4 last:border-b-0">
            <div className="size-10 animate-pulse rounded-lg bg-muted" />
            <div className="h-3 flex-1 animate-pulse rounded bg-muted" style={{ maxWidth: `${60 - i * 5}%` }} />
            <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdsPage() {
  const { adListData, isLoading } = useAdListQuery();
  return (
    <div className="w-full px-4 py-6 lg:px-6">
      {isLoading ? <AdsLoading /> : <AdComponent data={adListData ?? []} />}
    </div>
  )
}
