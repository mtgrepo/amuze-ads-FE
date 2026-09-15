import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";
import { createFullCampaign } from "../../../../http/apis/content/campaignApi";

export const useCreateFullCampaignCommand = () => {
    const qc = useQueryClient();

    const createFullCampaignMutation = useMutation({
        mutationKey: ['create-full-campaign'],
        mutationFn: async (data: FormData) => {
            const response = await createFullCampaign(data);
            return response?.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['campaign-list'] });
            qc.invalidateQueries({ queryKey: ['ad-list'] });
            toast.success('Campaign and ad created successfully.');
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
