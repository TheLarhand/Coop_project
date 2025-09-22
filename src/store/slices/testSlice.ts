import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { testApi } from "../../api/testApi";

interface TestState {
  apiStatus: string;
  loading: boolean;
  error: string | null;
  counter: number;
}

const initialState: TestState = {
  apiStatus: "",
  loading: false,
  error: null,
  counter: 0,
};

export const checkApiStatus = createAsyncThunk(
  "test/checkApiStatus",
  async (_, { rejectWithValue }) => {
    try {
      const response = await testApi.checkApiStatus();
      return response.message;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || "Ошибка подключения к API"
      );
    }
  }
);

export const testSlice = createSlice({
  name: "test",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    increment: (state) => {
      state.counter += 1;
    },
    decrement: (state) => {
      state.counter -= 1;
    },
    resetCounter: (state) => {
      state.counter = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Проверка статуса API
      .addCase(checkApiStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.apiStatus = "";
      })
      .addCase(checkApiStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.apiStatus = "API работает";
      })
      .addCase(checkApiStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.apiStatus = "API не доступен";
      });
  },
});

export const { clearError, increment, decrement, resetCounter } = testSlice.actions;

export const selectApiStatus = (state: { test: TestState }) => state.test.apiStatus;
export const selectTestLoading = (state: { test: TestState }) => state.test.loading;
export const selectTestError = (state: { test: TestState }) => state.test.error;
export const selectCounter = (state: { test: TestState }) => state.test.counter;