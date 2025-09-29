import React from "react";
import Select from "../../../shared/ui/Select/Select";
import Input from "../../../shared/ui/Input/Input";
import Button from "../../../shared/ui/Button/Button";
import s from "./TaskFilters.module.scss";

interface TaskFilterProps {
  statusFilter: string | null;
  deadlineFilter: string;
  onStatusChange: (value: string | null) => void;
  onDeadlineChange: (value: string) => void;
  onReset: () => void;
}

const TaskFilter: React.FC<TaskFilterProps> = ({
  statusFilter,
  deadlineFilter,
  onStatusChange,
  onDeadlineChange,
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
      <Button variant="danger" onClick={onReset}>
        Сбросить
      </Button>
    </div>
  );
};

export default TaskFilter;
