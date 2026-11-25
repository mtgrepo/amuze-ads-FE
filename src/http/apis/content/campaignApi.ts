import { AxiosError } from "axios"
import axiosInstance from "../../httpClient"
import type { CampaignBudgetInput } from "../../../dto/input/content/campaignBudgetInput"
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

// Setting status "rejected" needs a reason too.
export const changeCampaignStatus = async (id: string, status: string, reason?: string) => {
    try {
        const response = await axiosInstance.patch(`/campaigns/${id}/change-status`, reason ? { status, reason } : { status })
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

// The reason (required, up to 500 characters) goes to the advertiser and into the ad's history.
export const rejectCampaign = async (id: string, reason: string) => {
    try {
        const response = await axiosInstance.post(`/campaigns/${id}/reject`, { reason })
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
export const payCampaign = async (id: string) => {
    try {
        const response = await axiosInstance.post(`/campaigns/${id}/pay`)
        return response.data
    } catch (error) {
        if(error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Payment failed")
        }
        throw new Error ("An unexpected error occurred")
    }
}

export const updateCampaignBudget = async (id: string, data: CampaignBudgetInput) => {
    try {
        const response = await axiosInstance.patch(`/campaigns/${id}/update`, data)
        return response.data
    } catch (error) {
        if(error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to update budget")
        }
        throw new Error ("An unexpected error occurred")
    }
}

export const getPaymentInfo = async (id: string) => {
    try {
        const response = await axiosInstance.get(`/campaigns/${id}/payment-info`)
        return response.data
    } catch (error) {
        if(error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to load payment info")
        }
        throw new Error ("An unexpected error occurred")
    }
}
