import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AdDetails from "../../../components/Content/Ads/ad_details";
import { useAdDetailQuery } from "../../../Composable/Query/content/useAdDetailQuery";

export default function AdDetailsPage() {
    const { id } = useParams();
    const { adDetail, isLoading } = useAdDetailQuery(id as string);

    return (
        <div className="flex w-full flex-col gap-4 px-4 py-6 lg:px-6">
            <Link to="/ads" className="inline-flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="size-4" /> All ads
            </Link>
            {isLoading ? (
                <div role="status" aria-label="Loading ad" className="flex w-full flex-col gap-5">
                    <div className="h-14 w-80 animate-pulse rounded-xl bg-muted" />
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                        {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />)}
                    </div>
                    <div className="h-80 animate-pulse rounded-xl bg-muted" />
                </div>
            ) : (
                <AdDetails data={adDetail} />
            )}
        </div>
    )
}
