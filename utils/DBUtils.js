
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 5
});

async function connectDB() {
    const connection = await pool.getConnection();
    console.log('MySQL Connected Successfully');
    connection.release();
}

async function executeQuery(sql, params = []) {
    const [rows] = await pool.execute(sql, params);
    return rows;
}

async function getLoanById(loanId) {
    return await executeQuery(
        'SELECT * FROM loan_details WHERE loan_id = ?',
        [loanId]
    );
}

async function closeDB() {
    await pool.end();
}
// Get loan approval records
async function getApprovalByLoanId(loanId) {
    return await executeQuery(
        'SELECT * FROM loan_approvals WHERE loan_id = ?',
        [loanId]
    );
}

// Get loan status history
async function getStatusHistoryByLoanId(loanId) {
    return await executeQuery(
        'SELECT * FROM loan_status_history WHERE loan_id = ?',
        [loanId]
    );
}

module.exports = {
    pool,
    connectDB,
    executeQuery,
    getLoanById,
    getApprovalByLoanId,
    getStatusHistoryByLoanId,
    closeDB
};
