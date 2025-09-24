import React from "react";
import s from "./TaskList.module.scss";
import TaskCard from "../TaskCard/TaskCard";
import type { Task } from "../../../shared/types/types";


const TaskList: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
  if (!tasks.length) return <div className={s.empty}>Задач нет</div>;

  return (
    <div className={s.list}>
      {tasks.map((t) => (
        <TaskCard key={t.id} task={t} />
      ))}
    </div>
  );
};

export default TaskList;
