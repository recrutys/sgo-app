import {Module} from '@nestjs/common';
import {TelegramConnectService} from './telegram-connect.service';
import {TelegramConnectController} from './telegram-connect.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {TelegramTokenEntity} from "./entity/telegram-token.entity";
import {UserEntity} from "../users/entity/user.entity";
import {GradeEntity} from "../users/entity/grade.entity";
import {AuthModule} from "../auth/auth.module";
import {ReportModule} from "../../external/report/report.module";
import {UsersModule} from "../users/users.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([TelegramTokenEntity, UserEntity, GradeEntity]),
        AuthModule, ReportModule, UsersModule
    ],
    controllers: [TelegramConnectController],
    providers: [TelegramConnectService],
})
export class TelegramConnectModule
{
}
