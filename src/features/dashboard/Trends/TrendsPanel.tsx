import s from "./TrendsPanel.module.scss";
import Sparkline from "../../../shared/ui/Sparkline/Sparkline";
import { useDashboardHistory } from "./useDashboardHistory";

export default function TrendsPanel() {
    const history = useDashboardHistory();
    if (history.length < 2) return null;

    const comp = history.map((p) => p.completed);
    const inw = history.map((p) => p.inWork);
    const fail = history.map((p) => p.failed);

    const last = (a: number[]) => a[a.length - 1] ?? 0;

    const cards = [
        { k: "Выполнено", v: last(comp), data: comp, hint: "Динамика выполненных по визитам" },
        { k: "В работе", v: last(inw), data: inw, hint: "Динамика задач в работе по визитам" },
        { k: "Просрочено", v: last(fail), data: fail, hint: "Динамика просрочек по визитам" },
    ];

    return (
        <section className={s.wrap} aria-label="Тренды">
            {cards.map((c, i) => (
                <div key={i} className={s.card} title={c.hint}>
                    <div className={s.row}>
                        <span className={s.k}>{c.k}</span>
                        <b className={s.v}>{c.v}</b>
                    </div>
                    <Sparkline data={c.data} />
                </div>
            ))}
        </section>
    );
}
