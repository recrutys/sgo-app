import {Global, Module} from '@nestjs/common';
import {HttpModule} from '@nestjs/axios';
import {SocksProxyAgent} from 'socks-proxy-agent';

@Global()
@Module({
    imports: [
        HttpModule.registerAsync({
            useFactory: () =>
            {
                const proxyUrl = process.env.PROXY_URL;

                // Выводим лог при старте
                if (proxyUrl)
                {
                    console.log(`[PROXY] HTTP клиент запущен через прокси: ${proxyUrl}`);

                    const agent = new SocksProxyAgent(proxyUrl);
                    return {
                        httpAgent: agent,
                        httpsAgent: agent,
                    };
                }

                console.log('[PROXY] HTTP клиент запущен без прокси (напрямую)');
                return {};
            },
        }),
    ],
    exports: [HttpModule],
})
export class GlobalHttpModule
{
}