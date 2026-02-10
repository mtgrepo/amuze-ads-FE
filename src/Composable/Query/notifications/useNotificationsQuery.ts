import { useQuery } from "@tanstack/react-query"
import { getAllNotis } from "../../../http/apis/notifications/notificationsApi";

export const useNotificationsQuery = () => {
    const notificationsData = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const response = await getAllNotis();
            return response?.data;
        }
    })
    return {
        notificationsData: notificationsData?.data,
        isLoading: notificationsData?.isLoading,
        isError: notificationsData?.isError
    }
}