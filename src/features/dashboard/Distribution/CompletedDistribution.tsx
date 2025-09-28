import s from "./CompletedDistribution.module.scss";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { makeSelectSorted } from "../../../store/selectors/statisticsSelectors";
import type { RootState } from "../../../store/store";

/**
 * Гистограмма: локальная сортировка по completedDesc и первые 12
 */
export default function CompletedDistribution() {
    const selectSorted = useMemo(() => makeSelectSorted(), []);
    const sorted = useSelector((s: RootState) => selectSorted(s, "", "completedDesc"));
    if (sorted.length === 0) return null;

    const top = sorted.slice(0, 12);
    const max = Math.max(...top.map((u) => u.completedTasks), 1);

    return (
        <section className={s.wrap} aria-label="Распределение выполненных">
            <h3 className={s.title}>Распределение «Выполнено» (Top)</h3>
            <ul className={s.list}>
                {top.map((u) => {
                    const w = Math.round((u.completedTasks / max) * 100);
                    return (
                        <li key={u.id} className={s.item} title={`${u.name}: ${u.completedTasks}`}>
                            <span className={s.name}>{u.name}</span>
                            <div className={s.bar}>
                                <span className={s.fill} style={{ width: `${w}%` }} />
                            </div>
                            <b className={s.val}>{u.completedTasks}</b>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
