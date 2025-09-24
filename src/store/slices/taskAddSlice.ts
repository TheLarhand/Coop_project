import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {PayloadAction} from "@reduxjs/toolkit"
import { api } from "../../api/api.ts";
import type { Task, TaskCreatePayload, Credentials } from "../../shared/types/types";
import type { RootState } from "../store";


interface TasksState {
    tasks: Task[];
    loading: 'idle' | 'pending' | 'succeeded' | 'failed';
    error: string | null;
}


const initialState: TasksState = {
    tasks: [],
    loading: 'idle',
    error: null,
};


export const createTask = createAsyncThunk<
    Task,
    TaskCreatePayload,
    { state: RootState; rejectValue: string }
>(
    "tasks/createTask",
    async (taskData, { getState, rejectWithValue }) => {
        const { username, password, isAuthenticated } = getState().auth;

        try {
            if (!isAuthenticated) {
                return rejectWithValue("Доступ запрещён: войдите в систему");
            }
            const creds: Credentials = { username, password };
            
            const data = await api.tasksApi.createTask(taskData, creds);
            return data;
        } catch (error: any) {
            const status = error?.response?.status;
            if (status === 401) {
                return rejectWithValue("Доступ запрещён: войдите в систему");
            }
            return rejectWithValue(
                error?.response?.data?.detail || "Ошибка создания задачи"
            );
        }
    }
);

const tasksSlice = createSlice({
    name: "tasks",
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder
            .addCase(createTask.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
            })
            .addCase(createTask.fulfilled, (state, action: PayloadAction<Task>) => {
                state.loading = 'succeeded';
                state.tasks.push(action.payload);
            })
            .addCase(createTask.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload as string ?? "Неизвестная ошибка";
            });
    },
});


export const selectTasksState = (state: RootState) => state.tasks;

export default tasksSlice.reducer;
