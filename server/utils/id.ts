import crypto from 'crypto'

type Prefix = 'USR' | 'CAT' | 'DEV' | 'SUP' | 'LOC' | 'CMP' | 'ACC' | 'DOM' | 'SSL' | 'SFT' | 'LIC'

export function generateId(prefix: Prefix): string {
    const random = crypto.randomBytes(4).toString('hex').toUpperCase()
    const timestamp = Date.now().toString(36).toUpperCase()
    return `${prefix}-${timestamp}-${random}`
}
