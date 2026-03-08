import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('🌱 Seeding database...')

    const email = 'admin@hardware.com'
    const plainPassword = 'Admin@123'

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(plainPassword, 10)

    // Upsert sample user
    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            name: 'Admin User',
            role: 'ADMIN',
        },
        create: {
            id: `CUST-${crypto.randomUUID()}`,
            email,
            name: 'Admin User',
            password: hashedPassword,
            role: 'ADMIN',
        },
    })

    console.log('✅ Sample user created:')
    console.log(`   Email:    ${user.email}`)
    console.log(`   Password: ${plainPassword}`)
    console.log(`   ID:       ${user.id}`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
        console.log('🌱 Seeding complete!')
    })
    .catch(async (e) => {
        console.error('❌ Seeding failed:', e)
        await prisma.$disconnect()
        process.exit(1)
    })
