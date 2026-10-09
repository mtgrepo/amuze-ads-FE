import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { rejectExtension } from "../../../http/apis/campaignExtension/campaignExtensionApi";
import { refreshAfterExtensionChange } from "./refreshAfterExtensionChange";

export const useRejectExtensionCommand = () => {
    const qc = useQueryClient();
    const mutation = useMutation({
        mutationFn: (id: string) => rejectExtension(id),
        onSuccess: () => {
            refreshAfterExtensionChange(qc);
            toast.success("Extension rejected and refunded");
        },
        onError: (error: Error) => toast.error(error.message),
    });
    return { rejectExtension: mutation.mutateAsync, isRejecting: mutation.isPending };
};
