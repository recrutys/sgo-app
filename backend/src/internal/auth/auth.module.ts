import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {AuthService} from "./auth.service";
import {SecretKeyGuard} from "../../common/guards/secret-key.guard";
import {AuthController} from "./auth.controller";
import {UserEntity} from "../users/entity/user.entity";
import {HttpModule} from "@nestjs/axios";
import {UsersModule} from "../users/users.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity]),
        HttpModule,
        UsersModule
    ],
    providers: [AuthService, SecretKeyGuard],
    controllers: [AuthController],
    exports: [AuthService, SecretKeyGuard]
})
export class AuthModule
{

}