import { AxiosError } from "axios"
import axiosInstance from "../../httpClient";

export const loginAdmin = async ( email: string, password: string) => {
    try {
        const response = await axiosInstance.post("/auth/admin/login", {email, password});
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "An error occurred while logging in.");
        }
        throw new Error("An unexpected error occurred.");
    }
}