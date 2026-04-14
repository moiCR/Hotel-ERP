import 'dotenv/config'
import { db } from './server/utils/db'

async function main() {
    console.log("DATABASE_URL:", process.env.DATABASE_URL)
    const logs = await db.bitacora.findMany()
    console.log("DB logs count:", logs.length)
}
main().catch(console.error).finally(() => process.exit(0))
