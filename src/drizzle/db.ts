import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

import { relations } from "./schema"
import * as schema from "./schema"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
})

export const db = drizzle({
  relations,
  schema,
  client: pool,
  logger: true,
})
