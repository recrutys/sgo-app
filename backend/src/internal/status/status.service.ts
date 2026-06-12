import {HttpService} from "@nestjs/axios";
import {firstValueFrom} from "rxjs";
import {Injectable} from "@nestjs/common";

@Injectable()
export class StatusService
{
    constructor(private readonly httpService: HttpService)
    {
    }

    async getSGOstatus(): Promise<boolean>
    {
        let isAvailable = false;

        try
        {
            const response = await firstValueFrom(
                this.httpService.get('https://spo.rso23.ru', {
                    timeout: 5000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    },

                    validateStatus: () => true
                }),
            );

            isAvailable = response.status === 200;
        }
        catch
        {
            isAvailable = false;
        }

        return isAvailable;
    }
}