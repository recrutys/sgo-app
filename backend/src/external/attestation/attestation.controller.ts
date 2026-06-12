import {Controller, Get, UseGuards} from '@nestjs/common';
import {AttestationService} from './attestation.service';
import {SecretKeyGuard} from "../../common/guards/secret-key.guard";
import {CurrentUser} from "../../common/decorators/user.decorator";

@Controller('users/me/attestation')
export class AttestationController
{
    constructor(private readonly attestationService: AttestationService)
    {
    }

    @Get()
    @UseGuards(SecretKeyGuard)
    async getAttestation(@CurrentUser() user: any)
    {
        return this.attestationService.getAttestation(user);
    }
}
