import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import crypto from 'crypto'

const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)

const prismaClient = new PrismaClient({ adapter })

const prisma = prismaClient.$extends({
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

export default prisma
