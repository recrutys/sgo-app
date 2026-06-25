import {useState, useEffect} from "react";
import {getStatus, getStatusSg} from "@/hooks/api/endpoints";

type AppStatus = "loading" | "online" | "sgo_offline" | "server_dead";

export function useAppStatus(): AppStatus
{
    const [status, setStatus] = useState<AppStatus>("loading");

    useEffect(() =>
    {
        let isCurrentRequest = true;

        async function checkAppStatus()
        {
            try
            {
                setStatus("loading");

                // Проверяем наш бэкэнд
                await getStatus();

                // Проверяем Сетевой Город
                const resData = await getStatusSg();

                if (!isCurrentRequest) return;

                if (resData?.data === false)
                {
                    setStatus("sgo_offline");
                }
                else
                {
                    setStatus("online");
                }

            }
            catch (error)
            {
                if (isCurrentRequest)
                {
                    setStatus("server_dead");
                }
            }
        }

        checkAppStatus();

        return () =>
        {
            isCurrentRequest = false;
        };
    }, []);

    return status;
}