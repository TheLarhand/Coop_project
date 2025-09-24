import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { completeMyTask, fetchMyTasks } from "../../store/slices/myTasksSlice";
import { fetchMyStatistic, selectStatistics } from "../../store/slices/statisticsSlice";
import Pagination from "../../shared/ui/Pagination/Pagination";
import MainLayout from "../../layouts/MainLayout";


const MyTasksPage: React.FC = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state: RootState) => state.myTasks);
  const statistics = useSelector(selectStatistics);

  const [page, setPage] = useState(1);
  const pageSize = 2;

  // загружаем задачи + статистику
  useEffect(() => {
    const start = (page - 1) * pageSize;
    dispatch(fetchMyTasks({ start, limit: pageSize }) as any);
  }, [dispatch, page, pageSize]);

  useEffect(() => {
    dispatch(fetchMyStatistic() as any);
  }, [dispatch]);

  // считаем total из статистики
  const total =
    (statistics.my?.completedTasks ?? 0) +
    (statistics.my?.inWorkTasks ?? 0) +
    (statistics.my?.failedTasks ?? 0);

  return (
    <MainLayout>
      <h1>Мои задачи</h1>

      {loading && <p>Загрузка...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {items.map((task) => (
          <li key={task.id}>
            {task.title} — {task.status}
            {task.status === "in work" ? (
              <button
                onClick={() =>
                  dispatch(completeMyTask({ taskId: task.id, result: "Выполнил задачу" }) as any)
                }
              >
                Завершить
              </button>
            ) : (
              <button
                onClick={() =>
                  dispatch(completeMyTask({ taskId: task.id, result: "" }) as any)
                }
              >
                Снять отметку
              </button>
            )}
          </li>
        ))}
      </ul>

      <Pagination
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
      />
    </MainLayout>
  );
};

export default MyTasksPage;