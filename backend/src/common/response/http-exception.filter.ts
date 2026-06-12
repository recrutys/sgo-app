import {ExceptionFilter, Catch, ArgumentsHost, HttpException} from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter
{
    catch(exception: HttpException, host: ArgumentsHost)
    {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();

        // Заворачиваем ошибку в JSON с указанием текстовой ошибки и ошибки-кода (для обработки на фронтенде)
        response.status(exception.getStatus()).json({
            status: 'error',
            message: (exception.getResponse() as any)?.message ?? 'Неизвестная ошибка',
            message_code: (exception.getResponse() as any)?.message_code ?? 'UNKNOWN_ERROR',
        });
    }
}