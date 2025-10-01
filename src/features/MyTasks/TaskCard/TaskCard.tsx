import React from "react";
import Button from "../../../shared/ui/Button/Button";
import s from "./TaskCard.module.scss";
import type { Task, User } from "../../../shared/types/types";

interface TaskCardProps extends Task {
  users: User[];
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
  author,
  title,
  description,
  deadline,
  status,
  result,
  users,
  onCompleteClick,
}) => {
  const { label, className } = statusMap[status];
  const user = users.find((u) => u.id === Number(author));

  return (
    <li className={`${s.card} ${s[className]}`}>
      <div className={s.topBar}>
        <span className={s.status}>{label}</span>
      </div>

      <div className={s.main}>
        <div className={s.content}>
          <div className={s.header}>
            {user?.ava && <img src={user.ava} alt={user.name} className={s.avatar} />}
            <span className={s.author}>{user?.name ?? "Неизвестный автор"}</span>
            {status !== "completed" && (
              <div className={s.actions}>
                <Button variant="primary" onClick={() => onCompleteClick(id)}>
                  Завершить
                </Button>
              </div>
            )}
          </div>

          <small className={s.deadline}>Дедлайн: {deadline}</small>
          <h3 className={s.title}>{title}</h3>
          {description && <p className={s.description}>{description}</p>}

          {result && <p className={s.result}>{result}</p>}
        </div>
      </div>
    </li>
  );
};

export default TaskCard;
