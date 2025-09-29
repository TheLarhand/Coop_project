import React from "react";
import TaskCard from "../TaskCard/TaskCard";
import s from "./TaskList.module.scss";
import type { Task } from "../../../shared/types/types";

interface TaskListProps {
  tasks: Task[];
  onCompleteClick: (taskId: number) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onCompleteClick }) => {
  if (!tasks.length) {
    return <p className={s.empty}>Задач нет</p>;
  }

  return (
    <ul className={s.list}>
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          id={task.id}
          title={task.title}
          description={task.description}
          deadline={task.deadline}
          status={task.status}
          onCompleteClick={onCompleteClick}
        />
      ))}
    </ul>
  );
};

export default TaskList;
