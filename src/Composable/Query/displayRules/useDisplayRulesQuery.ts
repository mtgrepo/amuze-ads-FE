import { useQuery } from "@tanstack/react-query";
import { getDisplayRules } from "../../../http/apis/displayRules/displayRulesApi";
import type { DisplayRule } from "../../../dto/response/displayRules/displayRulesResponse";

export const useDisplayRulesQuery = () => {
    const query = useQuery({
        queryKey: ["ad-display-rules"],
        queryFn: async () => {
            const response = await getDisplayRules();
            return (response?.data ?? []) as DisplayRule[];
        },
    });
    return {
        rules: query.data ?? [],
        isLoading: query.isLoading,
        isError: query.isError,
        refetch: query.refetch,
    };
};
