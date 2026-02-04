import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { AdminUserInput } from "../../../dto/input/system/adminUserInput"
import { createAdminUser } from "../../../http/apis/system/adminUserApi"
import { toast } from "sonner";

export const useAdminUserCreateCommand = () => {
    const qc = useQueryClient();
    const adminUserCreateMutation = useMutation({
        mutationKey: ["create-admin-user-command"],
        mutationFn: async (data: AdminUserInput) => {
            const response = await createAdminUser(data)
            return response?.data
        },
        onSuccess: () => {
            toast.success("Admin User created successfully!");
            qc.invalidateQueries({ queryKey: ["admin-users"] });
        }
    })
    return {
        createAdminUserCommand: adminUserCreateMutation.mutateAsync,
        isPending: adminUserCreateMutation.isPending,
        isError: adminUserCreateMutation.isError
    }
}