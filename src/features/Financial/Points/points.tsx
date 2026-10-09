import { PointsComponent } from "../../../components/Financial/Points/points_component";
import { usePointsLedgerQuery } from "../../../Composable/Query/points/usePointsLedgerQuery";
import { useAdvertisersQuery } from "../../../Composable/Query/advertiser/useAdvertisersQuery";

export default function PointsPage() {
    const { ledger, isLoading } = usePointsLedgerQuery();
    const { advertisersList } = useAdvertisersQuery();
    return (
        <div className="w-full mx-auto px-5 ">
            {isLoading ? (
                <p className="items-center justify-center text-center my-auto">Loading.....</p>
            ) : (
                <PointsComponent ledger={ledger ?? { totalBalance: 0, entries: [] }} advertisers={advertisersList ?? []} />
            )}
        </div>
    )
}
