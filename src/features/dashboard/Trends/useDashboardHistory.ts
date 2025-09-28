import { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { selectGlobalTotals } from "../../../store/selectors/statisticsSelectors";

type Point = { ts: number; completed: number; inWork: number; failed: number };
const LS_KEY = "dashboard:history:v1";
const LIMIT = 20;

function read(): Point[] {
    try {
        const raw = localStorage.getItem(LS_KEY);
        return raw ? (JSON.parse(raw) as Point[]) : [];
    } catch {
        return [];
    }
}

function write(arr: Point[]) {
    try {
        localStorage.setItem(LS_KEY, JSON.stringify(arr));
        // eslint-disable-next-line no-empty
    } catch { }
}

/**
 * Сохраняет текущие totals в историю (1 запись на визит) и возвращает массив Point[]
 */
export function useDashboardHistory() {
    const totals = useSelector(selectGlobalTotals);

    useEffect(() => {
        // небольшая задержка, чтобы не мигало при загрузке
        const t = window.setTimeout(() => {
            const now: Point = {
                ts: Date.now(),
                completed: totals.completed,
                inWork: totals.inWork,
                failed: totals.failed,
            };
            const prev = read();

            // не дублируем одинаковую «последнюю» точку
            const last = prev[prev.length - 1];
            if (
                !last ||
                last.completed !== now.completed ||
                last.inWork !== now.inWork ||
                last.failed !== now.failed
            ) {
                const next = [...prev, now].slice(-LIMIT);
                write(next);
            }
        }, 200);
        return () => window.clearTimeout(t);
    }, [totals.completed, totals.inWork, totals.failed]);

    const history = useMemo(() => read(), []);
    return history;
}
