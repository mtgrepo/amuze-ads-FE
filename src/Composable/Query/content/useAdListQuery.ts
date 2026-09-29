import { useQuery } from "@tanstack/react-query"
import { getAllAds } from "../../../http/apis/content/adApi";

// advertiserId: optional filter (an agency id returns all of its clients' ads).
export const useAdListQuery = (advertiserId?: string) => {
    const adListData = useQuery({
        queryKey: ['ad-list', advertiserId ?? 'all'],
        queryFn: async () => {
            const response = await getAllAds(advertiserId);
            return response?.data;
        }
    })
    return {
        adListData: adListData?.data,
        isLoading: adListData?.isLoading,
        isError: adListData?.isError
    }
}
