import {Controller, Delete, Get, Param, Post, Query, Req, UnauthorizedException, UseGuards} from '@nestjs/common';
import {TelegramConnectService} from './telegram-connect.service';
import {InternalSecretGuard} from "../../common/guards/internal-secret.guard";
import {IsNull, Not, Repository} from "typeorm";
import {SecretKeyGuard} from "../../common/guards/secret-key.guard";
import {CurrentUser} from "../../common/decorators/user.decorator";
import {ReportService} from "../../external/report/report.service";
import {UserEntity} from "../users/entity/user.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {UsersService} from "../users/users.service";

@Controller('telegram-connect')
export class TelegramConnectController
{
    constructor(
        private readonly telegramConnectService: TelegramConnectService,
        private readonly usersService: UsersService,
        private readonly reportService: ReportService,
        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>
    )
    {
    }

    // Методы для Telegram-бота (internal)

    // Создание токена для связи с Telegram ботом
    @Post('internal/token/:chat_id')
    @UseGuards(InternalSecretGuard)
    async createToken(@Param('chat_id') chatId: string)
    {
        return await this.telegramConnectService.createToken(chatId);
    }

    // Получение пользователей, подключенных к Telegram боту
    @Get('internal/active-users')
    @UseGuards(InternalSecretGuard)
    async getActiveUsers()
    {
        return await this.userRepo.find({
            where: {
                tg_chat_id: Not(IsNull())
            }
        });
    }

    // Получение кэшированных оценок по Telegram ID (связь с внешней колонкой tg_chat_id)
    @Get('internal/grades/:tg_chat_id')
    @UseGuards(InternalSecretGuard)
    async getGrades(
        @Param('tg_chat_id') tgChatId: string,
        @Query('force') force: string
    )
    {
        const user: any = await this.userRepo.findOne({
            where: {
                tg_chat_id: tgChatId
            }
        });

        if (!user)
        {
            throw new UnauthorizedException({
                message: 'Пользователь не найден',
                message_code: 'USER_NOT_FOUND'
            });
        }

        if (force === 'true')
        {
            return await this.reportService.getReport(user as any);
        }

        const cachedGrades: any = this.usersService.getCachedGrades(user.user_id);

        return cachedGrades ? cachedGrades.data : [];
    }

    // Вызывается когда пользователь пишет /disconnect в боте
    @Delete('internal/disconnect/:chat_id')
    @UseGuards(InternalSecretGuard)
    async disconnectByChatId(@Param('chat_id') chatId: string)
    {
        return await this.telegramConnectService.disconnectByChatId(chatId);
    }

    // Методы для пользователя (Public)

    // GET(!) чтобы узнать информацию о токене
    @Get('connect/:token')
    @UseGuards(SecretKeyGuard)
    async getTokenInfo(@Param('token') token: string)
    {
        return await this.telegramConnectService.getTokenInfo(token);
    }

    // POST(!) чтобы создать связь с Telegram ботом
    @Post('connect/:token')
    @UseGuards(SecretKeyGuard)
    async confirmConnect(@Param('token') token: string, @CurrentUser() user: any)
    {
        return await this.telegramConnectService.confirmToken(token, user.user_id);
    }

    // DELETE(!) для разъединения связи с Telegram ботом
    @Delete('disconnect')
    @UseGuards(SecretKeyGuard)
    async disconnect(@CurrentUser() user: any)
    {
        return await this.telegramConnectService.disconnect(user.user_id);
    }

    // Возвращает статус подключения пользователя к Telegram
    @Get('status')
    @UseGuards(SecretKeyGuard)
    async getStatus(@CurrentUser() user: any)
    {
        return await this.telegramConnectService.getStatus(user);
    }
}
