import { useQuery } from "@tanstack/react-query"
import { getAllAds } from "../../../http/apis/content/adApi";

export const useAdListQuery = () => {
    const adListData = useQuery({
        queryKey: ['ad-list'],
        queryFn: async () => {
            const response = await getAllAds();
            return response?.data;
        }
    })
    return {
        adListData: adListData?.data,
        isLoading: adListData?.isLoading,
        isError: adListData?.isError
    }
}