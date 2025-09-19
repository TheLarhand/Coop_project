import axios from "axios";
import type {Credentials, Profile, User} from "../shared/types/types.ts";

const API_URL = "http://localhost:8000";

const axios_api = axios.create({
    baseURL: API_URL
});

export const usersApi = {
    getUsers: async (creds?: Credentials): Promise<User[]> => {
        const res = await axios_api.get<User[]>("/task-api/users", {
            auth: creds ? { username: creds.username, password: creds.password } : undefined,
        });
        return res.data;
    },
}

export const profileApi = {
    getProfile: async (creds?: Credentials): Promise<Profile> => {
        const res = await axios_api.get<Profile>("/task-api/myProfile", {
            auth: creds ? { username: creds.username, password: creds.password } : undefined,
        });
        return res.data;
    },
}

export const checkAuth = async (creds: Credentials): Promise<void> => {
    await axios_api.get("/task-api/myProfile", {
        auth: { username: creds.username, password: creds.password },
    });
}

export const api = {
    usersApi,
    profileApi,
    checkAuth
}