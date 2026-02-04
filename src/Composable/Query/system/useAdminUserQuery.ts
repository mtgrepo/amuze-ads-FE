import { useQuery } from "@tanstack/react-query"
import { getAdminUsers } from "../../../http/apis/system/adminUserApi";

export const useAdminUserQuery = () => {
    const adminUserQueryData = useQuery({
        queryKey: ['admin-users'],
        queryFn: async () => {
            const response = await getAdminUsers();
            return response?.data;
        }
    })
    return {
        adminUserQueryData: adminUserQueryData?.data,
        isLoading: adminUserQueryData?.isLoading,
        isError: adminUserQueryData?.isError
    }
}