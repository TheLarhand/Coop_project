import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import s from './Layout.module.scss';
import { SiCoop } from "react-icons/si";
import { FiMenu, FiX } from "react-icons/fi";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLUListElement>(null);

  const navigationItems = [
    { path: "/", label: "Дашборд" },
    { path: "/myTasks", label: "Мои задачи" },
    { path: "/delegatedTasks", label: "Делегированные" },
    { path: "/createTask", label: "Создать задачу" },
    { path: "/profile", label: "Профиль" },
  ];

  // Закрытие при клике вне меню
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <header className={s.header}>
      <div className={s.headerInner}>
        <div className={s.logoBox} onClick={() => navigate("/testPage")}>
          <SiCoop className={s.logo} />
          <span>Coop Project</span>
        </div>

        {/* Бургер */}
        <button className={s.burger} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
        </button>

        {/* Навигация */}
        <ul
          ref={menuRef}
          className={`${s.navigate} ${menuOpen ? s.open : ""}`}
        >
          {navigationItems.map((item) => (
            <li
              key={item.path}
              className={`${s.item} ${location.pathname === item.path ? s.active : ""
                }`}
              onClick={() => {
                navigate(item.path);
                setMenuOpen(false);
              }}
            >
              {item.label}
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}

export default Header;
