
const express = require('express');

const app = express();

app.use(express.json());

// ------------------------------------
// 1. Initialize loan storage
// ------------------------------------

let loanId = 1000;
let loans = [];

// Practice authentication token
const VALID_TOKEN = 'finnone-practice-token';

// ------------------------------------
// 2. Login API - Generate Token
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
// 3. Authentication Middleware
// ------------------------------------

function authenticateToken(req, res, next) {

    const authHeader = req.headers['authorization'];

    const token = authHeader && authHeader.split(' ')[1];

    if (token !== VALID_TOKEN) {
        return res.status(401).json({
            message: 'Unauthorized - Invalid or missing token'
        });
    }

    next();
}

// ------------------------------------
// 4. POST API - Create Loan
// ------------------------------------

app.post('/api/loans', authenticateToken, (req, res) => {

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

    const loan = {
        loanId: ++loanId,
        customerName,
        loanAmount,
        loanTenure,
        employmentType,
        monthlyIncome,
        status: 'Created'
    };

    loans.push(loan);

    return res.status(201).json({
        message: 'Loan created successfully',
        data: loan
    });
});

// ------------------------------------
// 5. GET API - Retrieve Loan
// ------------------------------------

app.get('/api/loans/:loanId', authenticateToken, (req, res) => {

    const id = Number(req.params.loanId);

    const loan = loans.find(item => item.loanId === id);

    if (!loan) {
        return res.status(404).json({
            message: 'Loan not found'
        });
    }

    return res.status(200).json({
        message: 'Loan details retrieved successfully',
        data: loan
    });
});

// ------------------------------------
// 6. PATCH API - Update Loan Status
// ------------------------------------

app.patch('/api/loans/:loanId', authenticateToken, (req, res) => {

    const id = Number(req.params.loanId);
    const { status } = req.body;

    const loan = loans.find(item => item.loanId === id);

    if (!loan) {
        return res.status(404).json({
            message: 'Loan not found'
        });
    }

    if (!status) {
        return res.status(400).json({
            message: 'Loan status is mandatory'
        });
    }

    loan.status = status;

    return res.status(200).json({
        message: 'Loan status updated successfully',
        data: loan
    });
});

// ------------------------------------
// 7. PUT API - Update Complete Loan
// ------------------------------------

app.put('/api/loans/:loanId', authenticateToken, (req, res) => {

    const id = Number(req.params.loanId);

    const loan = loans.find(item => item.loanId === id);

    if (!loan) {
        return res.status(404).json({
            message: 'Loan not found'
        });
    }

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

    Object.assign(loan, {
        customerName,
        loanAmount,
        loanTenure,
        employmentType,
        monthlyIncome,
        status
    });

    return res.status(200).json({
        message: 'Loan details updated successfully',
        data: loan
    });
});

// ------------------------------------
// 8. DELETE API - Delete Loan
// ------------------------------------

app.delete('/api/loans/:loanId', authenticateToken, (req, res) => {

    const id = Number(req.params.loanId);

    const loanIndex = loans.findIndex(
        item => item.loanId === id
    );

    if (loanIndex === -1) {
        return res.status(404).json({
            message: 'Loan not found'
        });
    }

    const deletedLoan = loans.splice(loanIndex, 1);

    return res.status(200).json({
        message: 'Loan deleted successfully',
        data: deletedLoan[0]
    });
});

// ------------------------------------
// 9. Start Server
// ------------------------------------

app.listen(3000, () => {
    console.log('Mock Banking API running on port 3000');
});
