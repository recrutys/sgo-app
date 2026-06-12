import {Injectable, CanActivate, ExecutionContext, UnauthorizedException} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';

@Injectable()
export class InternalSecretGuard implements CanActivate
{
    constructor(private readonly configService: ConfigService)
    {
    }

    canActivate(context: ExecutionContext): boolean
    {
        const request = context.switchToHttp().getRequest();
        const secret = request.headers['x-internal-secret'];

        if (!secret)
        {
            throw new UnauthorizedException({
                message: 'Внутренний токен отсутствует в заголовках',
                message_code: 'INTERNAL_SECRET_MISSING'
            });
        }

        if (secret !== this.configService.get('INTERNAL_SECRET'))
        {
            throw new UnauthorizedException({
                message: 'Неверный внутренний токен доступа',
                message_code: 'INVALID_INTERNAL_SECRET'
            });
        }

        return true;
    }
}