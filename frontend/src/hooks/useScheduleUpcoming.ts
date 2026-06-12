import {useEffect, useState} from "react";
import {getMeScheduleUpcoming} from "@/hooks/api/endpoints";
import {toast} from "sonner";

export function useScheduleUpcoming()
{
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() =>
    {
        const fetchSchedule = async () =>
        {
            try
            {
                const res = await getMeScheduleUpcoming();

                setData(res?.data || res);
            }
            catch (error)
            {
                console.error("Ошибка загрузки расписания:", error);
                toast.error(error?.message)
            }
            finally
            {
                setIsLoading(false);
            }
        };

        fetchSchedule();
    }, []);

    return {data, isLoading};
}