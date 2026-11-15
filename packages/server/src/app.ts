import { Hono } from 'hono'

import { errorHandler } from './shared/lib/error-handler.js'

export const app = new Hono()

app.onError(errorHandler)

app.get('/', (c) => c.text('Hello Hono!'))
