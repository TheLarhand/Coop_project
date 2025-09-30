import s from "./StatsHeader.module.scss";

type Props = {
    total: number;
    completed: number;
    inWork: number;
    failed: number;
    doneRate: number;            // уже % (0..100)
    avgCompletedPerUser: number;
    topName: string | null;      // антилидера нет
};

export default function StatsHeader({
    total,
    completed,
    inWork,
    failed,
    doneRate,
    avgCompletedPerUser,
    topName
}: Props) {
    const pct = Math.max(0, Math.min(100, Math.round(doneRate || 0)));

    return (
        <section className={s.wrap} aria-label="KPI">
            <K k="Всего задач" v={total} />
            <K k="Выполнено" v={completed} />
            <K k="В работе" v={inWork} />
            <K k="Просрочено" v={failed} />
            <K k="Доля выполненных" v={`${pct}%`} />
            <K k="Выполнено / чел" v={avgCompletedPerUser} />
            <K k="Топ исполнитель" v={topName ?? "—"} />
        </section>
    );
}

function K({ k, v }: { k: string; v: number | string }) {
    return (
        <div className={s.card}>
            <div className={s.k} title={String(k)}>{k}</div>
            <div className={s.v} title={String(v)}>{v}</div>
        </div>
    );
}
