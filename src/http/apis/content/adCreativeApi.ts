import { AxiosError } from "axios"
import axiosInstance from "../../httpClient"

export const getAdCreativeById = async (id: string) => {
    try {
        const response = await axiosInstance.get(`/ad-creatives/${id}`)
        return response.data
    } catch (error) {
        if(error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to fetch ad creative")
        }
        throw new Error("An unexpected error occurred")
    }
}
