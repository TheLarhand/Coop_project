import React, { useEffect, useState, useMemo } from "react";
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
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Состояния
  const [page, setPage] = useState(1);
  const pageSize = 6;

  // Фильтры
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [deadlineFilter, setDeadlineFilter] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);

  // Модальное окно
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<number | null>(null);
  const [currentTask, setCurrentTask] = useState<any>(null);
  const [comment, setComment] = useState("");

  // Загрузка данных
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchMyTasks({ start: 0, limit: 100 }) as any);
      dispatch(fetchMyStatistic() as any);
    }
  }, [dispatch, isAuthenticated]);

  // Определение фронтового статуса задачи
  const getFrontStatus = (task: any): "completed" | "failed" | "in work" => {
    if (task.status === "completed") return "completed";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadline = new Date(task.deadline);
    deadline.setHours(0, 0, 0, 0);

    if (deadline < today) return "failed";
    return "in work";
  };

  // Проверка просрочки задачи
  const isTaskOverdue = (task: any): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadline = new Date(task.deadline);
    deadline.setHours(0, 0, 0, 0);

    return deadline < today;
  };

  // Получение информации о просрочке
  const getOverdueInfo = (task: any): string => {
    if (!isTaskOverdue(task)) return "";

    const today = new Date();
    const deadline = new Date(task.deadline);
    const diffTime = Math.abs(today.getTime() - deadline.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return ` (Просрочено на ${diffDays} ${getDayText(diffDays)})`;
  };

  // Склонение слова "день"
  const getDayText = (days: number): string => {
    if (days % 10 === 1 && days % 100 !== 11) return "день";
    if (days % 10 >= 2 && days % 10 <= 4 && (days % 100 < 10 || days % 100 >= 20)) return "дня";
    return "дней";
  };

  // Мемоизированные отфильтрованные задачи
  const filteredItems = useMemo(() => {
    return items
      .map(task => ({
        ...task,
        status: getFrontStatus(task),
        isOverdue: isTaskOverdue(task),
        overdueInfo: getOverdueInfo(task)
      }))
      .filter(task => {
        // Фильтрация по статусу
        if (statusFilter && task.status !== statusFilter) {
          return false;
        }

        // Фильтрация по дедлайну
        if (deadlineFilter) {
          const taskDeadline = new Date(task.deadline);
          const filterDeadline = new Date(deadlineFilter);
          if (taskDeadline > filterDeadline) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        // Сортировка
        if (sortOrder === "asc") {
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        } else if (sortOrder === "desc") {
          return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
        }
        return 0;
      });
  }, [items, statusFilter, deadlineFilter, sortOrder]);

  // Пагинация
  const paginatedItems = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredItems.slice(startIndex, endIndex);
  }, [filteredItems, page, pageSize]);

  // Сброс пагинации при изменении фильтров
  useEffect(() => {
    setPage(1);
  }, [statusFilter, deadlineFilter, sortOrder]);

  // Общее количество задач
  const totalTasksCount = useMemo(() => {
    return (statistics.my?.completedTasks ?? 0) +
      (statistics.my?.inWorkTasks ?? 0) +
      (statistics.my?.failedTasks ?? 0);
  }, [statistics]);

  // Обработчики
  const handleCompleteClick = (taskId: number) => {
    const task = items.find(t => t.id === taskId);
    setCurrentTaskId(taskId);
    setCurrentTask(task);
    setComment("");
    setIsModalOpen(true);
  };

  const handleConfirmComplete = () => {
    if (currentTaskId !== null && currentTask) {
      const today = new Date().toLocaleDateString("ru-RU");

      // Формируем комментарий с информацией о просрочке
      let finalComment = comment;

      if (isTaskOverdue(currentTask)) {
        const overdueInfo = getOverdueInfo(currentTask);
        finalComment = `${comment} ${overdueInfo} (Выполнено: ${today})`;
      } else {
        finalComment = `${comment} (Выполнено: ${today})`;
      }

      dispatch(
        completeMyTask({
          taskId: currentTaskId,
          result: finalComment,
        }) as any
      );
    }
    setIsModalOpen(false);
    setCurrentTask(null);
  };

  const handleResetFilters = () => {
    setStatusFilter(null);
    setDeadlineFilter("");
    setSortOrder(null);
    setPage(1);
  };

  // Отображение количества задач
  const getTasksCountText = () => {
    if (statusFilter || deadlineFilter || sortOrder) {
      return `${filteredItems.length} из ${totalTasksCount}`;
    }
    return `${totalTasksCount}`;
  };

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className={s.container}>
          <h1>Мои задачи</h1>
          <p className={s.error}>Для просмотра войдите в систему</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className={s.page}>
        <h1>
          Мои задачи{" "}
          <span className={s.count}>{getTasksCountText()}</span>
        </h1>

        <TaskFilter
          statusFilter={statusFilter}
          deadlineFilter={deadlineFilter}
          sortOrder={sortOrder}
          onStatusChange={setStatusFilter}
          onDeadlineChange={setDeadlineFilter}
          onSortChange={setSortOrder}
          onReset={handleResetFilters}
        />

        {loading && <p>Загрузка...</p>}
        {error && <p className={s.error}>{error}</p>}

        {!loading && !error && (
          <>
            <TaskList
              tasks={paginatedItems}
              onCompleteClick={handleCompleteClick}
            />

            {filteredItems.length > 0 && (
              <Pagination
                total={filteredItems.length}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
              />
            )}

            {filteredItems.length === 0 && (
              <p className={s.noTasks}>Задачи не найдены</p>
            )}
          </>
        )}

        <CompleteModal
          isOpen={isModalOpen}
          comment={comment}
          onCommentChange={setComment}
          onCancel={() => {
            setIsModalOpen(false);
            setCurrentTask(null);
          }}
          onConfirm={handleConfirmComplete}
          isOverdue={currentTask ? isTaskOverdue(currentTask) : false}
          overdueInfo={currentTask ? getOverdueInfo(currentTask) : ""}
        />
      </div>
    </MainLayout>
  );
};

export default MyTasksPage;