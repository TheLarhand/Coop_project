import MainLayout from '../../layouts/MainLayout.tsx'
import React, {useState} from "react";
import {useDispatch, useSelector} from 'react-redux';
import type {AppDispatch} from "../../store/store.ts";
import {login, selectIsAuthenticated} from "../../store/slices/authSlice.ts";
import s from "./ProfilePage.module.scss";
import {
    fetchProfile,
    selectProfile,
    selectProfileError,
    selectProfileLoading
} from "../../store/slices/profileSlice.ts";

const ProfilePage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const didAuth = useSelector(selectIsAuthenticated)

    const [userName, setUserName] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const [modalOpen, setModalOpen] = useState<boolean>(false)
    const [modalError, setModalError] = useState<string | null>(null)

    const profile = useSelector(selectProfile);
    const loading = useSelector(selectProfileLoading);
    const error = useSelector(selectProfileError);

    const handleChangeUsername = (e?: React.ChangeEvent<HTMLInputElement>) => {
        setUserName(e!.target.value)
    }

    const handleChangePassword = (e?: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e!.target.value)
    }

    const toggleModal = () => {
        setModalOpen(!modalOpen)
    }

    const clearModal = () => {
        setUserName('')
        setPassword('')
        setModalError('')
        setModalOpen(false)
    }

    const handleAuth = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (didAuth) return;
        try {
            await dispatch(login({ username: userName, password: password })).unwrap();
            await dispatch(fetchProfile()).unwrap();
            clearModal()
            console.log("Auth!");
        } catch (error) {
            console.error(error);
            setModalError(error)
        }
    }

    return (
    <MainLayout>
        {modalOpen && !didAuth && (
            <div className={s.modalBackground}>
                <div className={s.formContainer}>
                    <img className={s.formContainer__closeModal} src={"/closeModal.svg"}  alt={"closeModal_icon"} onClick={toggleModal}/>
                    <form className={s.formContainer__form} onSubmit={handleAuth}>
                        <h2 className={s.formContainer__form__title}>Auth Form</h2>
                        <input placeholder={"username"} value={userName} required={true} onChange={handleChangeUsername}></input>
                        <input placeholder={"password"} value={password} required={true} onChange={handleChangePassword}></input>
                        <button type={"submit"}>Auth</button>
                        {modalError && (
                            <span className={s.formContainer__error}>{modalError}</span>
                        )}
                    </form>
                </div>
            </div>
        )}

        {!didAuth && (
            <button type={"button"} onClick={toggleModal}>Auth</button>
        )}

        {error && (
            <div>Произошла ошибка: {error}</div>
        )}

        {loading && !error && (
            <div>Загрузка профиля...</div>
        )}

        {didAuth && profile && !loading && !error && (
            <div className={s.userContainer}>
                <img className={s.userAvatar} src={profile.ava} alt={"user_image"} />
                <span className={s.userName}>Имя: {profile.name}</span>
            </div>
        )}
    </MainLayout>
    )
}

export default ProfilePage