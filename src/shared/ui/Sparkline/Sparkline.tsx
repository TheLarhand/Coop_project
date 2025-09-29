import s from "./Sparkline.module.scss";

type Props = {
    data: number[];
    width?: number;
    height?: number;
    strokeWidth?: number;
    title?: string;
};

export default function Sparkline({
    data,
    width = 160,
    height = 36,
    strokeWidth = 2,
    title,
}: Props) {
    const min = Math.min(...data, 0);
    const max = Math.max(...data, 1);
    const dx = data.length > 1 ? width / (data.length - 1) : 0;

    const d = data
        .map((v, i) => {
            const x = i * dx;
            const y = height - ((v - min) / (max - min || 1)) * height;
            return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
        })
        .join(" ");

    const area = data.length > 1 ? d + ` L ${width},${height} L 0,${height} Z` : "";

    return (
        <svg
            className={s.svg}
            viewBox={`0 0 ${width} ${height}`}
            width={width}
            height={height}
            aria-label={title}
        >
            {area && <path d={area} className={s.area} />}
            <path d={d} className={s.line} strokeWidth={strokeWidth} />
        </svg>
    );
}
