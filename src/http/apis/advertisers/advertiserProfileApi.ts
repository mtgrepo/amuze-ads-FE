import { AxiosError } from "axios"
import axiosInstance from "../../httpClient"
import type { AdvertiserInput } from "../../../dto/input/advertiser/advertiserInput"

export const getAllAdvertiserProfile = async () => {
    try {
        const response = await axiosInstance.get("/advertiser-profile")
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
        const response = await axiosInstance.get(`/advertiser-profile/${id}`)
        return response.data
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to fetch advertiser profile by ID")
        }
        throw new Error("An unexpected error occurred")
    }
}

export const createAdvertiserProfile = async (data: AdvertiserInput) => {
    try {
        const response = await axiosInstance.post("/advertiser-profile", data)
        return response.data
    } catch (error) {
        if(error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to create advertiser profile")
        }
        throw new Error("An unexpected error occurred")
    }
}

export const updateAdvertiserProfile = async (id: string, data: AdvertiserInput) => {
    try {
        const response = await axiosInstance.patch(`/advertiser-profile/${id}`, data)
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
        const response = await axiosInstance.delete(`/advertiser-profile/${id}`)
        return response.data
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to delete advertiser profile")
        }
        throw new Error("An unexpected error occurred")
    }
}