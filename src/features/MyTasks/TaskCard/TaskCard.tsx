import React from "react";
import s from "./TaskCard.module.scss";
import type { Task } from "../../../shared/types/types";

const statusColors: Record<Task["status"], string> = {
  "in work": s.statusWork,
  completed: s.statusCompleted,
  failed: s.statusFailed,
};

const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
  return (
    <div className={s.card}>
      <div className={s.header}>
        <h3>{task.title}</h3>
        <span className={`${s.status} ${statusColors[task.status]}`}>
          {task.status === "in work" && "В работе"}
          {task.status === "completed" && "Выполнена"}
          {task.status === "failed" && "Просрочена"}
        </span>
      </div>
      <p className={s.desc}>{task.description}</p>
      <div className={s.footer}>
        <span className={s.deadline}>Дедлайн: {task.deadline}</span>
        <span className={s.author}>Автор: {task.author}</span>
      </div>
    </div>
  );
};

export default TaskCard;
