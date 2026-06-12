import {useEffect, useState} from "react";
import {toast} from "sonner";
import {getMeAttestation} from "@/hooks/api/endpoints";

export function useAttestation()
{
    const [attestationData, setAttestationData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() =>
    {
        const fetchAttestation = async () =>
        {
            try
            {
                const res = await getMeAttestation();
                const data = res && res.status === "success" ? res.data : res;

                if (
                    data
                    && (typeof data === "object" || Array.isArray(data))
                )
                {
                    setAttestationData(data);
                }
            }
            catch (error)
            {
                console.error("Ошибка при получении аттестации: ", error);
                toast.error(error?.message);
            }
            finally
            {
                setIsLoading(false);
            }
        };

        fetchAttestation();
    }, []);

    return {
        attestationData,
        isLoading
    }
}