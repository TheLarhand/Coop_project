import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api/api.ts";
import type { RootState } from "../store";
import type { Profile } from "../../shared/types/types.ts";

interface profileState {
    profile: Profile | null;
    loading: boolean;
    error: string | null;
}

const initialState: profileState = {
    profile: null,
    loading: false,
    error: null,
};

export const fetchProfile = createAsyncThunk<
    Profile,
    void,
    { state: RootState; rejectValue: string }
>("profile/fetchProfile", async (_, { getState, rejectWithValue }) => {
    const { username, password, isAuthenticated } = getState().auth;
    try {
        const data: Profile = await api.profileApi.getProfile(
            isAuthenticated ? { username, password } : undefined
        );
        return data;
    } catch (error: any) {
        const status = error?.response?.status;
        if (status === 401) {
            return rejectWithValue("Доступ запрещён: войдите в систему");
        }
        return rejectWithValue(
            error?.response?.data?.detail || "Ошибка загрузки профиля"
        );
    }
});

export const updateProfile = createAsyncThunk<
    Profile,
    Partial<Profile>,
    { state: RootState; rejectValue: string }
>("profile/updateProfile", async (newProfile: Partial<Profile>, { getState, rejectWithValue }) => {
    const { username, password, isAuthenticated } = getState().auth;
    try {
        const data: Profile = await api.profileApi.updateProfile(
            isAuthenticated ? { username, password } : undefined,
            newProfile
        );
        return data;
    } catch (error: any) {
        const status = error?.response?.status;
        if (status === 401) {
            return rejectWithValue("Доступ запрещён: войдите в систему");
        }
        return rejectWithValue(
            error?.response?.data?.detail || "Ошибка обновления профиля"
        );
    }
});

export const profileSlice = createSlice({
    name: "profile",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearProfile: (state) => {
            state.profile = null;
        },
    },
    extraReducers: (builder) => {
        builder
            /* Получение профиля */
            .addCase(fetchProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.profile = action.payload;
            })
            .addCase(fetchProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) ?? "Неизвестная ошибка";
            })

            /* Обновление профиля */
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.profile = action.payload;
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.error = (action.payload as string) ?? "Неизвестная ошибка";
            });
    },
})

export const { clearError, clearProfile } = profileSlice.actions;

export const selectProfile = (state: RootState) => state.profile.profile;
export const selectProfileError = (state: RootState) => state.profile.error;
export const selectProfileLoading = (state: RootState) => state.profile.loading;