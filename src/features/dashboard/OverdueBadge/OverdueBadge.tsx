import s from "./OverdueBadge.module.scss";

type Props = { failed: number; total: number };

export default function OverdueBadge({ failed, total }: Props) {
    const rate = total ? Math.round((failed / total) * 100) : 0;
    const danger = failed > 0;
    return (
        <span
            className={`${s.badge} ${danger ? s.danger : s.ok}`}
            title={`Просрочено: ${failed} (${rate}%)`}
        >
            Просрочено: <b>{failed}</b>{total ? ` (${rate}%)` : ""}
        </span>
    );
}
