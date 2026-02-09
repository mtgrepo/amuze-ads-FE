import { useQuery } from "@tanstack/react-query"
import type { AdSetResponse } from "../../../dto/response/content/adSetResponse";
import { getAllAdSet } from "../../../http/apis/Content/adSetApi";

export const useAdSetListQuery = () => {
    const adSetData = useQuery({
        queryKey: ['ad-set-list'],
        queryFn: async () : Promise<AdSetResponse[]> => {
            const response = await getAllAdSet();
            return response?.data
        }
    })
    return {
        adSetData: adSetData?.data,
        isLoading: adSetData?.isLoading,
        isError: adSetData?.isError
    }
}