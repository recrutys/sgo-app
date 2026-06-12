import {Metadata} from "next";
import ExamsPageComponent from "@/components/Exams/ExamsPageComponent";

export const metadata: Metadata = {
    title: "Экзамены | Сетевой Город. Образование"
};

export default function ExamsPage()
{
    return <ExamsPageComponent />;
}