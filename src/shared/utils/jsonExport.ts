import type { UserStatistic } from "../types/types";

/**
 * Экспортирует статистику пользователей в JSON-файл.
 * Форматируем поля, добавляем total и doneRate.
 */
export function exportUsersStatToJSON(
    items: UserStatistic[],
    filenameBase = "dashboard_stats"
) {
    const payload = items.map((u) => {
        const total = u.completedTasks + u.inWorkTasks + u.failedTasks;
        const doneRate = total ? Math.round((u.completedTasks / total) * 100) : 0;
        return {
            id: u.id,
            name: u.name,
            completed: u.completedTasks,
            inWork: u.inWorkTasks,
            failed: u.failedTasks,
            total,
            doneRate,
            ava: u.ava ?? null,
        };
    });

    const json = JSON.stringify(
        { generatedAt: new Date().toISOString(), items: payload },
        null,
        2
    );

    const ts = new Date().toISOString().replace(/[:]/g, "-").slice(0, 19);
    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filenameBase}_${ts}.json`;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

