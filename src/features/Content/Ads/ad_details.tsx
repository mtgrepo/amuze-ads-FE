import { useParams } from "react-router-dom";
import AdDetails from "../../../components/Content/Ads/ad_details";
import { useAdDetailQuery } from "../../../Composable/Query/content/useAdDetailQuery";

export default function AdDetailsPage() {
    const { id } = useParams();
    const { adDetail, isLoading } = useAdDetailQuery(id as string);

    if (isLoading) return <p className="p-8 text-muted-foreground">Loading...</p>;

    return (
        <AdDetails data={adDetail} />
    )
}
