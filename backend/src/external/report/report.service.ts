import {Injectable, InternalServerErrorException} from '@nestjs/common';
import {HttpService} from "@nestjs/axios";
import {getSGORequestParams} from "../../common/sgo.helper";
import {firstValueFrom} from "rxjs";
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import {formatSubjectName} from "../../common/mappers/subject-mapper";
import {ABSENCE_MAP, MARK_MAP} from "../../common/mappers/sgo-mapper";

dayjs.locale('ru');

@Injectable()
export class ReportService
{
    constructor(private readonly httpService: HttpService)
    {
    }

    async getReport(user: any): Promise<any>
    {
        // Устанавливаем данные для запроса
        const {studentId, headers} = getSGORequestParams(user);

        try
        {
            // Получаем отчетную ведомость из СГО
            const {data} = await firstValueFrom(
                this.httpService.get(
                    `https://spo.rso23.ru/services/reports/current/performance/${studentId}`,
                    {headers: headers as any}
                )
            )

            // Если нет данных от СГО, возвращаем пустой массив
            if (!data || !data.daysWithMarksForSubject)
            {
                return [];
            }

            // Группируем
            const sortedSubjects = data.daysWithMarksForSubject.map(item => ({
                subject: item.subjectName,
                avgNumeric: item.averageMark || 0,
                marks: this.groupMarksByMonth(item.daysWithMarks)
            }))
                // Сортируем по убыванию
                .sort((a: any, b: any) => b.avgNumeric - a.avgNumeric);

            // Собираем финальный ответ
            const result: any[] = [];
            for (let i = 0; i < sortedSubjects.length; i++)
            {
                const item = sortedSubjects[i];

                let status: 'good' | 'bad' | 'neutral' = 'neutral';
                if (item.avgNumeric >= 4.0) status = 'good';
                else if (item.avgNumeric > 0) status = 'bad';

                result.push({
                    id: i + 1,
                    subject: formatSubjectName(item.subject),
                    total: item.avgNumeric.toFixed(2).replace('.', ','),
                    status,
                    marks: item.marks
                });
            }

            return result;
        }
        catch (error)
        {
            throw new InternalServerErrorException({
                message: 'Ошибка формирования отчета успеваемости',
                message_code: 'REPORT_FETCH_ERROR',
            });
        }
    }

    private groupMarksByMonth(daysWithMarks: any): any
    {
        const monthsGroup: Record<string, any> = {};

        for (const dayMark of daysWithMarks)
        {
            const d = dayjs(dayMark.day);
            const monthName = d.format('MMM');
            const dateStr = d.format('DD.MM');

            if (!monthsGroup[monthName])
            {
                const formattedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
                monthsGroup[monthName] = {month: formattedMonth, dates: []};
            }

            const dayValues = dayMark.markValues.map(val => MARK_MAP[val] || val);
            if (dayMark.absenceType)
            {
                dayValues.push(ABSENCE_MAP[dayMark.absenceType] || 'Н');
            }

            if (dayValues.length > 0)
            {
                monthsGroup[monthName].dates.push({
                    date: dateStr,
                    val: dayValues.join(', ')
                });
            }
        }

        return Object.values(monthsGroup);
    }
}
