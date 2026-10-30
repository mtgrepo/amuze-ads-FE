import { useQuery } from "@tanstack/react-query";
import { getExtensionQuote } from "../../../http/apis/campaignExtension/campaignExtensionApi";
import type { ExtensionQuoteResponse } from "../../../dto/response/campaignExtension/campaignExtensionResponse";

/** Prices `quantity` more units of the campaign's own package. */
export const useExtensionQuoteQuery = (campaignId: string | undefined, quantity: number, enabled: boolean) => {
    const { data, isFetching, error } = useQuery<{ data: ExtensionQuoteResponse }>({
        queryKey: ["extension-quote", campaignId, quantity],
        queryFn: () => getExtensionQuote(campaignId!, quantity),
        enabled: enabled && !!campaignId && Number.isInteger(quantity) && quantity >= 1,
        retry: false,
    });
    return { quote: data?.data, isFetching, error: error as Error | null };
};
