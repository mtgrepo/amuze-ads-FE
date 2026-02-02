import { AxiosError } from "axios"
import axiosInstance from "../../httpClient";

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