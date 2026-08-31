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

    const categories = [
        { id: 'CAT-DEVICE-LAPTOP', name: 'Laptop', type: 'DEVICE' as const },
        { id: 'CAT-DEVICE-DESKTOP', name: 'Desktop', type: 'DEVICE' as const },
        { id: 'CAT-COMPONENT-RAM', name: 'RAM', type: 'COMPONENT' as const },
        { id: 'CAT-COMPONENT-SSD', name: 'SSD', type: 'COMPONENT' as const },
        { id: 'CAT-ACCESSORY-MONITOR', name: 'Monitor', type: 'ACCESSORY' as const },
    ]

    for (const category of categories) {
        await prisma.category.upsert({
            where: { id: category.id },
            update: { name: category.name, type: category.type },
            create: category,
        })
    }

    const supplier = await prisma.supplier.upsert({
        where: { id: 'SUP-DEMO-001' },
        update: {},
        create: {
            id: 'SUP-DEMO-001',
            name: 'Demo Technology Supplier',
            contactEmail: 'supplier@example.com',
            contactPhone: '0900000000',
        },
    })

    const location = await prisma.location.upsert({
        where: { id: 'LOC-DEMO-001' },
        update: {},
        create: {
            id: 'LOC-DEMO-001',
            name: 'Kho chính',
            address: 'Tầng 1, Văn phòng chính',
        },
    })

    const laptop = await prisma.device.upsert({
        where: { id: 'DEV-DEMO-001' },
        update: {},
        create: {
            id: 'DEV-DEMO-001',
            name: 'Laptop Dell Latitude 5440',
            serialNumber: 'DEMO-DL5440-001',
            model: 'Latitude 5440',
            manufacturer: 'Dell',
            status: 'AVAILABLE',
            condition: 'GOOD',
            purchasePrice: 18500000,
            categoryId: 'CAT-DEVICE-LAPTOP',
            supplierId: supplier.id,
            locationId: location.id,
            notes: 'Dữ liệu mẫu',
        },
    })

    const desktop = await prisma.device.upsert({
        where: { id: 'DEV-DEMO-002' },
        update: {},
        create: {
            id: 'DEV-DEMO-002',
            name: 'Desktop HP ProDesk 400',
            serialNumber: 'DEMO-HP400-001',
            model: 'ProDesk 400 G9',
            manufacturer: 'HP',
            status: 'IN_USE',
            condition: 'GOOD',
            purchasePrice: 14200000,
            categoryId: 'CAT-DEVICE-DESKTOP',
            supplierId: supplier.id,
            locationId: location.id,
            notes: 'Dữ liệu mẫu',
        },
    })

    await prisma.assignment.upsert({
        where: { id: 'ASM-DEMO-002' },
        update: {
            deviceId: desktop.id,
            userId: user.id,
            returnedAt: null,
            conditionBefore: 'GOOD',
            conditionAfter: null,
        },
        create: {
            id: 'ASM-DEMO-002',
            deviceId: desktop.id,
            userId: user.id,
            conditionBefore: 'GOOD',
            notes: 'Lượt cấp phát mẫu',
        },
    })

    await prisma.component.upsert({
        where: { id: 'CMP-DEMO-001' },
        update: {},
        create: {
            id: 'CMP-DEMO-001',
            name: 'RAM Kingston 16GB DDR4',
            serialNumber: 'DEMO-RAM-001',
            manufacturer: 'Kingston',
            status: 'AVAILABLE',
            purchasePrice: 950000,
            categoryId: 'CAT-COMPONENT-RAM',
            supplierId: supplier.id,
            locationId: location.id,
            notes: 'Dữ liệu mẫu',
        },
    })

    await prisma.component.upsert({
        where: { id: 'CMP-DEMO-002' },
        update: {},
        create: {
            id: 'CMP-DEMO-002',
            name: 'SSD Samsung 980 1TB',
            serialNumber: 'DEMO-SSD-001',
            manufacturer: 'Samsung',
            status: 'INSTALLED',
            purchasePrice: 1800000,
            categoryId: 'CAT-COMPONENT-SSD',
            supplierId: supplier.id,
            locationId: location.id,
            deviceId: laptop.id,
            notes: 'Dữ liệu mẫu',
        },
    })

    await prisma.accessory.upsert({
        where: { id: 'ACC-DEMO-001' },
        update: {},
        create: {
            id: 'ACC-DEMO-001',
            name: 'Màn hình Dell P2422H',
            manufacturer: 'Dell',
            totalQuantity: 10,
            minQuantity: 2,
            unitPrice: 4200000,
            categoryId: 'CAT-ACCESSORY-MONITOR',
            supplierId: supplier.id,
            locationId: location.id,
            notes: 'Dữ liệu mẫu',
        },
    })

    console.log('✅ Sample inventory data created:')
    console.log('   2 devices, 2 components, 1 accessory')
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
