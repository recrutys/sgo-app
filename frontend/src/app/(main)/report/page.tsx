import {Metadata} from "next";
import ReportPageComponent from "@/components/Report/ReportPageComponent";

export const metadata: Metadata = {
    title: "Ведомость | Сетевой Город. Образование"
};

export default function ReportPage()
{
    return <ReportPageComponent />
}