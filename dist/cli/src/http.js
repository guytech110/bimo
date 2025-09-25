import axios from 'axios';
export function http(base) {
    const instance = axios.create({
        baseURL: base,
        headers: { 'Content-Type': 'application/json', 'X-BIMO-SOURCE': 'dev' },
        timeout: 60000,
    });
    return instance;
}
export function authHeaders(token) {
    const headers = {};
    if (token)
        headers['Authorization'] = `Bearer ${token}`;
    // Ensure CLI requests are marked as developer source for backend tagging
    headers['X-BIMO-SOURCE'] = 'dev';
    return headers;
}
export async function request(instance, method, url, data, config) {
    if (method === 'get')
        return instance.get(url, config);
    return instance.post(url, data, config);
}
