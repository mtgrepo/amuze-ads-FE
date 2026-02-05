import { useQuery } from "@tanstack/react-query"
import { getAllAdvertiserProfile } from "../../../http/apis/advertisers/advertiserProfileApi";
import type { ProfileResponse } from "../../../dto/response/advertiserProfile/profileResponse";

export const useProfileListQuery = () => {
    const profileListData = useQuery({
        queryKey: ['advertiser-profile-list'],
        queryFn: async () : Promise<ProfileResponse[]> => {
            const response = await getAllAdvertiserProfile();
            return response?.data;
        }
    })
    return {
        profileListData: profileListData?.data,
        isLoading: profileListData?.isLoading,
        isError: profileListData?.isError
    }
}