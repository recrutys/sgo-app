"use client";

import {useSchedule} from "@/hooks/useSchedule";
import './SchedulePage.scss';

export default function SchedulePageComponent()
{
    const {scheduleData, isLoading} = useSchedule();

    if (isLoading)
    {
        return (
            <div className="block">
                <div className="block-container">
                    <div className="block-row">
                        Загрузка расписания...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="schedule">
            {scheduleData?.map((day: any, idx: number) => (
                <div
                    key={idx}
                    className={`block block-container block-row schedule__card ${day.isToday ? "schedule__card--today" : ""} ${day.isNextWeek ? "schedule__card--next-week" : ""}`}
                >
                    <div className="schedule__header">
                        <div className="schedule__header-left">
                            <span className="schedule__day">{day.day}</span>
                            <span className="schedule__date">{day.date}</span>
                        </div>
                        {day.isToday && <span className="schedule__status">Сегодня</span>}
                        {day.isNextWeek && <span className="schedule__status">Следующая неделя</span>}
                    </div>

                    <div className="schedule__content">
                        {day.startsFromLesson > 1 && day.lessons.length > 0 && (
                            <div className="schedule__start-badge">
                                ⚡⚡ К {day.startsFromLesson}-й паре
                            </div>
                        )}

                        {day.lessons.length > 0 ? (
                            <ul className="schedule__lessons">
                                {day.lessons.map((lesson: any) => (
                                    <li key={lesson.id} className="schedule__lesson">
                                        <span className="schedule__lesson-num">{lesson.id}.</span>
                                        <span className="schedule__lesson-name">{lesson.name}</span>
                                        <span className="schedule__lesson-meta">
                                            {lesson.time} • {lesson.room} • {lesson.teacher}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="schedule__empty">Пар нет</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}