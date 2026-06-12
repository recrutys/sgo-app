import {useState, useMemo} from "react";
import "./GradeCalculator.scss";

type RealMark = {
    id: string;
    date: string;
    val: number;
    ignored: boolean;
};

function parseMark(val: string): number | null
{
    const n = parseInt(val.trim(), 10);
    return isNaN(n) ? null : n;
}

function flattenMarks(subjectData: any): RealMark[]
{
    if (!subjectData?.marks) return [];

    const result: RealMark[] = [];

    for (const mark of subjectData.marks)
    {
        for (const day of mark.dates)
        {
            for (const raw of day.val.toString().split(","))
            {
                const n = parseMark(raw);
                if (n !== null)
                {
                    result.push({
                        id: Math.random().toString(36).slice(2, 9),
                        date: day.date,
                        val: n,
                        ignored: false,
                    });
                }
            }
        }
    }

    return result;
}

export default function GradeCalculator({subjectData}: { subjectData: any })
{
    const [realMarks, setRealMarks] = useState<RealMark[]>(() => flattenMarks(subjectData));
    const [simMarks, setSimMarks] = useState<number[]>([]);

    const sortedRealMarks = useMemo(
        () => [...realMarks].sort((a, b) => a.val - b.val),
        [realMarks]
    );

    const average = useMemo(() =>
    {
        const active = realMarks.filter(m => !m.ignored).map(m => m.val);
        const all = [...active, ...simMarks];
        if (!all.length) return "0.00";
        return (all.reduce((s, v) => s + v, 0) / all.length).toFixed(2);
    }, [realMarks, simMarks]);

    const toggleIgnore = (id: string) =>
        setRealMarks(prev => prev.map(m => m.id === id ? {...m, ignored: !m.ignored} : m));

    const addSim = (val: number) => setSimMarks(prev => [...prev, val]);
    const removeSim = (idx: number) => setSimMarks(prev => prev.filter((_, i) => i !== idx));

    return (
        <div className="grade-calculator">
            <div className="grade-calculator__header">
                <h4 className="grade-calculator__title">
                    Средний балл: <span className="grade-calculator__avg">{average}</span>
                </h4>
            </div>

            <div className="grade-calculator__controls">
                <p className="grade-calculator__controls-label">Добавить оценку:</p>
                <div className="grade-calculator__buttons">
                    {[5, 4, 3].map(v => (
                        <button
                            key={v}
                            className={`grade-calculator__btn grade-calculator__btn--${v}`}
                            onClick={() => addSim(v)}
                        >
                            + {v}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grade-calculator__marks">
                {simMarks.map((val, idx) => (
                    <div
                        key={`sim-${idx}`}
                        className="grade-calculator__mark grade-calculator__mark--sim"
                        onClick={() => removeSim(idx)}
                        title="Удалить"
                    >
                        Новая — <b>{val}</b>
                        <span className="grade-calculator__remove">&times;</span>
                    </div>
                ))}

                {sortedRealMarks.map(m => (
                    <div
                        key={m.id}
                        className={[
                            "grade-calculator__mark",
                            `grade-calculator__mark--${m.val}`,
                            m.ignored ? "grade-calculator__mark--ignored" : "",
                        ].filter(Boolean).join(" ")}
                        onClick={() => m.val <= 4 && toggleIgnore(m.id)}
                        title={m.val <= 4 ? (m.ignored ? "Вернуть оценку" : "Не учитывать") : ""}
                    >
                        {m.date} — <b>{m.val}</b>
                    </div>
                ))}
            </div>
        </div>
    );
}