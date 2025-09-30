import { useEffect, useState, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import MainLayout from "../../layouts/MainLayout";
import Button from "../../shared/ui/Button/Button";
import Input from "../../shared/ui/Input/Input";
import Textarea from "../../shared/ui/Textarea/Textarea";
import s from "./DelegatedTask.module.scss";
import type { AppDispatch } from "../../store/store";

import {
  fetchDelegatedTasks,
  deleteDelegatedTask,
  updateDelegatedTask,
} from "../../store/slices/delegatedTasksSlice";

import { fetchUsers, selectAllUsers } from "../../store/slices/usersSlice";
import type { RootState } from "../../store/store";
import type { Task } from "../../shared/types/types";

function DelegatedTasksPage() {
  const dispatch = useDispatch<AppDispatch>();

  const { tasks, loading, error } = useSelector(
    (state: RootState) => state.delegatedTasks
  );
  const users = useSelector(selectAllUsers);

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");

  // загружаем задачи и пользователей при монтировании
  useEffect(() => {
    dispatch(fetchDelegatedTasks({}));
    dispatch(fetchUsers());
  }, [dispatch]);

  // получить имя пользователя по id
  const getUserName = (id: number) => {
    const user = users.find((u) => u.id === id);
    return user ? user.name : `Пользователь #${id}`;
  };

  // получить аватарку пользователя
  const getUserAva = (id: number) => {
    const user = users.find((u) => u.id === id);
    return user?.ava ?? "https://via.placeholder.com/40";
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setDeadline(task.deadline);
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    try {
      await dispatch(
        updateDelegatedTask({
          taskId: Number(editingTask.id),
          update: { title, description, deadline },
        })
      ).unwrap();
      setEditingTask(null);
    } catch (err) {
      console.error("Ошибка при обновлении задачи:", err);
    }
  };

  const handleDelete = (taskId: number) => {
    dispatch(deleteDelegatedTask(taskId));
  };

  return (
    <MainLayout>
      <div className={s.container}>
        <h1 className={s.heading}>Мои делегированные задачи</h1>

        {loading && <p>Загрузка...</p>}
        {error && <p className={s.error}>{error}</p>}

        <ul className={s.taskList}>
          {tasks.map((task) => (
            <li key={task.id} className={s.taskCard}>
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <p>
                <strong>Дедлайн:</strong> {task.deadline}
              </p>

              {/* исполнитель */}
              <div className={s.performer}>
                <img
                  src={getUserAva(task.performer)}
                  alt={getUserName(task.performer)}
                  width={40}
                  height={40}
                  className={s.avatar}
                />
                <span>{getUserName(task.performer)}</span>
              </div>

              <div className={s.buttons}>
                <Button variant="primary" onClick={() => handleEdit(task)}>
                  Редактировать
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleDelete(Number(task.id))}
                >
                  Удалить
                </Button>
              </div>
            </li>
          ))}
        </ul>

        {editingTask && (
          <div className={s.editFormWrapper}>
            <h2>Редактирование задачи</h2>
            <form onSubmit={handleUpdate} className={s.form}>
              <div className={s.formGroup}>
                <label>Название</label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className={s.formGroup}>
                <label>Описание</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className={s.formGroup}>
                <label>Дедлайн</label>
                <Input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>

              <div className={s.buttonContainer}>
                <Button type="submit" variant="primary">
                  Сохранить
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditingTask(null)}
                >
                  Отмена
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default DelegatedTasksPage