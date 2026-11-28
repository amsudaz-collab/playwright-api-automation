
const { connectDB, pool } = require('./db');

async function testConnection() {
    try {
        await connectDB();

        const [rows] = await pool.query('SHOW TABLES');

        console.log('Available database tables:', rows);
    } catch (error) {
        console.error(error);
    } finally {
        await pool.end();
    }
}

testConnection();

