"use client";

import {useLayoutEffect, useState} from "react";
import {usePathname, useRouter} from "next/navigation";
import {useAppStatus} from "@/hooks/useAppStatus";
import Navbar from "@/components/Navbar/Navbar";
import ServerDeadScreen from "@/components/Server/ServerDeadScreen";
import OfflineBanner from "@/components/Server/OfflineBanner";
import ReportPageComponent from "@/components/Report/ReportPageComponent";

export default function MainLayout({children}: { children: React.ReactNode })
{
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    const status = useAppStatus();

    useLayoutEffect(() =>
    {
        const session = localStorage.getItem("secret_key");
        if (!session)
        {
            router.replace("/login");
        }
        else
        {
            setIsAuthorized(true);

            if (pathname === "/")
            {
                router.replace("/dashboard");
            }
        }
    }, [router, pathname]);

    if (isAuthorized === null || status === "loading")
    {
        return (
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                fontSize: "14px",
                color: "#888888"
            }}>
                Загрузка...
            </div>
        );
    }

    if (status === "server_dead") return <ServerDeadScreen />;

    if (status === "sgo_offline")
    {
        return (
            <>
                <Navbar />
                <OfflineBanner />
                <ReportPageComponent isOffline={true} />
            </>
        );
    }

    return (
        <>
            <Navbar />
            {children}
        </>
    )
}