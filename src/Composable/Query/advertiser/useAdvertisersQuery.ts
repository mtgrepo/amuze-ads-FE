import { useQuery } from "@tanstack/react-query"
import { getAdvertisers } from "../../../http/apis/advertisers/advertisersApi"

export const useAdvertisersQuery = () => {
    const advertisersList = useQuery({
        queryKey: ['advertisers'],
        queryFn: async () => {
            const response = await getAdvertisers();
            return response?.data;
        }
    })
    return {
        advertisersList: advertisersList?.data,
        isLoading: advertisersList?.isLoading,
        isError: advertisersList?.isError
    }
}