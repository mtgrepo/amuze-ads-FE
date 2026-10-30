import { AxiosError } from "axios"
import axiosInstance from "../../httpClient"
import type { ObjectiveInput } from "../../../dto/response/campaignObjective/campaignObjectiveResponse"

const fail = (error: unknown, fallback: string): never => {
    if (error instanceof AxiosError) {
        const message = error.response?.data?.message
        throw new Error((Array.isArray(message) ? message.join("; ") : message) || fallback)
    }
    throw new Error("An unexpected error occurred")
}

export const getObjectivePrices = async () => {
    try {
        const response = await axiosInstance.get("/campaign-objectives/prices")
        return response.data
    } catch (error) {
        return fail(error, "Failed to fetch objective prices")
    }
}

/** All three objective types for a campaign, with progress. */
export const getCampaignObjectives = async (campaignId: string) => {
    try {
        const response = await axiosInstance.get(`/campaign-objectives/campaign/${campaignId}`)
        return response.data
    } catch (error) {
        return fail(error, "Failed to fetch objectives")
    }
}

/** Replaces a draft campaign's objectives; send only the picked ones. */
export const saveCampaignObjectives = async (campaignId: string, objectives: ObjectiveInput[]) => {
    try {
        const response = await axiosInstance.put(`/campaign-objectives/campaign/${campaignId}`, { objectives })
        return response.data
    } catch (error) {
        return fail(error, "Failed to save objectives")
    }
}
