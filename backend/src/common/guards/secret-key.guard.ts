import {Injectable, CanActivate, ExecutionContext, UnauthorizedException} from '@nestjs/common';
import {AuthService} from "../../internal/auth/auth.service";
import {UsersService} from "../../internal/users/users.service";

@Injectable()
export class SecretKeyGuard implements CanActivate
{
    constructor(private readonly usersService: UsersService)
    {
    }

    async canActivate(context: ExecutionContext): Promise<boolean>
    {
        const request = context.switchToHttp().getRequest();
        const key = request.headers['x-secret-key'];

        if (!key)
        {
            throw new UnauthorizedException({
                message: 'Ключ авторизации отсутствует в заголовках',
                message_code: 'SECRET_KEY_MISSING'
            });
        }

        const user = await this.usersService.findBySecretKey(key);

        if (!user)
        {
            throw new UnauthorizedException({
                message: 'Предоставленный ключ не найден',
                message_code: 'INVALID_SECRET_KEY'
            });
        }

        if (user.secret_key_expires_at < new Date())
        {
            throw new UnauthorizedException({
                message: 'Срок действия сессии истёк. Пожалуйста, войдите снова',
                message_code: 'SECRET_KEY_EXPIRED'
            });
        }

        request.user = user;

        return true;
    }
}