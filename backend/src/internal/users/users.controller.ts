import {Controller, Get, Query, UseGuards} from "@nestjs/common";
import {SecretKeyGuard} from "../../common/guards/secret-key.guard";
import {CurrentUser} from "../../common/decorators/user.decorator";
import {UsersService} from "./users.service";

@Controller('users')
export class UsersController
{
    constructor(
        private readonly usersService: UsersService
    )
    {
    }

    @Get('me')
    @UseGuards(SecretKeyGuard)
    async me(@CurrentUser() data: any)
    {
        const user = await this.usersService.findByUserId(data.user_id)

        await this.usersService.syncGradesIfNeeded(user!);

        return {
            id: user!.user_id,
            full_name: user!.sgo_full_name,
            group_name: user!.sgo_group_name,
            student_id: user!.sgo_student_id,
            cache_last_sync_at: user!.cache_last_sync_at
        };
    }

    @Get('me/cache')
    @UseGuards(SecretKeyGuard)
    async getCachedGrades(@CurrentUser() data: any)
    {
        return this.usersService.getCachedGrades(data.user_id);
    }

    @Get('search')
    @UseGuards(SecretKeyGuard)
    async searchUsers(@Query('q') q: string, @CurrentUser() user: any)
    {
        return this.usersService.searchUsers(q, user.id);
    }
}