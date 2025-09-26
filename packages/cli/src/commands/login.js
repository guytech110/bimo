import { Command } from 'commander';
import open from 'open';
import { http } from '../http.js';
import { saveConfig, getConfig } from '../config.js';
export function loginCommand() {
    const cmd = new Command('login')
        .description('Authenticate via device code flow')
        .action(async (options, command) => {
        const cfg = await getConfig();
        const parentOptions = command.parent?.opts();
        const base = parentOptions?.gateway || cfg.gatewayUrl || `http://localhost:8001/v1`;
        const startUrl = `${base}/cli/device/start`;
        const { data: start } = await http(base).post(startUrl);
        const verification = `${base.replace(/\/v1$/, '')}${start.verification_uri}`;
        console.log(`To authenticate, a browser will open to: ${verification}`);
        console.log(`Enter code: ${start.user_code}`);
        await open(verification + `?user_code=${encodeURIComponent(start.user_code)}`);
        const pollUrl = `${base}/cli/device/poll`;
        const started = Date.now();
        while (true) {
            await new Promise(r => setTimeout(r, (start.interval || 3) * 1000));
            const { data: poll } = await http(base).post(pollUrl, { device_code: start.device_code });
            if (poll.status === 'approved' && poll.access_token) {
                await saveConfig({ token: poll.access_token, gatewayUrl: base });
                console.log('Login successful.');
                break;
            }
            if (Date.now() - started > (start.expires_in || 600) * 1000) {
                console.error('Login timed out. Please try again.');
                process.exit(1);
            }
            process.stdout.write('.');
        }
    });
    return cmd;
}




