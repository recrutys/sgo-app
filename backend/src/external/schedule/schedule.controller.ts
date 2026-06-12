import {Controller, Get, UseGuards} from '@nestjs/common';
import {ScheduleService} from './schedule.service';
import {SecretKeyGuard} from "../../common/guards/secret-key.guard";
import {CurrentUser} from "../../common/decorators/user.decorator";

@Controller('users/me/schedule')
export class ScheduleController
{
    constructor(private readonly scheduleService: ScheduleService)
    {
    }

    @Get()
    @UseGuards(SecretKeyGuard)
    async getSchedule(@CurrentUser() user: any)
    {
        return this.scheduleService.getSchedule(user);
    }
}
