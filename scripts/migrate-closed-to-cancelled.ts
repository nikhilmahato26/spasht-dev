import 'dotenv/config'
import { db as prisma } from '../src/lib/db'

async function main() {
  console.log("Migrating deals with status CLOSED to CANCELLED...")
  // Using queryRawUnsafe since 'CLOSED' might not exist in the new generated types
  // once the schema is updated and prisma client is re-generated.
  const result = await prisma.$executeRawUnsafe(`
    UPDATE "Deal"
    SET "status" = 'CANCELLED'
    WHERE "status" = 'CLOSED'
  `)
  
  console.log(`Updated ${result} deals from CLOSED to CANCELLED.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
