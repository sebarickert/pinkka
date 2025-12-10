import { BACKEND_URL } from '@/lib/env'

export function fetcher(path: string, options?: RequestInit) {
  return fetch(`${BACKEND_URL}${path}`, {
    credentials: 'include',
    ...options,
  })
}
