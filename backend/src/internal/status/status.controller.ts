import {Controller, Get} from "@nestjs/common";
import {StatusService} from "./status.service";

@Controller('status')
export class StatusController
{
    constructor(private readonly statusService: StatusService)
    {
    }

    @Get('sg')
    async SGOPing()
    {
        return await this.statusService.getSGOstatus();
    }

    @Get()
    backendPing()
    {
        return {
            status: "ok"
        }
    }
}