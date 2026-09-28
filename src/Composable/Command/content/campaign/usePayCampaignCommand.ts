import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";
import { payCampaign } from "../../../../http/apis/content/campaignApi";

export const usePayCampaignCommand = () => {
    const qc = useQueryClient();

    const payCampaignMutation = useMutation({
        mutationKey: ['pay-campaign'],
        mutationFn: async (id: string) => {
            const response = await payCampaign(id);
            return response?.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['campaign-list'] });
            qc.invalidateQueries({ queryKey: ['ad-list'] });
            qc.invalidateQueries({ queryKey: ['ad-details'] });
            qc.invalidateQueries({ queryKey: ['transaction-list'] });
            toast.success('Payment recorded.');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Payment failed.');
        }
    })

    return {
        payCampaignCommand: payCampaignMutation.mutateAsync,
        isPending: payCampaignMutation.isPending,
    }
}
