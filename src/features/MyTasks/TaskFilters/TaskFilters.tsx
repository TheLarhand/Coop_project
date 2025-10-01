import React from "react";
import Select from "../../../shared/ui/Select/Select";
import Input from "../../../shared/ui/Input/Input";
import Button from "../../../shared/ui/Button/Button";
import s from "./TaskFilters.module.scss";

interface TaskFilterProps {
  statusFilter: string | null;
  deadlineFilter: string;
  sortOrder: "asc" | "desc" | null;
  onStatusChange: (value: string | null) => void;
  onDeadlineChange: (value: string) => void;
  onSortChange: (value: "asc" | "desc" | null) => void;
  onReset: () => void;
}

const TaskFilter: React.FC<TaskFilterProps> = ({
  statusFilter,
  deadlineFilter,
  sortOrder,
  onStatusChange,
  onDeadlineChange,
  onSortChange,
  onReset,
}) => {
  return (
    <div className={s.filterWrapper}>
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
      />

      <Button variant="danger" onClick={onReset}>
        Сбросить
      </Button>
    </div>
  );
};

export default TaskFilter;
