import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { completeMyTask, fetchMyTasks } from "../../store/slices/myTasksSlice";
import { fetchMyStatistic, selectStatistics } from "../../store/slices/statisticsSlice";
import Pagination from "../../shared/ui/Pagination/Pagination";
import MainLayout from "../../layouts/MainLayout";
import TaskFilter from "../../features/MyTasks/TaskFilters/TaskFilters";
import TaskList from "../../features/MyTasks/TaskList/TaskList";
import CompleteModal from "../../features/MyTasks/CompleteModal/CompleteModal";
import s from "./MyTasksPage.module.scss";

const MyTasksPage: React.FC = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state: RootState) => state.myTasks);
  const statistics = useSelector(selectStatistics);

  const [page, setPage] = useState(1);
  const pageSize = 20;

  // фильтры
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [deadlineFilter, setDeadlineFilter] = useState<string>("");

  // модалка
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<number | null>(null);
  const [comment, setComment] = useState("");

  // загрузка задач
  useEffect(() => {
    const start = (page - 1) * pageSize;
    dispatch(fetchMyTasks({ start, limit: pageSize }) as any);
  }, [dispatch, page, pageSize]);

  // загрузка статистики
  useEffect(() => {
    dispatch(fetchMyStatistic() as any);
  }, [dispatch]);

  const total =
    (statistics.my?.completedTasks ?? 0) +
    (statistics.my?.inWorkTasks ?? 0) +
    (statistics.my?.failedTasks ?? 0);

  // функция, которая возвращает фактический статус для фронта
  const getFrontStatus = (task: any) => {
    if (task.status === "completed") return "completed";
    if (new Date(task.deadline) < new Date()) return "failed";
    return "in work";
  };

  // фильтрация
  const filteredItems = items.filter((task) => {
    const frontStatus = getFrontStatus(task);

    let ok = true;
    if (statusFilter && frontStatus !== statusFilter) {
      ok = false;
    }

    if (deadlineFilter && new Date(task.deadline) > new Date(deadlineFilter)) {
      ok = false;
    }

    return ok;
  });


  const handleCompleteClick = (taskId: number) => {
    setCurrentTaskId(taskId);
    setComment("");
    setIsModalOpen(true);
  };

  const handleConfirmComplete = () => {
    if (currentTaskId !== null) {
      dispatch(completeMyTask({ taskId: currentTaskId, result: comment }) as any);
    }
    setIsModalOpen(false);
  };

  const paginationTotal =
    statusFilter || deadlineFilter ? filteredItems.length : total;

  useEffect(() => {
    setPage(1);
  }, [statusFilter, deadlineFilter]);

  return (
    <MainLayout>
      <div className={s.page}>
        <h1>
          Мои задачи{" "}
          <span className={s.count}>
            {statusFilter || deadlineFilter
              ? `${filteredItems.length} из ${total}`
              : `${total}`}
          </span>
        </h1>

        <TaskFilter
          statusFilter={statusFilter}
          deadlineFilter={deadlineFilter}
          onStatusChange={setStatusFilter}
          onDeadlineChange={setDeadlineFilter}
          onReset={() => {
            setStatusFilter(null);
            setDeadlineFilter("");
          }}
        />

        {loading && <p>Загрузка...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        <TaskList
          tasks={filteredItems.map((task) => ({
            ...task,
            status: getFrontStatus(task),
          }))}
          onCompleteClick={handleCompleteClick}
        />

        <Pagination total={paginationTotal} page={page} pageSize={pageSize} onPageChange={setPage} />

        <CompleteModal
          isOpen={isModalOpen}
          comment={comment}
          onCommentChange={setComment}
          onCancel={() => setIsModalOpen(false)}
          onConfirm={handleConfirmComplete}
        />
      </div>
    </MainLayout>
  );
};

export default MyTasksPage;
