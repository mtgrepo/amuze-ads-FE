import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";
import { payCampaign } from "../../../../http/apis/content/campaignApi";
import { refreshAfterAdChange } from "../refreshAfterAdChange";

export const usePayCampaignCommand = () => {
    const qc = useQueryClient();

    const payCampaignMutation = useMutation({
        mutationKey: ['pay-campaign'],
        mutationFn: async (id: string) => {
            const response = await payCampaign(id);
            return response?.data;
        },
        onSuccess: () => {
            refreshAfterAdChange(qc);
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
