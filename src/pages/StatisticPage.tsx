import { useEffect, useMemo, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import Button from "../shared/ui/Button/Button";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/store";

import {
  fetchGlobalStatistic,
  fetchMyStatistic,
  selectStatistics,
  setSortMode,
  type SortMode,
} from "../store/slices/statisticsSlice";

import { selectIsAuthenticated } from "../store/slices/authSlice";
import { selectProfile } from "../store/slices/profileSlice";

import ChartDonut from "../shared/ui/ChartDonut/ChartDonut";
import UserStatCard from "../features/dashboard/UserStatCard/UserStatCard";
import UsersTable from "../features/dashboard/UsersTable/UsersTable";
import { exportUsersStatToCSV } from "../shared/utils/csv";
import { exportUsersStatToXLSX } from "../shared/utils/xlsxExport"; // опционально, см. файл ниже
import type { UserStatistic } from "../shared/types/types";

import {
  makeSelectPaginated,
  makeSelectSorted,
  selectGlobalTotals,
} from "../store/selectors/statisticsSelectors";

export default function StatisticPage() {
  const dispatch = useDispatch<AppDispatch>();

  // селекторы auth/profile/statistics
  const isAuth = useSelector(selectIsAuthenticated);
  const me = useSelector(selectProfile); // { name, ava } | null
  const { loading, error, sortMode } = useSelector(selectStatistics);

  // загрузка данных
  useEffect(() => {
    dispatch(fetchGlobalStatistic());
    if (isAuth) dispatch(fetchMyStatistic());
  }, [dispatch, isAuth]);

  // показываем прошлый визит, и сразу перезаписываем нынешним
  const [lastVisit, setLastVisit] = useState<Date | null>(null);
  useEffect(() => {
    const prevISO = localStorage.getItem("dashboard:lastVisit");
    if (prevISO) setLastVisit(new Date(prevISO));
    localStorage.setItem("dashboard:lastVisit", new Date().toISOString());
  }, []);

  // ------- Локальное состояние вида/поиска/пагинации
  const [view, setView] = useState<"cards" | "table">(
    (localStorage.getItem("dashboard:view") as "cards" | "table") || "cards"
  );
  const [query, setQuery] = useState(localStorage.getItem("dashboard:query") || "");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // сохраняем view/query
  useEffect(() => {
    localStorage.setItem("dashboard:view", view);
  }, [view]);
  useEffect(() => {
    localStorage.setItem("dashboard:query", query);
  }, [query]);

  // ------- Мемо-селекторы (создаём один раз)
  const selectSorted = useMemo(() => makeSelectSorted(), []);
  const selectPaginated = useMemo(() => makeSelectPaginated(), []);

  // значения из селекторов
  const globalTotals = useSelector(selectGlobalTotals);
  const sorted = useSelector((s: RootState) => selectSorted(s, query, sortMode));
  const { data: paginated, totalPages, currentPage } = useSelector((s: RootState) =>
    selectPaginated(s, query, sortMode, page, pageSize)
  );

  // ресет страницы если перелистнули дальше последней
  useEffect(() => {
    if (page !== currentPage) setPage(currentPage);
  }, [currentPage, page]);

  // ------- Экспорт
  const handleExportCSVAll = () => {
    exportUsersStatToCSV(sorted);
  };
  const handleExportCSVPage = () => {
    exportUsersStatToCSV(paginated, { filenameBase: "dashboard_stats_current_page" });
  };
  const handleExportXLSXAll = () => {
    exportUsersStatToXLSX(sorted);
  };

  // смена сортировки -> страница 1
  const setSort = (mode: SortMode) => {
    dispatch(setSortMode(mode));
    setPage(1);
  };

  return (
    <MainLayout>
      <h1>Дашборд</h1>

      {lastVisit && (
        <div style={{ opacity: 0.7, marginTop: 4 }}>
          Последний визит: {lastVisit.toLocaleString()}
        </div>
      )}

      {/* Верхняя панель */}
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          margin: "16px 0 8px",
          alignItems: "center",
        }}
      >
        <Button
          variant={view === "cards" ? "primary" : "secondary"}
          onClick={() => setView("cards")}
        >
          Карточки
        </Button>
        <Button
          variant={view === "table" ? "primary" : "secondary"}
          onClick={() => setView("table")}
        >
          Таблица
        </Button>

        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <input
            placeholder="Поиск по имени…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            style={{
              padding: "8px 10px",
              border: "1px solid #bdc3c7",
              borderRadius: 8,
              minWidth: 220,
            }}
          />
          <Button variant="secondary" onClick={() => dispatch(fetchGlobalStatistic())}>
            Обновить
          </Button>
          <Button onClick={handleExportCSVAll}>Экспорт CSV (всё)</Button>
          <Button variant="secondary" onClick={handleExportCSVPage}>
            Экспорт CSV (страница)
          </Button>
          <Button variant="secondary" onClick={handleExportXLSXAll}>
            Экспорт XLSX
          </Button>
        </div>
      </div>

      {loading && <div>Загрузка…</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}

      {/* Глобальная сводка */}
      {!loading && !error && (
        <section aria-label="Глобальная сводка" style={{ margin: "12px 0 20px" }}>
          <h3 style={{ margin: "6px 0" }}>Глобальная сводка</h3>
          <ChartDonut
            completed={globalTotals.completed}
            inWork={globalTotals.inWork}
            failed={globalTotals.failed}
            size={96}
            title="Глобальная статистика"
          />
        </section>
      )}

      {/* Пусто */}
      {!loading && !error && sorted.length === 0 && (
        <div style={{ opacity: 0.7, marginTop: 12 }}>
          Нет данных для отображения. Создайте задачи на других страницах, чтобы здесь
          появились цифры.
        </div>
      )}

      {/* Контент */}
      {!loading && !error && sorted.length > 0 && (
        <>
          {view === "cards" ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: 16,
              }}
            >
              {paginated.map((u, i) => {
                const isMe = !!(me && u.name === me.name);
                const total = u.completedTasks + u.inWorkTasks + u.failedTasks;
                const rank = (currentPage - 1) * pageSize + i + 1;
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
                    rank={rank}
                    total={total}
                  />
                );
              })}
            </div>
          ) : (
            <UsersTable
              data={paginated as UserStatistic[]}
              sortMode={sortMode}
              onSortChange={(m) => setSort(m)}
              meName={me?.name || null}
              pageRankOffset={(currentPage - 1) * pageSize}
            />
          )}

          {/* Пагинация */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 8,
              marginTop: 16,
              alignItems: "center",
            }}
          >
            <Button variant="secondary" onClick={() => setPage(1)} disabled={currentPage === 1}>
              « Первая
            </Button>
            <Button
              variant="secondary"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Назад
            </Button>
            <span style={{ opacity: 0.75 }}>
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="secondary"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Вперёд
            </Button>
            <Button
              variant="secondary"
              onClick={() => setPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Последняя »
            </Button>
          </div>
        </>
      )}
    </MainLayout>
  );
}
