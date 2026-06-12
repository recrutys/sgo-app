"use client";

import './ReportPage.scss';

import {useReport} from "@/hooks/useReport";
import Modal from "@/components/UI/Modal/Modal";
import GradeCalculator from "@/components/Report/GradeCalculator/GradeCalculator";
import {useEffect, useState} from "react";
import {toast} from "sonner";

export default function ReportPageComponent({
    isOffline = false
}: {
    isOffline?: boolean
})
{
    const {grades, isLoading} = useReport(isOffline);

    // Для калькулятора
    const [selectedSubject, setSelectedSubject] = useState<any | null>(null);

    // Добавляем useEffect для подсказки
    useEffect(() =>
    {
        // Проверяем, что загрузка закончилась и есть предметы
        if (!isLoading && grades && grades.length > 0)
        {
            // Проверяем, показывали ли мы уже подсказку
            const hasSeenHint = localStorage.getItem("sgo_calc_hint_shown");

            if (!hasSeenHint)
            {
                // Показываем тост с задержкой в 1 секунду для плавности
                const timer = setTimeout(() =>
                {
                    toast.info('Подсказка: Нажмите на любой предмет, чтобы прогнозировать средний балл', {
                        duration: 6000,
                    });

                    // Записываем в память, чтобы больше не спамить
                    localStorage.setItem("sgo_calc_hint_shown", "true");
                }, 1000);

                return () => clearTimeout(timer);
            }
        }
    }, [isLoading, grades]);

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

    const isBadMark = (val: string) => ['2', 'Н', 'УП'].some(bad => val.includes(bad));

    return (
        <div className="report">
            {grades.map((item: any) => (
                <div key={item.id} className="block report__card block-container"
                     onClick={() => setSelectedSubject(item)}>
                    <div className="report__header block-row">
                        <span className="report__subject">{item.subject}</span>
                        <span className={`report__total ${item.status === "good" ? "report__total--good" : "report__total--bad"}`}>
                            {item.total}
                        </span>
                    </div>
                    <div className="report__content block-row">
                        {item.marks && item.marks.length > 0 ? item.marks.map((m: any, idx: number) => (
                            <div key={idx} className="report__month">
                                <span className="report__month-label">{m.month}</span>
                                {m.dates.map((d: any, dIdx: number) => (
                                    <span key={dIdx} className="report__mark">
                                        {d.date} — <b className={isBadMark(d.val) ? "report__mark--bad" : ""}>{d.val}</b>
                                        {dIdx < m.dates.length - 1 && ", "}
                                    </span>
                                ))}
                            </div>
                        )) : (
                            <span className="report__empty">Оценок пока нет</span>
                        )}
                    </div>
                </div>
            ))}

            <Modal
                isOpen={!!selectedSubject}
                onClose={() => setSelectedSubject(null)}
                title={selectedSubject?.subject || "Калькулятор"}
            >
                {selectedSubject && <GradeCalculator subjectData={selectedSubject} />}
            </Modal>
        </div>
    );
}