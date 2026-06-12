import {Metadata} from "next";
import DashboardPageComponent from "@/components/Dashboard/DashboardPageComponent";

export const metadata: Metadata = {
    title: "Главная | Сетевой Город. Образование"
};

export default function DashboardPage()
{
    return (
        <DashboardPageComponent />
    )
}