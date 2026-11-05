import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";
import { createFullCampaign } from "../../../../http/apis/content/campaignApi";
import { refreshAfterAdChange } from "../refreshAfterAdChange";

export const useCreateFullCampaignCommand = () => {
    const qc = useQueryClient();

    const createFullCampaignMutation = useMutation({
        mutationKey: ['create-full-campaign'],
        mutationFn: async (data: FormData) => {
            const response = await createFullCampaign(data);
            return response?.data;
        },
        onSuccess: () => {
            refreshAfterAdChange(qc);
            toast.success('Ad saved as draft.');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to create campaign.');
        }
    })

    return {
        createFullCampaignCommand: createFullCampaignMutation.mutateAsync,
        isPending: createFullCampaignMutation.isPending,
        isError: createFullCampaignMutation.isError
    }
}
