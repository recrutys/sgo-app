import {useEffect, useState} from "react";
import {toast} from "sonner";
import {getMeSchedule} from "@/hooks/api/endpoints";

export function useSchedule()
{
    const [scheduleData, setScheduleData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() =>
    {
        const fetchSchedule = async () =>
        {
            try
            {
                const res = await getMeSchedule();
                const data = res && res.status === "success" ? res.data : res;

                if (Array.isArray(data))
                {
                    setScheduleData(data);
                }
            }
            catch (error)
            {
                console.error("Ошибка при получении расписании: ", error);
                toast.error(error?.message);
            }
            finally
            {
                setIsLoading(false);
            }
        };

        fetchSchedule();
    }, []);

    return {
        scheduleData,
        isLoading
    }
}