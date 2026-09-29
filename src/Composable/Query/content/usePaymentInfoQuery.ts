import { useQuery } from "@tanstack/react-query"
import { getPaymentInfo } from "../../../http/apis/content/campaignApi"
import type { PaymentInfoResponse } from "../../../dto/response/points/pointsResponse"

export const usePaymentInfoQuery = (campaignId: string, enabled: boolean = true) => {
    const paymentInfo = useQuery({
        queryKey: ['payment-info', campaignId],
        queryFn: async () => {
            const response = await getPaymentInfo(campaignId);
            return response?.data as PaymentInfoResponse;
        },
        enabled: enabled && !!campaignId,
    })
    return {
        paymentInfo: paymentInfo.data,
        isLoading: paymentInfo.isLoading,
        isError: paymentInfo.isError,
    }
}
