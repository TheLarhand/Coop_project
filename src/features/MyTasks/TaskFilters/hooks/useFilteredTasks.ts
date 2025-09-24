import { useMemo } from "react";
import type { Task } from "../../../../shared/types/types";

export type SortDirection = "asc" | "desc" | "";

export interface Filters {
  status: Task["status"] | "";
  deadline: string;
  sortDirection: SortDirection;
}


const toYMD = (d: string) => {
  if (!d) return "";
  const iso = new Date(d).toISOString();
  return iso.slice(0, 10);
};

export const useFilteredTasks = (tasks: Task[], filters: Filters) => {
  return useMemo(() => {
    let result = tasks.slice();

    if (filters.status) {
      result = result.filter((t) => t.status === filters.status);
    }

    if (filters.deadline) {
      const target = toYMD(filters.deadline);
      result = result.filter((t) => toYMD(t.deadline) === target);
    }

    if (filters.sortDirection) {
      result.sort((a, b) => {
        const ta = new Date(a.deadline).getTime();
        const tb = new Date(b.deadline).getTime();
        return filters.sortDirection === "asc" ? ta - tb : tb - ta;
      });
    }

    return result;
  }, [tasks, filters.status, filters.deadline, filters.sortDirection]);
};
