import { useQuery } from "@tanstack/react-query";
import { getPendingExtensions } from "../../../http/apis/campaignExtension/campaignExtensionApi";
import type { CampaignExtensionResponse } from "../../../dto/response/campaignExtension/campaignExtensionResponse";

export const usePendingExtensionsQuery = () => {
    const { data, isLoading } = useQuery<{ data: CampaignExtensionResponse[] }>({
        queryKey: ["campaign-extensions", "pending"],
        queryFn: getPendingExtensions,
    });
    return { pendingExtensions: data?.data ?? [], isLoading };
};

/** Price for a new end date; no points are taken. */
