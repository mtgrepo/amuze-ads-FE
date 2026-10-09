import { useQuery } from "@tanstack/react-query";
import { getExtensionQuote } from "../../../http/apis/campaignExtension/campaignExtensionApi";
import type { ExtensionQuoteResponse } from "../../../dto/response/campaignExtension/campaignExtensionResponse";

export const useExtensionQuoteQuery = (campaignId: string | undefined, newEndDate: string, enabled: boolean) => {
    const { data, isFetching, error } = useQuery<{ data: ExtensionQuoteResponse }>({
        queryKey: ["extension-quote", campaignId, newEndDate],
        queryFn: () => getExtensionQuote(campaignId!, newEndDate),
        enabled: enabled && !!campaignId && /^\d{4}-\d{2}-\d{2}$/.test(newEndDate),
        retry: false,
    });
    return { quote: data?.data, isFetching, error: error as Error | null };
};
