import type { UserStatistic } from "../types/types";

/**
 * Параметры экспорта CSV.
 */
export type CsvOptions = {
    /** Если true — выбрать разделитель по локали: ';' для ru, ',' иначе. По умолчанию true. */
    localeAwareDelimiter?: boolean;
    /** Принудительный разделитель (перекрывает авто-логику). */
    delimiter?: "," | ";";
    /** Добавлять UTF-8 BOM (нужно Excel на Windows). По умолчанию true. */
    addBOM?: boolean;
    /** Добавлять строку итогов. По умолчанию true. */
    addTotalsRow?: boolean;
    /** Заголовки: 'auto' (ru/en по локали) | 'en' | 'ru' | кастомный массив. По умолчанию 'auto'. */
    headers?: "auto" | "en" | "ru" | string[];
    /** Перевод строки: Excel любит CRLF. По умолчанию "\r\n". */
    lineBreak?: "\r\n" | "\n";
    /** База имени файла без расширения. По умолчанию: dashboard_stats_YYYY-MM-DDTHH-mm-ss */
    filenameBase?: string;
};

/**
 * Экспортирует текущий список пользователей в CSV.
 * Колонки: name, completed, inWork, failed, total, doneRate(%)
 */
export function exportUsersStatToCSV(items: UserStatistic[], opts: CsvOptions = {}) {
    const {
        localeAwareDelimiter = true,
        delimiter: forcedDelimiter,
        addBOM = true,
        addTotalsRow = true,
        headers = "auto",
        lineBreak = "\r\n",
        filenameBase,
    } = opts;

    const isRu = (navigator?.language || "").toLowerCase().startsWith("ru");
    const delimiter = forcedDelimiter ?? (localeAwareDelimiter ? (isRu ? ";" : ",") : ",");

    const header = Array.isArray(headers)
        ? headers
        : headers === "ru" || (headers === "auto" && isRu)
            ? ["Имя", "Выполнено", "В работе", "Просрочено", "Всего", "Готово(%)"]
            : ["name", "completed", "inWork", "failed", "total", "doneRate(%)"];

    const rows: string[][] = [
        header,
        ...items.map((u) => {
            const total = u.completedTasks + u.inWorkTasks + u.failedTasks;
            const rate = total ? Math.round((u.completedTasks / total) * 100) : 0;
            return [
                escapeCSV(u.name, delimiter),
                String(u.completedTasks),
                String(u.inWorkTasks),
                String(u.failedTasks),
                String(total),
                String(rate),
            ];
        }),
    ];

    if (addTotalsRow) {
        let completed = 0,
            inWork = 0,
            failed = 0;
        for (const u of items) {
            completed += u.completedTasks;
            inWork += u.inWorkTasks;
            failed += u.failedTasks;
        }
        const totalAll = completed + inWork + failed;
        const rateAll = totalAll ? Math.round((completed / totalAll) * 100) : 0;

        rows.push([
            isRu ? "ИТОГО" : "TOTAL",
            String(completed),
            String(inWork),
            String(failed),
            String(totalAll),
            String(rateAll),
        ]);
    }

    const csvBody = rows.map((r) => r.join(delimiter)).join(lineBreak);
    const csv = (addBOM ? "\uFEFF" : "") + csvBody;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const ts = new Date().toISOString().replace(/[:]/g, "-").slice(0, 19);
    const base = filenameBase ?? `dashboard_stats_${ts}`;
    const a = document.createElement("a");
    a.href = url;
    a.download = `${base}.csv`;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Экранируем значение по CSV-правилам и защищаем от CSV-инъекций:
 * 1) Если начинается с =,+,-,@ — префиксуем апостроф.
 * 2) Если есть кавычки/переводы строк/разделитель — оборачиваем в кавычки и удваиваем кавычки.
 */
function escapeCSV(value: string, delimiter: string): string {
    if (value == null) return "";

    let v = String(value);

    // CSV injection guard
    if (/^[=+\-@]/.test(v)) v = "'" + v;

    const needsQuotes = v.includes('"') || v.includes("\r") || v.includes("\n") || v.includes(delimiter);
    if (v.includes('"')) v = v.replace(/"/g, '""');
    return needsQuotes ? `"${v}"` : v;
}
