import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {TypeOrmModule} from "@nestjs/typeorm";
import {GlobalHttpModule} from "./common/http/global-http.module";

// Импортируем модули
import {AuthModule} from './internal/auth/auth.module';
import {UsersModule} from './internal/users/users.module';
import {StatusModule} from "./internal/status/status.module";
import {DashboardModule} from "./external/dashboard/dashboard.module";
import { ReportModule } from './external/report/report.module';
import { ScheduleModule } from './external/schedule/schedule.module';
import { AttestationModule } from './external/attestation/attestation.module';
import { ExamsModule } from './external/exams/exams.module';
import { ScheduleUpcomingModule } from './external/schedule-upcoming/schedule-upcoming.module';
import { TelegramConnectModule } from './internal/telegram-connect/telegram-connect.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
		
        // Глобально инициализируем базу данных
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService): Promise<any> => ({
                type: 'postgres' as const,
                host: config.get('DB_HOST'),
                port: config.get<number>('DB_PORT'),
                username: config.get('DB_USER'),
                password: config.get('DB_PASSWORD'),
                database: config.get('DB_NAME'),
                entities: [],
                synchronize: true,
                autoLoadEntities: true
            }),
        }),

        // Глобальный http module для проксирования запросов
        GlobalHttpModule,

        // Импортируем модули
        AuthModule, UsersModule, StatusModule, DashboardModule, ReportModule, ScheduleModule, AttestationModule, ExamsModule, ScheduleUpcomingModule, TelegramConnectModule
    ],
    controllers: [
        AppController
    ],
    providers: [AppService],
})
export class AppModule
{
}