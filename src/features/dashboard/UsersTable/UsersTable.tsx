import s from "./UsersTable.module.scss";
import DoneRateBadge from "../DoneRateBadge/DoneRateBadge";
import OverdueBadge from "../OverdueBadge/OverdueBadge";

import type { UserStatistic } from "../../../shared/types/types";
import type { SortMode } from "../../../store/slices/statisticsSlice";

type Props = {
    data: UserStatistic[];
    sortMode: SortMode;
    onSortChange: (m: SortMode) => void;
    meName: string | null;
    pageRankOffset?: number;
};

// увеличенный фоллбек-аватар 44x44
const fallbackAva =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='44' height='44'><rect width='100%' height='100%' rx='8' ry='8' fill='%23ecf0f1'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='10' fill='%23999'>no img</text></svg>";

export default function UsersTable({
    data,
    sortMode,
    onSortChange,
    meName,
    pageRankOffset = 0,
}: Props) {
    return (
        <div className={s.tableWrap}>
            <div className={s.sortHint}>Сортировка: {humanSort(sortMode)} ↓</div>

            <table className={s.table} aria-label="Пользователи">
                <thead>
                    <tr>
                        <th className={s.colNum}>#</th>
                        <th
                            className={s.sortable}
                            title="Сортировать по имени A→Z"
                            onClick={() => onSortChange("nameAsc")}
                        >
                            Имя
                        </th>
                        <th
                            className={s.sortable}
                            title="Сортировать по выполнено ↓"
                            onClick={() => onSortChange("completedDesc")}
                        >
                            Выполнено
                        </th>
                        <th
                            className={s.sortable}
                            title="Сортировать по «в работе» ↓"
                            onClick={() => onSortChange("inWorkDesc")}
                        >
                            В работе
                        </th>
                        <th
                            className={s.sortable}
                            title="Сортировать по просрочено ↓"
                            onClick={() => onSortChange("failedDesc")}
                        >
                            Просрочено
                        </th>
                        <th>Всего / %</th>
                        <th className={s.colBar}>Визуал</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((u, i) => {
                        const total = u.completedTasks + u.inWorkTasks + u.failedTasks;
                        const doneRate = total ? Math.round((u.completedTasks / total) * 100) : 0;
                        const totalPct = total ? Math.round((u.completedTasks / total) * 100) : 0;
                        const rank = pageRankOffset + i + 1;

                        return (
                            <tr key={u.id} className={meName && u.name === meName ? s.meRow : undefined}>
                                <td className={s.colNum}>{rank}</td>

                                {/* Аватар 44px + бейджи */}
                                <td className={s.userCell}>
                                    <img
                                        className={s.ava}
                                        src={u.ava || fallbackAva}
                                        alt={u.name}
                                        width={44}
                                        height={44}
                                        onError={(e) => {
                                            const img = e.currentTarget as HTMLImageElement;
                                            if (img.src !== fallbackAva) img.src = fallbackAva;
                                        }}
                                    />
                                    <div className={s.nameBox}>
                                        <b className={s.name}>{u.name}</b>
                                        <div className={s.badges}>
                                            <DoneRateBadge doneRate={doneRate} />
                                            <OverdueBadge failed={u.failedTasks} total={total} />
                                        </div>
                                    </div>
                                </td>

                                <td>{u.completedTasks}</td>
                                <td>{u.inWorkTasks}</td>
                                <td>{u.failedTasks}</td>
                                <td>{total} / {totalPct}%</td>

                                <td className={s.colBar}>
                                    <div className={s.bar}>
                                        <span className={s.barFill} style={{ width: `${totalPct}%` }} />
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

function humanSort(mode: SortMode) {
    switch (mode) {
        case "completedDesc": return "Выполнено";
        case "failedDesc": return "Просрочено";
        case "inWorkDesc": return "В работе";
        case "nameAsc": return "Имя (A→Z)";
        default: return "—";
    }
}


