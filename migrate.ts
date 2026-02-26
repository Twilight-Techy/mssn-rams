import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { usersTable } from './src/db/schema';
import { eq, isNull, and } from 'drizzle-orm';
import { config } from 'dotenv';
config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function main() {
    console.log("Starting DB classification migration...");

    try {
        // 1. Migrate 'Diploma'
        const diplomaRes = await db.update(usersTable)
            .set({ classification: 'diploma', department: null })
            .where(eq(usersTable.department as any, 'Diploma'));
        console.log("Migrated Diploma users.");

        // 2. Migrate 'Part-Time'
        const partTimeRes = await db.update(usersTable)
            .set({ classification: 'part_time', department: null })
            .where(eq(usersTable.department as any, 'Part-Time'));
        console.log("Migrated Part-Time users.");

        // 3. Migrate 'PDS'
        const pdsRes = await db.update(usersTable)
            .set({ classification: 'pds', department: null })
            .where(eq(usersTable.department as any, 'PDS'));
        console.log("Migrated PDS users.");

        // 4. Set remaining Muslim Students to 'full_time_undergraduate' if they don't have a classification yet
        const undergradRes = await db.update(usersTable)
            .set({ classification: 'full_time_undergraduate' })
            .where(
                and(
                    eq(usersTable.category, 'student'),
                    eq(usersTable.isMuslim, true),
                    isNull(usersTable.classification)
                )
            );
        console.log("Migrated remaining valid Muslim Students to full_time_undergraduate.");

        console.log("Migration completed successfully.");
    } catch (e) {
        console.error("Migration failed:", e);
    }
}

main().catch(console.error);
