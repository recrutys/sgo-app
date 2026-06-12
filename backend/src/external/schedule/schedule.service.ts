import {Injectable, InternalServerErrorException} from '@nestjs/common';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import {HttpService} from "@nestjs/axios";
import {getSGORequestParams} from "../../common/sgo.helper";
import {firstValueFrom} from "rxjs";
import {formatSubjectName} from "../../common/mappers/subject-mapper";
import {UserUtils} from "../../common/user.utils";

dayjs.locale('ru');

@Injectable()
export class ScheduleService
{
    constructor(private readonly httpService: HttpService)
    {
    }

    async getSchedule(user: any): Promise<any>
    {
        // Устанавливаем данные для запроса
        const {studentId, headers} = getSGORequestParams(user);

        try
        {
            // Находим понедельник текущей недели
            let startDate = dayjs().day(1);

            /**
             * В JS нулевой день - воскресенье.
             * Если пользователь зашёл в воскресенье, то надо его отбросить назад
             * чтобы точно взять понедельник
             */
            if (dayjs().day() === 0)
            {
                startDate = dayjs().subtract(1, 'week').day(1);
            }

            // Конечная дата - старт + 7 дней (то есть понедельник следующей недели)
            const endDate = startDate.add(7, 'day');

            // Фиксируем сегодняшнюю дату, чтобы потом подсветить "текущий день"
            const todayDate = dayjs().format('DD.MM.YYYY');

            // Получаем подробное расписание из СГО
            const {data} = await firstValueFrom(
                this.httpService.get(
                    `https://spo.rso23.ru/services/students/${studentId}/lessons/${startDate.format('YYYY-MM-DD')}/${endDate.format('YYYY-MM-DD')}`,
                    {headers: headers as any}
                )
            );

            const days: any = [];
            for (let i = 0; i < 8; i++)
            {
                // Вычисляем дату конкретного дня в цикле (Понедельник, Вторник... и так 8 раз)
                const currentDay = startDate.add(i, 'day');
                const dateISO = currentDay.format('YYYY-MM-DD');
                const dateDisplay = currentDay.format('DD.MM.YYYY');

                // Ищем в данных от СГО уроки именно для этой даты
                const dayData = data.find((item: any) => item.date.startsWith(dateISO));
                const rawLessons = dayData?.lessons || [];

                const formattedLessonsList: any[] = [];
                let firstRealLessonNumber = 0; // По умолчанию 0 (значит, пар сегодня нет)

                // Ищем номер самой первой реальной пары в этот день
                for (let idx = 0; idx < rawLessons.length; idx++)
                {
                    // Проверяем, что поле name существует (не undefined и не null)
                    if (rawLessons[idx] && rawLessons[idx].name)
                    {
                        // Как только нашли пару с названием — фиксируем её номер (индекс + 1)
                        firstRealLessonNumber = idx + 1;
                        break;
                    }
                }

                // Форматируем и собираем только существующие уроки
                for (let idx = 0; idx < rawLessons.length; idx++)
                {
                    const lesson = rawLessons[idx];

                    // Если у урока нет названия или времени (пустое окно) — пропускаем
                    if (!lesson.name || !lesson.startTime || !lesson.endTime)
                    {
                        continue;
                    }

                    // Форматируем преподавателя: "Петров Петр Петрович" -> "Петров П.П."
                    const teacherName = UserUtils.buildShortName(lesson.timetable?.teacher);

                    // Форматируем аудиторию -> "ауд. 2-405"
                    const c = lesson.timetable?.classroom;
                    const roomName = c ? `ауд. ${c.buildingName}-${c.name}` : '—';

                    // Пушим урок в список
                    formattedLessonsList.push({
                        id: idx + 1, // Реальный номер пары по порядку (1, 2, 3...)
                        name: formatSubjectName(lesson.name),
                        time: `${lesson.startTime} — ${lesson.endTime}`,
                        room: roomName,
                        teacher: teacherName,
                    });
                }

                // Получаем название дня недели ("пн", "вт")
                const dayName = currentDay.format('dd');

                // Сохраняем готовый день со всеми флагами
                days.push({
                    day: dayName.charAt(0).toUpperCase() + dayName.slice(1),
                    date: dateDisplay,
                    isToday: dateDisplay === todayDate,
                    isNextWeek: i === 7, // 8-й день — это понедельник следующей недели
                    startsFromLesson: firstRealLessonNumber, // Отдаем точный номер первой живой пары
                    lessons: formattedLessonsList,
                });
            }

            return days;
        }
        catch (error)
        {
            throw new InternalServerErrorException({
                message: 'Ошибка парсинга расписания',
                message_code: 'SCHEDULE_PARSE_ERROR',
            });
        }
    }
}