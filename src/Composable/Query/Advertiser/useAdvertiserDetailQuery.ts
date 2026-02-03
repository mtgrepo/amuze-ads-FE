import { useQuery } from "@tanstack/react-query"
import { getAdvertiserById } from "../../../http/apis/advertisers/advertisersApi"

export const useAdvertiserDetailQuery = (id: string) => {
    const advertiserDetail = useQuery({
        queryKey: ['advertiser-details', id],
        queryFn: async () => {
            const response = await getAdvertiserById(id);
            return response?.data;
        },
        enabled: !!id,
    })
    return {
        advertiserDetail: advertiserDetail?.data,
        isLoading: advertiserDetail?.isLoading,
        isError: advertiserDetail?.isError
    }
}