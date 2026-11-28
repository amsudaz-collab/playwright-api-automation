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

});
