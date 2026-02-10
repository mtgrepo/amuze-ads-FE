import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { SystemConfigInput } from "../../../dto/input/system/systemConfigInput"
import { createSystemConfig } from "../../../http/apis/system/systemConfigApi"
import { toast } from "sonner";

export const useSystemConfigCreateCommand = () => {
    const qc = useQueryClient();
    const systemConfigCreateMutation = useMutation({
        mutationKey: ["create-system-config-command"],
        mutationFn: async (data: SystemConfigInput) => {
            const response = await createSystemConfig(data)
            return response?.data
        },
        onSuccess: () => {
            toast.success("System config created successfully!");
            qc.invalidateQueries({ queryKey: ["system-configs"] });
        }
    })
    return {
        createSystemConfigCommand: systemConfigCreateMutation.mutateAsync,
        isPending: systemConfigCreateMutation.isPending,
        isError: systemConfigCreateMutation.isError
    }
}
