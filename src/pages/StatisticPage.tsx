import { useEffect, useMemo } from "react";
import MainLayout from "../layouts/MainLayout";
import Button from "../shared/ui/Button/Button";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../store/store";

import {
  fetchGlobalStatistic,
  fetchMyStatistic,
  selectStatistics,
  setSortMode,
} from "../store/slices/statisticsSlice";

// авторизация и профиль
import { selectIsAuthenticated } from "../store/slices/authSlice";
import { selectProfile } from "../store/slices/profileSlice";

import ChartDonut from "../shared/ui/ChartDonut/ChartDonut";
import UserStatCard from "../features/dashboard/UserStatCard/UserStatCard";

export default function StatisticPage() {
  const dispatch = useDispatch<AppDispatch>();

  // селекторы
  const isAuth = useSelector(selectIsAuthenticated);
  const me = useSelector(selectProfile); // { name, ava } | null
  const { global, my, loading, error, sortMode } = useSelector(selectStatistics);

  // загрузка данных
  useEffect(() => {
    dispatch(fetchGlobalStatistic());
    if (isAuth) dispatch(fetchMyStatistic());
  }, [dispatch, isAuth]);

  // сохраняем/читаем время визита
  useEffect(() => {
    const nowISO = new Date().toISOString();
    if (!localStorage.getItem("dashboard:lastVisit")) {
      localStorage.setItem("dashboard:lastVisit", nowISO);
    }
    // при каждом заходе обновляем
    localStorage.setItem("dashboard:lastVisit", nowISO);
  }, []);
  const lastVisitISO = localStorage.getItem("dashboard:lastVisit");
  const lastVisit = lastVisitISO ? new Date(lastVisitISO) : null;

  // сортировка
  const sorted = useMemo(() => {
    const arr = [...global];
    switch (sortMode) {
      case "completedDesc":
        arr.sort((a, b) => b.completedTasks - a.completedTasks);
        break;
      case "failedDesc":
        arr.sort((a, b) => b.failedTasks - a.failedTasks);
        break;
      case "inWorkDesc":
        arr.sort((a, b) => b.inWorkTasks - a.inWorkTasks);
        break;
      case "nameAsc":
      default:
        arr.sort((a, b) => a.name.localeCompare(b.name));
    }
    return arr;
  }, [global, sortMode]);

  return (
    <MainLayout>
      <h1>Дашборд</h1>

      {lastVisit && (
        <div style={{ opacity: 0.7, marginTop: 4 }}>
          Последний визит на дашборд: {lastVisit.toLocaleString()}
        </div>
      )}

      {/* Шапка с моим ником/авой (если авторизован) */}
      {isAuth && me && (
        <section
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 12,
          }}
        >
          <img
            src={me.ava}
            alt={me.name}
            width={40}
            height={40}
            style={{ borderRadius: 8 }}
          />
          <div>
            <div style={{ fontWeight: 600 }}>{me.name}</div>
            {my && (
              <div style={{ fontSize: 12, opacity: 0.8 }}>
                Мои задачи: {my.completedTasks + my.inWorkTasks + my.failedTasks} ·
                Выполнено {my.completedTasks}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Кнопки сортировки */}
      <div style={{ margin: "12px 0", display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Button
          variant="secondary"
          onClick={() => dispatch(setSortMode("completedDesc"))}
        >
          Сортировать по выполнено ↓
        </Button>
        <Button
          variant="secondary"
          onClick={() => dispatch(setSortMode("failedDesc"))}
        >
          Сортировать по просрочено ↓
        </Button>
        <Button
          variant="secondary"
          onClick={() => dispatch(setSortMode("inWorkDesc"))}
        >
          Сортировать по в работе ↓
        </Button>
        <Button
          variant="secondary"
          onClick={() => dispatch(setSortMode("nameAsc"))}
        >
          Сортировать по имени A→Z
        </Button>
      </div>

      {loading && <div>Загрузка…</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}

      {/* Моя статистика — только когда есть и пользователь авторизован */}
      {isAuth && my && (
        <section aria-label="Моя статистика" style={{ margin: "16px 0" }}>
          <h3 style={{ margin: "6px 0" }}>Моя статистика</h3>
          <ChartDonut
            completed={my.completedTasks}
            inWork={my.inWorkTasks}
            failed={my.failedTasks}
            size={80}
            title="Моя статистика"
          />
        </section>
      )}

      {/* Пустое состояние общей статистики */}
      {!loading && !error && sorted.length === 0 && (
        <div style={{ opacity: 0.7, marginTop: 12 }}>
          Нет данных для отображения. Создайте задачи на других страницах, чтобы
          здесь появились цифры.
        </div>
      )}

      {/* Сетка карточек пользователей */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 16,
        }}
      >
        {sorted.map((u, i) => {
          const isMe = !!(me && u.name === me.name);
          const total = u.completedTasks + u.inWorkTasks + u.failedTasks;
          return (
            <UserStatCard
              key={u.id}
              id={u.id}
              name={u.name}
              ava={u.ava ?? null}
              completed={u.completedTasks}
              inWork={u.inWorkTasks}
              failed={u.failedTasks}
              highlight={isMe}
              rank={i + 1}
              total={total}
            />
          );
        })}
      </div>
    </MainLayout>
  );
}
