import { useQuery } from "@tanstack/react-query";
import { getAdvertisers } from "../../../http/apis/advertisers/advertisersApi";

export interface AdvertiserOption {
    id: string;
    name: string;
    type: "agency" | "advertiser";
    agencyId: string | null;
}

export const useAdvertiserOptionsQuery = () => {
    const { data, isLoading } = useQuery<{ data: AdvertiserOption[] }>({
        queryKey: ["advertisers-list"],
        queryFn: getAdvertisers,
        staleTime: 5 * 60 * 1000,
    });
    return { advertisers: data?.data ?? [], isLoading };
};
