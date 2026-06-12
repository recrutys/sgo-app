import {Module} from '@nestjs/common';
import {ScheduleUpcomingService} from './schedule-upcoming.service';
import {ScheduleUpcomingController} from './schedule-upcoming.controller';
import {UsersModule} from "../../internal/users/users.module";

@Module({
    imports: [UsersModule],
    controllers: [ScheduleUpcomingController],
    providers: [ScheduleUpcomingService],
})
export class ScheduleUpcomingModule
{

}
