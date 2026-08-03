import { AuditAction, AuditEntity, logAudit } from '../../utils/audit'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    if (!body.devices || !Array.isArray(body.devices)) {
        throw createError({
            statusCode: 400,
            message: 'Dữ liệu đầu vào phải là một mảng danh sách thiết bị.'
        })
    }

    const results = {
        successCount: 0,
        skippedCount: 0,
        errors: [] as string[]
    }

    // Pre-fetch all categories of type DEVICE for quick lookup
    const categoriesDb = await db.category.findMany({ where: { type: 'DEVICE' } })
    // Map with lowercase trimmed keys for forgiving matches
    const categoryMap = new Map(categoriesDb.map(c => [c.name.toLowerCase().trim(), c.id]))

    // Helper to get or create category
    async function getOrCreateCategory(name: string): Promise<string> {
        if (!name) return ''
        const key = name.toLowerCase().trim()
        if (categoryMap.has(key)) return categoryMap.get(key)!

        try {
            const newCat = await db.category.create({
                data: {
                    id: generateId('CAT'),
                    name: name.trim(),
                    type: 'DEVICE'
                }
            })
            categoryMap.set(key, newCat.id)
            return newCat.id
        } catch (e) {
            // Handle race condition or unique constraint softly
            const exist = await db.category.findUnique({ where: { name: name.trim() } })
            if (exist) {
                categoryMap.set(key, exist.id)
                return exist.id
            }
            return ''
        }
    }

    // Map Vietnamese status strings to ENUM
    function mapStatus(val?: string) {
        if (!val) return 'AVAILABLE'
        const norm = val.toLowerCase().trim()
        if (norm.includes('sử dụng')) return 'IN_USE'
        if (norm.includes('bảo trì')) return 'MAINTENANCE'
        if (norm.includes('thanh lý') || norm.includes('retired')) return 'RETIRED'
        if (norm.includes('mất') || norm.includes('lost')) return 'LOST'
        return 'AVAILABLE'
    }

    // Map Vietnamese condition strings to ENUM
    function mapCondition(val?: string) {
        if (!val) return 'NEW'
        const norm = val.toLowerCase().trim()
        if (norm.includes('tốt') || norm.includes('good')) return 'GOOD'
        if (norm.includes('khá') || norm.includes('fair')) return 'FAIR'
        if (norm.includes('kém') || norm.includes('poor')) return 'POOR'
        if (norm.includes('hỏng') || norm.includes('damaged')) return 'DAMAGED'
        return 'NEW'
    }

    // Process devices sequentially to safely create categories and manage DB concurrency
    for (let i = 0; i < body.devices.length; i++) {
        const raw = body.devices[i]
        const displayRowIndex = i + 2 // Because row 1 is usually headers

        if (!raw.name || !raw.categoryName) {
            results.errors.push(`Dòng ${displayRowIndex}: Thiếu trường bắt buộc (Tên, Danh mục)`)
            results.skippedCount++
            continue
        }

        const serialNumber = raw.serialNumber ? String(raw.serialNumber).trim() : null
        const existingDevice = serialNumber
            ? await db.device.findUnique({ where: { serialNumber } })
            : null

        if (existingDevice) {
            results.errors.push(`Dòng ${displayRowIndex}: Số Serial '${raw.serialNumber}' đã tồn tại trong hệ thống.`)
            results.skippedCount++
            continue
        }

        try {
            const categoryId = await getOrCreateCategory(String(raw.categoryName))
            if (!categoryId) {
                results.errors.push(`Dòng ${displayRowIndex}: Không thể xử lý danh mục '${raw.categoryName}'`)
                results.skippedCount++
                continue
            }

            const device = await db.device.create({
                data: {
                    id: generateId('DEV'),
                    name: String(raw.name),
                    serialNumber,
                    model: raw.model ? String(raw.model) : null,
                    manufacturer: raw.manufacturer ? String(raw.manufacturer) : null,
                    categoryId,
                    status: mapStatus(raw.status),
                    condition: mapCondition(raw.condition),
                    notes: raw.notes ? String(raw.notes) : null
                }
            })

            // Optional: log audit for this import (might generate many logs, consider one bulk log)
            await logAudit(event, {
                action: AuditAction.CREATE,
                entity: AuditEntity.DEVICE,
                entityId: device.id,
                details: { imported: true, ...device }
            })

            results.successCount++
        } catch (error: any) {
            results.errors.push(`Dòng ${displayRowIndex}: Lỗi hệ thống khi lưu - ${error.message || 'Unknown error'}`)
            results.skippedCount++
        }
    }

    return {
        success: true,
        results
    }
})
