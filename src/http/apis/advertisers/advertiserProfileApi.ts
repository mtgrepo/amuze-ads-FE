import { AxiosError } from "axios"
import axiosInstance from "../../httpClient"

export const getAllAdvertiserProfile = async () => {
    try {
        const response = await axiosInstance.get("/advertiser-profiles")
        return response.data
    } catch (error) {
        if(error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to fetch advertiser profile")
        }
        throw new Error("An unexpected error occurred")
    }
}

export const getAdvertiserById = async (id: string) => {
    try {
        const response = await axiosInstance.get(`/advertiser-profiles/${id}`)
        return response.data
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to fetch advertiser profile by ID")
        }
        throw new Error("An unexpected error occurred")
    }
}

export const createAdvertiserProfile = async (data: FormData) => {
    try {
        const response = await axiosInstance.post("/advertiser-profiles", data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    } catch (error) {
        if(error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to create advertiser profile")
        }
        throw new Error("An unexpected error occurred")
    }
}

export const updateAdvertiserProfile = async (id: string, data: FormData) => {
    try {
        const response = await axiosInstance.patch(`/advertiser-profiles/${id}`, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to update advertiser profile")
        } 
        throw new Error("An unexpected error occurred")
    }
}

export const deleteAdvertiserProfile = async (id: string) => {
    try {
        const response = await axiosInstance.delete(`/advertiser-profiles/${id}`)
        return response.data
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to delete advertiser profile")
        }
        throw new Error("An unexpected error occurred")
    }
}