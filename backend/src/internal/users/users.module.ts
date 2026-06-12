import {forwardRef, Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {UserEntity} from './entity/user.entity';
import {UsersService} from './users.service';
import {UsersController} from './users.controller';
import {GradeEntity} from "./entity/grade.entity";
import {ReportModule} from "../../external/report/report.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity, GradeEntity]),
        forwardRef(() => ReportModule)
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService]
})
export class UsersModule
{
}