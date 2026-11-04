import { AdvertisersComponent } from "../../components/Advertisers/advertisers_component";
import { useAdvertisersQuery } from "../../Composable/Query/advertiser/useAdvertisersQuery";

function AdvertisersLoading() {
  return (
    <div role="status" aria-label="Loading advertisers" className="flex flex-col gap-5">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
      <div className="h-9 animate-pulse rounded-lg bg-muted/70" />
      <div className="overflow-hidden rounded-[14px] border bg-card">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b px-4 py-4 last:border-b-0">
            <div className="size-[34px] animate-pulse rounded-full bg-muted" />
            <div className="h-3 flex-1 animate-pulse rounded bg-muted" style={{ maxWidth: `${60 - i * 5}%` }} />
            <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Advertisers() {
  const { advertisersList, isLoading } = useAdvertisersQuery();
  return (
    <div className="w-full px-4 py-6 lg:px-6">
      {isLoading ? <AdvertisersLoading /> : <AdvertisersComponent data={advertisersList ?? []} />}
    </div>
  )
}
