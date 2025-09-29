import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import type { UserStatistic } from "../types/types";

export function exportUsersStatToXLSX(items: UserStatistic[], filenameBase = "dashboard_stats") {
    const isRu = (navigator?.language || "").toLowerCase().startsWith("ru");
    const headers = isRu
        ? ["Имя", "Выполнено", "В работе", "Просрочено", "Всего", "Готово(%)"]
        : ["name", "completed", "inWork", "failed", "total", "doneRate(%)"];

    const rows = items.map((u) => {
        const total = u.completedTasks + u.inWorkTasks + u.failedTasks;
        const rate = total ? Math.round((u.completedTasks / total) * 100) : 0;
        return [u.name, u.completedTasks, u.inWorkTasks, u.failedTasks, total, rate];
    });

    const totals = items.reduce(
        (acc, u) => {
            acc.completed += u.completedTasks;
            acc.inWork += u.inWorkTasks;
            acc.failed += u.failedTasks;
            return acc;
        },
        { completed: 0, inWork: 0, failed: 0 }
    );
    const totalAll = totals.completed + totals.inWork + totals.failed;
    const rateAll = totalAll ? Math.round((totals.completed / totalAll) * 100) : 0;

    const data = [
        headers,
        ...rows,
        [isRu ? "ИТОГО" : "TOTAL", totals.completed, totals.inWork, totals.failed, totalAll, rateAll],
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Stats");

    const ts = new Date().toISOString().replace(/[:]/g, "-").slice(0, 19);
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    // можно оставить "application/octet-stream", но так красивее
    const mime =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    saveAs(new Blob([wbout], { type: mime }), `${filenameBase}_${ts}.xlsx`);
}



