import {Module} from '@nestjs/common';
import {DashboardService} from './dashboard.service';
import {DashboardController} from './dashboard.controller';
import {UsersModule} from "../../internal/users/users.module";

@Module({
    imports: [UsersModule],
    controllers: [DashboardController],
    providers: [DashboardService]
})
export class DashboardModule
{
}
