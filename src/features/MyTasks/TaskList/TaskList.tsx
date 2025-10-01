import React from "react";
import TaskCard from "../TaskCard/TaskCard";
import s from "./TaskList.module.scss";
import type { Task } from "../../../shared/types/types";
import { useSelector } from "react-redux";
import { selectAllUsers } from "../../../store/slices/usersSlice";

interface TaskListProps {
  tasks: Task[];
  onCompleteClick: (taskId: number) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onCompleteClick }) => {
  const users = useSelector(selectAllUsers);

  if (!tasks.length) {
    return <p className={s.empty}>Задач нет</p>;
  }

  return (
    <ul className={s.list}>
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          {...task}
          users={users}
          onCompleteClick={onCompleteClick}
        />
      ))}
    </ul>
  );
};

export default TaskList;
