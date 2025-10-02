import React from "react";
import Select from "../../../shared/ui/Select/Select";
import Input from "../../../shared/ui/Input/Input";
import Button from "../../../shared/ui/Button/Button";
import s from "./TaskFilters.module.scss";
import type { User } from "../../../shared/types/types";

interface TaskFilterProps {
  statusFilter: string | null;
  deadlineFilter: string;
  authorFilter: string | null;
  sortOrder: "asc" | "desc" | null;
  onStatusChange: (value: string | null) => void;
  onDeadlineChange: (value: string) => void;
  onAuthorChange: (value: string | null) => void;
  onSortChange: (value: "asc" | "desc" | null) => void;
  onReset: () => void;
  users: User[];
}

const TaskFilter: React.FC<TaskFilterProps> = ({
  statusFilter,
  deadlineFilter,
  authorFilter,
  sortOrder,
  onStatusChange,
  onDeadlineChange,
  onAuthorChange,
  onSortChange,
  onReset,
  users
}) => {
  return (
    <div className={s.filterWrapper}>
      <div className={s.grid}>
        <Input
          type="date"
          value={deadlineFilter}
          onChange={(e) => onDeadlineChange(e.target.value)}
          placeholder="Фильтр по дедлайну"
          className={s.inputDate}
        />

        <Select
          value={statusFilter}
          onChange={onStatusChange}
          options={[
            { label: "Все", value: null },
            { label: "В работе", value: "in work" },
            { label: "Выполненные", value: "completed" },
            { label: "Просроченные", value: "failed" },
          ]}
          placeholder="Фильтр по статусу"
          className={s.statusSelect}
        />

        <Select
          value={authorFilter}
          onChange={onAuthorChange}
          options={[
            { label: "Все авторы", value: null },
            ...users.map(user => ({
              label: user.name,
              value: user.id.toString()
            }))
          ]}
          placeholder="Фильтр по автору"
          className={s.authorSelect}
        />

        <Select
          value={sortOrder}
          onChange={(value) => onSortChange(value as "asc" | "desc" | null)}
          options={[
            { label: "Без сортировки", value: null },
            { label: "По ранним срокам", value: "asc" },
            { label: "По поздним срокам", value: "desc" },
          ]}
          placeholder="Сортировка по дате"
          className={s.sortSelect}
        />
      </div>

      <Button variant="danger" onClick={onReset} className={s.resetButton}>
        Сбросить
      </Button>
    </div>
  );
};

export default TaskFilter;