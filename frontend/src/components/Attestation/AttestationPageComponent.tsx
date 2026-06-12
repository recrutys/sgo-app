"use client";
import {useState} from "react";
import {useAttestation} from "@/hooks/useAttestation";
import "./AttestationPage.scss";

interface GradeRow
{
    subject: string;
    mark: string | null;
    total: string | null;
}

const SemesterTable = ({title, data}: { title: string; data: GradeRow[] }) =>
{
    const sorted = Array.from(data).sort((a, b) =>
    {
        if (a.mark === "✓" && b.mark !== "✓") return -1;
        if (b.mark === "✓" && a.mark !== "✓") return 1;
        return Number(b.mark) - Number(a.mark);
    });

    return (
        <div className="block block-container block-row">
            <table className="attestation__table">
                <thead>
                    <tr className="attestation__thead-row">
                        <th className="attestation__th">
                            <span className="attestation__th-badge">{title}</span>
                        </th>
                        <th className="attestation__th">
                            <span className="attestation__th-badge">Оценка</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {sorted.length > 0 ? (
                        sorted.map((row, idx) => (
                            <tr key={idx} className="attestation__row">
                                <td className="attestation__cell attestation__subject">{row.subject}</td>
                                <td className="attestation__cell attestation__mark">{row.mark ?? "-"}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={3} className="attestation__empty">
                                Нет предметов в этом семестре
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default function AttestationPageComponent()
{
    const {attestationData, isLoading} = useAttestation();
    const courses = attestationData ? Object.keys(attestationData) : [];
    const [selectedCourse, setSelectedCourse] = useState("");

    const activeCourse = selectedCourse || courses[0] || "";
    const currentCourse = attestationData?.[activeCourse];

    if (isLoading)
    {
        return (
            <div className="block">
                <div className="block-container">
                    <div className="block-row">
                        Загрузка аттестации...
                    </div>
                </div>
            </div>
        );
    }

    if (!attestationData || courses.length === 0)
    {
        return (
            <div className="block block-container block-row">
                Данные об аттестации не найдены
            </div>
        );
    }

    return (
        <div className="attestation">
            <div className="attestation__selector">
                <select
                    value={activeCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                >
                    {courses.map((course) => (
                        <option key={course} value={course}>{course}</option>
                    ))}
                </select>
            </div>
            {currentCourse && (
                <div className="attestation__semesters">
                    <SemesterTable title="1 Семестр" data={currentCourse.semester1 ?? []} />
                    <SemesterTable title="2 Семестр" data={currentCourse.semester2 ?? []} />
                </div>
            )}
        </div>
    );
}