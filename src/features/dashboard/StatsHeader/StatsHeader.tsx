import s from "./StatsHeader.module.scss";

type Props = {
    total: number;
    completed: number;
    inWork: number;
    failed: number;
    doneRate: number;
    avgCompletedPerUser: number;
    topName?: string | null;
    antiName?: string | null;
};

export default function StatsHeader({
    total, completed, inWork, failed, doneRate, avgCompletedPerUser, topName, antiName,
}: Props) {
    const cards = [
        { k: "Всего задач", v: total },
        { k: "Выполнено", v: completed },
        { k: "В работе", v: inWork },
        { k: "Просрочено", v: failed },
        // только текстовая правка, логика не менялась
        { k: "Доля выполненных", v: `${doneRate}%` },
        { k: "Выполнено / чел", v: avgCompletedPerUser.toFixed(1) },
        { k: "Топ исполнитель", v: topName || "—" },
        { k: "Анти-лидер", v: antiName || "—" },
    ];

    return (
        <section className={s.wrap} aria-label="Ключевые показатели">
            {cards.map((c, i) => (
                <div key={i} className={s.card} title={String(c.v)}>
                    <span className={s.k}>{c.k}</span>
                    <b className={s.v}>{c.v}</b>
                </div>
            ))}
        </section>
    );
}
