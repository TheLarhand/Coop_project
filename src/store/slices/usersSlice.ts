import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api/api.ts";
import type { User } from "../../shared/types/types";
import type { RootState } from "../store";

interface UsersState {
    users: User[];
    loading: boolean;
    error: string | null;
}

const initialState: UsersState = {
    users: [],
    loading: false,
    error: null,
};

export const fetchUsers = createAsyncThunk<
    User[],
    void,
    { state: RootState; rejectValue: string }
    >("users/fetchUsers", async (_, { getState, rejectWithValue }) => {
    const { username, password, isAuthenticated } = getState().auth;

    try {
        const data = await api.usersApi.getUsers(
            isAuthenticated ? { username, password } : undefined
        );
        return data;
    } catch (error: any) {
        const status = error?.response?.status;
        if (status === 401) {
            return rejectWithValue("Доступ запрещён: войдите в систему");
        }
        return rejectWithValue(
            error?.response?.data?.detail || "Ошибка загрузки пользователей"
        );
    }
});

export const usersSlice = createSlice({
    name: "users",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) ?? "Неизвестная ошибка";
            });
    },
});

export const { clearError } = usersSlice.actions;
export const selectAllUsers = (state: RootState) => state.users.users;
export const selectUsersLoading = (state: RootState) => state.users.loading;
export const selectUsersError = (state: RootState) => state.users.error;