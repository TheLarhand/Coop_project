import axios from "axios";
import type { Credentials, Profile, User, UserStatistic, MyStatistic, TaskCreatePayload, Task } from "../shared/types/types";

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


// myTaskApi

export const myTasksApi = {
    getAll: async ({
        username,
        password,
        start,
        limit,
    }: Credentials & { start?: number; limit?: number }): Promise<Task[]> => {
        const res = await axios_api.get("/task-api/myTasks", {
            auth: { username, password },
            params: { start, limit },
        });

        return res.data.map((t: any) => ({
            id: t.taskId,
            title: t.title,
            description: t.description,
            deadline: t.deadline,
            status: t.status,
            author: String(t.author),
            result: t.result,
        }));
    },

    complete: async ({
        username,
        password,
        taskId,
        result,
    }: Credentials & { taskId: number; result: string }): Promise<Task> => {
        const res = await axios_api.put(
            `/task-api/myTasks/${taskId}`,
            { result },
            { auth: { username, password } }
        );

        return {
            id: res.data.taskId,
            title: res.data.title,
            description: res.data.description,
            deadline: res.data.deadline,
            status: res.data.status,
            author: String(res.data.author),
            result: res.data.result,
        };
    },
};

// ↑↑↑ myTaskApi


export const checkAuth = async (creds: Credentials): Promise<void> => {
    await axios_api.get("/task-api/myProfile", {
        auth: { username: creds.username, password: creds.password },
    });
};

// --- НОВОЕ: API для задач ---
export const tasksApi = {
    createTask: async (taskData: TaskCreatePayload, creds?: Credentials): Promise<Task> => {
        try {
            const res = await axios_api.post<Task>(
                "/task-api/createTask",
                taskData,
                {
                    auth: creds ? { username: creds.username, password: creds.password } : undefined,
                }
            );
            return res.data;
        } catch (err) {
            console.error('API Error:', err);
            throw err;
        }
    },
};
// --- КОНЕЦ НОВОГО ---

export const api = {
    usersApi,
    profileApi,
    statisticsApi,  // <— Мой экспорт
    myTasksApi,
    checkAuth,
    tasksApi,
};
