import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import type { SortMode } from "../slices/statisticsSlice";
import type { UserStatistic } from "../../shared/types/types";

/** База */
export const selectGlobal = (s: RootState) => s.statistics.global;
export const selectSortMode = (s: RootState) => s.statistics.sortMode;

/** Фильтрация по имени */
export const makeSelectFiltered = () =>
    createSelector(
        [selectGlobal, (_: RootState, query: string) => query],
        (global, query) => {
            const q = query.trim().toLowerCase();
            if (!q) return global;
            return global.filter((u) => u.name.toLowerCase().includes(q));
        }
    );

/** Сортировка */
export const makeSelectSorted = () =>
    createSelector(
        [makeSelectFiltered(), (_: RootState, __: string, sortMode: SortMode) => sortMode],
        (filtered, sortMode) => {
            const arr = [...filtered];
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
        }
    );

/** Пагинация (сквозной расчёт total/totalPages) */
export const makeSelectPaginated = () =>
    createSelector(
        [
            makeSelectSorted(),
            (_: RootState, __: string, ___: SortMode, page: number) => page,
            (_: RootState, __: string, ___: SortMode, ____, pageSize: number) => pageSize,
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

