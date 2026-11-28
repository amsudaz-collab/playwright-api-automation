
const { test, expect } = require('@playwright/test');
const { createLoan } = require('../../utils/apiHelper');
const { requestWithAuth } = require('../../utils/authHelper');
const apiConfig = require('./config/apiConfig');


test.describe('Payment API Tests', () => {

    let loanId;
    let paymentId;

    test.beforeAll(async ({ request }) => {

        const loanData = {
            customerName: 'Amsu',
            amount: 100000,
            tenure: 36,
            monthlyIncome: 50000
        };

        const response = await createLoan(request, loanData);
        const body = await response.json();
console.log(response.body)

console.log('Loan creation status:', response.status());
console.log('Loan creation response:', body);
console.log(response.body)
console.log(request.body)

expect(response.status()).toBe(201);

        loanId = body.data.loanId;

        console.log('Created Loan ID:', loanId);
    });

    test('TC01 - Record payment successfully', async ({ request }) => {

        const paymentData = {
            amount: 10000,
            paymentDate: '2026-11-26',
            paymentMode: 'UPI'
        };

        const response = await requestWithAuth(request, token =>
            request.post(
                `${apiConfig.baseURL}/api/loans/${loanId}/payments`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    data: paymentData
                }
            )
        );

        const body = await response.json();

        expect(response.status()).toBe(201);
        expect(body.message).toBe('Payment recorded successfully');

        paymentId = body.data.paymentId;

        expect(body.data.loanId).toBe(loanId);
        expect(body.data.amount).toBe(10000);
        expect(body.data.paymentMode).toBe('UPI');

        console.log('Payment ID:', paymentId);
    });

    test('TC02 - Retrieve payment history', async ({ request }) => {

        const response = await requestWithAuth(request, token =>
            request.get(
                `${apiConfig.baseURL}/api/loans/${loanId}/payments`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
        );

        const body = await response.json();

        expect(response.status()).toBe(200);
        expect(body.data.loanId).toBe(loanId);
        expect(body.data.paymentHistory).toHaveLength(1);

        expect(body.data.paymentHistory[0].paymentId).toBe(paymentId);
        expect(body.data.paymentHistory[0].amount).toBe(10000);

        console.log('Payment history validation successful');
    });

});
