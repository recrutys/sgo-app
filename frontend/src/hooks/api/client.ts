export async function apiClient(endpoint: string, method: string = "GET", body: any = null, timeout: number | null = null): Promise<any>
{
    if (typeof window === "undefined") return;

    const secretKey = localStorage.getItem("secret_key");
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
    const url = `${apiBaseUrl?.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;

    const headers: any = {"Content-Type": "application/json"};
    if (secretKey) headers["x-secret-key"] = secretKey;

    const config: any = {method, headers};
    if (body) config.body = JSON.stringify(body);

    // Вспомогательная функция для обработки ответа (чтобы не дублировать код ниже)
    const handleResponse = async (res: Response) =>
    {
        if (!res.ok)
        {
            let errorData;
            try
            {
                // Пытаемся распарсить JSON ошибки от бэкенда
                errorData = await res.json();
            }
            catch
            {
                // Если бэк упал совсем и выдал не JSON, а HTML-страницу ошибки
                throw Object.assign(new Error(`Ошибка запроса: ${res.statusText}`), {code: "NETWORK_ERROR"});
            }

            // Если сессия истекла или такого ключа нет - редирект на авторизацию
            if (
                res.status === 401
                && (
                    errorData?.message_code === "SECRET_KEY_EXPIRED"
                    || errorData?.message_code === "INVALID_SECRET_KEY"
                    || errorData?.message_code === "SGO_SESSION_EXPIRED"
                )
            )
            {
                localStorage.removeItem("secret_key");
                window.location.replace("/login?reason=session_expired");
                return;
            }

            // Прокидываем данные ошибки от бэка дальше в catch компонента
            throw errorData;
        }
        return res.json();
    };

    if (timeout)
    {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);

        try
        {
            const response = await fetch(url, {...config, signal: controller.signal});
            clearTimeout(timer);
            return await handleResponse(response);
        }
        catch (e: any)
        {
            clearTimeout(timer);
            if (e.name === "AbortError") throw Object.assign(new Error("timeout"), {code: "TIMEOUT"});
            // Если это уже объект ошибки от бэка, просто пускаем его дальше
            if (e.status === "error" || e.message_code) throw e;
            throw Object.assign(e, {code: "NETWORK_ERROR"});
        }
    }

    const response = await fetch(url, config);
    return await handleResponse(response);
}