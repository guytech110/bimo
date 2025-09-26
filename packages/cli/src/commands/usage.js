import { Command } from 'commander';
import { http, authHeaders } from '../http.js';
import { getConfig } from '../config.js';

export function usageCommand() {
  const cmd = new Command('usage')
    .description('Show usage for a provider (defaults to latest gemini)')
    .argument('[provider]', 'Provider id (gemini, openai, etc.)')
    .option('--days <n>', 'Days to include', '30')
    .action(async (provider, options, command) => {
      const cfg = await getConfig();
      const parentOptions = command.parent?.opts();
      const base = parentOptions?.gateway || cfg.gatewayUrl || `http://localhost:8001/v1`;
      const token = cfg.token || '';
      const days = parseInt(String(options?.days || '30'), 10) || 30;

      try {
        // Pick latest connection for requested provider (default gemini)
        const want = (provider || 'gemini').toLowerCase();
        const { data } = await http(base).get(`${base}/providers/connections`, { headers: authHeaders(token) });
        const rows = Array.isArray(data?.data) ? data.data : [];
        const pick = rows
          .filter(r => (r.provider_id || '').toLowerCase() === want)
          .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))[0];
        if (!pick) {
          console.log(`No ${want} connections found. Run: bimo connect ${want}`);
          return;
        }
        const url = `${base}/providers/${pick.id}/usage?days=${days}`;
        const resp = await http(base).get(url, { headers: authHeaders(token) });
        const u = resp.data || {};
        const monthly = typeof u.monthly_cost === 'number' ? u.monthly_cost : 0;
        console.log(`Usage for ${want} (connection ${pick.id}):`);
        console.log(`- Monthly cost: $${monthly.toFixed(2)}`);
        if (Array.isArray(u.daily_spend) && u.daily_spend.length > 0) {
          const last = u.daily_spend[u.daily_spend.length - 1];
          console.log(`- Latest day: ${last.day || 'n/a'}  $${Number(last.cost || 0).toFixed(2)}`);
        } else {
          console.log('- No daily spend data yet');
        }
      } catch (err) {
        const msg = err?.response?.data?.error?.message || err?.message || String(err);
        console.error(`Failed to fetch usage: ${msg}`);
        process.exit(1);
      }
    });
  return cmd;
}
