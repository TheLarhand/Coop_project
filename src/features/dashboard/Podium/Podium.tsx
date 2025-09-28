import s from "./Podium.module.scss";
import { useSelector } from "react-redux";
import { selectGlobalKpis } from "../../../store/selectors/statisticsSelectors";

/**
 * Подиум Top-3 по "Выполнено".
 * Если меньше 3 — показываем сколько есть.
 */
export default function Podium() {
    const { leaderboard } = useSelector(selectGlobalKpis);

    const top3 = leaderboard.slice(0, 3);
    if (top3.length === 0) return null;

    // хотим порядок: 2-е место, 1-е, 3-е (визуально удобнее)
    const order = [top3[1], top3[0], top3[2]].filter(Boolean);

    return (
        <section className={s.wrap} aria-label="Лидерборд Top-3">
            <h3 className={s.title}>Лидерборд</h3>
            <div className={s.podium}>
                {order.map((p, idx) => (
                    <div
                        key={p!.id}
                        className={`${s.place} ${idx === 1 ? s.first : idx === 0 ? s.second : s.third}`}
                        title={`${p!.name} — ${p!.completed} задач`}
                    >
                        <b className={s.score}>{p!.completed}</b>
                        <span className={s.name}>{p!.name}</span>
                        <i className={s.badge}>#{p!.place}</i>
                    </div>
                ))}
            </div>
        </section>
    );
}
