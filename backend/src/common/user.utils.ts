export class UserUtils
{
    /**
     * Формирует имя в формате "Фамилия И.О." или "Фамилия И."
     * Подходит и для студентов, и для преподавателей
     */
    static buildShortName(person?: {
        lastName?: string | null;
        firstName?: string | null;
        middleName?: string | null
    }): string
    {
        if (!person || !person.lastName)
        {
            return 'Не указан';
        }

        const lastName = person.lastName.trim();
        const firstInitial = person.firstName?.trim() ? `${person.firstName.trim()[0]}.` : '';
        const middleInitial = person.middleName?.trim() ? `${person.middleName.trim()[0]}.` : '';

        // Соединяем инициалы вместе, например: "П.П."
        const initials = `${firstInitial}${middleInitial}`;

        // Если инициалов нет вообще, вернется просто Фамилия, иначе — Фамилия И.О.
        return initials ? `${lastName} ${initials}` : lastName;
    }

    /**
     * Переводит строковое время "ЧЧ:ММ" в количество минут от начала дня
     */
    static timeToMinutes(timeStr: string): number
    {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }
}