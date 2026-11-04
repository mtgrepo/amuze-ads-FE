import { PointsComponent } from "../../../components/Financial/Points/points_component";
import { usePointsLedgerQuery } from "../../../Composable/Query/points/usePointsLedgerQuery";
import { useAdvertisersQuery } from "../../../Composable/Query/advertiser/useAdvertisersQuery";

function PointsLoading() {
    return (
        <div role="status" aria-label="Loading points" className="flex flex-col gap-5">
            <div className="h-8 w-40 animate-pulse rounded-lg bg-muted" />
            <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-[92px] animate-pulse rounded-[14px] bg-muted" />)}
            </div>
            <div className="overflow-hidden rounded-[14px] border bg-card">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 border-b px-4 py-4 last:border-b-0">
                        <div className="h-3 flex-1 animate-pulse rounded bg-muted" style={{ maxWidth: `${50 - i * 5}%` }} />
                        <div className="h-8 w-24 animate-pulse rounded-lg bg-muted" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function PointsPage() {
    const { ledger, isLoading } = usePointsLedgerQuery();
    const { advertisersList, isLoading: advertisersLoading } = useAdvertisersQuery();
    return (
        <div className="w-full px-4 py-6 lg:px-6">
            {isLoading || advertisersLoading ? (
                <PointsLoading />
            ) : (
                <PointsComponent ledger={ledger ?? { totalBalance: 0, entries: [] }} advertisers={advertisersList ?? []} />
            )}
        </div>
    )
}
