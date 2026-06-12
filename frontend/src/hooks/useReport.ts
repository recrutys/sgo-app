import {useEffect, useState} from "react";
import {getMeCache, getMeReport} from "@/hooks/api/endpoints";
import {toast} from "sonner";

export function useReport(isOffline: boolean = false)
{
    const [grades, setGrades] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() =>
    {
        const fetchGrades = async () =>
        {
            try
            {
                const res = isOffline ? await getMeCache() : await getMeReport();
                const data = res && res.status === "success" ? res.data : res;
                if (Array.isArray(data))
                {
                    setGrades(data);
                }
            }
            catch (error)
            {
                console.error("Ошибка при получении отчётной ведомости:", error);
                toast.error(error?.message);
            }
            finally
            {
                setIsLoading(false);
            }
        };

        fetchGrades();
    }, [isOffline]);

    return {grades, isLoading};
}