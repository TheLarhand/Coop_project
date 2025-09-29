import { useEffect, useMemo, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import Button from "../shared/ui/Button/Button";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/store";

// новые импорты
import TrendsPanel from "../features/dashboard/Trends/TrendsPanel";
import CompletedDistribution from "../features/dashboard/Distribution/CompletedDistribution";


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
import StatsHeader from "../features/dashboard/StatsHeader/StatsHeader";
import WeeklyDelta from "../features/dashboard/WeeklyDelta/WeeklyDelta";

// ⬇️ добавлено
import MyRankBadge from "../features/dashboard/MyRankBadge/MyRankBadge";
import Podium from "../features/dashboard/Podium/Podium";

import { exportUsersStatToCSV } from "../shared/utils/csv";
import { exportUsersStatToXLSX } from "../shared/utils/xlsxExport";
import { exportUsersStatToJSON } from "../shared/utils/jsonExport";
import { copyUsersStatToClipboardTSV } from "../shared/utils/clipboard";
import type { UserStatistic } from "../shared/types/types";

import {
  makeSelectPaginated,
  makeSelectSorted,
  selectGlobalTotals,
  selectGlobalKpis,
} from "../store/selectors/statisticsSelectors";

export default function StatisticPage() {
  const dispatch = useDispatch<AppDispatch>();

  // auth/profile/statistics
  const isAuth = useSelector(selectIsAuthenticated);
  const me = useSelector(selectProfile);
  const { loading, error, sortMode } = useSelector(selectStatistics);

  // загрузка
  useEffect(() => {
    dispatch(fetchGlobalStatistic());
    if (isAuth) dispatch(fetchMyStatistic());
  }, [dispatch, isAuth]);

  // время визита
  const [lastVisit, setLastVisit] = useState<Date | null>(null);
  useEffect(() => {
    const prevISO = localStorage.getItem("dashboard:lastVisit");
    if (prevISO) setLastVisit(new Date(prevISO));
    localStorage.setItem("dashboard:lastVisit", new Date().toISOString());
  }, []);

  // Вид/поиск/пагинация
  const [view, setView] = useState<"cards" | "table">(
    (localStorage.getItem("dashboard:view") as "cards" | "table") || "cards"
  );
  const [query, setQuery] = useState(localStorage.getItem("dashboard:query") || "");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(12);
  const [copyOk, setCopyOk] = useState<null | string>(null);

  useEffect(() => { localStorage.setItem("dashboard:view", view); }, [view]);
  useEffect(() => { localStorage.setItem("dashboard:query", query); }, [query]);

  const selectSorted = useMemo(() => makeSelectSorted(), []);
  const selectPaginated = useMemo(() => makeSelectPaginated(), []);

  const globalTotals = useSelector(selectGlobalTotals);
  const kpis = useSelector(selectGlobalKpis);
  const sorted = useSelector((s: RootState) => selectSorted(s, query, sortMode));
  const { data: paginated, total, totalPages, currentPage } = useSelector((s: RootState) =>
    selectPaginated(s, query, sortMode, page, pageSize)
  );

  useEffect(() => { if (page !== currentPage) setPage(currentPage); }, [currentPage, page]);

  // Actions
  const setSort = (mode: SortMode) => {
    dispatch(setSortMode(mode));
    setPage(1);
    localStorage.setItem("dashboard:sortMode", mode);
  };

  const handleExportCSVAll = () => exportUsersStatToCSV(sorted);
  const handleExportCSVPage = () => exportUsersStatToCSV(paginated, { filenameBase: "dashboard_stats_current_page" });
  const handleExportXLSXAll = () => {
    try { exportUsersStatToXLSX(sorted); }
    catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Не удалось создать XLSX.";
      alert("Не удалось создать XLSX. Используй CSV или JSON.\nПодробности: " + msg);
      console.error(err);
    }
  };
  const handleExportJSONAll = () => exportUsersStatToJSON(sorted);
  const handleCopyTSV = async () => {
    try {
      await copyUsersStatToClipboardTSV(sorted);
      setCopyOk("Скопировано в буфер!");
      window.setTimeout(() => setCopyOk(null), 1500);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Не удалось скопировать в буфер.");
      console.error(err);
    }
  };
  const handleResetView = () => {
    localStorage.removeItem("dashboard:view");
    localStorage.removeItem("dashboard:query");
    localStorage.removeItem("dashboard:lastVisit");
    localStorage.removeItem("dashboard:lastSnapshot"); // очистка снапшота WeeklyDelta
    localStorage.removeItem("dashboard:sortMode");
    setView("cards"); setQuery(""); setPage(1);
  };

  const handleClearTrends = () => {
    localStorage.removeItem("dashboard:history:v1");
  };

  // UI
  return (
    <MainLayout>
      <h1>Дашборд</h1>

      {/* KPI-плашки */}
      <StatsHeader
        total={kpis.total}
        completed={kpis.completed}
        inWork={kpis.inWork}
        failed={kpis.failed}
        doneRate={kpis.doneRate}
        avgCompletedPerUser={kpis.avgCompletedPerUser}
        topName={kpis.top?.name ?? null}
        antiName={kpis.anti?.name ?? null}
      />

      {/* динамика с последнего визита */}
      <WeeklyDelta />

      {/* подиум Top-3 */}
      <div style={{ margin: "8px 0 14px" }}>
        <Podium />
      </div>

      {lastVisit && (
        <div style={{ opacity: 0.7, marginTop: 4 }}>
          Последний визит: {lastVisit.toLocaleString()}
        </div>
      )}

      {/* Верхняя панель */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "16px 0 8px", alignItems: "center" }}>
        <Button variant={view === "cards" ? "primary" : "secondary"} onClick={() => setView("cards")}>Карточки</Button>
        <Button variant={view === "table" ? "primary" : "secondary"} onClick={() => setView("table")}>Таблица</Button>

        {/* быстрые сортировки */}
        <Button variant="secondary" onClick={() => setSort("completedDesc")}>Сортировать по выполнено ↓</Button>
        <Button variant="secondary" onClick={() => setSort("failedDesc")}>По просрочено ↓</Button>
        <Button variant="secondary" onClick={() => setSort("inWorkDesc")}>По «в работе» ↓</Button>
        <Button variant="secondary" onClick={() => setSort("nameAsc")}>По имени A→Z</Button>

        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          {/* ⬇️ бейдж «моя позиция» */}
          <MyRankBadge />

          <input
            placeholder="Поиск по имени…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            style={{ padding: "8px 10px", border: "1px solid #bdc3c7", borderRadius: 8, minWidth: 220 }}
          />
          <Button variant="secondary" onClick={() => dispatch(fetchGlobalStatistic())}>Обновить</Button>
          <Button onClick={handleExportCSVAll}>CSV (всё)</Button>
          <Button variant="secondary" onClick={handleExportCSVPage}>CSV (страница)</Button>
          <Button variant="secondary" onClick={handleExportXLSXAll}>XLSX</Button>
          <Button variant="secondary" onClick={handleExportJSONAll}>JSON</Button>
          <Button variant="secondary" onClick={handleCopyTSV}>Копировать TSV</Button>
          <Button variant="secondary" onClick={handleResetView}>Сбросить вид</Button>
          <Button variant="secondary" onClick={handleClearTrends}>Очистить тренды</Button>
        </div>
      </div>

      {/* Панель: счётчики и Top-N */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", margin: "6px 0 10px", opacity: 0.9 }}>
        <span>Найдено пользователей: <b>{total}</b></span>
        <span style={{ borderLeft: "1px solid #ddd", height: 16 }} />
        <span>Показывать: </span>
        <Button variant={pageSize === 1 ? "primary" : "secondary"} onClick={() => { setPageSize(1); setPage(1); }}>Топ 1</Button>
        <Button variant={pageSize === 3 ? "primary" : "secondary"} onClick={() => { setPageSize(3); setPage(1); }}>Топ 3</Button>
        <Button variant={pageSize === 5 ? "primary" : "secondary"} onClick={() => { setPageSize(5); setPage(1); }}>Топ 5</Button>
        {copyOk && <span style={{ color: "#27ae60" }}>{copyOk}</span>}
      </div>

      {loading && <div>Загрузка…</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}

      {/* Глобальная сводка */}
      {!loading && !error && (
        <section aria-label="Глобальная сводка" style={{ margin: "12px 0 12px" }}>
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

      {/* НОВОЕ: тренды по визитам */}
      <TrendsPanel />

      {/* НОВОЕ: распределение по выполненным */}
      <CompletedDistribution />

      {/* Контент */}
      {!loading && !error && sorted.length === 0 && (
        <div style={{ opacity: 0.7, marginTop: 12 }}>
          Нет данных для отображения. Создайте задачи на других страницах, чтобы здесь появились цифры.
        </div>
      )}

      {!loading && !error && sorted.length > 0 && (
        <>
          {view === "cards" ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, minmax(0, 1fr))", // было auto-fill
                gap: 16
              }}
            >
              {paginated.map((u, i) => {
                const isMe = !!(me && u.name === me.name);
                const totalRow = u.completedTasks + u.inWorkTasks + u.failedTasks;
                const rank = (currentPage - 1) * pageSize + i + 1;
                const isTop = kpis.top?.id === u.id; // топ-1 по выполненным

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
                    top={isTop}          // ⬅ добавил
                    rank={rank}
                    total={totalRow}
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
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16, alignItems: "center" }}>
            <Button variant="secondary" onClick={() => setPage(1)} disabled={currentPage === 1}>« Первая</Button>
            <Button variant="secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>Назад</Button>
            <span style={{ opacity: 0.75 }}>{currentPage} / {totalPages}</span>
            <Button variant="secondary" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Вперёд</Button>
            <Button variant="secondary" onClick={() => setPage(totalPages)} disabled={currentPage === totalPages}>Последняя »</Button>
          </div>
        </>
      )}
    </MainLayout>
  );
}


