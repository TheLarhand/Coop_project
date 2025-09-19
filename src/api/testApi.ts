import axios from "axios";

const API_URL = "http://localhost:8000";

export const testApi = {
    checkApiStatus: async (): Promise<{ message: string }> => {
        const response = await axios.get<{ message: string; version: string }>(API_URL);
        return { message: response.data.message };
    }
}