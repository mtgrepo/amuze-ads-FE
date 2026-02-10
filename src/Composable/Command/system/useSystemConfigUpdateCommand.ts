import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { SystemConfigInput } from "../../../dto/input/system/systemConfigInput"
import { updateSystemConfig } from "../../../http/apis/system/systemConfigApi"
import { toast } from "sonner";

export const useSystemConfigUpdateCommand = () => {
    const qc = useQueryClient();
    const updateSystemConfigMutation = useMutation({
        mutationKey: ["update-system-config-command"],
        mutationFn: async ({ id, data }: { id: string, data: SystemConfigInput }) => {
            const response = await updateSystemConfig(id, data)
            return response?.data
        },
        onSuccess: () => {
            toast.success("System config updated successfully!");
            qc.invalidateQueries({ queryKey: ["system-configs"] });
        }
    })
    return {
        updateSystemConfigCommand: updateSystemConfigMutation.mutateAsync,
        isPending: updateSystemConfigMutation.isPending,
        isError: updateSystemConfigMutation.isError
    }
}
