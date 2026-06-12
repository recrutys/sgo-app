import {Controller, Get, UseGuards} from '@nestjs/common';
import {ReportService} from './report.service';
import {SecretKeyGuard} from "../../common/guards/secret-key.guard";
import {CurrentUser} from "../../common/decorators/user.decorator";

@Controller('users/me/report')
export class ReportController
{
    constructor(private readonly reportService: ReportService)
    {
    }

    @Get()
    @UseGuards(SecretKeyGuard)
    async getReport(@CurrentUser() user: any)
    {
        return this.reportService.getReport(user);
    }
}
