import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";
import { approveCampaign } from "../../../../http/apis/content/campaignApi";

export const useCampaignApproveCommand = () => {
    const qc = useQueryClient();

    const campaignApproveMutation = useMutation({
        mutationKey: ['approve-campaign'],
        mutationFn: async (id: string) => {
            const response = await approveCampaign(id);
            return response?.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['campaign-list'] });
            toast.success('Campaign approved successfully.');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to approve campaign.');
        }
    })

    return {
        approveCampaignCommand: campaignApproveMutation.mutateAsync,
        isPending: campaignApproveMutation.isPending,
        isError: campaignApproveMutation.isError
    }
}
