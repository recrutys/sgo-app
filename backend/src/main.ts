import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {ResponseInterceptor} from "./common/response/response.interceptor";
import {HttpExceptionFilter} from "./common/response/http-exception.filter";

async function bootstrap()
{
    const app = await NestFactory.create(AppModule);

    // Включаем CORS
    app.enableCors({
        origin: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });

    // Интерцептор для успешного ответа эндпоинта
    app.useGlobalInterceptors(new ResponseInterceptor());

    // Фильтр для ошибок от эндпоинтов
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
