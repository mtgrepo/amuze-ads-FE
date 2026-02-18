import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateAdvertiserStatus } from "../../../http/apis/advertisers/advertisersApi"
import { toast } from "sonner";

export const useUpdateAdvertiserStatusCommand = () => {
    const qc = useQueryClient();
    const updateStatusMutation = useMutation({
        mutationKey: ["update-advertiser-status-command"],
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            const response = await updateAdvertiserStatus(id, status);
            return response?.data;
        },
        onSuccess: () => {
            toast.success("Advertiser status updated successfully!");
            qc.invalidateQueries({ queryKey: ["advertisers"] });
        }
    })
    return {
        updateAdvertiserStatusCommand: updateStatusMutation.mutateAsync,
        isPending: updateStatusMutation.isPending,
        isError: updateStatusMutation.isError
    }
}
