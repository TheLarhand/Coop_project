import { useEffect, useMemo, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import Button from "../shared/ui/Button/Button";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/store";

import u from "../features/dashboard/ui.module.scss";
import s from "./StatisticPage.module.scss";

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
import MyRankBadge from "../features/dashboard/MyRankBadge/MyRankBadge";
import Podium from "../features/dashboard/Podium/Podium";
import Tooltip from "../shared/ui/Tooltip/Tooltip";

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

  const isAuth = useSelector(selectIsAuthenticated);
  const me = useSelector(selectProfile);
  const { loading, error, sortMode } = useSelector(selectStatistics);

  useEffect(() => {
    dispatch(fetchGlobalStatistic());
    if (isAuth) dispatch(fetchMyStatistic());
  }, [dispatch, isAuth]);

  const [lastVisit, setLastVisit] = useState<Date | null>(null);
  useEffect(() => {
    const prevISO = localStorage.getItem("dashboard:lastVisit");
    if (prevISO) setLastVisit(new Date(prevISO));
    localStorage.setItem("dashboard:lastVisit", new Date().toISOString());
  }, []);

  // Вид / поиск / пагинация / режим "только активные"
  const [view, setView] = useState<"cards" | "table">(
    (localStorage.getItem("dashboard:view") as "cards" | "table") || "cards"
  );
  const [query, setQuery] = useState(localStorage.getItem("dashboard:query") || "");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(12);
  const [onlyActive, setOnlyActive] = useState<boolean>(false);
  const [copyOk, setCopyOk] = useState<null | string>(null);

  useEffect(() => { localStorage.setItem("dashboard:view", view); }, [view]);
  useEffect(() => { localStorage.setItem("dashboard:query", query); }, [query]);

  const selectSorted = useMemo(() => makeSelectSorted(), []);
  const selectPaginated = useMemo(() => makeSelectPaginated(), []);

  const globalTotals = useSelector(selectGlobalTotals);
  const kpis = useSelector(selectGlobalKpis);
  const sorted = useSelector((s: RootState) => selectSorted(s, query, sortMode, onlyActive));
  const { data: paginated, total, totalPages, currentPage } = useSelector((s: RootState) =>
    selectPaginated(s, query, sortMode, onlyActive, page, pageSize)
  );

  useEffect(() => { if (page !== currentPage) setPage(currentPage); }, [currentPage, page]);

  // Actions
  const setSort = (mode: SortMode) => {
    dispatch(setSortMode(mode));
    setPage(1);
    localStorage.setItem("dashboard:sortMode", mode);
  };

  // Быстрые "Топ N": включаем onlyActive + сортировку по выполненным
  const showTop = (n: 1 | 3 | 5) => {
    setOnlyActive(true);
    setSort("completedDesc");
    setPageSize(n);
    setPage(1);
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
    localStorage.removeItem("dashboard:lastSnapshot");
    localStorage.removeItem("dashboard:sortMode");
    setView("cards"); setQuery(""); setPage(1);
    setOnlyActive(false);
  };
  const handleClearTrends = () => {
    localStorage.removeItem("dashboard:history:v1");
  };

  return (
    <MainLayout>
      <div className={s.page}>
        <h1>Дашборд</h1>

        {/* KPI */}
        <StatsHeader
          total={kpis.total}
          completed={kpis.completed}
          inWork={kpis.inWork}
          failed={kpis.failed}
          doneRate={kpis.doneRate}
          avgCompletedPerUser={kpis.avgCompletedPerUser}
          topName={kpis.top?.name ?? null}
        />

        {/* Динамика + Лидерборд */}
        <WeeklyDelta />
        <div style={{ margin: "8px 0 14px" }}>
          <Podium />
        </div>

        {lastVisit && (
          <div style={{ opacity: 0.7, marginTop: 4 }}>
            Последний визит: {lastVisit.toLocaleString()}
          </div>
        )}

        {/* Верхняя полоса: поиск слева, мой ранг справа */}
        <div className={s.topbar}>
          <input
            className={u.input}
            placeholder="Поиск по имени…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          />
          <Tooltip label="Моя позиция в рейтинге">
            <MyRankBadge />
          </Tooltip>
        </div>

        {/* Тулбар */}
        <div className={s.toolbar}>
          <Tooltip label="Карточки пользователей">
            <Button className={u.btn} variant={view === "cards" ? "primary" : "secondary"} onClick={() => setView("cards")}>Карточки</Button>
          </Tooltip>

          <Tooltip label="Табличный вид">
            <Button className={u.btn} variant={view === "table" ? "primary" : "secondary"} onClick={() => setView("table")}>Таблица</Button>
          </Tooltip>

          <Tooltip label="Сортировать по выполненным ↓">
            <Button className={u.btn} variant="secondary" onClick={() => setSort("completedDesc")}>Сортировать по выполнено ↓</Button>
          </Tooltip>
          <Tooltip label="Сортировать по просроченным ↓">
            <Button className={u.btn} variant="secondary" onClick={() => setSort("failedDesc")}>По просрочено ↓</Button>
          </Tooltip>
          <Tooltip label="Сортировать по задачам в работе ↓">
            <Button className={u.btn} variant="secondary" onClick={() => setSort("inWorkDesc")}>По «в работе» ↓</Button>
          </Tooltip>
          <Tooltip label="Сортировать по имени A→Z">
            <Button className={u.btn} variant="secondary" onClick={() => setSort("nameAsc")}>По имени A→Z</Button>
          </Tooltip>

          <div style={{ flex: 1 }} />

          <Tooltip label="Обновить данные">
            <Button className={u.btn} variant="secondary" onClick={() => dispatch(fetchGlobalStatistic())}>Обновить</Button>
          </Tooltip>
          <Tooltip label="Скачать всё в CSV">
            <Button className={u.btn} onClick={handleExportCSVAll}>CSV (всё)</Button>
          </Tooltip>
          <Tooltip label="Скачать текущую страницу CSV">
            <Button className={u.btn} variant="secondary" onClick={handleExportCSVPage}>CSV (страница)</Button>
          </Tooltip>
          <Tooltip label="Экспорт в Excel (XLSX)">
            <Button className={u.btn} variant="secondary" onClick={handleExportXLSXAll}>XLSX</Button>
          </Tooltip>
          <Tooltip label="Экспорт JSON">
            <Button className={u.btn} variant="secondary" onClick={handleExportJSONAll}>JSON</Button>
          </Tooltip>
          <Tooltip label="Скопировать таблицу в буфер (TSV)">
            <Button className={u.btn} variant="secondary" onClick={handleCopyTSV}>Копировать TSV</Button>
          </Tooltip>
          <Tooltip label="Сбросить выбранный вид и фильтры">
            <Button className={u.btn} variant="secondary" onClick={handleResetView}>Сбросить вид</Button>
          </Tooltip>
          <Tooltip label="Очистить сохранённую историю трендов">
            <Button className={u.btn} variant="secondary" onClick={handleClearTrends}>Очистить тренды</Button>
          </Tooltip>
        </div>

        {/* Панель: счётчики и Top-N */}
        <div className={s.meta}>
          <span>Найдено пользователей: <b>{total}</b></span>
          <span className={s.divider} />
          <span>Показывать: </span>

          <Tooltip label="Показать только лидера (с задачами)">
            <Button className={u.btn} variant={pageSize === 1 && onlyActive ? "primary" : "secondary"} onClick={() => showTop(1)}>Топ 1</Button>
          </Tooltip>
          <Tooltip label="Первые три по выполненным (без нулевых)">
            <Button className={u.btn} variant={pageSize === 3 && onlyActive ? "primary" : "secondary"} onClick={() => showTop(3)}>Топ 3</Button>
          </Tooltip>
          <Tooltip label="Первые пять по выполненным (без нулевых)">
            <Button className={u.btn} variant={pageSize === 5 && onlyActive ? "primary" : "secondary"} onClick={() => showTop(5)}>Топ 5</Button>
          </Tooltip>

          {/* Кнопка “Все” — вернуть обычный режим */}
          <Tooltip label="Показать всех пользователей">
            <Button className={u.btn} variant={!onlyActive ? "primary" : "secondary"} onClick={() => { setOnlyActive(false); setPage(1); }}>Все</Button>
          </Tooltip>

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

        <TrendsPanel />
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
              <div className={s.cardsGrid}>
                {paginated.map((u, i) => {
                  const isMe = !!(me && u.name === me.name);
                  const totalRow = u.completedTasks + u.inWorkTasks + u.failedTasks;
                  const rank = (currentPage - 1) * pageSize + i + 1;
                  const isTop = kpis.top?.id === u.id;

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
                      top={isTop}
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
            <div className={s.pager}>
              <Button className={u.btn} variant="secondary" onClick={() => setPage(1)} disabled={currentPage === 1}>« Первая</Button>
              <Button className={u.btn} variant="secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>Назад</Button>
              <span style={{ opacity: 0.75 }}>{currentPage} / {totalPages}</span>
              <Button className={u.btn} variant="secondary" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Вперёд</Button>
              <Button className={u.btn} variant="secondary" onClick={() => setPage(totalPages)} disabled={currentPage === totalPages}>Последняя »</Button>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}


