import s from "./UsersTable.module.scss";
import type { SortMode } from "../../../store/slices/statisticsSlice";
import type { UserStatistic } from "../../../shared/types/types";
import ChartBars from "../../../shared/ui/ChartBars/ChartBars";

type Props = {
    data: UserStatistic[];
    sortMode: SortMode;
    onSortChange: (mode: SortMode) => void;
    meName: string | null;
    pageRankOffset?: number;
};

const SORT_LABEL: Record<SortMode, string> = {
    nameAsc: "Имя (A→Z)",
    completedDesc: "Выполнено ↓",
    failedDesc: "Просрочено ↓",
    inWorkDesc: "В работе ↓",
};

const fallbackAva =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28'><rect width='100%' height='100%' fill='%23ecf0f1'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='12' fill='%23999'>?</text></svg>";

export default function UsersTable({
    data,
    sortMode,
    onSortChange,
    meName,
    pageRankOffset = 0,
}: Props) {
    const toggle = (mode: SortMode) => onSortChange(mode);

    return (
        <div className={s.wrap} aria-label="Таблица пользователей">
            <div className={s.head}>
                <b>Пользователи</b>
                <span className={s.sortNote}>Сортировка: {SORT_LABEL[sortMode]}</span>
            </div>

            <div className={s.scroller}>
                <table className={s.table}>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th className={s.click} onClick={() => toggle("nameAsc")} aria-label="Сортировать по имени">Имя</th>
                            <th className={s.click} onClick={() => toggle("completedDesc")} aria-label="Сортировать по выполнено">Выполнено</th>
                            <th className={s.click} onClick={() => toggle("inWorkDesc")} aria-label="Сортировать по в работе">В работе</th>
                            <th className={s.click} onClick={() => toggle("failedDesc")} aria-label="Сортировать по просрочено">Просрочено</th>
                            <th className={s.click} onClick={() => toggle("completedDesc")} aria-label="Сортировать по выполнено (итого)">Всего / %</th>
                            <th>Визуал</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((u, i) => {
                            const total = u.completedTasks + u.inWorkTasks + u.failedTasks;
                            const doneRate = total ? Math.round((u.completedTasks / total) * 100) : 0;
                            const isMe = meName && u.name === meName;

                            return (
                                <tr key={u.id} className={isMe ? s.me : undefined}>
                                    <td>{pageRankOffset + i + 1}</td>
                                    <td className={s.person}>
                                        <img
                                            className={s.ava}
                                            src={u.ava || fallbackAva}
                                            alt={u.name}
                                            loading="lazy"
                                            onError={(e) => {
                                                const img = e.currentTarget as HTMLImageElement;
                                                if (img.src !== fallbackAva) img.src = fallbackAva;
                                            }}
                                        />
                                        <span className={s.name}>{u.name}</span>
                                        {isMe && <i className={s.badge}>я</i>}
                                    </td>
                                    <td className={s.center}>{u.completedTasks}</td>
                                    <td className={s.center}>{u.inWorkTasks}</td>
                                    <td className={s.center}>{u.failedTasks}</td>
                                    <td className={s.center}><b>{total}</b> / {doneRate}%</td>
                                    <td style={{ minWidth: 160 }}>
                                        <ChartBars completed={u.completedTasks} inWork={u.inWorkTasks} failed={u.failedTasks} />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {data.length === 0 && <div className={s.empty}>Нет пользователей для отображения</div>}
        </div>
    );
}

