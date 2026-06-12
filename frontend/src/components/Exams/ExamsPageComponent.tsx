"use client";
import {useExams} from "@/hooks/useExams";
import "./ExamsPage.scss";

interface ExamItem
{
    name: string;
    teacher: string;
    grade: string | null;
}

interface ExamSection
{
    title: string;
    items: ExamItem[];
}

export default function ExamsPageComponent()
{
    const {examsData, isLoading} = useExams();

    if (isLoading)
    {
        return (
            <div className="block block-container block-row">
                Загрузка экзаменов...
            </div>
        );
    }

    return (
        <div className="exams">
            {examsData.map((section: ExamSection, idx: number) =>
            {
                const sortedItems = [...section.items].sort((a, b) =>
                {
                    if (a.grade === "✓" && b.grade !== "✓") return -1;
                    if (b.grade === "✓" && a.grade !== "✓") return 1;
                    return Number(b.grade) - Number(a.grade);
                });

                return (
                    <div key={idx} className="block block-container block-row exams__section">
                        <div className="exams__header">
                            <span className="exams__badge">{section.title}</span>
                            <span className="exams__badge">Оценка</span>
                        </div>
                        <div className="exams__items">
                            {sortedItems.map((item, itemIdx) => (
                                <div key={itemIdx} className="exams__row">
                                    <div className="exams__info">
                                        <span className="exams__name">{item.name}</span>
                                        <span className="exams__teacher">{item.teacher}</span>
                                    </div>
                                    <span className="exams__grade">{item.grade ?? "-"}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}