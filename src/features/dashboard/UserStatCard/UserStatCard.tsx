import s from "./UserStatCard.module.scss";
import ChartBars from "../../../shared/ui/ChartBars/ChartBars";
import DoneRateBadge from "../DoneRateBadge/DoneRateBadge";
import OverdueBadge from "../OverdueBadge/OverdueBadge";

// увеличенный фоллбек-аватар 64x64
const fallbackAva =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='100%' height='100%' rx='10' ry='10' fill='%23ecf0f1'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='12' fill='%23999'>no img</text></svg>";

type Props = {
    id: number;
    name: string;
    ava: string | null;
    completed: number;
    inWork: number;
    failed: number;
    total?: number;
    rank?: number;
    highlight?: boolean;   // подсветка «это я»
    top?: boolean;         // топ-1 по выполненным
};

export default function UserStatCard({
    name,
    ava,
    completed,
    inWork,
    failed,
    total = completed + inWork + failed,
    rank,
    highlight,
    top = false,
}: Props) {
    const doneRate = total ? Math.round((completed / total) * 100) : 0;
    const overdueRate = total ? Math.round((failed / total) * 100) : 0;

    return (
        <article className={`${s.card} ${highlight ? s.highlight : ""} ${top ? s.top : ""}`}>
            <header className={s.head}>
                <div className={s.avaWrap}>
                    <img
                        className={s.ava}
                        src={ava || fallbackAva}
                        alt={name}
                        width={64}
                        height={64}
                        onError={(e) => {
                            const img = e.currentTarget as HTMLImageElement;
                            if (img.src !== fallbackAva) img.src = fallbackAva;
                        }}
                    />
                    {top && (
                        <span className={s.crown} role="img" aria-label="Top 1">
                            👑
                        </span>
                    )}
                </div>

                <div className={s.titleBox}>
                    <b className={s.name}>{name}</b>
                    <span className={s.meta}>
                        {typeof rank === "number" ? `#${rank}` : ""} · {total} задач
                    </span>

                    {/* новые бейджи — как в таблице */}
                    <div className={s.badgesRow}>
                        <DoneRateBadge doneRate={doneRate} />
                        <OverdueBadge failed={failed} total={total} />
                    </div>
                </div>
            </header>

            <ul className={s.list}>
                <li>✅ Выполнено: {completed} ({doneRate}%)</li>
                <li>🟡 В работе: {inWork}</li>
                <li>⛔ Просрочено: {failed} ({overdueRate}%)</li>
            </ul>

            <ChartBars completed={completed} inWork={inWork} failed={failed} />
        </article>
    );
}


