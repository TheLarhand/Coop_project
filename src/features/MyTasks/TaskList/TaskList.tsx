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
          author={task.author}
          id={task.id}
          title={task.title}
          description={task.description}
          deadline={task.deadline}
          status={task.status}
          result={task.result}
          users={users}
          onCompleteClick={onCompleteClick}
        />
      ))}
    </ul>
  );
};

export default TaskList;
