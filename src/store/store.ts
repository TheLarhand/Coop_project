import { configureStore } from '@reduxjs/toolkit';
import { testSlice } from './slices/testSlice';

// Конфигурация Redux store с подключенными редьюсерами
export const store = configureStore({
  reducer: {
      test: testSlice.reducer,
    // Когда реализуете слайсы добавите их 
  },
});

// Типы для TypeScript интеграции
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch