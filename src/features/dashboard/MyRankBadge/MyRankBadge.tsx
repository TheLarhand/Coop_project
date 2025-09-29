import s from "./MyRankBadge.module.scss";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { makeSelectSorted } from "../../../store/selectors/statisticsSelectors";
import { selectProfile } from "../../../store/slices/profileSlice";
import type { RootState } from "../../../store/store";

/**
 * Показываем бейдж "Моя позиция" в текущей сортировке.
 * Если пользователь не авторизован — ничего не рендерим.
 */
export default function MyRankBadge() {
    const me = useSelector(selectProfile);
    const selectSorted = useMemo(() => makeSelectSorted(), []);
    const sorted = useSelector((s: RootState) => selectSorted(s, "", s.statistics.sortMode));

    if (!me) return null;

    const idx = sorted.findIndex((u) => u.name === me.name);
    if (idx === -1) return null;

    const rank = idx + 1;

    return (
        <div className={s.badge} title="Место в текущей сортировке">
            <span className={s.k}>Моя позиция</span>
            <b className={s.v}>#{rank}</b>
        </div>
    );
}
