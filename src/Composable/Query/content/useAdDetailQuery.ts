import { useQuery } from "@tanstack/react-query"
import { getAdById } from "../../../http/apis/content/adApi"

export const useAdDetailQuery = (id: string) => {
    const adDetail = useQuery({
        queryKey: ['ad-details', id],
        queryFn: async () => {
            const response = await getAdById(id);
            return response?.data;
        },
        enabled: !!id,
    })
    return {
        adDetail: adDetail?.data,
        isLoading: adDetail?.isLoading,
        isError: adDetail?.isError
    }
}
