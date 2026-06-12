import {Controller, Get, UseGuards} from '@nestjs/common';
import {ScheduleUpcomingService} from './schedule-upcoming.service';
import {SecretKeyGuard} from "../../common/guards/secret-key.guard";
import {CurrentUser} from "../../common/decorators/user.decorator";

@Controller('users/me/schedule-upcoming')
export class ScheduleUpcomingController
{
    constructor(private readonly scheduleUpcomingService: ScheduleUpcomingService)
    {
    }

    @Get()
    @UseGuards(SecretKeyGuard)
    async getScheduleUpcoming(@CurrentUser() user: any)
    {
        return await this.scheduleUpcomingService.getScheduleUpcoming(user);
    }
}
