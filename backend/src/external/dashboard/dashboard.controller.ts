import {Controller, Get, UseGuards} from '@nestjs/common';
import {DashboardService} from './dashboard.service';
import {SecretKeyGuard} from "../../common/guards/secret-key.guard";
import {CurrentUser} from "../../common/decorators/user.decorator";

@Controller('users/me/dashboard')
export class DashboardController
{
    constructor(private readonly dashboardService: DashboardService)
    {
    }

    @Get()
    @UseGuards(SecretKeyGuard)
    async getDashboard(@CurrentUser() user: any)
    {
        return this.dashboardService.getDashboard(user);
    }
}
