import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { AdminUserInput } from "../../../dto/input/system/adminUserInput"
import { updateAdminUser } from "../../../http/apis/system/adminUserApi"
import { toast } from "sonner";

export const useAdminUserUpdateCommand = () => {
    const qc = useQueryClient();
    const updateAdminUserMutation = useMutation({
        mutationKey: ["update-admin-user-command"],
        mutationFn: async ({ id, data }: { id: string, data: AdminUserInput }) => {
            const response = await updateAdminUser(id, data)
            return response?.data
        },
        onSuccess: () => {
            toast.success("Admin User updated successfully!");
            qc.invalidateQueries({ queryKey: ["admin-users"] });
        }
    })
    return {
        updateAdminUserCommand: updateAdminUserMutation.mutateAsync,
        isPending: updateAdminUserMutation.isPending,
        isError: updateAdminUserMutation.isError
    }
}