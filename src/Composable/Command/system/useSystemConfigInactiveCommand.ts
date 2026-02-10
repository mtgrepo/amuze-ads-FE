import { useMutation, useQueryClient } from "@tanstack/react-query"
import { setSystemConfigActive } from "../../../http/apis/system/systemConfigApi";
import { toast } from "sonner";

export const useSystemConfigActiveCommand = () => {
    const qc = useQueryClient();
    const mutation = useMutation({
        mutationKey: ["set-system-config-active-command"],
        mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
            const response = await setSystemConfigActive(id, isActive);
            return response?.data;
        },
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({ queryKey: ["system-configs"] });
            toast.success(
                variables.isActive
                    ? "System config activated successfully!"
                    : "System config deactivated successfully!"
            );
        }
    })
    return {
        setActiveCommand: mutation.mutateAsync,
        isPending: mutation.isPending,
        isError: mutation.isError
    }
}
