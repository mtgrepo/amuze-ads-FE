import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { getActivity } from "../../../http/apis/activity/activityApi";
import type { ActivityFilters } from "../../../dto/input/activity/activityFilters";
import type { ActivityPage } from "../../../dto/response/activity/activityResponse";

/** The activity log for the given filters. Pass enabled=false to wait for an id. Paged lists keep the last page on screen while the next loads. */
export const useActivityQuery = (filters: ActivityFilters, enabled = true) => {
    const activity = useQuery<ActivityPage>({
        queryKey: ['activity', filters],
        queryFn: async () => {
            const response = await getActivity(filters);
            return response?.data;
        },
        enabled,
        placeholderData: filters.page ? keepPreviousData : undefined,
    })
    return {
        activity: activity.data?.items ?? [],
        total: activity.data?.total ?? 0,
        isLoading: activity.isLoading,
        isFetching: activity.isFetching,
        isError: activity.isError,
    }
}
