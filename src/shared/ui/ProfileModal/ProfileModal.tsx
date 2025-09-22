import React from "react";
import s from "./ProfileModal.module.scss";

interface ModalShellProps extends React.HTMLAttributes<HTMLElement> {
    onClose?: () => void;
    onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
    children?: React.ReactNode;
    render?: () => React.ReactNode;
    modalError?: string | null;
}

const ProfileModal: React.FC<ModalShellProps> = ({
    onClose,
    onSubmit,
    children,
    render,
    modalError,
    ...rest
    }) => {
    return (
        <div className={s.modalBackground} {...rest} role="dialog" aria-modal="true">
            <div className={s.formContainer}>
                <img
                    className={s.formContainer__closeModal}
                    src="/closeModal.svg"
                    alt="close"
                    onClick={onClose}
                />
                <form className={s.formContainer__form} onSubmit={onSubmit}>
                    {render ? render() : children}
                    {modalError && <span className={s.formContainer__error}>{modalError}</span>}
                </form>
            </div>
        </div>
    );
};

export default ProfileModal;