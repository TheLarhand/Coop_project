import React from "react";
import s from "./TaskFilters.module.scss";
import Select from "../../../shared/ui/Select/Select";
import Input from "../../../shared/ui/Input/Input";
import Button from "../../../shared/ui/Button/Button"

import type { SortDirection } from "./hooks/useFilteredTasks";

interface Props {
  filters: { status: string; deadline: string; sortDirection: SortDirection };
  setFilters: (f: { status: string; deadline: string; sortDirection: SortDirection }) => void;
}

const statusOptions = [
  { label: "Все статусы", value: "" },
  { label: "В работе", value: "in work" },
  { label: "Выполненные", value: "completed" },
  { label: "Просроченные", value: "failed" },
];

const TaskFilters: React.FC<Props> = ({ filters, setFilters }) => {
  const toggleDateSort = () => {
    setFilters({
      ...filters,
      sortDirection: filters.sortDirection === "asc" ? "desc" : "asc",
    });
  };

  const clearFilters = () => {
    setFilters({ status: "", deadline: "", sortDirection: "" });
  };

  return (
    <div className={s.filters}>
      <Select<string>
        value={filters.status}
        onChange={(val) => setFilters({ ...filters, status: val })}
        options={statusOptions}
        placeholder="Выбери статус"
      />

      <Input
        type="date"
        value={filters.deadline}
        onChange={(e) => setFilters({ ...filters, deadline: (e.target as HTMLInputElement).value })}
        placeholder="Дата дедлайна"
        className={s.short}
      />

      <Button
        variant={filters.sortDirection ? "primary" : "secondary"}
        onClick={toggleDateSort}
        className={s.nowrap}
      >
        Сортировать по дате {filters.sortDirection === "asc" ? "↑" : filters.sortDirection === "desc" ? "↓" : ""}
      </Button>

      <Button variant="danger" onClick={clearFilters}>
        Сброс
      </Button>
    </div>
  );
};

export default TaskFilters;
