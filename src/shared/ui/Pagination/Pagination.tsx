import React from "react";
import s from "./Pagination.module.scss";

interface Props {
  total: number;
  page: number;
  pageSize: number;
}

const Pagination: React.FC<Props> = ({ total, page, pageSize }) => {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  return (
    <div className={s.pagination}>
      <button disabled={page === 1}>Назад</button>
      <span>{page} / {totalPages}</span>
      <button disabled={page === totalPages}>Вперёд</button>
    </div>
  );
};

export default Pagination;
