import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as userSchema from '../models/user.model'
import * as shelterSchema from '../models/shelter.model'
import * as routeSchema from '../models/route.model'
import * as reportSchema from '../models/report.model'
import * as fileSchema from '../models/file.model'

const schema = { ...userSchema, ...shelterSchema, ...routeSchema, ...reportSchema, ...fileSchema }

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set')
}

export const queryClient = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false,      // use simple query protocol — fixes UUID prepared statement hang bug
})
export const db = drizzle(queryClient, { schema })

export type DB = typeof db
