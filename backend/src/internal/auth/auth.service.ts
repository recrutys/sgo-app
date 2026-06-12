import {GatewayTimeoutException, Injectable, InternalServerErrorException, UnauthorizedException} from "@nestjs/common";
import {Repository} from "typeorm";
import {UserEntity} from "../users/entity/user.entity";
import {InjectRepository} from "@nestjs/typeorm";
import * as crypto from 'crypto';
import {firstValueFrom} from "rxjs";
import {HttpService} from '@nestjs/axios';

@Injectable()
export class AuthService
{
    constructor(
        private readonly httpService: HttpService,
        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>
    )
    {
    }

    async login(data: any): Promise<{
        secret_key: string
    }>
    {
        // Хешируем пароль (требование СГО)
        const hashedPassword = crypto.createHash('sha256').update(data.password).digest('base64');

        // Рассчитываем дату: действие ключа авторизации на сайте (не СГО) = +7 дней с момента авторизации
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        // Ищем пользователя по логину
        let user = await this.userRepo.findOne({
            where: {
                login: data.login
            }
        });

        // Если пользователь существует и данные верны:
        if (user && user.password_hash == hashedPassword)
        {
            // Продлеваем/устанавливаем срок жизни ключа
            user.secret_key_expires_at = expiresAt;

            // Сохраняем в базу
            await this.userRepo.save(user)

            return {
                secret_key: user.secret_key
            }
        }

        // Если пользователь новый, либо ввёл новые данные
        let SGOResponse: any;

        try
        {
            SGOResponse = await firstValueFrom(
                this.httpService.post(
                    'https://spo.rso23.ru/services/security/login',
                    { // Параметры в body (JSON)
                        login: data.login,
                        password: hashedPassword,
                        isRemember: true
                    },
                    { // Дополнительные параметры
                        timeout: 10000, // Если СГО не отвечает 10 секунд - отдаём ошибку,
                        headers: {
                            'Content-Type': 'application/json',
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        }
                    }
                )
            )
        }
        catch (error)
        {
            throw this.mapSgoError(error);
        }

        // Авторизация успешна, устанавливаем данные студента
        const SGOData = SGOResponse.data;

        // Вытаскиваем ключ региона (тенанта)
        const tenantKey = SGOData.tenantName ?? Object.keys(SGOData.tenants ?? {})[0];
        const tenant = SGOData.tenants?.[tenantKey];
        if (!tenant) this.throwSgoParseError();

        // Находим студента в структуре ответа СГО
        const student =
            tenant.studentRole?.students?.[0] ??
            tenant.parentRole?.students?.[0] ??
            tenant.parentRole?.children?.[0];

        if (!student) this.throwSgoParseError();

        // Собираем данные
        const groupName = student.groupName ?? tenant.studentRole?.groupName;
        const fullName = [student.lastName, student.firstName, student.middleName].filter(Boolean).join(' ');
        const sgoSession = this.extractSession(SGOResponse.headers['set-cookie']);

        // Если пользователь не найден в базе - добавляем
        if (!user)
        {
            user = this.userRepo.create({
                login: data.login,
                password_hash: hashedPassword,
                secret_key: crypto.randomBytes(32).toString('hex'),
                secret_key_expires_at: expiresAt,
                sgo_full_name: fullName,
                sgo_group_name: groupName,
                sgo_session: sgoSession,
                sgo_student_id: String(student.id),
            });
        }
        else // Если пользователь есть - обновляем (например, в сетевом сменили пароли)
        {
            // Обновляем хэш пароля и сессию СГО в базе
            user.password_hash = hashedPassword;
            user.sgo_session = sgoSession;
            user.secret_key_expires_at = expiresAt;
        }

        await this.userRepo.save(user);

        return {
            secret_key: user.secret_key
        }
    }

    private extractSession(cookies: string[] | undefined): string
    {
        if (!cookies?.length) return '';
        return cookies.map(c => c.split(';')[0]).join('; ');
    }

    private mapSgoError(error: any): Error
    {
        // СГО ушёл в таймаут (висит)
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout'))
        {
            return new GatewayTimeoutException({
                message: 'Сетевой Город слишком долго отвечает. Попробуй позже.',
                message_code: 'SGO_TIMEOUT',
            });
        }

        const status = error.response?.status;

        // Юзер ввёл неправильный логин/пароль на сайте СГО
        if (status === 401)
        {
            return new UnauthorizedException({
                message: 'Неверный логин или пароль от Сетевого Города.',
                message_code: 'INVALID_CREDENTIALS',
            });
        }

        // Упал сервер СГО (500, 502, 503 и т.д.)
        if (status >= 500)
        {
            return new InternalServerErrorException({
                message: 'Ошибка на стороне серверов Сетевого Города. Ведутся техработы.',
                message_code: 'SGO_SERVER_ERROR',
            });
        }

        // Любая другая проблема с сетью или прокси
        return new InternalServerErrorException({
            message: error.response?.data?.message ?? 'Ошибка сети. Проверьте работу прокси-сервера.',
            message_code: 'NETWORK_ERROR',
        });
    }

    private throwSgoParseError(): never
    {
        throw new InternalServerErrorException({
            message: 'Не удалось прочитать профиль студента. Возможно, изменился интерфейс СГО.',
            message_code: 'SGO_PARSE_ERROR',
        });
    }
}