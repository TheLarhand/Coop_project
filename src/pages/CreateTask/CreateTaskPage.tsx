import { useState, type FormEvent } from 'react';
import MainLayout from '../../layouts/MainLayout'
import s from './CreateTask.module.scss'
function CreateTaskPage() {

  interface Assignee {
    id: string;
    name: string;
  }

  interface Task {
    name: string;
    description: string;
    assigneeId: string;
    deadline: string;
  }

  const assignees: Assignee[] = [
    { id: '1', name: 'Анна' },
    { id: '2', name: 'Борис' },
    { id: '3', name: 'Виктор' },
    { id: '4', name: 'Галина' },
  ];

  const [taskName, setTaskName] = useState('')
  const [taskDiscription, setTaskDiscription] = useState('')
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [deadline, setDeadline] = useState('');

  const heandleAddTask = (e: FormEvent) => {
    e.preventDefault()

    const newTask: Task = {
      name: taskName,
      description: taskDiscription,
      assigneeId: selectedAssignee,
      deadline: deadline,
    }

    console.log('New task: ', newTask)

    setTaskName('')
    setTaskDiscription('')
    setSelectedAssignee('')
    setDeadline('')
  }
  return (
    <MainLayout>
      <div className={s.container}>
        <div className={s.card}>
          <h1 className={s.heading}>Добавить новую задачу</h1>
          <p className={s.subheading}>Заполните все поля, чтобы создать задачу для вашей команды</p>
{/* Форма для назначения задачи  */}
          <form action="submit" className={s.form} onSubmit={heandleAddTask}> 

            <div className={s.formGroup}> 
              <label htmlFor="taskName">Название задачи</label>
              <input type="text" id="taskName" required className={s.input} value={taskName} onChange={(e) => setTaskName(e.target.value)}/> {/* Название для задачи */}
            </div>

            <div className={s.formGroup}>
              <label htmlFor="taskDescription" className={s.lable}>Описание задачи</label>
              <textarea id="taskDescription" required className={`${s.input} ${s.textarea}`} value={taskDiscription} onChange={(e) => setTaskDiscription(e.target.value)}></textarea> {/* Описание для задачи */}
            </div>

            <div className={s.formGroup}>
              <label htmlFor="assignee" className={s.lable}>Исполнитель</label>
              <select id="assignee" required className={`${s.input} ${s.select}`} value={selectedAssignee} onChange={(e) => setSelectedAssignee(e.target.value)}> {/* Селектор для выбра исполнителя задачи */}
                <option value="" disabled>Выберите исполнителя</option>
                {assignees.map(assignee => (
                  <option key={assignee.id} value={assignee.name}>{assignee.name}</option>
                ))}
              </select>
            </div>

            <div className={s.formGroup}>
              <label htmlFor="deadline" className={s.lable}>Дедлайн</label> {/* Установка дедлайна задачи */}
              <input type="date" id='deadline' required className={s.input} value={deadline} onChange={(e) => setDeadline(e.target.value)}/>
            </div>

            <div className={s.buttonContainer}>
                <button type='submit' className={s.button} >Добавить задачу</button> {/* Кнопка добавления задачи */}
            </div>

          </form>
        </div>
      </div>
    </MainLayout>
  )
}

export default CreateTaskPage