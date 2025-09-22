import s from "./ChartDonut.module.scss";

type Props = {
    completed: number;
    inWork: number;
    failed: number;
    size?: number;   // px
    title?: string;  // tooltip/aria
};

export default function ChartDonut({
    completed,
    inWork,
    failed,
    size = 96,
    title = "Диаграмма",
}: Props) {
    const total = Math.max(0, completed + inWork + failed);
    const isZero = total === 0;

    const a = isZero ? 0 : (completed / total) * 360;
    const b = isZero ? 0 : ((completed + inWork) / total) * 360;

    return (
        <div className={s.wrapper}>
            <div
                className={s.donut}
                style={{
                    width: size,
                    height: size,
                    background: isZero
                        ? "conic-gradient(#e5e7eb 0 360deg)"
                        : `conic-gradient(var(--ok) 0 ${a}deg, var(--warn) 0 ${b}deg, var(--bad) 0 360deg)`,
                }}
                aria-label={title}
                title={
                    isZero
                        ? `${title}: данных нет`
                        : `${title}: выполнено ${completed}, в работе ${inWork}, просрочено ${failed}`
                }
            />
            <ul className={s.legend} aria-hidden>
                <li><i className={s.iOk} /> Выполнено {completed}</li>
                <li><i className={s.iWarn} /> В работе {inWork}</li>
                <li><i className={s.iBad} /> Просрочено {failed}</li>
            </ul>
        </div>
    );
}
