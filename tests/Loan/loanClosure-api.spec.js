const apiConfig = require('./config/apiConfig');
const { test, expect } = require('@playwright/test');
const { createLoan, closeLoan } = require('../../utils/apiHelper');

test.describe('Loan Closure API Tests', () => {

    let loanId;

    test.beforeAll(async ({ request }) => {

        // Create a loan before testing closure
        const loanDetails = {
            customerName: 'Amsu',
            loanAmount: 200000,
            loanTenure: 36,
            employmentType: 'Salaried',
            monthlyIncome: 50000
        };

        const response = await createLoan(request, loanDetails);

        expect(response.status()).toBe(201);

        const responseBody = await response.json();

        loanId = responseBody.data.loanId;

        console.log('Generated Loan ID:', loanId);
    });

    test('TC01 - Close loan successfully', async ({ request }) => {

        const closureData = {
            closureReason: 'Full repayment',
            closureDate: '2026-11-26'
        };

        const response = await closeLoan(
            request,
            loanId,
            closureData
        );

        expect(response.status()).toBe(200);

        const responseBody = await response.json();

        expect(responseBody.message).toBe('Loan closed successfully');
        expect(responseBody.data.loanId).toBe(loanId);
        expect(responseBody.data.status).toBe('Closed');
        expect(responseBody.data.closureReason).toBe('Full repayment');

        console.log('Loan Closure Successful:', loanId);
    });

    // TC02 - Invalid Loan ID
    test('TC02 - Close loan with invalid Loan ID', async ({ request }) => {

        const response = await closeLoan(
            request,
            999999,
            {
                closureReason: 'Full repayment',
                closureDate: '2026-11-26'
            }
        );

        expect(response.status()).toBe(404);

        const responseBody = await response.json();

        expect(responseBody.message).toBe('Loan not found');

        console.log('Invalid Loan ID validation successful');
    });


    // TC03 - Missing Closure Reason
    test('TC03 - Close loan without closure reason', async ({ request }) => {

        const response = await closeLoan(
            request,
            loanId,
            {
                closureReason: '',
                closureDate: '2026-11-26'
            }
        );

        expect(response.status()).toBe(400);

        const responseBody = await response.json();

        expect(responseBody.message).toBe('Closure reason is mandatory');

        console.log('Missing closure reason validation successful');
    });


    // TC04 - Already Closed Loan
    
test('TC04 - Close an already closed loan', async ({ request }) => {

    // Step 1: Create a new loan
    const loanDetails = {
        customerName: 'TestCustomer',
        loanAmount: 200000,
        loanTenure: 36,
        employmentType: 'Salaried',
        monthlyIncome: 50000
    };

    const createResponse = await createLoan(request, loanDetails);

    expect(createResponse.status()).toBe(201);

    const createBody = await createResponse.json();

    const newLoanId = createBody.data.loanId;

    console.log('Generated Loan ID:', newLoanId);

    const closureData = {
        closureReason: 'Full repayment',
        closureDate: '2026-11-26'
    };

    // Step 2: Close the loan for the first time
    const firstResponse = await closeLoan(
        request,
        newLoanId,
        closureData
    );

    expect(firstResponse.status()).toBe(200);

    console.log('First closure successful');

    // Step 3: Attempt to close the same loan again
    const secondResponse = await closeLoan(
        request,
        newLoanId,
        closureData
    );

    expect(secondResponse.status()).toBe(400);

    const responseBody = await secondResponse.json();

    expect(responseBody.message).toBe('Loan is already closed');

    console.log('Already closed loan validation successful');
});


    // TC05 - Missing Authentication Token
    test('TC05 - Close loan without authentication', async ({ request }) => {

        const response = await request.post(
    `${apiConfig.baseURL}/api/loans/${loanId}/close`,
            {
                data: {
                    closureReason: 'Full repayment',
                    closureDate: '2026-11-26'
                }
            }
        );

        expect(response.status()).toBe(401);

        const responseBody = await response.json();

        expect(responseBody.message).toContain('Unauthorized');

        console.log('Authentication validation successful');
    });


});
