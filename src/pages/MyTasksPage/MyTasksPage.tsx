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
  const pageSize = 6;

  // фильтры
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [deadlineFilter, setDeadlineFilter] = useState<string>("");

  // модалка
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<number | null>(null);
  const [comment, setComment] = useState("");

  // загружаем все задачи один раз
  useEffect(() => {
    dispatch(fetchMyTasks({}) as any);
  }, [dispatch]);

  // статистика
  useEffect(() => {
    dispatch(fetchMyStatistic() as any);
  }, [dispatch]);

  const total =
    (statistics.my?.completedTasks ?? 0) +
    (statistics.my?.inWorkTasks ?? 0) +
    (statistics.my?.failedTasks ?? 0);

  // фронтовый статус
  const getFrontStatus = (task: any): "completed" | "failed" | "in work" => {
    if (task.status === "completed") return "completed";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadline = new Date(task.deadline);
    deadline.setHours(0, 0, 0, 0);

    if (deadline < today) return "failed";
    return "in work";
  };

  // фильтрация
  const filteredItems = items.filter((task) => {
    const frontStatus = getFrontStatus(task);

    let ok = true;
    if (statusFilter && frontStatus !== statusFilter) ok = false;
    if (deadlineFilter && new Date(task.deadline) > new Date(deadlineFilter)) ok = false;

    return ok;
  });

  // пагинация на фронте
  const paginatedItems = filteredItems
    .map((task) => ({
      ...task,
      status: getFrontStatus(task),
    }))
    .slice((page - 1) * pageSize, page * pageSize);

  const handleCompleteClick = (taskId: number) => {
    setCurrentTaskId(taskId);
    setComment("");
    setIsModalOpen(true);
  };

  const handleConfirmComplete = () => {
    if (currentTaskId !== null) {
      const today = new Date().toLocaleDateString("ru-RU");
      const finalComment = `${comment} (Выполнено: ${today})`;

      dispatch(
        completeMyTask({
          taskId: currentTaskId,
          result: finalComment,
        }) as any
      );
    }
    setIsModalOpen(false);
  };

  useEffect(() => {
    setPage(1); // сброс страницы при изменении фильтра
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

        <TaskList tasks={paginatedItems} onCompleteClick={handleCompleteClick} />

        <Pagination
          total={filteredItems.length}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
        />

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
