import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteAdminUser } from "../../../http/apis/system/adminUserApi";
import { toast } from "sonner";

export const useAdminUserDeleteCommand = () => {
    const qc = useQueryClient();
    const adminUserDeleteMutation = useMutation({
        mutationKey: ["delete-admin-user-command"],
        mutationFn: async (id: string) => {
            const response = await deleteAdminUser(id);
            return response?.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin-users"] });
            toast.success("Admin User deleted successfully!");
        }
    })
    return {
        deleteAdminUserCommand: adminUserDeleteMutation.mutateAsync,
        isPending: adminUserDeleteMutation.isPending,
        isError: adminUserDeleteMutation.isError
    }
}