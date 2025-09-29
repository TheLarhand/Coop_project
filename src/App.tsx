import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TestPage from './pages/TestPage';
import StatisticPage from './pages/StatisticPage';
import MyTasksPage from './pages/MyTasksPage/MyTasksPage';
import DelegatedTasksPage from './pages/DelegatedPage/DelegatedTasksPage';
import CreateTaskPage from './pages/CreateTask/CreateTaskPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';

function App() {
  //Это главный компонент здесь подключаются глобальные компоненты реализуется роутинг
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StatisticPage/>} />
        <Route path="/myTasks" element={<MyTasksPage/>} />
        <Route path="/delegatedTasks" element={<DelegatedTasksPage/>} />
        <Route path="/createTask" element={<CreateTaskPage/>} />
        <Route path="/profile" element={<ProfilePage />} />

        <Route path="/testPage" element={<TestPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
