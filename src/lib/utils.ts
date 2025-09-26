import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const API_BASE = (
  (typeof window !== 'undefined' && (window as any).__API_BASE__) ||
  ((import.meta as any).env?.VITE_API_BASE_URL as string) ||
  ''
)

export async function apiPost(path: string, body: unknown) {
  const source = (typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem('bimo:source')) || 'prod'
  const token = (typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem('bimo:token')) || ''
  const headers: Record<string,string> = { 'Content-Type': 'application/json' }
  if (source) headers['X-BIMO-SOURCE'] = source
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  const text = await res.text()
  try { return { status: res.status, body: JSON.parse(text) } }
  catch { return { status: res.status, body: text } }
}

export async function apiGet(path: string) {
  const source = (typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem('bimo:source')) || 'prod'
  const token = (typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem('bimo:token')) || ''
  const headers: Record<string,string> = {}
  if (source) headers['X-BIMO-SOURCE'] = source
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_BASE}${path}`, { method: 'GET', headers })
  const text = await res.text()
  try { return res.ok ? JSON.parse(text) : {} } catch { return {} }
}
