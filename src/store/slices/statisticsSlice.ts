import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../api/api";
import type { RootState } from "../store";
import type { MyStatistic, UserStatistic } from "../../shared/types/types";

/**
 * Режимы сортировки для Главной (Dashboard/Overview).
 * - completedDesc — по выполненным задачам, по убыванию.
 * - failedDesc    — по просроченным, по убыванию.
 * - inWorkDesc    — по «в работе», по убыванию.
 * - nameAsc       — по имени, A→Z.
 */
export type SortMode = "completedDesc" | "nameAsc" | "failedDesc" | "inWorkDesc";

interface StatisticsState {
    global: UserStatistic[];
    my: MyStatistic | null;
    loading: boolean;
    error: string | null;
    sortMode: SortMode;
}

const persistedSort =
    (localStorage.getItem("dashboard:sortMode") as SortMode | null) ?? null;

const initialState: StatisticsState = {
    global: [],
    my: null,
    loading: false,
    error: null,
    sortMode: persistedSort ?? "completedDesc",
};

/** Глобальная статистика — PUBLIC (без авторизации). */
export const fetchGlobalStatistic = createAsyncThunk<
    UserStatistic[],
    void,
    { rejectValue: string }
>("statistics/fetchGlobal", async (_, { rejectWithValue }) => {
    try {
        return await api.statisticsApi.getGlobal();
    } catch (err: unknown) {
        const msg =
            err instanceof Error
                ? err.message
                : (err as any)?.response?.data?.detail ?? "Ошибка загрузки глобальной статистики";
        return rejectWithValue(msg);
    }
});

/** Моя статистика — требует Basic Auth. */
export const fetchMyStatistic = createAsyncThunk<
    MyStatistic | null,
    void,
    { state: RootState; rejectValue: string }
>("statistics/fetchMy", async (_, { getState, rejectWithValue }) => {
    const { username, password, isAuthenticated } = getState().auth;
    if (!isAuthenticated) return null;
    try {
        return await api.statisticsApi.getMy({ username, password });
    } catch (err: unknown) {
        const msg =
            err instanceof Error
                ? err.message
                : (err as any)?.response?.data?.detail ?? "Ошибка загрузки моей статистики";
        return rejectWithValue(msg);
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
        resetStatistics: () => initialState,
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

export const { setSortMode, clearError, resetStatistics } = statisticsSlice.actions;

/** Базовый селектор стейта статистики */
export const selectStatistics = (state: RootState) => state.statistics;

/** Суммы по глобальной статистике для пончика */
export const selectGlobalTotals = (state: RootState) => {
    const { global } = state.statistics;
    return global.reduce(
        (acc, u) => {
            acc.completed += u.completedTasks;
            acc.inWork += u.inWorkTasks;
            acc.failed += u.failedTasks;
            return acc;
        },
        { completed: 0, inWork: 0, failed: 0 }
    );
};

export default statisticsSlice.reducer;




