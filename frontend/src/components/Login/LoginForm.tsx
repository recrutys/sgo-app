"use client";

import InputBox from "@/components/UI/InputBox/InputBox";
import Button from "@/components/UI/Button/Button";
import {useLoginForm} from "@/hooks/useLoginForm";

import './LoginForm.scss';
import Link from "next/link";

export default function LoginPage()
{
    const {isLoading, isAlreadyAuth, executeLogin} = useLoginForm();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) =>
    {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const loginValue = formData.get("login") as string;
        const passwordValue = formData.get("password") as string;

        await executeLogin(loginValue, passwordValue);
    };

    if (isAlreadyAuth) return null;

    return (
        <form onSubmit={handleSubmit} className="block login-card">
            <div className="login-card__container block-container">
                <div className="login-card__header">
                    <div className="login-card__main">
                        <div className="login-card__logo">S</div>
                        <div className="login-card__meta">
                            <span className="login-card__title">Авторизация в "Сетевой город"</span>
                            <span className="login-card__subtitle">Клиент здорового человека</span>
                        </div>
                    </div>
                </div>

                <div className="login-card__content">
                    <div className="login-card__inputBox">
                        <InputBox
                            label={<>
                                <b>Логин</b>
                                (фамилия123)</>}
                            type="text"
                            name="login"
                            placeholder="Введите логин"
                            required
                            disabled={isLoading}
                        />

                        <InputBox
                            label={<>
                                <b>Пароль</b>
                                (учитывайте регистр)</>}
                            type="password"
                            name="password"
                            placeholder="Введите пароль"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <span className="login-card__warningLabel">
                        Авторизуясь, вы подтверждаете, что осознаёте неофициальный статус клиента и соглашаетесь с{" "}
                        <Link href="/pages/privacy" className="login-card__warningLabel-link">политикой конфиденциальности</Link>
                    </span>

                    <Button type="submit" isLoading={isLoading} loadingText="Проверка...">
                        Войти
                    </Button>
                </div>
            </div>
        </form>
    );
}