"use client";

import {useDashboard} from "@/hooks/useDashboard";
import ScheduleUpcomingWidget from "@/components/Dashboard/Widget/ScheduleUpcomingWidget";
import "./DashboardPage.scss";

export default function DashboardPageComponent()
{
    const {grades, isLoading} = useDashboard();

    if (isLoading)
    {
        return (
            <div className="block">
                <div className="block-container">
                    <div className="block-row">
                        Загрузка успеваемости...
                    </div>
                </div>
            </div>
        );
    }

    if (grades.length === 0)
    {
        return (
            <div className="block">
                <div className="block-container">
                    <div className="block-row">
                        Нет данных об оценках
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mainPage__container has-sidebar">
            <aside className="mainPage__sidebar">
                <ScheduleUpcomingWidget />
            </aside>

            <div className="mainPage__content">
                <div className="mainPage__grades-container">
                    {grades.map((grade: any) => (
                        <div key={grade.id} className="block">
                            <div className="block-container mainPage__grade-item">
                                <span className="mainPage__grade-item--name">{grade.name}</span>
                                <span className={`mainPage__grade-item--grade-badge ${grade.status === "good" ? "is-green" : "is-red"}`}>
                                    {grade.value}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}