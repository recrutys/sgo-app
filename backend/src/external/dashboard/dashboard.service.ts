import {Injectable, InternalServerErrorException, UnauthorizedException} from '@nestjs/common';
import {HttpService} from "@nestjs/axios";
import {getSGORequestParams} from "../../common/sgo.helper";
import {firstValueFrom} from "rxjs";
import {formatSubjectName} from "../../common/mappers/subject-mapper";

@Injectable()
export class DashboardService
{
    constructor(private readonly httpService: HttpService)
    {
    }

    async getDashboard(user: any): Promise<any>
    {
        // Устанавливаем данные для запроса
        const {studentId, headers} = getSGORequestParams(user);

        try
        {
            // Получаем средние баллы из СГО
            const {data} = await firstValueFrom(
                this.httpService.get(
                    `https://spo.rso23.ru/services/students/${studentId}/dashboard`,
                    {headers: headers as any}
                )
            );

            // Если нет данных от СГО, возвращаем пустой массив
            if (!data || !data.subjects)
            {
                return [];
            }

            // Если есть, то.. сортируем массив по убыванию оценок
            data.subjects.sort((a: any, b: any) =>
            {
                const markA = a.mark ?? 0;
                const markB = b.mark ?? 0;
                return markB - markA; // "от большего к меньшему"
            });

            const result: any[] = [];

            // Циклом перебираем предметы и сделаем объекты
            for (let i = 0; i < data.subjects.length; i++)
            {
                const subject = data.subjects[i];
                const mark = subject.mark || 0;

                let status = 'bad';
                if (mark >= 4.0)
                {
                    status = 'good';
                }

                // Форматируем строку оценки, например: 4.9123 -> "4,91"
                const formattedMark = mark.toFixed(2).replace('.', ',');

                // Добавляем в итоговый массив
                result.push({
                    id: i + 1,
                    name: formatSubjectName(subject.name),
                    value: formattedMark,
                    status: status
                });
            }

            return result;
        }
        catch (error)
        {
            if (error?.response?.status === 401)
            {
                throw new UnauthorizedException({
                    message: 'Сессия Сетевого Города истекла. Войдите заново',
                    message_code: 'SGO_SESSION_EXPIRED',
                });
            }

            throw new InternalServerErrorException({
                message: 'Ошибка при получении успеваемости',
                message_code: 'DASHBOARD_FETCH_ERROR',
            });
        }
    }
}
