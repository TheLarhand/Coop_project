import Button from "../../shared/ui/Button/Button";
import Input from "../../shared/ui/Input/Input";
import Textarea from "../../shared/ui/Textarea/Textarea";
import { useEffect, useState, type FormEvent } from 'react';
import MainLayout from '../../layouts/MainLayout'
import s from './CreateTask.module.scss'
import { fetchUsers, selectAllUsers, selectUsersLoading, selectUsersError } from '../../store/slices/usersSlice';
import { useDispatch, useSelector } from 'react-redux';
import type { User } from '../../shared/types/types';
import type { AppDispatch } from '../../store/store';
import { fetchProfile, selectProfile  } from "../../store/slices/profileSlice";
import Select from "../../shared/ui/Select/Select";


 interface Task {
    id: string
    name: string;
    description: string;
    assigneeId: string;
    deadline: string;
    creator: string
  }

function CreateTaskPage() {

  const users = useSelector(selectAllUsers);
  const profile = useSelector(selectProfile)
  const isLoading = useSelector(selectUsersLoading);
  const error = useSelector(selectUsersError);

  const [taskName, setTaskName] = useState('')
  const [taskDiscription, setTaskDiscription] = useState('')
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [deadline, setDeadline] = useState('');

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchProfile());
  }, [dispatch]);

  const assigneeOptions = users.map(user => ({
    label: user.name,
    value: user.name,
  }));

   const generateUniqueId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  };

  const handleAddTask = (e: FormEvent) => {
    e.preventDefault();

    if (!profile || !profile.name) {
        console.error("Профиль пользователя не загружен. Невозможно создать задачу.");
        return;
    }

    const newTask: Task = {
      id: generateUniqueId(),
      name: taskName,
      description: taskDiscription,
      assigneeId: selectedAssignee,
      deadline: deadline,
      creator: profile.name
    };

    console.log('New task:', newTask);

    setTaskName('');
    setTaskDiscription('');
    setSelectedAssignee('');
    setDeadline('');
  };

  const clearBtn = () => {
    setTaskName('');
    setTaskDiscription('');
    setSelectedAssignee('');
    setDeadline('');
  }
  
  return (
    <MainLayout>
      <div className={s.container}>
        <div className={s.card}>
          <h1 className={s.heading}>Добавить новую задачу</h1>
          <p className={s.subheading}>Заполните все поля, чтобы создать задачу для вашей команды</p>
          <form className={s.form} onSubmit={handleAddTask}>

            <div className={s.formGroup}>
              <label htmlFor="taskName">Название задачи</label>
              <Input type="text" required 
                placeholder=""
                value={taskName} 
                onChange={(e) => setTaskName(e.target.value)}></Input>
            </div>

            <div className={s.formGroup}>
              <label htmlFor="taskDescription" className={s.lable}>Описание задачи</label>
              <Textarea
                required
                value={taskDiscription} 
                onChange={(e) => setTaskDiscription(e.target.value)}
              ></Textarea>
            </div>

            <div className={s.formGroup}>
              <label htmlFor="assignee" className={s.lable}>Исполнитель</label>
              <Select
                value={selectedAssignee}
                onChange={setSelectedAssignee}
                options={assigneeOptions}
                placeholder={isLoading ? 'Загрузка пользователей...' : 'Выберите исполнителя'}
                disabled={isLoading || !!error}
                className={s.input}
              />
            </div>

            <div className={s.formGroup}>
              <label htmlFor="deadline" className={s.lable}>Дедлайн</label>
              <Input type="date" required 
                placeholder=""
                value={deadline} 
                onChange={(e) => setDeadline(e.target.value)}></Input>
            </div>

            <div className={s.buttonContainer}>
              <Button type="submit" variant="primary">Добавить задачу</Button>
              <Button type="button" onClick={clearBtn} variant="primary">Очистить поля</Button>
            </div>

          </form>
        </div>
      </div>
    </MainLayout>
  );
}

export default CreateTaskPage