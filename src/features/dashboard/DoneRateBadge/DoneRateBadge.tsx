import s from "./DoneRateBadge.module.scss";

type Props = { doneRate: number };

export default function DoneRateBadge({ doneRate }: Props) {
    const cls =
        doneRate >= 80 ? s.good :
            doneRate >= 50 ? s.mid :
                s.bad;

    return (
        <span className={`${s.badge} ${cls}`} title={`Доля выполненных: ${doneRate}%`}>
            Готово: <b>{doneRate}%</b>
        </span>
    );
}
