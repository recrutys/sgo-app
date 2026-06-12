import {Metadata} from "next";
import SchedulePageComponent from "@/components/Schedule/SchedulePageComponent";

export const metadata: Metadata = {
    title: "Расписание | Сетевой Город. Образование"
};

export default function SchedulePage()
{
    return <SchedulePageComponent />
}