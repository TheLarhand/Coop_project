import type { ReactNode } from "react";
import s from "./Tooltip.module.scss";

type Props = {
    label: string;
    /** Чтобы тултип не влиял на внутреннюю разметку ребёнка */
    className?: string;
    children?: ReactNode;
};

export default function Tooltip({ label, className, children }: Props) {
    return (
        <span className={`${s.wrap} ${className ?? ""}`} tabIndex={0}>
            {children}
            <span className={s.tip} role="tooltip" aria-live="polite">
                {label}
                <span className={s.arrow} aria-hidden />
            </span>
        </span>
    );
}
