import MainLayout from '../../layouts/MainLayout.tsx'
import React, {useEffect, useRef, useState} from "react";
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
import Button from "../../shared/ui/Button/Button.tsx";
import Input from "../../shared/ui/Input/Input.tsx";
import {fetchMyStatistic, selectStatistics} from "../../store/slices/statisticsSlice.ts";
import UserStatCard from "../../features/dashboard/UserStatCard/UserStatCard.tsx";
import { fileToAvatarDataURL  } from "./utils/utils";

const ProfilePage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const didAuth = useSelector(selectIsAuthenticated);
    const profile = useSelector(selectProfile);
    const loading = useSelector(selectProfileLoading);
    const error = useSelector(selectProfileError);
    const authedUsername = useSelector(selectUsername);
    const { my } = useSelector(selectStatistics);

    const [userName, setUserName] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [ava, setAva] = useState<string>('');
    const fileRef = useRef<HTMLInputElement | null>(null);

    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [modalError, setModalError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
            if (didAuth) await dispatch(fetchMyStatistic());
        })()
    }, [dispatch, didAuth]);

    const toggleModal = (editing: boolean = false) => {
        setModalOpen(!modalOpen);
        if (editing) {
            setIsEditing(true);
            setUserName(profile!.name);
            setAva(profile!.ava);
        }
        if (didAuth && !editing) {
            setIsEditing(false);
            setUserName(authedUsername);
            setAva('');
        }
    }

    const clearModal = () => {
        setUserName('');
        setPassword('');
        setModalError('');
        setModalOpen(false);
        if (isEditing) setIsEditing(false);
        if (fileRef.current) fileRef.current.value = "";
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

    const onAvatarPick: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
        setModalError(null);
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setModalError("Пожалуйста, выберите изображение.");
            if (fileRef.current) fileRef.current.value = "";
            return;
        }

        // общий лимит (и для статичных, и для анимированных)
        if (file.size > 5 * 1024 * 1024) {
            setModalError("Файл слишком большой (> 5 МБ).");
            if (fileRef.current) fileRef.current.value = "";
            return;
        }

        try {
            const { dataURL } = await fileToAvatarDataURL(file, {
                maxSide: 256,
                mime: "image/webp",
                quality: 0.90,
                maxBytesAnimated: 5 * 1024 * 1024,
            });
            setAva(dataURL);
        } catch (err: any) {
            setModalError(err?.message ?? "Не удалось обработать изображение");
            if (fileRef.current) fileRef.current.value = "";
        }
    };

    const handleUpdateProfile = async (name?: string, ava?: string, e?: React.FormEvent) => {
        e?.preventDefault();
        if (!didAuth) return;
        try {
            await dispatch(updateProfile({ name: name?.trim(), ava: ava })).unwrap();
            clearModal()
            console.log("Profile updated")
        } catch (error: any) {
            console.error(error);
        }
    }

    return (
        <MainLayout>
            {modalOpen && !isEditing && (
                <ProfileModal
                    onClose={() => toggleModal()}
                    onSubmit={(e) => handleAuth(e)}
                    modalError={modalError}
                    render={() => (
                        <>
                            <h2 className={s.formContainer__form__title}>{ didAuth ? 'Change Account Form' : 'Auth Form' }</h2>
                            <Input
                                placeholder="username"
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                            />
                            <Input
                                placeholder="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <Button type={"submit"}>{ didAuth ? 'Change Account' : 'Auth' }</Button>
                        </>
                    )}
                />
            )}

            {modalOpen && isEditing && (
                <ProfileModal
                    onClose={() => toggleModal()}
                    onSubmit={(e) => handleUpdateProfile(userName, ava, e)}
                    modalError={modalError}
                    render={() => (
                        <>
                            <h2 className={s.formContainer__form__title}>Update Profile form</h2>

                            {(ava || profile?.ava) && (
                                <div className={s.avatarPreview}>
                                    <img
                                        className={s.avatarPreview__img}
                                        src={ava || profile!.ava}
                                        alt="avatar preview"
                                    />
                                    {ava && <small className={s.avatarPreview__hint}>Предпросмотр (ещё не сохранено)</small>}
                                </div>
                            )}

                            <Input
                                placeholder="name"
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                            />
                            <input
                                type="file"
                                accept="image/*"
                                id="avatarInput"
                                onChange={onAvatarPick}
                            />
                            <Button type={"submit"}>Update Profile</Button>
                        </>
                    )}
                />
            )}

            {didAuth && (
                <div className={s.buttonsContainer}>
                    <Button type={"button"} onClick={() => toggleModal()}>Change profile</Button>
                    <Button type={"button"} onClick={() => toggleModal(true)}>Update profile</Button>
                    <Button type={"button"} onClick={handleLogOut}>Log Out</Button>
                </div>
            )}

            {!didAuth && (
                <Button type={"button"} onClick={() => toggleModal()}>Auth</Button>
            )}

            {error && (
                <div>Произошла ошибка: {error}</div>
            )}

            {loading && !error && (
                <div>Загрузка профиля...</div>
            )}

            {didAuth && profile && !loading && !error && (
                <div className={s.userContainer}>
                    <img className={s.userAvatar} src={profile.ava} alt={"user_image"}/>
                    <span className={s.userName}>Имя: {profile.name}</span>
                    {my && (
                        <div className={s.userStat}>
                            <UserStatCard
                                id={0}
                                name={userName}
                                ava={profile.ava}
                                completed={my!.completedTasks}
                                inWork={my!.inWorkTasks}
                                failed={my!.failedTasks}
                                highlight={false}
                                total={my!.completedTasks + my!.inWorkTasks + my!.failedTasks}
                            />
                        </div>
                    )}
                </div>
            )}
        </MainLayout>
    )
}

export default ProfilePage