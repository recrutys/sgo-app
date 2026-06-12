import {Injectable, InternalServerErrorException} from '@nestjs/common';
import {UserUtils} from "../../common/user.utils";
import {formatSubjectName} from "../../common/mappers/subject-mapper";
import {getSGORequestParams} from "../../common/sgo.helper";
import {firstValueFrom} from "rxjs";
import {HttpService} from "@nestjs/axios";
import dayjs from "dayjs";
import 'dayjs/locale/ru';

dayjs.locale('ru');

@Injectable()
export class ScheduleUpcomingService
{
    constructor(private readonly httpService: HttpService)
    {
    }

    /**
     * Получение расписания для виджета "Пары сегодня" и "Пары завтра"
     */
    async getScheduleUpcoming(user: any): Promise<any[]>
    {
        // Устанавливаем данные для запроса
        const {studentId, headers} = getSGORequestParams(user);

        const {startOfWeek, endOfWeek} = this.getWeekBounds();

        try
        {
            const {data} = await firstValueFrom(
                this.httpService.get(
                    `https://spo.rso23.ru/services/students/${studentId}/lessons/${startOfWeek}/${endOfWeek}`,
                    {headers: headers as any}
                ),
            );

            const now = dayjs();
            const todayISO = now.format('YYYY-MM-DD');
            const tomorrowISO = now.add(1, 'day').format('YYYY-MM-DD');

            return [
                this.buildDaySchedule(data, todayISO, 'Сегодня'),
                this.buildDaySchedule(data, tomorrowISO, 'Завтра')
            ];
        }
        catch (e)
        {
            throw new InternalServerErrorException({
                message: 'Не удалось получить расписание для виджета',
                message_code: 'WIDGET_SCHEDULE_ERROR',
            });
        }
    }

    /**
     * Вычисляет границы текущей (или прошлой, если сегодня воскресенье) недели для СГО
     */
    private getWeekBounds(): { startOfWeek: string; endOfWeek: string }
    {
        const now = dayjs();
        let start = now.day(1);

        if (now.day() === 0)
        {
            start = now.subtract(1, 'week').day(1);
        }

        return {
            startOfWeek: start.format('YYYY-MM-DD'),
            endOfWeek: start.add(7, 'day').format('YYYY-MM-DD')
        };
    }

    /**
     * Собирает и форматирует данные расписания на конкретный день
     */
    private buildDaySchedule(apiData: any, dateISO: string, title: string): any
    {
        const dayData = apiData.find((item: any) => item.date.startsWith(dateISO));

        if (!dayData || !dayData.lessons)
        {
            return {title, startsFromSecond: false, lessons: []};
        }

        const rawLessons = dayData.lessons;
        const startsFromSecond = rawLessons.length > 0 && !rawLessons[0].name;

        const currentMinutes = dayjs().hour() * 60 + dayjs().minute();
        const isToday = title === 'Сегодня';
        let foundNext = false;

        const lessons = rawLessons.map((lesson, idx) => ({
            ...lesson,
            realId: idx + 1
        })).filter((lesson: any): lesson is any & { realId: number } => !!lesson.name).map((lesson: any) =>
        {
            const startTotal = UserUtils.timeToMinutes(lesson.startTime);
            const endTotal = UserUtils.timeToMinutes(lesson.endTime);

            const isCurrent = isToday && currentMinutes >= startTotal && currentMinutes <= endTotal;

            let isNext = false;
            if (isToday && !isCurrent && currentMinutes < startTotal && !foundNext)
            {
                isNext = true;
                foundNext = true;
            }

            return {
                id: lesson.realId,
                name: formatSubjectName(lesson.name!),
                start: lesson.startTime,
                end: lesson.endTime,
                isCurrent,
                isNext,
            };
        });

        return {
            title,
            startsFromSecond,
            lessons,
        };
    }
}
