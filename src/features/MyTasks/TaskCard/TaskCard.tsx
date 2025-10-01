import React from "react";
import Button from "../../../shared/ui/Button/Button";
import s from "./TaskCard.module.scss";

interface TaskCardProps {
  id: number;
  title: string;
  description?: string;
  deadline: string;
  status: "in work" | "completed" | "failed";
  result?: string;
  onCompleteClick: (taskId: number) => void;
}

// Маппинг статусов
const statusMap: Record<
  TaskCardProps["status"],
  { label: string; className: string }
> = {
  "in work": { label: "В работе", className: "inWork" },
  completed: { label: "Выполнена", className: "completed" },
  failed: { label: "Просрочена", className: "failed" },
};

const TaskCard: React.FC<TaskCardProps> = ({
  id,
  title,
  description,
  deadline,
  status,
  result,
  onCompleteClick,
}) => {
  const { label, className } = statusMap[status];

  return (
    <li className={`${s.card} ${s[className]}`}>
      <div className={s.topBar}>
        <span className={s.status}>{label}</span>
      </div>

      <div className={s.main}>
        <div className={s.content}>
          <small className={s.deadline}>{deadline}</small>
          <h3 className={s.title}>{title}</h3>
          {description && <p className={s.description}>{description}</p>}

          {result && <p>{result}</p>}
        </div>

        {status !== "completed" && (
          <div className={s.actions}>
            <Button variant="primary" onClick={() => onCompleteClick(id)}>
              Завершить
            </Button>
          </div>
        )}
      </div>
    </li>
  );
};

export default TaskCard;
