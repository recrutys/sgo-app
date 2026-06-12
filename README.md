# SGO App

Веб-приложение для работы с данными платформы «Сетевой Город. Образование» (СГО). Показывает оценки, расписание, аттестацию, экзамены и поддерживает уведомления через Telegram-бота.

**Стек:** Next.js (frontend) · NestJS (backend) · PostgreSQL · Docker Compose

---

## Структура проекта

```
sgo-app/
├── backend/          # NestJS API
├── frontend/         # Next.js приложение
└── docker-compose.yml
```

---

## Деплой

### 1. Клонировать репозиторий

```bash
git clone <repo-url> /var/www/sgo-app
cd /var/www/sgo-app
```

### 2. Создать `.env` файлы

**`backend/.env`** (на основе `backend/.env.example`):

```env
# База данных
DB_HOST=postgres
DB_PORT=5432
DB_USER=твой_юзер
DB_PASSWORD=твой_пароль
DB_NAME=имя_базы

# Порт бэкенда
PORT=4000

# Секрет для внутреннего API (Telegram-бот)
INTERNAL_SECRET=случайная_строка
```

> `DB_HOST=postgres` — обязательно именно так, это имя сервиса в Docker Compose.

**`frontend/.env`** (на основе `frontend/.env.example`):

```env
NEXT_PUBLIC_API_URL=http://твой_сервер:4000
PORT=3000
```

### 3. Собрать и запустить

```bash
docker compose up -d --build
```

Первый запуск: PostgreSQL автоматически создаст базу и юзера из `DB_*` переменных.

---

## Обновление после изменений

```bash
cd /var/www/sgo-app
docker compose up -d --build
```

Пересоберёт только изменившиеся сервисы (NestJS + Next.js), база данных не затрагивается.

Пересборка конкретного сервиса:

```bash
docker compose up -d --build backend
docker compose up -d --build frontend
```

---

## Полезные команды Docker

```bash
# Статус контейнеров
docker compose ps

# Логи всех сервисов
docker compose logs

# Логи конкретного сервиса в реальном времени
docker compose logs -f backend
docker compose logs -f frontend

# Остановить и удалить контейнеры (база не трогается)
docker compose down

# Зайти внутрь контейнера
docker compose exec backend sh
docker compose exec postgres sh

# Подключиться к PostgreSQL напрямую
docker compose exec postgres psql -U юзер -d имя_базы
```

---

## Порты

| Сервис   | Порт |
|----------|------|
| Frontend | 3000 |
| Backend  | 4000 |

---

## API — Роутинг бэкенда

Базовый URL: `http://сервер:4000`

### Аутентификация

Большинство защищённых эндпоинтов требуют заголовок:

```
x-secret-key: <ключ_сессии>
```

Ключ выдаётся при логине и хранится в таблице `sgo_users`. Срок действия ограничен (`secret_key_expires_at`).

---

### POST `/auth/login`

Вход по логину и паролю СГО. Возвращает `secret_key` для дальнейших запросов.

```json
// Body
{
  "login": "фамилия123",
  "password": "пароль"
}
```

---

### GET `/status`

Пинг бэкенда. Авторизация не нужна.

```json
{ "status": "ok" }
```

### GET `/status/sg`

Проверка доступности СГО. Авторизация не нужна.

---

### GET `/users/me`

Информация о текущем пользователе. Также запускает синхронизацию оценок если нужно.

```json
{
  "id": "uuid",
  "full_name": "Иванов Иван Иванович",
  "group_name": "11А",
  "student_id": "12345",
  "cache_last_sync_at": "2024-01-01T12:00:00Z"
}
```

### GET `/users/me/cache`

Закэшированные оценки пользователя из базы (без запроса в СГО).

---

### GET `/users/me/dashboard`

Данные для главной страницы (средний балл и т.п.).

### GET `/users/me/report`

Ведомость — полный список оценок по предметам.

### GET `/users/me/attestation`

Данные аттестации.

### GET `/users/me/exams`

Список экзаменов.

### GET `/users/me/schedule`

Расписание на текущую неделю.

### GET `/users/me/schedule-upcoming`

Ближайшие уроки (виджет на главной).

---

## Frontend — страницы

| URL                  | Компонент               | Описание              |
|----------------------|-------------------------|-----------------------|
| `/login`             | `LoginForm`             | Страница входа        |
| `/`                  | редирект на `/dashboard`| —                     |
| `/dashboard`         | `DashboardPageComponent`| Главная, виджеты      |
| `/report`            | `ReportPageComponent`   | Ведомость с оценками  |
| `/attestation`       | `AttestationPageComponent` | Аттестация         |
| `/exams`             | `ExamsPageComponent`    | Экзамены              |
| `/schedule`          | `SchedulePageComponent` | Расписание            |
| `/pages/privacy`     | —                       | Политика конфиденциальности |

---

## База данных

### Таблица `sgo_users`

| Колонка                | Тип         | Описание                              |
|------------------------|-------------|---------------------------------------|
| `user_id`              | uuid (PK)   | Идентификатор пользователя            |
| `login`                | varchar     | Логин в СГО (уникальный)              |
| `password_hash`        | varchar     | Хэш пароля                            |
| `secret_key`           | varchar     | Ключ сессии (уникальный)              |
| `secret_key_expires_at`| timestamp   | Срок действия сессии                  |
| `sgo_full_name`        | varchar     | ФИО из СГО                            |
| `sgo_group_name`       | varchar     | Класс/группа                          |
| `sgo_session`          | text        | Сессионные данные СГО                 |
| `sgo_student_id`       | varchar     | ID студента в СГО                     |
| `tg_chat_id`           | varchar     | Telegram chat ID (nullable)           |
| `cache_last_sync_at`   | timestamp   | Время последней синхронизации оценок  |

---

## Миграции

TypeORM настроен на `synchronize: true` — схема обновляется автоматически при старте бэкенда.

---

## Формат ответов API

Все ответы оборачиваются в единый формат через `ResponseInterceptor`:

```json
// Успешный ответ
{
  "success": true,
  "data": { ... }
}

// Ошибка
{
  "success": false,
  "message": "Текст ошибки",
  "message_code": "ERROR_CODE"
}
```
