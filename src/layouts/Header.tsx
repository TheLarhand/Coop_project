import { useNavigate } from 'react-router-dom';
import s from './Layout.module.scss';
import Button from '../shared/ui/Button/Button';

function Header() {
  const navigate = useNavigate();

  const navigationItems = [
    { path: '/testPage', label: 'Тестовая страница' },
    { path: '/', label: 'Главная (Dashboard/Overview)' },
    { path: '/myTasks', label: 'Мои задачи' },
    { path: '/delegatedTasks', label: 'Делегированные' },
    { path: '/createTask', label: 'Создать задачу' },
    { path: '/profile', label: 'Профиль' }
  ];

  return (
    <header className={s.header}>
      <div className={s.headerInner}>
        {navigationItems.map((item) => (
          <Button
            key={item.path}
            onClick={() => navigate(item.path)}
            variant="secondary"
          >
            {item.label}
          </Button>
        ))}
      </div>
    </header>
  );
}

export default Header;
