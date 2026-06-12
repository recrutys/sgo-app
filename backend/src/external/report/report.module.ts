import {forwardRef, Module} from '@nestjs/common';
import {ReportService} from './report.service';
import {ReportController} from './report.controller';
import {UsersModule} from "../../internal/users/users.module";

@Module({
    imports: [
        forwardRef(() => UsersModule)
    ],
    controllers: [ReportController],
    providers: [ReportService],
    exports: [ReportService]
})
export class ReportModule
{
}
