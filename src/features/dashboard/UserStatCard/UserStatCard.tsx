import ChartBars from "../../../shared/ui/ChartBars/ChartBars";
import s from "./UserStatCard.module.scss";

type Props = {
    id: number;
    name: string;
    ava: string | null;
    completed: number;
    inWork: number;
    failed: number;
    total?: number;      // общее количество задач
    rank?: number;       // позиция в текущей сортировке
    highlight?: boolean; // подсветить карточку текущего юзера
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
}: Props) {
    const doneRate = total ? Math.round((completed / total) * 100) : 0;
    const overdueRate = total ? Math.round((failed / total) * 100) : 0;

    return (
        <article className={`${s.card} ${highlight ? s.highlight : ""}`}>
            <header className={s.head}>
                <img className={s.ava} src={ava ?? ""} alt={name} width={48} height={48} />
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <b className={s.name}>{name}</b>
                    <span className={s.meta}>
                        {typeof rank === "number" ? `#${rank}` : ""} · {total} задач
                    </span>
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
