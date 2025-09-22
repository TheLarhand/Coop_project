import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../api/api";
import type { RootState } from "../store";
import type { MyStatistic, UserStatistic } from "../../shared/types/types";

// ДОБАВИЛИ режимы сортировки
export type SortMode = "completedDesc" | "nameAsc" | "failedDesc" | "inWorkDesc";

interface StatisticsState {
    global: UserStatistic[];
    my: MyStatistic | null;
    loading: boolean;
    error: string | null;
    sortMode: SortMode;
}

const initialState: StatisticsState = {
    global: [],
    my: null,
    loading: false,
    error: null,
    sortMode: "completedDesc",
};

export const fetchGlobalStatistic = createAsyncThunk<
    UserStatistic[],
    void,
    { rejectValue: string }
>("statistics/fetchGlobal", async (_, { rejectWithValue }) => {
    try {
        return await api.statisticsApi.getGlobal();
    } catch (e: any) {
        return rejectWithValue(
            e?.response?.data?.detail || "Ошибка загрузки глобальной статистики"
        );
    }
});

export const fetchMyStatistic = createAsyncThunk<
    MyStatistic | null,
    void,
    { state: RootState; rejectValue: string }
>("statistics/fetchMy", async (_, { getState, rejectWithValue }) => {
    const { username, password, isAuthenticated } = getState().auth;
    if (!isAuthenticated) return null;
    try {
        return await api.statisticsApi.getMy({ username, password });
    } catch (e: any) {
        return rejectWithValue(
            e?.response?.data?.detail || "Ошибка загрузки моей статистики"
        );
    }
});

const statisticsSlice = createSlice({
    name: "statistics",
    initialState,
    reducers: {
        setSortMode: (state, action: PayloadAction<SortMode>) => {
            state.sortMode = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchGlobalStatistic.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchGlobalStatistic.fulfilled, (state, action) => {
                state.loading = false;
                state.global = action.payload;
            })
            .addCase(fetchGlobalStatistic.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) ?? "Неизвестная ошибка";
            })
            .addCase(fetchMyStatistic.fulfilled, (state, action) => {
                state.my = action.payload;
            })
            .addCase(fetchMyStatistic.rejected, (state, action) => {
                state.error = state.error ?? (action.payload as string) ?? null;
            });
    },
});

export const { setSortMode, clearError } = statisticsSlice.actions;
export const selectStatistics = (state: RootState) => state.statistics;
export default statisticsSlice.reducer;


