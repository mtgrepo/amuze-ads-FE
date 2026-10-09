import { useQuery } from "@tanstack/react-query";
import { getCampaignExtensions, getExtensionQuote, getPendingExtensions } from "../../../http/apis/campaignExtension/campaignExtensionApi";
import type { CampaignExtensionResponse, ExtensionQuoteResponse } from "../../../dto/response/campaignExtension/campaignExtensionResponse";

export const useCampaignExtensionsQuery = (campaignId?: string) => {
    const { data, isLoading } = useQuery<{ data: CampaignExtensionResponse[] }>({
        queryKey: ["campaign-extensions", campaignId],
        queryFn: () => getCampaignExtensions(campaignId!),
        enabled: !!campaignId,
    });
    return { extensions: data?.data ?? [], isLoading };
};

export const usePendingExtensionsQuery = () => {
    const { data, isLoading } = useQuery<{ data: CampaignExtensionResponse[] }>({
        queryKey: ["campaign-extensions", "pending"],
        queryFn: getPendingExtensions,
    });
    return { pendingExtensions: data?.data ?? [], isLoading };
};

/** Price for a new end date; no points are taken. */
export const useExtensionQuoteQuery = (campaignId: string | undefined, newEndDate: string, enabled: boolean) => {
    const { data, isFetching, error } = useQuery<{ data: ExtensionQuoteResponse }>({
        queryKey: ["extension-quote", campaignId, newEndDate],
        queryFn: () => getExtensionQuote(campaignId!, newEndDate),
        enabled: enabled && !!campaignId && /^\d{4}-\d{2}-\d{2}$/.test(newEndDate),
        retry: false,
    });
    return { quote: data?.data, isFetching, error: error as Error | null };
};
