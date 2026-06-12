import {Injectable, InternalServerErrorException} from '@nestjs/common';
import {HttpService} from "@nestjs/axios";
import {getSGORequestParams} from "../../common/sgo.helper";
import {MARK_MAP, TYPE_EXAM_LABELS} from "../../common/mappers/sgo-mapper";
import {formatSubjectName} from "../../common/mappers/subject-mapper";
import {firstValueFrom} from "rxjs";
import {UserUtils} from "../../common/user.utils";

@Injectable()
export class ExamsService
{
    constructor(private readonly httpService: HttpService)
    {

    }

    async getExams(user: any)
    {
        // Устанавливаем данные для запроса
        const {studentId, headers} = getSGORequestParams(user);

        try
        {
            // Получаем все экзамены, разделенные по типовым блокам (Дифф. зачеты, экзамены, прочее ...)
            const {data} = await firstValueFrom(
                this.httpService.get(
                    `https://spo.rso23.ru/services/reports/curator/group-attestation-for-student/${studentId}`,
                    {headers: headers as any}
                ),
            );

            // Инициализируем группы под каждый тип аттестации
            const groups: Record<string, any[]> = {
                'DifferentiatedTest': [],
                'Test': [],
                'Exam': [],
                'Other': [],
            };

            data.subjects.forEach((sub: any) =>
            {
                const teacher = sub.teacher;

                // Форматируем ФИО: Фамилия И.О. Если данных нет — пишем заглушку
                const formattedTeacher = UserUtils.buildShortName(teacher)

                // Достаем оценку студента по его ID из объекта marks
                const rawMark = sub.marks?.[studentId]?.value;
                const grade = MARK_MAP[rawMark] ?? null;

                const item = {
                    name: formatSubjectName(sub.name),
                    teacher: formattedTeacher,
                    grade: grade,
                };

                // Раскидываем по группам, если тип неизвестен — отправляем в 'Other'
                if (groups[sub.examinationType])
                {
                    groups[sub.examinationType].push(item);
                }
                else
                {
                    groups['Other'].push(item);
                }
            });

            // Формируем финальный массив для фронта (убираем пустые группы)
            return Object.entries(groups).filter(([_, items]) => items.length > 0).map(([type, items]) => ({
                title: TYPE_EXAM_LABELS[type] || 'Прочее',
                items: items.sort((a, b) => a.name.localeCompare(b.name)), // Сортировка по алфавиту для красоты
            }));
        }
        catch (e)
        {
            throw new InternalServerErrorException({
                message: 'Ошибка получения ведомости экзаменов',
                message_code: 'EXAMS_FETCH_ERROR',
            });
        }
    }
}
