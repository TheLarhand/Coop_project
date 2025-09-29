import s from "./Skeleton.module.scss";

type Props = {
    lines?: number;     // сколько строк-заглушек
    height?: number;    // высота строки в px
    rounded?: boolean;  // скругление
};

export default function Skeleton({ lines = 3, height = 14, rounded = true }: Props) {
    return (
        <div className={s.block} aria-hidden>
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className={`${s.line} ${rounded ? s.rounded : ""}`}
                    style={{ height }}
                />
            ))}
        </div>
    );
}
