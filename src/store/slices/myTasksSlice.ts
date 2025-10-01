import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import type { Task } from "../../shared/types/types";
import { api } from "../../api/api";

/* --- State --- */
interface MyTasksState {
  items: Task[];
  loading: boolean;
  error: string | null;
  unauthorized: boolean;
}

const initialState: MyTasksState = {
  items: [],
  loading: false,
  error: null,
  unauthorized: false,
};

/* --- Thunks --- */
export const fetchMyTasks = createAsyncThunk<
  Task[],
  { start?: number; limit?: number } | undefined,
  { state: RootState; rejectValue: string }
>(
  "myTasks/fetchAll",
  async (params, { getState, rejectWithValue }) => {
    const { username, password, isAuthenticated } = getState().auth;
    if (!isAuthenticated) {
      return rejectWithValue("unauthorized");
    }

    try {
      return await api.myTasksApi.getAll({
        username,
        password,
        start: params?.start,
        limit: params?.limit,
      });
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.detail || "Ошибка загрузки моих задач"
      );
    }
  }
);

export const completeMyTask = createAsyncThunk<
  Task,
  { taskId: number; result: string },
  { state: RootState; rejectValue: string }
>(
  "myTasks/complete",
  async ({ taskId, result }, { getState, rejectWithValue }) => {
    const { username, password, isAuthenticated } = getState().auth;
    if (!isAuthenticated) {
      return rejectWithValue("unauthorized");
    }
    try {
      return await api.myTasksApi.complete({
        username,
        password,
        taskId,
        result,
      });
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.detail || "Ошибка завершения задачи"
      );
    }
  }
);

/* --- Slice --- */
const myTasksSlice = createSlice({
  name: "myTasks",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.unauthorized = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAll
      .addCase(fetchMyTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.unauthorized = false;
      })
      .addCase(fetchMyTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchMyTasks.rejected, (state, action) => {
        state.loading = false;
        if (action.payload === "unauthorized") {
          state.unauthorized = true;
        } else {
          state.error = (action.payload as string) ?? "Неизвестная ошибка";
        }
      })
      // complete
      .addCase(completeMyTask.pending, (state) => {
        state.error = null;
        state.unauthorized = false;
      })
      .addCase(completeMyTask.fulfilled, (state, action: PayloadAction<Task>) => {
        const idx = state.items.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) {
          state.items[idx] = action.payload;
        }
      })
      .addCase(completeMyTask.rejected, (state, action) => {
        if (action.payload === "unauthorized") {
          state.unauthorized = true;
        } else {
          state.error = (action.payload as string) ?? "Неизвестная ошибка";
        }
      });
  },
});

/* --- Export --- */
export const { clearError } = myTasksSlice.actions;
export const selectMyTasks = (state: RootState) => state.myTasks;
export default myTasksSlice.reducer;
