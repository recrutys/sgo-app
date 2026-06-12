import {Module} from '@nestjs/common';
import {AttestationService} from './attestation.service';
import {AttestationController} from './attestation.controller';
import {UsersModule} from "../../internal/users/users.module";

@Module({
    imports: [UsersModule],
    controllers: [AttestationController],
    providers: [AttestationService],
})
export class AttestationModule
{
}
