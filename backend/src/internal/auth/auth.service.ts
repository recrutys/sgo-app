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
        const hashedPassword = crypto.createHash('sha256').update(data.password).digest('base64');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        let user = await this.userRepo.findOne({
            where: {
                login: data.login
            }
        });

        const knownUser = user && user.password_hash == hashedPassword;

        let SGOResponse: any;

        try
        {
            SGOResponse = await firstValueFrom(
                this.httpService.post(
                    'https://spo.rso23.ru/services/security/login',
                    {
                        login: data.login,
                        password: hashedPassword,
                        isRemember: true
                    },
                    {
                        timeout: 10000,
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
            // Если юзер уже известен локально (пароль совпал с хэшем в базе) -
            // и СГО просто недоступен/упал/таймаут - работаем в офлайн-режиме по кэшу
            if (user && knownUser && this.isSgoUnavailable(error))
            {
                user.secret_key_expires_at = expiresAt;
                await this.userRepo.save(user);

                return {
                    secret_key: user.secret_key
                }
            }

            // Иначе (юзер новый, либо СГО явно сказал "неверный пароль") - кидаем ошибку как обычно
            throw this.mapSgoError(error);
        }

        // СГО жив и ответил успехом - обновляем сессию по полной
        const SGOData = SGOResponse.data;

        const tenantKey = SGOData.tenantName ?? Object.keys(SGOData.tenants ?? {})[0];
        const tenant = SGOData.tenants?.[tenantKey];
        if (!tenant) this.throwSgoParseError();

        const student =
            tenant.studentRole?.students?.[0] ??
            tenant.parentRole?.students?.[0] ??
            tenant.parentRole?.children?.[0];

        if (!student) this.throwSgoParseError();

        const groupName = student.groupName ?? tenant.studentRole?.groupName;
        const fullName = [student.lastName, student.firstName, student.middleName].filter(Boolean).join(' ');
        const sgoSession = this.extractSession(SGOResponse.headers['set-cookie']);

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
        else
        {
            user.password_hash = hashedPassword;
            user.sgo_session = sgoSession;
            user.sgo_full_name = fullName;
            user.sgo_group_name = groupName;
            user.secret_key_expires_at = expiresAt;
        }

        await this.userRepo.save(user);

        return {
            secret_key: user.secret_key
        }
    }

    private isSgoUnavailable(error: any): boolean
    {
        // Таймаут - СГО просто не ответил
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) return true;

        const status = error.response?.status;

        // 5xx или отсутствие ответа вообще (сеть/прокси легла) - считаем СГО недоступным
        return !status || status >= 500;
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
