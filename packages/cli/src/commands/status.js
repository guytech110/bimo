import { Command } from 'commander';
import { http, authHeaders } from '../http.js';
import { getConfig } from '../config.js';

export function statusCommand() {
  const cmd = new Command('status')
    .description('Show connection status summary')
    .action(async (options, command) => {
      const cfg = await getConfig();
      const parentOptions = command.parent?.opts();
      const base = parentOptions?.gateway || cfg.gatewayUrl || `http://localhost:8001/v1`;
      const token = cfg.token || '';

      try {
        const { data } = await http(base).get(`${base}/providers/connections`, { headers: authHeaders(token) });
        const rows = Array.isArray(data?.data) ? data.data : [];
        if (rows.length === 0) {
          console.log('No providers connected yet. Run: bimo connect gemini --service-account-file <path>');
          return;
        }
        const counts = rows.reduce((acc, r) => {
          const id = (r.provider_id || 'unknown').toLowerCase();
          acc[id] = (acc[id] || 0) + 1;
          return acc;
        }, {});
        const providers = Object.keys(counts).map(k => `${k}(${counts[k]})`).join(', ');
        console.log(`Connected providers: ${providers}`);
      } catch (err) {
        const msg = err?.response?.data?.error?.message || err?.message || String(err);
        console.error(`Failed to fetch status: ${msg}`);
        process.exit(1);
      }
    });
  return cmd;
}
