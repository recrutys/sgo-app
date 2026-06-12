"use client";

import {useScheduleUpcoming} from "@/hooks/useScheduleUpcoming";
import "./ScheduleUpcoming.scss";

export default function ScheduleUpcomingWidget()
{
    const {data, isLoading} = useScheduleUpcoming();

    if (isLoading || !data) return (
        <div className="block">
            <div className="block-container">
                <div className="block-row">
                    Загрузка ближайших пар...
                </div>
            </div>
        </div>
    );

    return (
        <>
            {data.map((day: any, index: number) => (
                <div key={index} className="block">
                    <div className="block-container">
                        <div className="block-row">
                            <div className="widget-header">Пары {day.title.toLowerCase()}</div>

                            {day.startsFromSecond && (
                                <div className="widget-badge">⚡⚡ К {day.lessons[0].id}-й паре</div>
                            )}

                            <ul className="lesson-list">
                                {day.lessons.length > 0 ? day.lessons.map((lesson: any) => (
                                    <li key={lesson.id}
                                        className={`lesson-item ${lesson.isNext ? "is-next" : ""} ${lesson.isCurrent ? "is-current" : ""}`}>
                                        <div className="lesson-info">
                                            <span className="lesson-number">{lesson.id}.</span>
                                            <span className="lesson-name">{lesson.name}</span>
                                        </div>
                                        <div className="lesson-time">
                                            {lesson.start} → {lesson.end}
                                            {lesson.isCurrent && <span className="current-badge">идёт сейчас</span>}
                                        </div>
                                    </li>
                                )) : <div className="no-lessons">Пар нет</div>}
                            </ul>
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
}