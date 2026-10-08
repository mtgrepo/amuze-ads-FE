import { useParams } from "react-router-dom";
import AdDetails from "../../../components/Content/Ads/ad_details";
import BackButton from "../../../components/Common/back_button";
import { useAdDetailQuery } from "../../../Composable/Query/content/useAdDetailQuery";

export default function AdDetailsPage() {
    const { id } = useParams();
    const { adDetail, isLoading } = useAdDetailQuery(id as string);

    if (isLoading) return <p className="p-8 text-muted-foreground">Loading...</p>;

    return (
        <div>
            <div className="max-w-5xl mx-auto px-8 pt-6">
                <BackButton fallback="/ads" />
            </div>
            <AdDetails data={adDetail} />
        </div>
    )
}
