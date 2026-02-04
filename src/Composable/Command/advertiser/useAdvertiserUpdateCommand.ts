import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { AdvertiserInput } from "../../../dto/input/advertiser/advertiserInput"
import { updateAdvertiser } from "../../../http/apis/advertisers/advertisersApi"
import { toast } from "sonner"

export const useAdvertiserUpdateCommand = () => {
    const qc = useQueryClient();
    const updateAdvertiserMutation = useMutation({
        mutationKey: ["update-advertiser-command"],
        mutationFn: async ({ id, data }: { id: string, data: AdvertiserInput }) => {
            const response = await updateAdvertiser(id, data)
            return response?.data
        },
        onSuccess: () => {
            toast.success("Advertiser updated successfully!");
            qc.invalidateQueries({ queryKey: ["advertisers"] });
            qc.invalidateQueries({ queryKey: ["advertiser-details",] });
        }
    })
    return {
        updateAdvertiserCommand: updateAdvertiserMutation.mutateAsync,
        isPending: updateAdvertiserMutation.isPending,
        isError: updateAdvertiserMutation.isError
    }
}