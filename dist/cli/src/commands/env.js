import { Command } from 'commander';
import { http, authHeaders } from '../http.js';
import { getConfig } from '../config.js';
export function envCommand() {
    const env = new Command('env').description('Environment utilities');
    env
        .command('export')
        .description('Print env variables in .env format')
        .action(async (options, command) => {
        const cfg = await getConfig();
        const parentOptions = command.parent?.parent?.opts();
        const base = parentOptions?.gateway || cfg.gatewayUrl || `http://localhost:8001/v1`;
        const token = cfg.token || '';
        const { data } = await http(base).get(`${base}/env`, { headers: authHeaders(token) });
        const key = data.BIMO_KEY || token || '';
        console.log(`BIMO_GATEWAY_URL=${data.BIMO_GATEWAY_URL}`);
        if (key)
            console.log(`BIMO_KEY=${key}`);
    });
    return env;
}
