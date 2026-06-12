import {useEffect, useState} from "react";
import {getMeExams, getMeReport} from "@/hooks/api/endpoints";
import {toast} from "sonner";

export function useExams()
{
    const [examsData, setExamsData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() =>
    {
        const fetchExams = async () =>
        {
            try
            {
                const res = await getMeExams();
                const data = res && res.status === "success" ? res.data : res;

                if (Array.isArray(data))
                {
                    setExamsData(data);
                }
            }
            catch (error)
            {
                console.error("Ошибка при получении экзаменов:", error);
                toast.error(error?.message);
            }
            finally
            {
                setIsLoading(false);
            }
        };

        fetchExams();
    }, []);

    return {
        examsData,
        isLoading
    }
}