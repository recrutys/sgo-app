import {useEffect, useState} from "react";
import {getMeDashboard} from "@/hooks/api/endpoints";
import {toast} from "sonner";

export function useDashboard()
{
    const [grades, setGrades] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() =>
    {
        const fetchGrades = async () =>
        {
            try
            {
                const res = await getMeDashboard();
                const data = res && res.status === "success" ? res.data : res;

                if (Array.isArray(data))
                {
                    setGrades(data);
                }
            }
            catch (error)
            {
                console.error("Ошибка при получении средних баллов:", error);
                toast.error(error?.message)
            }
            finally
            {
                setIsLoading(false);
            }
        };

        fetchGrades();
    }, []);

    return {
        grades,
        isLoading
    };
}