import { AxiosError } from "axios"
import axiosInstance from "../../httpClient"
import type { ActivityFilters } from "../../../dto/input/activity/activityFilters"

export const getActivity = async (filters: ActivityFilters) => {
    try {
        // Leave out empty filters so the API doesn't read them as values.
        const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined && v !== "" && v !== false))
        const response = await axiosInstance.get("/activity", { params })
        return response.data
    } catch (error) {
        if(error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to load activity")
        }
        throw new Error("An unexpected error occurred")
    }
}
