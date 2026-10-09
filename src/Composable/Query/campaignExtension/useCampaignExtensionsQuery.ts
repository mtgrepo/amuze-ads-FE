import { useQuery } from "@tanstack/react-query";
import { getCampaignExtensions } from "../../../http/apis/campaignExtension/campaignExtensionApi";
import type { CampaignExtensionResponse } from "../../../dto/response/campaignExtension/campaignExtensionResponse";

export const useCampaignExtensionsQuery = (campaignId?: string) => {
    const { data, isLoading } = useQuery<{ data: CampaignExtensionResponse[] }>({
        queryKey: ["campaign-extensions", campaignId],
        queryFn: () => getCampaignExtensions(campaignId!),
        enabled: !!campaignId,
    });
    return { extensions: data?.data ?? [], isLoading };
};
