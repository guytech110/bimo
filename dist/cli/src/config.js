import fs from 'fs';
import os from 'os';
import path from 'path';
const DIR = path.join(os.homedir(), '.bimo');
const FILE = path.join(DIR, 'config.json');
export async function getConfig() {
    try {
        const raw = await fs.promises.readFile(FILE, 'utf-8');
        return JSON.parse(raw);
    }
    catch {
        return {};
    }
}
export async function saveConfig(partial) {
    await fs.promises.mkdir(DIR, { recursive: true });
    const existing = await getConfig();
    const next = { ...existing, ...partial };
    await fs.promises.writeFile(FILE, JSON.stringify(next, null, 2), 'utf-8');
}
