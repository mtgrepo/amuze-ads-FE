import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateDisplayRule } from "../../../http/apis/displayRules/displayRulesApi";
import type { DisplayRuleInput } from "../../../dto/response/displayRules/displayRulesResponse";

export const useDisplayRuleUpdateCommand = () => {
    const qc = useQueryClient();
    const mutation = useMutation({
        mutationKey: ["update-display-rule"],
        mutationFn: async ({ type, placement, data }: { type: string; placement: string; data: DisplayRuleInput }) => {
            const response = await updateDisplayRule(type, placement, data);
            return response?.data;
        },
        onSuccess: () => {
            toast.success("Saved. The app picks it up the next time it starts.");
            qc.invalidateQueries({ queryKey: ["ad-display-rules"] });
            qc.invalidateQueries({ queryKey: ["activity"] });
        },
        onError: (error) => {
            toast.error("Couldn't save", { description: error instanceof Error ? error.message : undefined });
        },
    });
    return { updateDisplayRule: mutation.mutateAsync, isPending: mutation.isPending };
};
