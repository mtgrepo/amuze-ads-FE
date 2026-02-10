import { AxiosError } from "axios"
import axiosInstance from "../../httpClient"

export const getAllNotis = async () => {
    try {
        const response = await axiosInstance.get("/notifications")
        return response.data
    } catch (error) {
        if(error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to fetch notifications")
        }
        throw new Error("An unexpected error occurred")
    }
}