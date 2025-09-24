import React, { useState } from "react";

import s from "./MyTasksPage.module.scss";
import MainLayout from "../../layouts/MainLayout";
import TaskFilters from "../../features/MyTasks/TaskFilters/TaskFilters";
import TaskList from "../../features/MyTasks/TaskList/TaskList";
import Pagination from "../../shared/ui/Pagination/Pagination";
import type { Task } from "../../shared/types/types";

type SortDirection = "asc" | "desc" | "";

const mockTasks: Task[] = [
  {
    id: 1,
    title: "Сделать отчёт",
    description: "Финансовый отчёт за январь",
    deadline: "2025-10-01",
    status: "in work",
    author: "Ричард",
  },
  {
    id: 2,
    title: "Позвонить клиенту",
    description: "Обсудить контракт",
    deadline: "2025-9-25",
    status: "completed",
    author: "Ричард",
  },
  {
    id: 3,
    title: "Закрыть проект",
    description: "Финальные правки",
    deadline: "2025-9-29",
    status: "failed",
    author: "Ричард",
  },
];

const MyTasksPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [tasks] = useState(mockTasks);
  const [filters, setFilters] = useState({
    status: "",
    deadline: "",
    sortDirection: "" as SortDirection,
  });

  const filteredTasks = tasks
    .filter((t) => {
      if (filters.status && t.status !== filters.status) return false;

      if (filters.deadline) {
        const taskDate = new Date(t.deadline).getTime();
        const filterDate = new Date(filters.deadline).getTime();
        if (taskDate > filterDate) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (!filters.sortDirection) return 0;
      const da = new Date(a.deadline).getTime();
      const db = new Date(b.deadline).getTime();
      return filters.sortDirection === "asc" ? da - db : db - da;
    });

  return (
    <MainLayout>
      <div className={s.page}>
        <h1 className={s.title}>Мои задачи</h1>

        <TaskFilters filters={filters} setFilters={setFilters} />

        <TaskList tasks={filteredTasks} />
        <Pagination total={filteredTasks.length} page={page} pageSize={1} onPageChange={(p) => setPage(p)}/>
      </div>
    </MainLayout>
  );
};

export default MyTasksPage;
