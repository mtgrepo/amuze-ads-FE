import { AxiosError } from "axios"
import axiosInstance from "../../httpClient"
import type { AdSetCreateInput } from "../../../dto/input/content/adSetInput"
export const getAllAdSet = async () => {
    try {
        const response = await axiosInstance.get("/ad-sets")        
        return response.data
    } catch (error) {
        if(error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to fetch ad set")
        }
        throw new Error("An unexpected error occurred")
    }
}

export const getAdSetById = async (id: string) => {
    try {
        const response = await axiosInstance.get(`/ad-sets/${id}`);
        return response.data
    } catch (error) {
        if(error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to fetch ad set")
        }
        throw new Error("An unexpected error occurred")
    }
}

export const createAdSet = async (data: AdSetCreateInput) => {
    try {
        const response = await axiosInstance.post("/ad-sets", data);
        return response.data
    } catch (error) {
        if(error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to create ad set")
        }
        throw new Error("An unexpected error occurred")
    }
}

export const updateAdSet = async (id: string, data: AdSetCreateInput) => {
    try {
        const response = await axiosInstance.patch(`/ad-sets/${id}/update`, data);
        return response.data
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to update ad set")
        }
        throw new Error("An unexpected error occurred")
    }
}

export const deleteAdSet = async (id: string) => {
    try {
        const response = await axiosInstance.delete(`/ad-sets/${id}`);
        return response.data
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to delete ad set")
        }
        throw new Error("An unexpected error occurred")
    }
}