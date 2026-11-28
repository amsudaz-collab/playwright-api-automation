
const { test, expect } = require('@playwright/test');

const { createLoan,closeLoan,
 approveLoan } = require('../../utils/apiHelper');

const {
    getLoanById,
    getApprovalByLoanId,
    getStatusHistoryByLoanId,
    closeDB
} = require('../../utils/DBUtils');

test.describe('Loan Approval API Tests - API + MySQL', () => {

    test('TC_APPROVAL_01 - Approve a valid loan', async ({ request }) => {

        console.log('\nStarting Loan Approval Test');

        // 1. Create a fresh loan
        const loanPayload = {
            customerName: 'Approval Test Customer',
            loanAmount: 200000,
            loanTenure: 36,
            monthlyIncome: 50000
        };

        const createResponse = await createLoan(request, loanPayload);

        expect(createResponse.status()).toBe(201);

        const createBody = await createResponse.json();
        const loanId = createBody.data.loanId;

        console.log('Generated Loan ID:', loanId);

        // 2. Approve the loan
        const approvalPayload = {
            approverName: 'Admin',
            approvalStatus: 'Approved',
            remarks: 'Customer eligibility verified'
        };

        const approvalResponse = await approveLoan(
            request,
            loanId,
            approvalPayload
        );

        expect(approvalResponse.status()).toBe(201);

        const approvalBody = await approvalResponse.json();

        expect(approvalBody.message)
            .toBe('Loan approval decision recorded successfully');

        expect(approvalBody.data.loanId).toBe(loanId);
        expect(approvalBody.data.approvalStatus).toBe('Approved');

        console.log('Approval API Response:', approvalBody);

        // 3. Validate loan details in MySQL
        const loanRecords = await getLoanById(loanId);

        expect(loanRecords.length).toBe(1);
        expect(loanRecords[0].status).toBe('Approved');

        // 4. Validate approval record in MySQL
        const approvalRecords = await getApprovalByLoanId(loanId);

        expect(approvalRecords.length).toBe(1);
        expect(approvalRecords[0].approver_name).toBe('Admin');
        expect(approvalRecords[0].approval_status).toBe('Approved');
        

        // 5. Validate status history in MySQL
        const historyRecords = await getStatusHistoryByLoanId(loanId);

        expect(historyRecords.length).toBe(1);
        expect(historyRecords[0].new_status).toBe('Approved');

        console.log('Loan Details SQL Validation Passed');
        console.log('Approval SQL Validation Passed');
        console.log('Status History SQL Validation Passed');

        console.log('TC_APPROVAL_01 PASSED');
    });

test('TC_APPROVAL_02 - Reject a valid loan', async ({ request }) => {

    console.log('\nStarting Loan Rejection Test');

    // 1. Create a fresh loan
    const loanPayload = {
        customerName: 'Rejection Test Customer',
        loanAmount: 200000,
        loanTenure: 36,
        monthlyIncome: 50000
    };

    const createResponse = await createLoan(request, loanPayload);

    expect(createResponse.status()).toBe(201);

    const createBody = await createResponse.json();
    const loanId = createBody.data.loanId;

    console.log('Generated Loan ID:', loanId);

    // 2. Reject the loan
    const rejectionPayload = {
        approverName: 'Admin',
        approvalStatus: 'Rejected',
        remarks: 'Customer eligibility criteria not satisfied'
    };

    const rejectionResponse = await approveLoan(
        request,
        loanId,
        rejectionPayload
    );

    expect(rejectionResponse.status()).toBe(201);

    const rejectionBody = await rejectionResponse.json();

    expect(rejectionBody.data.loanId).toBe(loanId);
    expect(rejectionBody.data.approvalStatus).toBe('Rejected');

    console.log('Rejection API Response:', rejectionBody);

    // 3. Validate loan details in MySQL
    const loanRecords = await getLoanById(loanId);

    expect(loanRecords.length).toBe(1);
    expect(loanRecords[0].status).toBe('Rejected');

    // 4. Validate approval record
    const approvalRecords = await getApprovalByLoanId(loanId);

    expect(approvalRecords.length).toBe(1);
    expect(approvalRecords[0].approval_status).toBe('Rejected');

    // 5. Validate status history
    const historyRecords = await getStatusHistoryByLoanId(loanId);

    expect(historyRecords.length).toBe(1);
    expect(historyRecords[0].new_status).toBe('Rejected');

    console.log('Loan Rejection SQL Validation Passed');
    console.log('TC_APPROVAL_02 PASSED');
});

test('TC_APPROVAL_03 - Prevent duplicate loan approval', async ({ request }) => {

    console.log('\nStarting Duplicate Approval Test');

    // 1. Create a fresh loan
    const loanPayload = {
        customerName: 'Duplicate Approval Customer',
        loanAmount: 200000,
        loanTenure: 36,
        monthlyIncome: 50000
    };

    const createResponse = await createLoan(request, loanPayload);

    expect(createResponse.status()).toBe(201);

    const createBody = await createResponse.json();
    const loanId = createBody.data.loanId;

    console.log('Generated Loan ID:', loanId);

    // 2. First approval - should succeed
    const approvalPayload = {
        approverName: 'Admin',
        approvalStatus: 'Approved',
        remarks: 'First approval decision'
    };

    const firstApproval = await approveLoan(
        request,
        loanId,
        approvalPayload
    );

    expect(firstApproval.status()).toBe(201);

    console.log('First approval successful');

    // 3. Second approval - should be rejected
    const duplicatePayload = {
        approverName: 'Admin',
        approvalStatus: 'Approved',
        remarks: 'Duplicate approval attempt'
    };

    const duplicateResponse = await approveLoan(
        request,
        loanId,
        duplicatePayload
    );

    expect(duplicateResponse.status()).toBe(400);

    const duplicateBody = await duplicateResponse.json();

    expect(duplicateBody.message).toBe(
        'Loan already has a final decision or is closed'
    );

    console.log('Duplicate Approval Response:', duplicateBody);

    // 4. Validate loan status in MySQL
    const loanRecords = await getLoanById(loanId);

    expect(loanRecords.length).toBe(1);
    expect(loanRecords[0].status).toBe('Approved');

    // 5. Validate only one approval record exists
    const approvalRecords = await getApprovalByLoanId(loanId);

    expect(approvalRecords.length).toBe(1);
    expect(approvalRecords[0].approval_status).toBe('Approved');

    // 6. Validate only one status history record exists
    const historyRecords = await getStatusHistoryByLoanId(loanId);

    expect(historyRecords.length).toBe(1);
    expect(historyRecords[0].new_status).toBe('Approved');

    console.log('Duplicate Approval SQL Validation Passed');
    console.log('TC_APPROVAL_03 PASSED');
});
test('TC_APPROVAL_04 - Prevent approval after loan closure', async ({ request }) => {

    console.log('Starting Approval After Closure Test');

    // Step 1: Create a new loan
    const loanResponse = await createLoan(request, {
        customerName: 'Test Customer',
        loanAmount: 200000,
        loanType: 'Personal',
        loanTenure: 24,
        employmentType: 'Salaried',
        monthlyIncome: 50000
    });

    expect(loanResponse.status()).toBe(201);

    const loanBody = await loanResponse.json();
    const loanId = loanBody.data.loanId;

    console.log('Generated Loan ID:', loanId);

    // Step 2: Close the loan
    const closeResponse = await closeLoan(request, loanId, {
    closureReason: 'Customer requested loan closure',
    closureDate: new Date().toISOString().split('T')[0]
});

console.log('Close Loan Status:', closeResponse.status());

const closeBody = await closeResponse.json();

console.log('Close Loan Response:', closeBody);

expect(closeResponse.status()).toBe(200);
    // Step 3: Verify loan is closed
    const loanDetails = await getLoanById(loanId);

    expect(loanDetails[0].status).toBe('Closed');

    // Step 4: Capture history count after closure
    const historyBefore = await getStatusHistoryByLoanId(loanId);

    // Step 5: Try to approve the closed loan
    const approvalResponse = await approveLoan(request, loanId, {
        approverName: 'Admin',
        approvalStatus: 'Approved',
        remarks: 'Attempt to approve closed loan'
    });

    expect(approvalResponse.status()).toBe(400);

    const approvalBody = await approvalResponse.json();

    expect(approvalBody.message).toBe(
        'Loan already has a final decision or is closed'
    );

    // Step 6: Validate database
    const approvalRecords = await getApprovalByLoanId(loanId);
    const historyAfter = await getStatusHistoryByLoanId(loanId);

    expect(approvalRecords.length).toBe(0);

    expect(historyAfter.length).toBe(historyBefore.length);

    const finalLoanDetails = await getLoanById(loanId);

    expect(finalLoanDetails[0].status).toBe('Closed');

    console.log('Approval After Closure SQL Validation Passed');
    console.log('TC_APPROVAL_04 PASSED');

});

});


test.afterAll(async () => {
    await closeDB();
});
