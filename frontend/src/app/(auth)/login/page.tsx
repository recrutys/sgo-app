import LoginForm from "@/components/Login/LoginForm";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: "Авторизация | Сетевой Город. Образование"
};

export default function LoginPage()
{
    return (
		<Suspense fallback={<div>Загрузка...</div>}>
			<LoginForm />
	    </Suspense>
    );
}