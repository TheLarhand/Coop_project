import axios from "axios";
import type { Credentials, Profile, User, UserStatistic, MyStatistic } from "../shared/types/types";

const API_URL = "http://localhost:8000";
const axios_api = axios.create({ baseURL: API_URL });

export const usersApi = {
    getUsers: async (creds?: Credentials): Promise<User[]> => {
        const res = await axios_api.get<User[]>("/task-api/users", {
            auth: creds ? { username: creds.username, password: creds.password } : undefined,
        });
        return res.data;
    },
};

export const profileApi = {
    getProfile: async (creds?: Credentials): Promise<Profile> => {
        const res = await axios_api.get<Profile>("/task-api/myProfile", {
            auth: creds ? { username: creds.username, password: creds.password } : undefined,
        });
        return res.data;
    },

    updateProfile: async (creds?: Credentials, newProfile?: Partial<Profile>): Promise<Profile> => {
        if (!newProfile) {
            const error: any = new Error("Новые данные для профиля не были переданы");
            error.response = {
                data: { detail: "Новые данные для профиля не были переданы" },
                status: 400
            };
            throw error;
        }
        const res = await axios_api.put<Profile>(
            "/task-api/updateUser",
            newProfile,
            {
                auth: creds ? { username: creds.username, password: creds.password } : undefined,
            }
        );
        return res.data;
    }
};

// ↓↓↓ НОВОЕ - добавил блок statisticsApi и экспорт его из api
export const statisticsApi = {
    // глобальная статистика — без авторизации
    getGlobal: async (): Promise<UserStatistic[]> => {
        const res = await axios_api.get<UserStatistic[]>("/task-api/globalStatistic");
        return res.data;
    },
    // моя статистика — требует Basic Auth
    getMy: async (creds?: Credentials): Promise<MyStatistic> => {
        const res = await axios_api.get<MyStatistic>("/task-api/myStatistic", {
            auth: creds ? { username: creds.username, password: creds.password } : undefined,
        });
        return res.data;
    },
};
// ↑↑↑ НОВОЕ - добавил блок statisticsApi и экспорт его из api

export const checkAuth = async (creds: Credentials): Promise<void> => {
    await axios_api.get("/task-api/myProfile", {
        auth: { username: creds.username, password: creds.password },
    });
};

export const api = {
    usersApi,
    profileApi,
    statisticsApi,  // <— Мой экспорт
    checkAuth,
};
