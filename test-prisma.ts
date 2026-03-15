import db from './server/utils/db'

async function test() {
    try {
        console.log('Testing db.component...')
        if (db.component) {
            console.log('db.component exists!')
            const count = await db.component.count()
            console.log('Component count:', count)
        } else {
            console.log('db.component is UNDEFINED')
            console.log('Available models:', Object.keys(db).filter(k => !k.startsWith('$')))
        }

        console.log('Testing db.accessory...')
        if (db.accessory) {
            console.log('db.accessory exists!')
            const count = await db.accessory.count()
            console.log('Accessory count:', count)
        } else {
            console.log('db.accessory is UNDEFINED')
        }
    } catch (err) {
        console.error('Test error:', err)
    } finally {
        process.exit()
    }
}

test()
