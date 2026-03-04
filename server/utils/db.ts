import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import crypto from 'crypto'

const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)

export const prismaBase = new PrismaClient({ adapter })

const db = prismaBase.$extends({
    query: {
        user: {
            async create({ args, query }) {
                if (!args.data.id) {
                    args.data.id = `CUST-${crypto.randomUUID()}`
                }
                return query(args)
            }
        }
    }
})

export default db
