"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {getMe} from "@/hooks/api/endpoints";
import LogoutIcon from "@/components/UI/Icons/LogoutIcon";
import "./OfflineBanner.scss";

export default function OfflineBanner()
{
    const router = useRouter();
    const [userName, setUserName] = useState<string>("");
    const [lastSyncDate, setLastSyncDate] = useState<string>(""); // cache_last_sync_at	"2026-06-11T19:23:04.958Z"

    useEffect(() =>
    {
        const fetchUser = async () =>
        {
            try
            {
                const res = await getMe();
                const data = res && (res.status === "success" || res.success) ? res.data : res;
                if (data && data.full_name)
                {
                    setUserName(data.full_name);
                    setLastSyncDate(data.cache_last_sync_at);
                }
            }
            catch (err)
            {
                console.error(err);
            }
        };

        fetchUser();
    }, []);

    const handleLogout = () =>
    {
        localStorage.removeItem("secret_key");
        router.push("/login");
    };

    const formatDate = (dateString: string) =>
    {
        if (!dateString) return "";

        const date = new Date(dateString);
        return date.toLocaleString("ru-RU", {
            day: "numeric",
            month: "long",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="block offline-banner">
            <div className="block-container">
                <span className="block-row offline-banner__header">Сетевой Город временно «В С Ё»</span>
                {lastSyncDate && (
                    <>
                        <div className="block-row offline-banner__content">
                            Последняя дата синхрозиции: <b>{formatDate(lastSyncDate)}</b>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}