import React from "react";
import s from "./Pagination.module.scss";

interface Props {
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
}

const Pagination: React.FC<Props> = ({ total, page, pageSize, onPageChange }) => {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  return (
    <div className={s.pagination}>
      <button 
        disabled={page === 1} 
        onClick={() => onPageChange(page - 1)}
      >
        Назад
      </button>

      <span>{page} / {totalPages}</span>

      <button 
        disabled={page === totalPages} 
        onClick={() => onPageChange(page + 1)}
      >
        Вперёд
      </button>
    </div>
  );
};

export default Pagination;
