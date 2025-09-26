import type { UserStatistic } from "../types/types";

/**
 * Быстро скопировать в буфер обмена TSV (для Excel/Sheets).
 * Используем \t и \n. Делаем простую защиту от формул (=,+,-,@) префиксом '.
 */
export async function copyUsersStatToClipboardTSV(items: UserStatistic[]) {
    const isRu = (navigator?.language || "").toLowerCase().startsWith("ru");
    const header = isRu
        ? ["Имя", "Выполнено", "В работе", "Просрочено", "Всего", "Готово(%)"]
        : ["name", "completed", "inWork", "failed", "total", "doneRate(%)"];

    const guard = (v: string) => (/^[=+\-@]/.test(v) ? `'${v}` : v);

    const lines = [
        header.join("\t"),
        ...items.map((u) => {
            const total = u.completedTasks + u.inWorkTasks + u.failedTasks;
            const rate = total ? Math.round((u.completedTasks / total) * 100) : 0;
            const name = guard(String(u.name ?? ""));
            return [name, u.completedTasks, u.inWorkTasks, u.failedTasks, total, rate].join("\t");
        }),
    ];

    const text = lines.join("\n");
    await navigator.clipboard.writeText(text);
}
