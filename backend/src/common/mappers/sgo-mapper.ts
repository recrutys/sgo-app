// Маппинг для оценок (Five -> 5 ..)
export const MARK_MAP: Record<string, string> = {
    'Five': '5',
    'Four': '4',
    'Three': '3',
    'Two': '2',
    'Success': '✓',
    'Fail': 'н/з'
}

// Маппинг для причин отсутствия
export const ABSENCE_MAP: Record<string, string> = {
    'IsAbsentByValidReason': 'УП',
    'IsAbsentByNotValidReason': 'Н',
    'SickLeave': 'Б',
}

// Маппинг для типов экзаменов
export const TYPE_EXAM_LABELS: Record<string, string> = {
    'DifferentiatedTest': 'Дифф. зачёты',
    'Test': 'Зачёты',
    'Exam': 'Экзамены',
    'Other': 'Другой',
};