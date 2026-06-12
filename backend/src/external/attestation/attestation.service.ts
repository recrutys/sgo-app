import {Injectable, InternalServerErrorException} from '@nestjs/common';
import {HttpService} from "@nestjs/axios";
import {getSGORequestParams} from "../../common/sgo.helper";
import {firstValueFrom} from "rxjs";
import {MARK_MAP} from "../../common/mappers/sgo-mapper";
import {formatSubjectName} from "../../common/mappers/subject-mapper";

@Injectable()
export class AttestationService
{
    constructor(private readonly httpService: HttpService)
    {
    }

    async getAttestation(user: any)
    {
        // Устанавливаем данные для запроса
        const {studentId, headers} = getSGORequestParams(user);

        try
        {
            // Получаем полную аттестацию по всем 4-м курсам и всем семестрам
            const {data} = await firstValueFrom(
                this.httpService.get(
                    `https://spo.rso23.ru/services/students/${studentId}/attestation`,
                    {headers: headers as any}
                ),
            );

            /**
             * Итоговая структура ответа.
             * Ключ — номер курса, значение — оценки по семестрам.
             *
             * Пример:
             * {
             *   "1 курс": {
             *     "semester1": [{ subject: "МДК 01.01", mark: 5, total: 5 }],
             *     "semester2": [...]
             *   }
             * }
             */
            const result: Record<string, { semester1: any[], semester2: any[] }> = {};

            // Проходимся по каждому учебному году (1 курс, 2 курс, ...)
            data.academicYears.forEach((year: any) =>
            {
                const courseLabel = `${year.number} курс`;

                // СГО хранит оценки по ID семестра, достаём эти ID
                const semester1Id = year.terms[0]?.id.toString();
                const semester2Id = year.terms[1]?.id.toString();

                const semester1Grades: any[] = [];
                const semester2Grades: any[] = [];

                // Проходимся по каждому предмету и смотрим есть ли оценка в этом семестре
                data.subjects.forEach((subject: any) =>
                {
                    const formattedName = formatSubjectName(subject.name);
                    const totalMark = MARK_MAP[subject.finalMark?.value] ?? null;

                    // Если у предмета есть оценка в 1 семестре — добавляем
                    if (semester1Id && subject.marks.hasOwnProperty(semester1Id))
                    {
                        semester1Grades.push({
                            subject: formattedName,
                            mark: MARK_MAP[subject.marks[semester1Id]?.value] ?? null,
                            total: totalMark,
                        });
                    }

                    // Если у предмета есть оценка во 2 семестре - добавляем
                    if (semester2Id && subject.marks.hasOwnProperty(semester2Id))
                    {
                        semester2Grades.push({
                            subject: formattedName,
                            mark: MARK_MAP[subject.marks[semester2Id]?.value] ?? null,
                            total: totalMark,
                        });
                    }
                });

                // Добавляем курс в результат только если есть хоть какие-то оценки
                if (semester1Grades.length > 0 || semester2Grades.length > 0)
                {
                    result[courseLabel] = {
                        semester1: semester1Grades.sort((a, b) => a.subject.localeCompare(b.subject)),
                        semester2: semester2Grades.sort((a, b) => a.subject.localeCompare(b.subject)),
                    };
                }
            });

            return result;
        }
        catch (error)
        {
            throw new InternalServerErrorException({
                message: 'Не удалось получить данные аттестации',
                message_code: 'ATTESTATION_PARSE_ERROR',
            });
        }


    }
}
