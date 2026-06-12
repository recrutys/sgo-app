import {Injectable, NestInterceptor, ExecutionContext, CallHandler} from '@nestjs/common';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor
{
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>
    {
        // Заворачиваем успешный ответ в JSON с указанием статуса (success) и data: {данные}
        return next.handle().pipe(
            map(data => ({
                status: 'success',
                data,
            }))
        );
    }
}