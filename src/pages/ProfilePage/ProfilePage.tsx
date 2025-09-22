import MainLayout from '../../layouts/MainLayout.tsx'
import React, { useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from "../../store/store.ts";
import {login, logOut, selectIsAuthenticated, selectUsername} from "../../store/slices/authSlice.ts";
import s from "./ProfilePage.module.scss";
import {
    clearProfile,
    fetchProfile,
    selectProfile,
    updateProfile,
    selectProfileError,
    selectProfileLoading
} from "../../store/slices/profileSlice.ts";
import ProfileModal from "../../shared/ui/ProfileModal/ProfileModal.tsx";

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
    const authedUsername = useSelector(selectUsername);

    const toggleModal = () => {
        setModalOpen(!modalOpen)
        if (didAuth) setUserName(authedUsername)
    }

    const clearModal = () => {
        setUserName('')
        setPassword('')
        setModalError('')
        setModalOpen(false)
    }

    const handleAuth = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (didAuth) {
            if (userName.trim() == authedUsername.trim()) {
                console.error("Вы уже авторизованы в этом аккаунте");
                return setModalError("Вы уже авторизованы в этом аккаунте");
            }
            try {
                await dispatch(login({ username: userName.trim(), password: password.trim() })).unwrap();
                await dispatch(fetchProfile()).unwrap();
                clearModal()
                console.log("Account changed!");
            } catch (error: any) {
                console.error(error);
                setModalError(error)
            }
        }
        try {
            await dispatch(login({ username: userName.trim(), password: password.trim() })).unwrap();
            await dispatch(fetchProfile()).unwrap();
            clearModal()
            console.log("Auth!");
        } catch (error) {
            console.error(error);
            setModalError(error)
        }
    }

    const handleLogOut = () => {
        dispatch(logOut());
        dispatch(clearProfile());
    }

    const handleUpdateProfile = async (name?: string, ava?: string) => {
        if (!didAuth) return;
        try {
            await dispatch(updateProfile({ name, ava })).unwrap();
        } catch (error: any) {
            console.error(error);
        }
    }

    return (
        <MainLayout>
            {modalOpen && (
                <ProfileModal
                    onClose={toggleModal}
                    onSubmit={handleAuth}
                    modalError={modalError}
                    render={() => (
                        <>
                            <h2 className={s.formContainer__form__title}>{ didAuth ? 'Change Account Form' : 'Auth Form' }</h2>
                            <input
                                placeholder="username"
                                value={userName}
                                required
                                onChange={(e) => setUserName(e.target.value)}
                            />
                            <input
                                placeholder="password"
                                type="password"
                                value={password}
                                required
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button type="submit">{ didAuth ? 'Change Account' : 'Auth' }</button>
                        </>
                    )}
                />
            )}

            {didAuth && (
                <div className={s.buttonsContainer}>
                    <button type="button" onClick={toggleModal}>Change profile</button>
                    <button type="button" onClick={handleLogOut}>Log Out</button>
                </div>
            )}

            {!didAuth && (
                <button type="button" onClick={toggleModal}>Auth</button>
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