import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api/api";
import type { RootState } from "../store";
import type { Credentials, Task, TaskCreatePayload } from "../../shared/types/types";

interface DelegatedTasksState {
    tasks: Task[];
    loading: boolean;
    error: string | null;
}

const initialState: DelegatedTasksState = {
    tasks: [],
    loading: false,
    error: null,
};

// Получение списка задач
export const fetchDelegatedTasks = createAsyncThunk<
    Task[],
    { start?: number; limit?: number },
    { state: RootState; rejectValue: string }
>("delegatedTasks/fetchDelegatedTasks", async ({ start = 0, limit = 10 }, { getState, rejectWithValue }) => {
    const { username, password, isAuthenticated } = getState().auth;
    try {
        const creds: Credentials | undefined = isAuthenticated ? { username, password } : undefined;
        return await api.delegatedTasksApi.getTasks(creds, start, limit);
    } catch (error: any) {
        const status = error?.response?.status;
        if (status === 401) {
            return rejectWithValue("Доступ запрещён: войдите в систему");
        }
        return rejectWithValue(error?.response?.data?.detail || "Ошибка загрузки задач");
    }
});

// Удаление задачи
export const deleteDelegatedTask = createAsyncThunk<
    number,
    number,
    { state: RootState; rejectValue: string }
>("delegatedTasks/deleteDelegatedTask", async (taskId: number, { getState, rejectWithValue }) => {
    const { username, password, isAuthenticated } = getState().auth;
    try {
        const creds: Credentials | undefined = isAuthenticated ? { username, password } : undefined;
        await api.delegatedTasksApi.deleteTask(taskId, creds);
        return taskId;
    } catch (error: any) {
        const status = error?.response?.status;
        if (status === 401) {
            return rejectWithValue("Доступ запрещён: войдите в систему");
        }
        return rejectWithValue(error?.response?.data?.detail || "Ошибка удаления задачи");
    }
});

// Обновление задачи
export const updateDelegatedTask = createAsyncThunk<
    Task,
    { taskId: number; update: Partial<Pick<TaskCreatePayload, "title" | "description" | "deadline">> },
    { state: RootState; rejectValue: string }
>("delegatedTasks/updateDelegatedTask", async ({ taskId, update }, { getState, rejectWithValue }) => {
    const { username, password, isAuthenticated } = getState().auth;
    try {
        const creds: Credentials | undefined = isAuthenticated ? { username, password } : undefined;
        return await api.delegatedTasksApi.updateTask(taskId, update, creds);
    } catch (error: any) {
        const status = error?.response?.status;
        if (status === 401) {
            return rejectWithValue("Доступ запрещён: войдите в систему");
        }
        return rejectWithValue(error?.response?.data?.detail || "Ошибка обновления задачи");
    }
});

export const delegatedTasksSlice = createSlice({
    name: "delegatedTasks",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetch
            .addCase(fetchDelegatedTasks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDelegatedTasks.fulfilled, (state, action) => {
                state.loading = false;
                state.tasks = action.payload;
            })
            .addCase(fetchDelegatedTasks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Неизвестная ошибка";
            })

            // delete
            .addCase(deleteDelegatedTask.fulfilled, (state, action) => {
                state.tasks = state.tasks.filter((t) => t.id !== action.payload);
            })
            .addCase(deleteDelegatedTask.rejected, (state, action) => {
                state.error = action.payload ?? "Неизвестная ошибка";
            })

            // update
            .addCase(updateDelegatedTask.fulfilled, (state, action) => {
                const idx = state.tasks.findIndex((t) => t.id === action.payload.id);
                if (idx >= 0) {
                    state.tasks[idx] = action.payload;
                }
            })
            .addCase(updateDelegatedTask.rejected, (state, action) => {
                state.error = action.payload ?? "Неизвестная ошибка";
            });
    },
});

export const { clearError } = delegatedTasksSlice.actions;

export const selectDelegatedTasks = (state: RootState) => state.delegatedTasks.tasks;
export const selectDelegatedTasksError = (state: RootState) => state.delegatedTasks.error;
export const selectDelegatedTasksLoading = (state: RootState) => state.delegatedTasks.loading;
