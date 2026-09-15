import { AxiosError } from "axios"
import axiosInstance from "../../httpClient"
import type { CampaignInput } from "../../../dto/input/content/campaignInput"

export const getAllCampaign = async () => {
    try {
        const response = await axiosInstance.get("/campaigns")
        return response.data
    } catch (error) {
        if(error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to fetch campaign")
        }
        throw new Error ("An unexpected error occurred")
    }
}

export const getCampaignById = async (id: string) => {
    try {
        const response = await axiosInstance.get(`/campaigns/${id}`)
        return response.data
    } catch (error) {
        if(error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to fetch campaign")
        }
        throw new Error ("An unexpected error occurred")
    }
}

export const createCampaign = async (data: CampaignInput) => {
    try {
        const response = await axiosInstance.post("/campaigns", data)
        return response.data
    } catch (error) {
        if(error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to create campaign")
        }
        throw new Error ("An unexpected error occurred")
    }
}

export const updateCampaign = async (id: string, data: CampaignInput) => {
    try {
        const response = await axiosInstance.patch(`/campaigns/${id}/update`, data)
        return response.data
    } catch (error) {
        if(error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to update campaign")
        }   
        throw new Error ("An unexpected error occurred")
    }
}

export const changeCampaignStatus = async (id: string, status: string) => {
    try {
        const response = await axiosInstance.patch(`/campaigns/${id}/change-status`, { status })
        return response.data
    } catch (error) {
        if(error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to change campaign status")
        }
        throw new Error ("An unexpected error occurred")
    }
}

export const approveCampaign = async (id: string) => {
    try {
        const response = await axiosInstance.post(`/campaigns/${id}/approve`)
        return response.data
    } catch (error) {
        if(error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to approve campaign")
        }
        throw new Error ("An unexpected error occurred")
    }
}

export const rejectCampaign = async (id: string) => {
    try {
        const response = await axiosInstance.post(`/campaigns/${id}/reject`)
        return response.data
    } catch (error) {
        if(error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to reject campaign")
        }
        throw new Error ("An unexpected error occurred")
    }
}

export const deleteCampaign = async (id: string) => {
    try {
        const response = await axiosInstance.delete(`/campaigns/${id}`)
        return response.data
    } catch (error) {
        if(error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to delete campaign")
        }
        throw new Error ("An unexpected error occurred")
    }
}

export const createFullCampaign = async (data: FormData) => {
    try {
        const response = await axiosInstance.post("/campaigns/full", data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    } catch (error) {
        if(error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to create campaign")
        }
        throw new Error ("An unexpected error occurred")
    }
}

export const deleteCamapign = async (id: string) => {
    try {
        const response = await axiosInstance.delete(`/campaigns/${id}`) 
        return response.data
    } catch (error) {
        if(error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to delete campaign")
        }   
        throw new Error ("An unexpected error occurred")
    }
}