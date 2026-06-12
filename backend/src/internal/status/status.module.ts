import {StatusController} from "./status.controller";
import {StatusService} from "./status.service";
import {Module} from "@nestjs/common";

@Module({
    imports: [],
    controllers: [StatusController],
    providers: [StatusService],
    exports: []
})
export class StatusModule
{

}