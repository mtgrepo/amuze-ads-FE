import { AxiosError } from "axios"
import axiosInstance from "../../httpClient"

export const getAllAds = async () => {
    try {
        const response = await axiosInstance.get("/ads")
        return response.data
    } catch (error) {
        if(error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to fetch ads")
        }
        throw new Error("An unexpected error occurred")
    }
}