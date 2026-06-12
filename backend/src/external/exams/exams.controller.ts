import {Controller, Get, UseGuards} from '@nestjs/common';
import {ExamsService} from './exams.service';
import {SecretKeyGuard} from "../../common/guards/secret-key.guard";
import {CurrentUser} from "../../common/decorators/user.decorator";

@Controller('users/me/exams')
export class ExamsController
{
    constructor(private readonly examsService: ExamsService)
    {
    }

    @Get()
    @UseGuards(SecretKeyGuard)
    async getExams(@CurrentUser() user: any)
    {
        return this.examsService.getExams(user);
    }
}
