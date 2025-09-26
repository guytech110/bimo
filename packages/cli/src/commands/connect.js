import { Command } from 'commander';
import readline from 'readline';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import crypto from 'crypto';
import { http, authHeaders } from '../http.js';
import { getConfig } from '../config.js';
function prompt(query) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => rl.question(query, (ans) => { rl.close(); resolve(ans); }));
}
export function connectCommand() {
    const cmd = new Command('connect')
        .description('Connect a provider (use --service-account-file for Gemini/GCP service account JSON)')
        .argument('<provider>', 'Provider id or alias (openai, anthropic, claude, gemini, vertex, google, azure)')
        .option('--service-account-file <path>', 'Path to service account JSON file (use instead of pasting)')
        .option('--smart-connect', 'Attempt to auto-detect project, billing account and BigQuery dataset from service account file')
        .option('--key-type <type>', 'Key Type (production|developer)')
        .action(async (provider, options, command) => {
        const cfg = await getConfig();
        const parentOptions = command.parent?.opts();
        const base = parentOptions?.gateway || cfg.gatewayUrl || `http://localhost:8001/v1`;
        const token = cfg.token || '';
        const headers = { ...authHeaders(token), 'Idempotency-Key': uuidv4() };
        const alias = (provider || '').toLowerCase();
        let providerId = alias;
        if (alias === 'anthropic')
            providerId = 'claude';
        if (alias === 'vertex' || alias === 'google')
            providerId = 'gemini';
        if (alias === 'google-cloud' || alias === 'gcp')
            providerId = 'gcp';
        if (alias === 'gemini')
            providerId = 'gemini';
        const connectUrl = `${base}/providers/${providerId}/connect`;
        let body = { provider_id: providerId, method: 'api_key', credentials: {} };
        // Determine key type: prefer --key-type, otherwise prompt
        const typeAnsRaw = (options && options.keyType) ? String(options.keyType) : (await prompt('Key Type (production/developer) [production]: '));
        const typeAns = (typeAnsRaw || '').trim().toLowerCase();
        const connection_type = (typeAns === 'developer' ? 'developer' : 'production');
        body.connection_type = connection_type;
        body.connection_source = 'cli';
        if (providerId === 'openai') {
            const key = (await prompt('OpenAI API key: ')).trim();
            body.credentials.api_key = key;
        }
        else if (providerId === 'claude') {
            const key = (await prompt('Anthropic Claude API key: ')).trim();
            body.credentials.api_key = key;
        }
        else if (providerId === 'gemini') {
            // If a service account file was provided, assume service_account mode
            const mode = (options && options.serviceAccountFile) ? 'service_account' : (await prompt('Gemini/Vertex mode (api_key | service_account): ')).trim().toLowerCase();
            if (mode === 'service_account') {
                body.method = 'oauth';
                let sa = '';
                // If a service account file was provided, read and parse it
                if (options && options.serviceAccountFile) {
                    try {
                        const raw = await fs.readFile(String(options.serviceAccountFile), 'utf-8');
                        const parsed = JSON.parse(raw);
                        sa = JSON.stringify(parsed);
                        // basic detection from service account
                    }
                    catch (err) {
                        console.error(`Failed to read or parse service account file: ${err.message || err}`);
                        process.exit(1);
                    }
                }
                else {
                    sa = (await prompt('Paste service account JSON: ')).trim();
                }
                // Smart connect: attempt to auto-detect project, billing account and dataset
                let detectedProject;
                let detectedBilling;
                let detectedDataset;
                try {
                    console.log('>>> Parsing service account JSON for auto-detection (before)');
                    const parsed = sa ? JSON.parse(sa) : undefined;
                    console.log('>>> Parsing service account JSON for auto-detection (after)');
                    if (parsed && parsed.project_id) {
                        detectedProject = parsed.project_id;
                        console.log(`>>> Detected project from SA: ${detectedProject}`);
                    }
                }
                catch (err) {
                    console.log('>>> Failed to parse service account JSON for auto-detection:', err);
                    // ignore parse errors
                }
                if (options && options.smartConnect && sa) {
                    try {
                        const parsed = JSON.parse(sa);
                        const needsBilling = !detectedBilling;
                        const needsDataset = !detectedDataset;
                        if ((needsBilling || needsDataset) && parsed.client_email && parsed.private_key && detectedProject) {
                            // Obtain short-lived access token via JWT exchange
                            console.log('>>> Attempting JWT exchange to obtain short-lived access token');
                            const scopes = [];
                            if (needsBilling)
                                scopes.push('https://www.googleapis.com/auth/cloud-billing.readonly');
                            if (needsDataset)
                                scopes.push('https://www.googleapis.com/auth/bigquery.readonly');
                            if (scopes.length > 0) {
                                const obtainAccessToken = async (saObj, scopesArr) => {
                                    try {
                                        const header = { alg: 'RS256', typ: 'JWT' };
                                        const iat = Math.floor(Date.now() / 1000);
                                        const exp = iat + 3600;
                                        const payload = {
                                            iss: saObj.client_email,
                                            scope: scopesArr.join(' '),
                                            aud: 'https://oauth2.googleapis.com/token',
                                            exp,
                                            iat,
                                        };
                                        function base64url(input) {
                                            return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
                                        }
                                        const signedInput = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;
                                        const sign = crypto.createSign('RSA-SHA256');
                                        sign.update(signedInput);
                                        sign.end();
                                        const signature = sign.sign(saObj.private_key, 'base64');
                                        const jwt = `${signedInput}.${signature.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')}`;
                                        const params = new URLSearchParams();
                                        params.append('grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer');
                                        params.append('assertion', jwt);
                                        const resp = await axios.post('https://oauth2.googleapis.com/token', params.toString(), {
                                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                            timeout: 60000,
                                        });
                                        return resp.data && resp.data.access_token;
                                    }
                                    catch (err) {
                                        console.log('>>> JWT exchange failed:', err);
                                        return undefined;
                                    }
                                };
                                try {
                                    const token = await obtainAccessToken(parsed, scopes);
                                    console.log('>>> JWT exchange result token present:', Boolean(token));
                                    if (token) {
                                        // billing
                                        if (needsBilling && detectedProject) {
                                            try {
                                                console.log('>>> Calling Cloud Billing API to fetch billingInfo (before)');
                                                const billResp = await axios.get(`https://cloudbilling.googleapis.com/v1/projects/${encodeURIComponent(detectedProject)}/billingInfo`, { headers: { Authorization: `Bearer ${token}` }, timeout: 60000 });
                                                console.log('>>> Calling Cloud Billing API to fetch billingInfo (after)');
                                                const name = billResp.data && billResp.data.billingAccountName;
                                                if (name && typeof name === 'string') {
                                                    const parts = name.split('/');
                                                    detectedBilling = parts[parts.length - 1];
                                                    console.log(`>>> Detected billing account: ${detectedBilling}`);
                                                }
                                            }
                                            catch (err) {
                                                console.log('>>> Cloud Billing API call failed:', err);
                                            }
                                        }
                                        // bigquery dataset detection
                                        if (needsDataset && detectedProject) {
                                            try {
                                                console.log('>>> Calling BigQuery datasets API (before)');
                                                const dsResp = await axios.get(`https://bigquery.googleapis.com/bigquery/v2/projects/${encodeURIComponent(detectedProject)}/datasets`, { headers: { Authorization: `Bearer ${token}` }, timeout: 60000 });
                                                console.log('>>> Calling BigQuery datasets API (after)');
                                                const datasets = dsResp.data && dsResp.data.datasets;
                                                if (Array.isArray(datasets) && datasets.length > 0) {
                                                    const found = datasets.find((d) => d.datasetReference && d.datasetReference.datasetId && /billing/i.test(d.datasetReference.datasetId));
                                                    if (found) {
                                                        detectedDataset = found.datasetReference.datasetId;
                                                        console.log(`>>> Detected dataset: ${detectedDataset}`);
                                                    }
                                                }
                                            }
                                            catch (err) {
                                                console.log('>>> BigQuery datasets API call failed:', err);
                                            }
                                        }
                                    }
                                }
                                catch (err) {
                                    console.log('>>> Error during smart-connect auto-detection:', err);
                                }
                            }
                        }
                    }
                    catch (err) {
                        // ignore
                    }
                }
                const project = detectedProject || (await prompt('GCP project_id: ')).trim();
                const billing = detectedBilling || (await prompt('Billing account id: ')).trim();
                const dataset = detectedDataset || (await prompt('BigQuery dataset id (default billing_export): ')).trim() || 'billing_export';
                body.credentials.service_account_json = sa;
                body.credentials.project_id = project;
                body.credentials.billing_account_id = billing;
                body.credentials.bigquery_dataset_id = dataset;
            }
            else {
                const key = (await prompt('Google API key: ')).trim();
                body.credentials.api_key = key;
            }
        }
        else if (providerId === 'gcp') {
            // Google Cloud billing connection uses service account JSON mode
            body.method = 'oauth';
            let sa = '';
            if (options && options.serviceAccountFile) {
                try {
                    const raw = await fs.readFile(String(options.serviceAccountFile), 'utf-8');
                    const parsed = JSON.parse(raw);
                    sa = JSON.stringify(parsed);
                }
                catch (err) {
                    console.error(`Failed to read or parse service account file: ${err.message || err}`);
                    process.exit(1);
                }
            }
            else {
                sa = (await prompt('Paste service account JSON: ')).trim();
            }
            const project = (await prompt('GCP project_id: ')).trim();
            const billing = (await prompt('Billing account id: ')).trim();
            const dataset = (await prompt('BigQuery dataset id (default billing_export): ')).trim() || 'billing_export';
            body.credentials.service_account_json = sa;
            body.credentials.project_id = project;
            body.credentials.billing_account_id = billing;
            body.credentials.bigquery_dataset_id = dataset;
        }
        else if (providerId === 'azure') {
            const tenantId = (await prompt('Azure tenant id (optional): ')).trim();
            const clientId = (await prompt('Azure client id (optional): ')).trim();
            const clientSecret = (await prompt('Azure client secret (optional): ')).trim();
            body.credentials.azureAd = { tenantId, clientId, clientSecret };
        }
        else {
            const key = (await prompt(`${providerId} API key (optional): `)).trim();
            if (key)
                body.credentials.api_key = key;
        }
        const { data } = await http(base).post(connectUrl, body, { headers });
        const connId = (data && (data.connection_id || data.id)) ?? 'unknown';
        console.log(`Connected. Connection ID: ${connId}`);
    });
    return cmd;
}


