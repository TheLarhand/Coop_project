import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Credentials } from "../../shared/types/types";
import { api } from "../../api/api.ts";
import type { RootState } from "../store";

interface AuthState {
    username: string;
    password: string;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    username: "",
    password: "",
    isAuthenticated: false,
    loading: false,
    error: null,
};

export const login = createAsyncThunk<
    Credentials,
    Credentials,
    { rejectValue: string }
>
    ("auth/login", async (creds, { rejectWithValue }) => {
    try {
        await api.checkAuth(creds);
        return creds;
    } catch (err: any) {
        const status = err?.response?.status;
        if (status === 401) {
            return rejectWithValue("Неверный логин или пароль");
        }
        return rejectWithValue("Ошибка подключения к API");
    }
});

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logOut: (state) => {
            state.username = "";
            state.password = "";
            state.isAuthenticated = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.username = action.payload.username;
                state.password = action.payload.password;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(login.rejected, (state, action) => {
                if (!state.isAuthenticated) {
                    state.loading = false;
                    state.isAuthenticated = false;
                    state.error = action.payload ?? "Ошибка авторизации";
                } else {
                    state.loading = false;
                    state.error = action.payload ?? "Ошибка Смены аккаунта";
                }
            });
    },
});

export const { logOut } = authSlice.actions;

export const selectAuth = (state: RootState) => state.auth;
export const selectUsername = (state: RootState) => state.auth.username;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectAuthLoading = (state: RootState) => state.auth.loading;