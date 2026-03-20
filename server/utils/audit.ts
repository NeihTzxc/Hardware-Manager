import type { H3Event } from 'h3'
import db from './db'

export enum AuditAction {
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
    LOGIN = 'LOGIN',
    LOGOUT = 'LOGOUT',
    ASSIGN = 'ASSIGN',
    RETURN = 'RETURN',
    MAINTENANCE = 'MAINTENANCE'
}

export enum AuditEntity {
    DEVICE = 'DEVICE',
    USER = 'USER',
    ASSIGNMENT = 'ASSIGNMENT',
    CATEGORY = 'CATEGORY',
    COMPONENT = 'COMPONENT',
    ACCESSORY = 'ACCESSORY',
    SUPPLIER = 'SUPPLIER',
    LOCATION = 'LOCATION',
    TEMPLATE = 'TEMPLATE'
}

interface AuditLogOptions {
    action: AuditAction | string
    entity: AuditEntity | string
    entityId?: string
    details?: any
}

/**
 * Log an audit action to the database.
 * The userId is automatically extracted from event.context.auth.
 */
export const logAudit = async (event: H3Event, options: AuditLogOptions) => {
    const userId = event.context.auth?.userId

    try {
        await db.auditLog.create({
            data: {
                action: options.action,
                entity: options.entity,
                entityId: options.entityId,
                details: options.details ? JSON.parse(JSON.stringify(options.details)) : null,
                userId: userId || null
            }
        })
    } catch (error) {
        // We don't want audit log failures to break the main request
        console.error('Failed to create audit log:', error)
    }
}
