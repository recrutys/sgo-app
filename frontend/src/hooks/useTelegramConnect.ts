import {useEffect, useState, useCallback} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {connectTelegram, disconnectTelegram, getTelegramStatus} from "@/hooks/api/endpoints";
import {toast} from "sonner";

export function useTelegramConnect()
{
    const router = useRouter();
    const token = useSearchParams().get("token");

    const [tgStatus, setTgStatus] = useState<{ connected: boolean; chat_id?: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isConfirming, setIsConfirming] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);

    // useCallback, чтобы можно было вызывать из других методов хука
    const fetchStatus = useCallback(async () =>
    {
        try
        {
            const res = await getTelegramStatus();
            if (res?.status === "success")
            {
                setTgStatus(res.data);

                // Если привязали, чистим URL
                if (res.data.connected && token)
                {
                    router.replace('/telegram-connect');
                }
            }
        }
        catch (error: any)
        {
            toast.error(error?.message || "Ошибка загрузки статуса");
        }
        finally
        {
            setIsLoading(false);
        }
    }, [token, router]);

    useEffect(() =>
    {
        fetchStatus();
    }, [fetchStatus]);

    const handleConfirm = async () =>
    {
        if (!token) return;

        setIsConfirming(true);
        try
        {
            const res = await connectTelegram(token);
            if (res?.status === "success" && res.data === true)
            {
                toast.success("Telegram успешно подключен!");
                await fetchStatus();
            }
            else
            {
                toast.error("Ссылка недействительна или истекла.");
            }
        }
        catch (error: any)
        {
            toast.error(error?.message || "Ошибка при подключении");
        }
        finally
        {
            setIsConfirming(false);
        }
    };

    const handleDisconnect = async () =>
    {
        setIsDisconnecting(true);
        try
        {
            const res = await disconnectTelegram();
            if (res?.status === "success")
            {
                toast.success("Telegram отвязан");
                await fetchStatus(); // Обновляем состояние, чтобы UI показал статус "не подключено"
            }
        }
        catch (error: any)
        {
            toast.error(error?.message || "Ошибка при отвязке");
        }
        finally
        {
            setIsDisconnecting(false);
        }
    };

    return {
        tgStatus,
        isLoading,
        isConfirming,
        isDisconnecting,
        handleConfirm,
        handleDisconnect
    };
}