"use client";

import Link from "next/link";
import {usePathname, useRouter} from "next/navigation";
import {useEffect, useRef, useState} from "react";
import LogoutIcon from "@/components/UI/Icons/LogoutIcon";
import Dropdown from "@/components/UI/Dropdown/Dropdown";
import {getMe} from "@/hooks/api/endpoints";

import "./Navbar.scss";
import {useAppStatus} from "@/hooks/useAppStatus";

export default function Navbar()
{
    const pathname = usePathname();
    const [userDisplay, setUserDisplay] = useState("");
    const router = useRouter();
    const tabsRef = useRef<HTMLDivElement>(null);
    const [isAuthed, setIsAuthed] = useState(false);

    // Статус доступа
    const status = useAppStatus();

    // Проверяем авторизован ли пользователь и записываем
    useEffect(() =>
    {
        const key = localStorage.getItem("secret_key");
        setIsAuthed(!!key);
    }, []);

    // Получаем ФИО пользователя
    useEffect(() =>
    {
        getMe().then((res) =>
        {
            const data = res && res.status === "success" ? res.data : res;

            if (data && data.full_name)
            {
                const nameParts = data.full_name.split(" ");
                const lastName = nameParts[0] || "";
                const firstNameInit = nameParts[1] ? ` ${nameParts[1][0]}.` : "";
                const middleNameInit = nameParts[2] ? `${nameParts[2][0]}.` : "";
                setUserDisplay(`${lastName}${firstNameInit}${middleNameInit}`);
            }
        }).catch((err) => console.error("Ошибка при получении профиля:", err));
    }, []);

    // Обработчик для скролла
    const handleWheel = (e: React.WheelEvent) =>
    {
        if (!tabsRef.current) return;

        if (e.deltaY !== 0)
        {
            e.preventDefault();
            tabsRef.current.scrollLeft += e.deltaY;
        }
    };

    // Объявляем переменную до условий
    let navLinks = [];

    if (status == "sgo_offline")
    {
        navLinks = [
            {name: "Ведомость", href: "/report"},
        ];
    }
    else
    {
        navLinks = [
            {name: "Главная", href: "/dashboard", canView: !isAuthed},
            {name: "Ведомость", href: "/report"},
            {name: "Аттестация", href: "/attestation"},
            {name: "Расписание", href: "/schedule"},
            {name: "Экзамены", href: "/exams"},
        ];
    }

    // Обработчик кнопки "Выйти"
    const handleLogout = () =>
    {
        localStorage.removeItem("secret_key");
        router.push("/login");
    };

    return (
        <nav className="block navbar" onWheel={handleWheel}>
            <div className="navbar__container">

                <div className="navbar__tabs" ref={tabsRef}>
                    <ul className="navbar__tabs-list">
                        {navLinks.map((link) => (
                            <li
                                key={link.href}
                                className={`navbar__tab ${pathname === link.href ? "navbar__tab--selected" : ""}`}
                            >
                                <Link href={link.href} className="navbar__tab-link">
                                    {link.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="navbar__user">
                    {isAuthed ? (
                        <Dropdown
                            trigger={(open) => (
                                <span className="navbar__user-badge">
                                    {userDisplay || "Загрузка..."}
                                    <i className={`fa-solid fa-angle-down navbar__user-badge-arrow ${open ? "navbar__user-badge-arrow--open" : ""}`} />
                                </span>
                            )}
                            items={[
                                /* {label: "Telegram Connect", href: "/telegram-connect"}, */
                                {label: "Политика конфиденциальности", href: "/pages/privacy"},
                                {divider: true},
                                {label: "Выйти", danger: true, onClick: handleLogout},
                            ]}
                        />
                    ) : (
                        <Link href="/login" className="navbar__user-badge">
                            Войти
                        </Link>
                    )}
                </div>

            </div>
        </nav>
    );
}