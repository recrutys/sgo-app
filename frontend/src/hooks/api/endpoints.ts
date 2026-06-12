import { apiClient } from "@/hooks/api/client";

export const getMe = () => apiClient("/users/me", "GET");

// Авторизация
export const loginUser = (credentials: any) => apiClient("/auth/login", "POST", credentials);

// Средний балл на главной
export const getMeDashboard = () => apiClient("/users/me/dashboard", "GET");

export const getMeAttestation = () => apiClient("/users/me/attestation", "GET");
export const getMeExams = () => apiClient("/users/me/exams", "GET");

// Расписание
export const getMeScheduleUpcoming = () => apiClient("/users/me/schedule-upcoming", "GET");
export const getMeSchedule = () => apiClient("/users/me/schedule", "GET");

// Ведомость
export const getMeReport = () => apiClient("/users/me/report", "GET");

// Telegram эндпоинты
export const getTelegramStatus = () => apiClient("/telegram-connect/status", "GET");
export const connectTelegram = (token: string) => apiClient(`/telegram-connect/connect/${token}`, "POST");
export const disconnectTelegram = () => apiClient("/telegram-connect/disconnect", "DELETE");

// Кэшированные оценки
export const getMeCache = () => apiClient("/users/me/cache", "GET");

// Пинг сетевого
export const getStatusSg = () => apiClient("/status/sg", "GET");
export const getStatus = () => apiClient("/status", "GET");