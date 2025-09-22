import s from "./ChartBars.module.scss";

type Props = {
    completed: number;
    inWork: number;
    failed: number;
};

export default function ChartBars({ completed, inWork, failed }: Props) {
    const total = Math.max(1, completed + inWork + failed);
    const p1 = (completed / total) * 100;
    const p2 = (inWork / total) * 100;
    const p3 = (failed / total) * 100;

    return (
        <div className={s.root} title={`Вып: ${completed} • В раб: ${inWork} • Проср: ${failed}`}>
            <span className={s.completed} style={{ width: `${p1}%` }} />
            <span className={s.inWork} style={{ width: `${p2}%` }} />
            <span className={s.failed} style={{ width: `${p3}%` }} />
        </div>
    );
}
