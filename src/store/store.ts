import { configureStore } from '@reduxjs/toolkit';
import { testSlice } from './slices/testSlice';
import { authSlice } from "./slices/authSlice.ts";
import { usersSlice } from "./slices/usersSlice.ts";
import {profileSlice} from "./slices/profileSlice.ts";

// Конфигурация Redux store с подключенными редьюсерами
export const store = configureStore({
  reducer: {
      test: testSlice.reducer,
      auth: authSlice.reducer,
      users: usersSlice.reducer,
      profile: profileSlice.reducer,
  },
});

// Типы для TypeScript интеграции
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch