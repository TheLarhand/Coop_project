import s from './Layout.module.scss';

function Footer() {
  return (
    <footer className={s.footer}>
      <div className={s.footerInner}>
        <div className={s.main}>
          <div className={s.info}>
            <h2>Coop Project</h2>
            <p>Это учебное приложение для совместной работы над задачами.
              Проект реализован на React + TypeScript, с использованием Redux Toolkit и React Router DOM.
              Для хранения и управления данными используется API на FastAPI.</p>
            <p>Руководитель проекта: <a href="https://github.com/TheLarhand" target="_blank" rel="noopener noreferrer">Соколов Игорь</a></p>
          </div>


          <p>© 2025 IT-STEP JSE-242</p>
        </div>
        <div className={s.contacts}>
          <h4>Контакты команды</h4>

          <ul>
            <li>
              <a href="https://github.com/SHR-HR" target="_blank" rel="noopener noreferrer">
                Шаунин Роман
              </a>
            </li>
            <li>
              <a href="https://github.com/nurbay-bay" target="_blank" rel="noopener noreferrer">
                Нурмолдин Нурбай
              </a>
            </li>
            <li>
              <a href="https://github.com/gazzzpachooo" target="_blank" rel="noopener noreferrer">
                Лаас Михаил
              </a>
            </li>
            <li>
              <a href="https://github.com/Tiltushkin" target="_blank" rel="noopener noreferrer">
                Исаев Владислав
              </a>
            </li>
          </ul>
          <p>
            <a href="https://github.com/TheLarhand/Coop_project" target="_blank" rel="noopener noreferrer">
              Репозиторий проекта
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
