import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { approveExtension } from "../../../http/apis/campaignExtension/campaignExtensionApi";
import { refreshAfterExtensionChange } from "./refreshAfterExtensionChange";

export const useApproveExtensionCommand = () => {
    const qc = useQueryClient();
    const mutation = useMutation({
        mutationFn: (id: string) => approveExtension(id),
        onSuccess: () => {
            refreshAfterExtensionChange(qc);
            toast.success("Extension approved");
        },
        onError: (error: Error) => toast.error(error.message),
    });
    return { approveExtension: mutation.mutateAsync, isApproving: mutation.isPending };
};
