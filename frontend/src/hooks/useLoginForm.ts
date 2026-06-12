import {useState, useLayoutEffect} from "react";
import {useRouter} from "next/navigation";
import {loginUser} from "@/hooks/api/endpoints";
import {toast} from "sonner";

export function useLoginForm()
{
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [isAlreadyAuth, setIsAlreadyAuth] = useState(true);

    useLayoutEffect(() =>
    {
        const secretKey = localStorage.getItem("secret_key");
        if (secretKey)
        {
            router.replace("/dashboard");
        }
        else
        {
            setIsAlreadyAuth(false);
        }
    }, [router]);

    const handleBackendError = (code: string | undefined, fallbackMessage?: string) =>
    {
        let userMessage = "Ошибка при обработке данных или сервер недоступен";
        switch (code)
        {
            case "INVALID_CREDENTIALS":
                userMessage = "Неверный логин или пароль";
                break;
            case "SGO_TIMEOUT":
                userMessage = "Сетевой Город долго отвечает. Попробуйте еще раз";
                break;
            case "SGO_SERVER_ERROR":
                userMessage = "Ошибка на стороне Сетевого Города. Попробуйте позже";
                break;
            case "SGO_PARSE_ERROR":
                userMessage = "Не удалось распознать данные студента из Сетевого Города";
                break;
            case "NETWORK_ERROR": // Не используется. Существует заглушка, если сервер лёг
                userMessage = "СГ сломал наш бэкенд. Чиним последствия. Попробуйте позже!";
                break;
            default:
                if (fallbackMessage) userMessage = fallbackMessage;
                break;
        }
        toast.error(userMessage);
    };

    // Функция принимает чистые строки из FormData на странице
    const executeLogin = async (loginValue: string, passwordValue: string) =>
    {
        setIsLoading(true);

        try
        {
            const response = await loginUser({
                login: loginValue,
                password: passwordValue
            });

            if (response && (response.success || response.status === "success"))
            {
                const data = response.data ? response.data : response;

                localStorage.setItem("secret_key", data.secret_key);
                toast.success("Успешный вход!");
                router.push("/dashboard");
            }
            else
            {
                handleBackendError(response?.message_code, response?.message);
            }
        }
        catch (error: any)
        {
            if (error instanceof TypeError || error?.message?.includes("fetch"))
            {
                handleBackendError("NETWORK_ERROR");
            }
            else
            {
                handleBackendError(error?.message_code, error?.message);
            }
        }
        finally
        {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        isAlreadyAuth,
        executeLogin
    };
}