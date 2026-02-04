import { AxiosError } from "axios"
import axiosInstance from "../../httpClient";
import type { AdvertiserInput } from "../../../dto/input/advertiser/advertiserInput";

export const getAdvertisers = async () => {
    try {
        const response = await axiosInstance.get("/advertisers");
        return response.data;
    } catch (error) {
        if ( error instanceof AxiosError ) {
            throw new Error(error.response?.data.message || "An error occurred while fetching advertisers.");
        }   
        throw new Error("An unexpected error occurred.");
    }
}

export const getAdvertiserById = async (id: string) => {
    try {
        const response = await axiosInstance.get(`/advertisers/${id}`);
        return response.data;
    } catch (error) {
        if ( error instanceof AxiosError ) {
            throw new Error(error.response?.data.message || "An error occurred while fetching advertiser details.");
        }
        throw new Error("An unexpected error occurred.");
    }
}

export const createAdvertiser = async (data: AdvertiserInput) => {
    try {
        const response = await axiosInstance.post("/advertisers", data);
        return response.data;
    } catch (error) {
        if ( error instanceof AxiosError ) {
            throw new Error(error.response?.data.message || "An error occurred while creating advertiser.");
        }
        throw new Error("An unexpected error occurred.");
    }
}

export const updateAdvertiser = async (id: string, data: AdvertiserInput) => {
    try {
        const response = await axiosInstance.patch(`/advertisers/${id}/update`, data);
        return response.data;
    } catch (error) {
        if ( error instanceof AxiosError ) {
            throw new Error(error.response?.data.message || "An error occurred while updating advertiser.");
        }
        throw new Error("An unexpected error occurred.");
    }
}

export const deleteAdvertiser = async (id: string) => {
    try {
        const response = await axiosInstance.delete(`/advertisers/${id}`);
        return response.data;
    } catch (error) {
        if ( error instanceof AxiosError ) {
            throw new Error(error.response?.data.message || "An error occurred while deleting advertiser.");
        }
        throw new Error("An unexpected error occurred.");
    }
}