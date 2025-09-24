import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyTasks, completeMyTask, selectMyTasks } from "../../store/slices/myTasksSlice";
import type { RootState, AppDispatch } from "../../store/store";
import MainLayout from "../../layouts/MainLayout";

const MyTasksPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, error } = useSelector((state: RootState) => selectMyTasks(state));

  useEffect(() => {
    dispatch(fetchMyTasks({ start: 0, limit: 10 }));
  }, [dispatch]);

  const handleComplete = (id: number) => {
    const result = prompt("Введите комментарий к выполненной задаче:");
    if (result) {
      dispatch(completeMyTask({ taskId: id, result }));
    }
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <MainLayout>
      <h1>Мои задачи</h1>
      {items.length === 0 ? (
        <p>Задач нет</p>
      ) : (
        <ul>
          {items.map((task) => (
            <li key={task.id}>
              <strong>{task.title}</strong> — {task.status} (до {task.deadline})
              <br />
              {task.description}
              <br />
              {task.status === "in work" && (
                <button onClick={() => handleComplete(task.id)}>Завершить</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </MainLayout>
  );
};

export default MyTasksPage;
