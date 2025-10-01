import React, { useState } from "react";
import Textarea from "../../../shared/ui/Textarea/Textarea";
import Button from "../../../shared/ui/Button/Button";
import s from "./CompleteModal.module.scss";

interface CompleteModalProps {
  isOpen: boolean;
  comment: string;
  onCommentChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
  isOverdue?: boolean;
  overdueInfo?: string;
}

const CompleteModal: React.FC<CompleteModalProps> = ({
  isOpen,
  comment,
  onCommentChange,
  onCancel,
  onConfirm,
  isOverdue = false,
  overdueInfo = ""
}) => {
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!comment.trim()) {
      setError("Комментарий обязателен");
      return;
    }
    setError("");
    onConfirm();
  };

  return (
    <div className={s.overlay}>
      <div className={s.modal}>
        <h3 className={s.title}>Комментарий к задаче</h3>

        {isOverdue && (
          <div className={s.overdueWarning}>
            <div className={s.warningText}>
              <strong>⚠️ Задача просрочена</strong>
              {overdueInfo && <span>{overdueInfo}</span>}
            </div>
          </div>
        )}

        <Textarea
          value={comment}
          onChange={(e) => {
            onCommentChange(e.target.value);
            if (error) setError("");
          }}
          placeholder="Напишите, как выполнили задачу"
          className={s.textarea}
        />

        {error && <p className={s.error}>{error}</p>}

        <div className={s.actions}>
          <Button variant="secondary" onClick={onCancel}>
            Отмена
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={!comment.trim()}
          >
            Подтвердить
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompleteModal;