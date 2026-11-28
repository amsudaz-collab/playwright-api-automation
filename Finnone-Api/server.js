
const express = require('express');
const { pool, connectDB } = require('./db');

const app = express();
app.use(express.json());

const PORT = 3000;
const VALID_TOKEN = 'finnone-practice-token';

// ------------------------------------
// Helper: Convert database row to API format
// ------------------------------------

function mapLoan(row) {
    if (!row) return null;

    return {
        loanId: row.loan_id,
        customerName: row.customer_name,
        loanAmount: Number(row.loan_amount),
        loanTenure: row.loan_tenure,
        employmentType: row.employment_type,
        monthlyIncome: Number(row.monthly_income),
        status: row.status,
        ...(row.closure_reason !== null && {
            closureReason: row.closure_reason
        }),
        ...(row.closure_date && {
            closureDate: row.closure_date instanceof Date
                ? row.closure_date.toISOString().slice(0, 10)
                : String(row.closure_date).slice(0, 10)
        })
    };
}

function mapPayment(row) {
    return {
        paymentId: row.payment_id,
        loanId: row.loan_id,
        amount: Number(row.amount),
        paymentDate: row.payment_date instanceof Date
            ? row.payment_date.toISOString().slice(0, 10)
            : String(row.payment_date).slice(0, 10),
        paymentMode: row.payment_mode,
        status: row.status
    };
}

// ------------------------------------
// 1. Login API
// ------------------------------------

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    if (username !== 'admin' || password !== 'admin123') {
        return res.status(401).json({
            message: 'Invalid username or password'
        });
    }

    return res.status(200).json({
        message: 'Login successful',
        accessToken: VALID_TOKEN,
        tokenType: 'Bearer'
    });
});

// ------------------------------------
// 2. Authentication Middleware
// ------------------------------------

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token !== VALID_TOKEN) {
        return res.status(401).json({
            message: 'Unauthorized - Invalid or missing token'
        });
    }

    next();
}

// ------------------------------------
// 3. POST - Create Loan
// ------------------------------------

app.post('/api/loans', authenticateToken, async (req, res) => {
    try {
        const {
            customerName,
            loanAmount,
            loanTenure,
            employmentType,
            monthlyIncome
        } = req.body;

        if (!customerName || !customerName.trim()) {
            return res.status(400).json({
                message: 'Customer name is mandatory'
            });
        }

        if (typeof loanAmount !== 'number' ||
            loanAmount < 50000 ||
            loanAmount > 1000000) {
            return res.status(400).json({
                message: 'Loan amount must be between 50000 and 1000000'
            });
        }

        if (!Number.isInteger(loanTenure) || loanTenure <= 0) {
            return res.status(400).json({
                message: 'Invalid loan tenure'
            });
        }

        if (typeof monthlyIncome !== 'number' || monthlyIncome <= 0) {
            return res.status(400).json({
                message: 'Invalid monthly income'
            });
        }

        const [result] = await pool.execute(
            `INSERT INTO loan_details
            (customer_name, loan_amount, loan_tenure,
             employment_type, monthly_income, status)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                customerName,
                loanAmount,
                loanTenure,
                employmentType || null,
                monthlyIncome,
                'Created'
            ]
        );

        const [rows] = await pool.execute(
            'SELECT * FROM loan_details WHERE loan_id = ?',
            [result.insertId]
        );

        return res.status(201).json({
            message: 'Loan created successfully',
            data: mapLoan(rows[0])
        });

    } catch (error) {
        console.error('Create Loan Error:', error.message);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
});

// ------------------------------------
// 4. GET - Retrieve Loan
// ------------------------------------

app.get('/api/loans/:loanId', authenticateToken, async (req, res) => {
    try {
        const id = Number(req.params.loanId);

        const [rows] = await pool.execute(
            'SELECT * FROM loan_details WHERE loan_id = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: 'Loan not found'
            });
        }

        return res.status(200).json({
            message: 'Loan details retrieved successfully',
            data: mapLoan(rows[0])
        });

    } catch (error) {
        console.error('Get Loan Error:', error.message);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
});

// ------------------------------------
// 5. POST - Loan Closure
// ------------------------------------

app.post('/api/loans/:loanId/close', authenticateToken, async (req, res) => {
    try {
        const id = Number(req.params.loanId);
        const { closureReason, closureDate } = req.body;

        const [rows] = await pool.execute(
            'SELECT * FROM loan_details WHERE loan_id = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: 'Loan not found'
            });
        }

        const loan = rows[0];

        if (loan.status === 'Closed') {
            return res.status(400).json({
                message: 'Loan is already closed'
            });
        }

        if (!closureReason || !closureReason.trim()) {
            return res.status(400).json({
                message: 'Closure reason is mandatory'
            });
        }

        if (!closureDate || isNaN(Date.parse(closureDate))) {
            return res.status(400).json({
                message: 'Valid closure date is mandatory'
            });
        }

        await pool.execute(
            `UPDATE loan_details
             SET status = ?, closure_reason = ?, closure_date = ?
             WHERE loan_id = ?`,
            ['Closed', closureReason, closureDate, id]
        );

        const [updatedRows] = await pool.execute(
            'SELECT * FROM loan_details WHERE loan_id = ?',
            [id]
        );

        return res.status(200).json({
            message: 'Loan closed successfully',
            data: mapLoan(updatedRows[0])
        });

    } catch (error) {
        console.error('Loan Closure Error:', error.message);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
});

// ------------------------------------
// 6. PATCH - Update Loan Status
// ------------------------------------

app.patch('/api/loans/:loanId', authenticateToken, async (req, res) => {
    try {
        const id = Number(req.params.loanId);
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                message: 'Loan status is mandatory'
            });
        }

        const [result] = await pool.execute(
            'UPDATE loan_details SET status = ? WHERE loan_id = ?',
            [status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Loan not found'
            });
        }

        const [rows] = await pool.execute(
            'SELECT * FROM loan_details WHERE loan_id = ?',
            [id]
        );

        return res.status(200).json({
            message: 'Loan status updated successfully',
            data: mapLoan(rows[0])
        });

    } catch (error) {
        console.error('Patch Loan Error:', error.message);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
});

// ------------------------------------
// 7. PUT - Update Complete Loan
// ------------------------------------

app.put('/api/loans/:loanId', authenticateToken, async (req, res) => {
    try {
        const id = Number(req.params.loanId);

        const {
            customerName,
            loanAmount,
            loanTenure,
            employmentType,
            monthlyIncome,
            status
        } = req.body;

        if (!customerName || !customerName.trim()) {
            return res.status(400).json({
                message: 'Customer name is mandatory'
            });
        }

        if (typeof loanAmount !== 'number' ||
            loanAmount < 50000 ||
            loanAmount > 1000000) {
            return res.status(400).json({
                message: 'Invalid loan amount'
            });
        }

        if (!Number.isInteger(loanTenure) || loanTenure <= 0) {
            return res.status(400).json({
                message: 'Invalid loan tenure'
            });
        }

        if (typeof monthlyIncome !== 'number' || monthlyIncome <= 0) {
            return res.status(400).json({
                message: 'Invalid monthly income'
            });
        }

        const [result] = await pool.execute(
            `UPDATE loan_details
             SET customer_name = ?,
                 loan_amount = ?,
                 loan_tenure = ?,
                 employment_type = ?,
                 monthly_income = ?,
                 status = ?
             WHERE loan_id = ?`,
            [
                customerName,
                loanAmount,
                loanTenure,
                employmentType || null,
                monthlyIncome,
                status || 'Created',
                id
            ]
        );

        if (result.affectedRows === 0) {
            const [check] = await pool.execute(
                'SELECT loan_id FROM loan_details WHERE loan_id = ?',
                [id]
            );

            if (check.length === 0) {
                return res.status(404).json({
                    message: 'Loan not found'
                });
            }
        }

        const [rows] = await pool.execute(
            'SELECT * FROM loan_details WHERE loan_id = ?',
            [id]
        );

        return res.status(200).json({
            message: 'Loan details updated successfully',
            data: mapLoan(rows[0])
        });

    } catch (error) {
        console.error('Update Loan Error:', error.message);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
});

// ------------------------------------
// 8. DELETE - Delete Loan
// ------------------------------------

app.delete('/api/loans/:loanId', authenticateToken, async (req, res) => {
    let connection;

    try {
        const id = Number(req.params.loanId);

        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [rows] = await connection.execute(
            'SELECT * FROM loan_details WHERE loan_id = ?',
            [id]
        );

        if (rows.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                message: 'Loan not found'
            });
        }

        const deletedLoan = mapLoan(rows[0]);

        // Delete related payments first because of the foreign key.
        await connection.execute(
            'DELETE FROM loan_payments WHERE loan_id = ?',
            [id]
        );

        await connection.execute(
            'DELETE FROM loan_details WHERE loan_id = ?',
            [id]
        );

        await connection.commit();

        return res.status(200).json({
            message: 'Loan deleted successfully',
            data: deletedLoan
        });

    } catch (error) {
        if (connection) await connection.rollback();

        console.error('Delete Loan Error:', error.message);
        return res.status(500).json({
            message: 'Internal server error'
        });

    } finally {
        if (connection) connection.release();
    }
});

// ------------------------------------
// 9. GET - Retrieve Loan Payment History
// ------------------------------------

app.get('/api/loans/:loanId/payments', authenticateToken, async (req, res) => {
    try {
        const id = Number(req.params.loanId);

        const [loans] = await pool.execute(
            'SELECT loan_id FROM loan_details WHERE loan_id = ?',
            [id]
        );

        if (loans.length === 0) {
            return res.status(404).json({
                message: 'Loan not found'
            });
        }

        const [rows] = await pool.execute(
            'SELECT * FROM loan_payments WHERE loan_id = ? ORDER BY payment_id',
            [id]
        );

        return res.status(200).json({
            message: 'Payment history retrieved successfully',
            data: {
                loanId: id,
                paymentHistory: rows.map(mapPayment)
            }
        });

    } catch (error) {
        console.error('Get Payments Error:', error.message);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
});

// ------------------------------------
// 10. POST - Record Loan Payment
// ------------------------------------

app.post('/api/loans/:loanId/payments', authenticateToken, async (req, res) => {
    try {
        const id = Number(req.params.loanId);
        const { amount, paymentDate, paymentMode } = req.body;

        const [loans] = await pool.execute(
            'SELECT loan_id FROM loan_details WHERE loan_id = ?',
            [id]
        );

        if (loans.length === 0) {
            return res.status(404).json({
                message: 'Loan not found'
            });
        }

        if (typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({
                message: 'Valid payment amount is required'
            });
        }

        if (!paymentDate || !paymentMode) {
            return res.status(400).json({
                message: 'Payment date and payment mode are required'
            });
        }

        const [result] = await pool.execute(
            `INSERT INTO loan_payments
             (loan_id, amount, payment_date, payment_mode, status)
             VALUES (?, ?, ?, ?, ?)`,
            [id, amount, paymentDate, paymentMode, 'Success']
        );

        const [rows] = await pool.execute(
            'SELECT * FROM loan_payments WHERE payment_id = ?',
            [result.insertId]
        );

        return res.status(201).json({
            message: 'Payment recorded successfully',
            data: mapPayment(rows[0])
        });

    } catch (error) {
        console.error('Create Payment Error:', error.message);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
});

app.post('/api/loans/:loanId/approvals',
    authenticateToken, async (req, res) => {
        console.log("APPROVAL ROUTE HIT");

    let connection;

    try {
    console.log("STEP 1: Approval API started");

    const loanId = Number(req.params.loanId);
    const { approverName, approvalStatus, remarks } = req.body;

    if (!approverName || !approvalStatus) {
        return res.status(400).json({
            message: "Approver name and approval status are required"
        });
    }

    if (!['Approved', 'Rejected'].includes(approvalStatus)) {
        return res.status(400).json({
            message: "Invalid approval status"
        });
    }

    connection = await pool.getConnection();
    console.log("STEP 2: Database connection acquired");

    await connection.beginTransaction();
    console.log("STEP 3: Transaction started");

    const [loans] = await connection.execute(
        'SELECT * FROM loan_details WHERE loan_id = ? FOR UPDATE',
        [loanId]
    );

    console.log("STEP 4: Loan retrieved");

    if (loans.length === 0) {
        await connection.rollback();

        return res.status(404).json({
            message: "Loan not found"
        });
    }

    const oldStatus = loans[0].status;

    if (['Approved', 'Rejected', 'Closed'].includes(oldStatus)) {
        await connection.rollback();

        return res.status(400).json({
            message: "Loan already has a final decision or is closed"
        });
    }

    const [result] = await connection.execute(
        `INSERT INTO loan_approvals
        (loan_id, approver_name, approval_status, remarks)
        VALUES (?, ?, ?, ?)`,
        [loanId, approverName, approvalStatus, remarks || null]
    );

    console.log("STEP 5: Approval inserted");

    await connection.execute(
        'UPDATE loan_details SET status = ? WHERE loan_id = ?',
        [approvalStatus, loanId]
    );

    console.log("STEP 6: Loan status updated");

    await connection.execute(
        `INSERT INTO loan_status_history
        (loan_id, old_status, new_status, remarks)
        VALUES (?, ?, ?, ?)`,
        [loanId, oldStatus, approvalStatus, remarks || null]
    );

    console.log("STEP 7: Status history inserted");

    await connection.commit();

    console.log("STEP 8: Transaction committed");

    return res.status(201).json({
        message: "Loan approval decision recorded successfully",
        data: {
            approvalId: result.insertId,
            loanId,
            approverName,
            approvalStatus,
            remarks: remarks || null
        }
    });

} catch (error) {

    if (connection) {
        await connection.rollback();
    }

    console.error("Loan Approval Error:", error);

    return res.status(500).json({
        message: "Internal server error",
        error: error.message
    });

} finally {

    if (connection) {
        connection.release();
    }
}
});

// ------------------------------------
// 11. Start Server After DB Connection
// ------------------------------------

async function startServer() {
    try {
        await connectDB();

        const server = app.listen(PORT, () => {
            console.log(`Mock Banking API running on port ${PORT}`);
        });

        async function shutdown() {
            console.log('Shutting down server...');
            server.close(async () => {
                await pool.end();
                console.log('MySQL connection pool closed');
                process.exit(0);
            });
        }

        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);

    } catch (error) {
        console.error('Server startup failed:', error.message);
        await pool.end();
        process.exit(1);
    }
}

startServer();
