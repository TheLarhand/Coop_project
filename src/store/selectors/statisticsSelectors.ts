import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import type { SortMode } from "../slices/statisticsSlice";
import type { UserStatistic } from "../../shared/types/types";

/** База */
export const selectGlobal = (s: RootState) => s.statistics.global;

/** Фильтрация по имени + onlyActive (без нулевых) */
export const makeSelectFiltered = () =>
    createSelector(
        [
            selectGlobal,
            (_: RootState, query: string) => query,
            (_: RootState, __: string, ___: SortMode, onlyActive: boolean) => onlyActive,
        ],
        (global, query, onlyActive) => {
            const q = query.trim().toLowerCase();
            let arr = q ? global.filter((u) => u.name.toLowerCase().includes(q)) : global;

            if (onlyActive) {
                arr = arr.filter(
                    (u) => (u.completedTasks + u.inWorkTasks + u.failedTasks) > 0
                );
            }
            return arr;
        }
    );

/** Сортировка (стабильная; при равенстве — по имени RU) */
export const makeSelectSorted = () =>
    createSelector(
        [
            makeSelectFiltered(),
            (_: RootState, __: string, sortMode: SortMode) => sortMode,
        ],
        (filtered, sortMode) => {
            const collator = new Intl.Collator("ru");
            const arr = [...filtered];

            switch (sortMode) {
                case "completedDesc":
                    arr.sort(
                        (a, b) =>
                            b.completedTasks - a.completedTasks ||
                            collator.compare(a.name, b.name)
                    );
                    break;
                case "failedDesc":
                    arr.sort(
                        (a, b) =>
                            b.failedTasks - a.failedTasks ||
                            collator.compare(a.name, b.name)
                    );
                    break;
                case "inWorkDesc":
                    arr.sort(
                        (a, b) =>
                            b.inWorkTasks - a.inWorkTasks ||
                            collator.compare(a.name, b.name)
                    );
                    break;
                case "nameAsc":
                default:
                    arr.sort((a, b) => collator.compare(a.name, b.name));
            }
            return arr;
        }
    );

/** Пагинация */
export const makeSelectPaginated = () =>
    createSelector(
        [
            makeSelectSorted(),
            (_: RootState, __: string, ___: SortMode, ____: boolean, page: number) => page,
            (_: RootState, __: string, ___: SortMode, ____: boolean, _____: number, pageSize: number) => pageSize,
        ],
        (sorted: UserStatistic[], page, pageSize) => {
            const total = sorted.length;
            const totalPages = Math.max(1, Math.ceil(total / pageSize));
            const currentPage = Math.min(Math.max(1, page), totalPages);
            const data = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);
            return { data, total, totalPages, currentPage };
        }
    );

/** Сводные суммы для пончика */
export const selectGlobalTotals = createSelector([selectGlobal], (global) => {
    return global.reduce(
        (acc, u) => {
            acc.completed += u.completedTasks;
            acc.inWork += u.inWorkTasks;
            acc.failed += u.failedTasks;
            return acc;
        },
        { completed: 0, inWork: 0, failed: 0 }
    );
});

/** KPI + лидер по выполненным */
export const selectGlobalKpis = createSelector([selectGlobal], (global) => {
    const users = global.length;
    let completed = 0, inWork = 0, failed = 0;

    for (const u of global) {
        completed += u.completedTasks;
        inWork += u.inWorkTasks;
        failed += u.failedTasks;
    }

    const total = completed + inWork + failed;
    const doneRate = total ? Math.round((completed / total) * 100) : 0;
    const avgCompletedPerUser = users ? +(completed / users).toFixed(2) : 0;

    const collator = new Intl.Collator("ru");

    const byCompleted = [...global].sort(
        (a, b) => b.completedTasks - a.completedTasks || collator.compare(a.name, b.name)
    );
    const top = byCompleted[0]?.completedTasks > 0 ? byCompleted[0] : null;

    const leaderboard = byCompleted
        .filter((u) => u.completedTasks > 0)
        .slice(0, 5)
        .map((u, i) => ({
            place: i + 1,
            id: u.id,
            name: u.name,
            completed: u.completedTasks,
        }));

    return {
        users,
        total,
        completed,
        inWork,
        failed,
        doneRate,               // 0..100 (%)
        avgCompletedPerUser,
        top,                    // может быть null
        leaderboard,
    };
});
