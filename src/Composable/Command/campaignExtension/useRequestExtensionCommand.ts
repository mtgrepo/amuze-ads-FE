import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { requestExtension } from "../../../http/apis/campaignExtension/campaignExtensionApi";
import { refreshAfterExtensionChange } from "./refreshAfterExtensionChange";

export const useRequestExtensionCommand = () => {
    const qc = useQueryClient();
    const mutation = useMutation({
        mutationFn: ({ campaignId, newEndDate }: { campaignId: string; newEndDate: string }) => requestExtension(campaignId, newEndDate),
        onSuccess: (response) => {
            refreshAfterExtensionChange(qc);
            toast.success(response?.message ?? "Extension submitted");
        },
        onError: (error: Error) => toast.error(error.message),
    });
    return { requestExtension: mutation.mutateAsync, isRequesting: mutation.isPending };
};
