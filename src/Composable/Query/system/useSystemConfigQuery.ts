import { useQuery } from "@tanstack/react-query"
import { getSystemConfigs } from "../../../http/apis/system/systemConfigApi";

export const useSystemConfigQuery = () => {
    const systemConfigQueryData = useQuery({
        queryKey: ['system-configs'],
        queryFn: async () => {
            const response = await getSystemConfigs();
            return response?.data;
        }
    })
    return {
        systemConfigQueryData: systemConfigQueryData?.data,
        isLoading: systemConfigQueryData?.isLoading,
        isError: systemConfigQueryData?.isError
    }
}
