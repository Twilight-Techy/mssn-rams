const { neon } = require('@neondatabase/serverless');

async function test() {
    const sql = neon("postgresql://neondb_owner:npg_XVFBztDba28P@ep-curly-sun-aiippdlq-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require");
    try {
        const rows = await sql`SELECT * FROM users LIMIT 1`;
        console.log("Success:", rows);
    } catch (e) {
        console.error("DB Error:", e);
    }
}
test();
