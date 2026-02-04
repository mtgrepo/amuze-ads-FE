import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteAdvertiser } from "../../../http/apis/advertisers/advertisersApi";
import { toast } from "sonner";

export const useAdvertiserDeleteCommand = () => {
    const qc = useQueryClient();
    const deleteAdvertiserMutation = useMutation({
        mutationKey: ["delete-advertiser-command"],
        mutationFn: async (id: string) => {
            const response = await deleteAdvertiser(id);
            return response?.data;
        },
        onSuccess: () => {
            toast.success("Advertiser deleted successfully!");
            qc.invalidateQueries({ queryKey: ["advertisers"] });
        }
    })
    return {
        deleteAdvertiserCommand: deleteAdvertiserMutation.mutateAsync,
        isPending: deleteAdvertiserMutation.isPending,
        isError: deleteAdvertiserMutation.isError
    }
}