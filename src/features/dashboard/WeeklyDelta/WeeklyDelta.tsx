import { useEffect, useMemo, useState } from "react";
import s from "./WeeklyDelta.module.scss";
import { useSelector } from "react-redux";
import { selectGlobalTotals } from "../../../store/selectors/statisticsSelectors";

/** Псевдо-аналитика "за неделю" */
type Totals = { completed: number; inWork: number; failed: number };

const LS_KEY = "dashboard:lastSnapshot";

function readSnapshot(): Totals | null {
    try {
        const raw = localStorage.getItem(LS_KEY);
        return raw ? (JSON.parse(raw) as Totals) : null;
    } catch (e) {
        // (eslint) помечаем переменную как «использованную»
        void e;
        return null;
    }
}

function saveSnapshot(t: Totals) {
    try {
        localStorage.setItem(LS_KEY, JSON.stringify(t));
    } catch (e) {
        // (eslint) помечаем переменную как «использованную»
        void e;
    }
}

export default function WeeklyDelta() {
    const totals = useSelector(selectGlobalTotals);
    const [prev, setPrev] = useState<Totals | null>(null);

    useEffect(() => {
        setPrev(readSnapshot());
        const t = window.setTimeout(() => saveSnapshot(totals), 300);
        return () => window.clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const diff = useMemo(() => {
        if (!prev) return null;
        return {
            completed: totals.completed - prev.completed,
            inWork: totals.inWork - prev.inWork,
            failed: totals.failed - prev.failed,
        };
        //// eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prev, totals.completed, totals.inWork, totals.failed]);

    return (
        <section className={s.wrap} aria-label="Динамика за неделю">
            <h3 className={s.title}>Динамика (с последнего визита)</h3>
            <ul className={s.row}>
                <li className={s.item}>
                    <span className={s.k}>Выполнено</span>
                    <b className={`${s.v} ${diff && diff.completed >= 0 ? s.up : s.down}`}>
                        {diff ? signed(diff.completed) : "—"}
                    </b>
                </li>
                <li className={s.item}>
                    <span className={s.k}>В работе</span>
                    <b className={`${s.v} ${diff && diff.inWork >= 0 ? s.up : s.down}`}>
                        {diff ? signed(diff.inWork) : "—"}
                    </b>
                </li>
                <li className={s.item}>
                    <span className={s.k}>Просрочено</span>
                    <b className={`${s.v} ${diff && diff.failed >= 0 ? s.down : s.up}`}>
                        {diff ? signed(diff.failed) : "—"}
                    </b>
                </li>
            </ul>
            <span className={s.hint}>
                Сравнение с прошлым сохранённым срезом. Срез обновляется при каждом визите.
            </span>
        </section>
    );
}

function signed(n: number) {
    if (n > 0) return `+${n}`;
    if (n < 0) return `${n}`;
    return "0";
}



