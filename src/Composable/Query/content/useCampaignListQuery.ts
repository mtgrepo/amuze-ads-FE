import { useQuery } from "@tanstack/react-query"
import { getAllCampaign } from "../../../http/apis/content/campaignApi";

export const useCampaignListQuery = () => {
    const campaignList = useQuery({
        queryKey: ['campaign-list'],
        queryFn: async () => {
            const response = await getAllCampaign();
            return response?.data;
        }
    })
    return {
        campaignList: campaignList?.data,
        isLoading: campaignList?.isLoading,
        isError: campaignList?.isError
    }
}