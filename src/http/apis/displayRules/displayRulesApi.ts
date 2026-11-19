import { AxiosError } from "axios";
import axiosInstance from "../../httpClient";
import type { DisplayRuleInput } from "../../../dto/response/displayRules/displayRulesResponse";

export const getDisplayRules = async () => {
    try {
        const response = await axiosInstance.get("/ad-display-rules");
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to load the display rules");
        }
        throw new Error("An unexpected error occurred");
    }
};

export const updateDisplayRule = async (type: string, placement: string, data: DisplayRuleInput) => {
    try {
        const response = await axiosInstance.patch(`/ad-display-rules/${type}/${placement}`, data);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            const message = error.response?.data.message;
            throw new Error((Array.isArray(message) ? message[0] : message) || "Failed to save the display rule");
        }
        throw new Error("An unexpected error occurred");
    }
};
