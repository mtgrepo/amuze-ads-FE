import { PackagesComponent } from "../../components/AdPackages/packages_component";
import { useAllPackagesQuery } from "../../Composable/Query/adPackage/useAllPackagesQuery";
import { useCampaignListQuery } from "../../Composable/Query/content/useCampaignListQuery";
import type { CampaignResponse } from "../../dto/response/content/campaignResponse";

function PackagesLoading() {
    return (
        <div role="status" aria-label="Loading packages" className="flex flex-col gap-5">
            <div className="h-8 w-40 animate-pulse rounded-lg bg-muted" />
            <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))]">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-[214px] animate-pulse rounded-2xl bg-muted" />)}
            </div>
        </div>
    );
}

export default function AdPackagesPage() {
    const { packages, isLoading } = useAllPackagesQuery();
    const { campaignList } = useCampaignListQuery();
    return (
        <div className="w-full px-4 py-6 lg:px-6">
            {isLoading ? <PackagesLoading /> : <PackagesComponent data={packages ?? []} campaigns={campaignList as CampaignResponse[] | undefined} />}
        </div>
    );
}
