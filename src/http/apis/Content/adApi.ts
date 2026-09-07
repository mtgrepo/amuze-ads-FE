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

export const approveAd = async (adId: string) => {
    try {
        const response = await axiosInstance.post(`/ads/${adId}/approve`)
        return response.data
    } catch (error) {
        if(error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to approve ad")
        }
        throw new Error("An unexpected error occurred")
    }
}

export const rejectAd = async (adId: string) => {
    try {
        const response = await axiosInstance.post(`/ads/${adId}/reject`)
        return response.data
    } catch (error) {
        if(error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to reject ad")
        }
        throw new Error("An unexpected error occurred")
    }
}

export const updateAdStatus = async (adId: string, status: string) => {
    try {
        const response = await axiosInstance.patch(`/ads/${adId}/status`, { status })
        return response.data
    } catch (error) {
        if(error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to update ad status")
        }
        throw new Error("An unexpected error occurred")
    }
}