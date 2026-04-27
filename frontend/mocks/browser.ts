import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

console.log('[MSW] 📦 Setting up worker with', handlers.length, 'handlers')
console.log('[MSW] 📋 Handler types:', handlers.map((h: any) => `${h.info.method} ${h.info.path}`).slice(0, 5))

export const worker = setupWorker(...handlers)

console.log('[MSW] ✅ Worker created')
