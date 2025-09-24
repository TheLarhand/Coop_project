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
import { fileToAvatarDataURL } from "./utils/utils";

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
            if (userName.trim() === authedUsername.trim()) {
                console.error("Вы уже авторизованы в этом аккаунте");
                return setModalError("Вы уже авторизованы в этом аккаунте");
            }
            try {
                await dispatch(login({ username: userName.trim(), password: password.trim() })).unwrap();
                await dispatch(fetchProfile()).unwrap();
                clearModal();
                return;
            } catch (error: any) {
                console.error(error);
                setModalError(error);
                return;
            }
        }
        try {
            await dispatch(login({ username: userName.trim(), password: password.trim() })).unwrap();
            await dispatch(fetchProfile()).unwrap();
            clearModal();
        } catch (error) {
            console.error(error);
            setModalError(error as any);
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

    const handleUpdateProfile = async (name?: string, avatar?: string, e?: React.FormEvent) => {
        e?.preventDefault();
        if (!didAuth) return;
        try {
            await dispatch(updateProfile({ name: name?.trim(), ava: avatar })).unwrap();
            clearModal();
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
                                required={true}
                                onChange={(e) => setUserName(e.target.value)}
                            />
                            <Input
                                placeholder="password"
                                type="password"
                                value={password}
                                required={true}
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
                                required={true}
                                onChange={(e) => setUserName(e.target.value)}
                            />

                            <div className={s.fileRow}>
                                <input
                                    ref={fileRef}
                                    className={s.fileInput}
                                    type="file"
                                    accept="image/*"
                                    id="avatarInput"
                                    onChange={onAvatarPick}
                                />
                                <label htmlFor="avatarInput" className={s.fileBtn}>Загрузить аватар</label>
                            </div>

                            <Button type={"submit"}>Update Profile</Button>
                        </>
                    )}
                />
            )}

            {error && <div>Произошла ошибка: {error}</div>}
            {loading && !error && <div>Загрузка профиля...</div>}

            {didAuth && profile && !loading && !error && (
                <section className={s.profileCard}>
                    <div className={s.cover} aria-hidden />

                    <div className={s.header}>
                        <div className={s.identity}>
                            <img className={s.userAvatarXL} src={profile.ava} alt={profile.name} />
                            <div className={s.nameBlock}>
                                <h1 className={s.displayName}>{profile.name}</h1>
                                <span className={s.username}>@{authedUsername}</span>
                            </div>
                        </div>

                        <div className={s.actions}>
                            <Button type="button" onClick={() => toggleModal()}>Change profile</Button>
                            <Button type="button" onClick={() => toggleModal(true)}>Update profile</Button>
                            <Button type="button" variant="danger" onClick={handleLogOut}>Log Out</Button>
                        </div>
                    </div>

                    {my && (
                        <div className={s.stats}>
                            <ul className={s.kpis}>
                                <li className={s.kpi}>
                                    <b>{my.completedTasks}</b>
                                    <span>Выполнено</span>
                                </li>
                                <li className={s.kpi}>
                                    <b>{my.inWorkTasks}</b>
                                    <span>В работе</span>
                                </li>
                                <li className={s.kpi}>
                                    <b>{my.failedTasks}</b>
                                    <span>Просрочено</span>
                                </li>
                            </ul>

                            <div className={s.userStatCardWrap}>
                                <UserStatCard
                                    id={0}
                                    name={profile.name}
                                    ava={profile.ava}
                                    completed={my.completedTasks}
                                    inWork={my.inWorkTasks}
                                    failed={my.failedTasks}
                                    highlight={false}
                                    total={my.completedTasks + my.inWorkTasks + my.failedTasks}
                                />
                            </div>
                        </div>
                    )}
                </section>
            )}

            {!didAuth && (
                <div className={s.centered}>
                    <Button type="button" onClick={() => toggleModal()}>Auth</Button>
                </div>
            )}
        </MainLayout>
    )
}

export default ProfilePage