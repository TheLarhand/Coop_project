import { configureStore } from '@reduxjs/toolkit';
import { testSlice } from './slices/testSlice';
import { authSlice } from "./slices/authSlice";
import { usersSlice } from "./slices/usersSlice";
import { profileSlice } from "./slices/profileSlice";
/* ДОБАВИЛОСЬ: */
import statisticsReducer from "./slices/statisticsSlice";
import tasksReducer from "./slices/taskAddSlice";
import { delegatedTasksSlice } from "./slices/delegatedTasksSlice";

// Конфигурация Redux store с подключенными редьюсерами
export const store = configureStore({
  reducer: {
    test: testSlice.reducer,
    auth: authSlice.reducer,
    users: usersSlice.reducer,
    profile: profileSlice.reducer,
    /* ДОБАВИЛОСЬ: */
    statistics: statisticsReducer,
    tasks: tasksReducer,
    delegatedTasks: delegatedTasksSlice.reducer,
  },
});

// Типы для TypeScript интеграции
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch


