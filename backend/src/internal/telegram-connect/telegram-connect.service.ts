import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {TelegramTokenEntity} from "./entity/telegram-token.entity";
import {Repository} from "typeorm";
import {UserEntity} from "../users/entity/user.entity";
import * as crypto from 'crypto';
import {ConfigService} from "@nestjs/config";
import {HttpService} from "@nestjs/axios";
import {firstValueFrom} from "rxjs";

@Injectable()
export class TelegramConnectService
{
    constructor(
        @InjectRepository(TelegramTokenEntity)
        private readonly tokenRepo: Repository<TelegramTokenEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>,
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
    )
    {
    }

    // Бот вызывает метод, когда юзер пишет /connect
    async createToken(chatId: string): Promise<any>
    {
        // Проверяем, не привязан ли пользователь ранее
        const alreadyConnected = await this.userRepo.findOne({
            where: {
                tg_chat_id: chatId
            }
        });

        if (alreadyConnected)
        {
            return {
                error: 'already_connected'
            };
        }

        // Проверяем нет ли уже живого токена
        const isExistingKey = await this.tokenRepo.findOne({
            where: {
                chat_id: chatId
            }
        });

        if (isExistingKey && isExistingKey.expires_at > new Date())
        {
            const minutesLeft = Math.ceil((isExistingKey.expires_at.getTime() - Date.now()) / 60000);

            return {
                error: 'token_exists',
                minutes_left: minutesLeft
            };
        }

        // Удаляем старый, если истёк
        if (isExistingKey) await this.tokenRepo.delete({
            chat_id: chatId
        });

        // Создаем новый
        const token = this.generateToken();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 минут

        await this.tokenRepo.save(
            this.tokenRepo.create({
                token,
                chat_id: chatId,
                expires_at: expiresAt
            }),
        );

        return {token}
    }

    // Фронтенд вызывает, когда пользователь открыл ссылку /telegram-connect
    async getTokenInfo(token: string): Promise<any>
    {
        const record = await this.tokenRepo.findOne({
            where: {token}
        });

        // Если токена нет, или он истек - возвращаем null
        if (!record || record.expires_at < new Date()) return null;

        // Если есть - вовзараем Telegram chat_id пользователя
        return {
            chat_id: record.chat_id
        };
    }

    // Фронтенд вызывает когда юзер нажал "Подключить" на странице подтверждения
    async confirmToken(token: string, userId: string): Promise<boolean>
    {
        const record = await this.tokenRepo.findOne({
            where: {token}
        });

        // Если токена нет, или он истек - возвращаем false
        if (!record || record.expires_at < new Date()) return false;

        // Если токен есть - обновляем пользователя, добавляем к нему Telegram chat_id
        await this.userRepo.update({
            user_id: userId
        }, {
            tg_chat_id: record.chat_id
        });

        // Удаляем временный токен из таблицы sgo_tg_tokens
        await this.tokenRepo.delete({
            token
        });

        await this.sendTelegramMessage(
            record.chat_id,
            '✅ Аккаунт успешно привязан! Теперь вы будете получать уведомления об оценках.'
        );

        return true;
    }

    // Фронтенд вызывает, когда пользователь жмёт "Отвязать телеграм"
    async disconnect(userId: string): Promise<boolean>
    {
        await this.userRepo.update({
            user_id: userId
        }, {
            tg_chat_id: null
        });

        return true;
    }

    // Получить статус подключения
    async getStatus(user: UserEntity)
    {
        if (!user.tg_chat_id) return {
            connected: false
        };

        return {
            connected: true,
            chat_id: user.tg_chat_id,
        };
    }

    // Отключение пользователя через бота
    async disconnectByChatId(chatId)
    {
        await this.userRepo.update(
            {
                tg_chat_id: chatId
            },
            {
                tg_chat_id: null
            }
        );

        return {
            success: true
        };
    }

    private generateToken(): string
    {
        return crypto.randomBytes(32).toString('hex');
    }

    private async sendTelegramMessage(chatId: string, text: string): Promise<void>
    {
        try
        {
            await firstValueFrom(
                this.httpService.post(
                    `https://api.telegram.org/bot${this.configService.get('TG_BOT_TOKEN')}/sendMessage`,
                    {chat_id: chatId, text}
                )
            );
        }
        catch (e)
        {
            console.error('DEBUG TELEGRAM: ', e);
        }
    }
}
