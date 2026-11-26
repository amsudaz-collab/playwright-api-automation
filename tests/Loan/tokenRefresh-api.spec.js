
const { test, expect } = require('@playwright/test');

const apiConfig = require('./config/apiConfig');
const { requestWithAuth } = require('../../utils/authHelper');

test('Verify 401 token refresh and API retry', async ({ request }) => {

    let firstAttempt = true;

    const response = await requestWithAuth(request, (token) => {

        // Deliberately send an invalid token on the first attempt
        const tokenToUse = firstAttempt
            ? 'invalid-token'
            : token;

        firstAttempt = false;

        return request.post(
            `${apiConfig.baseURL}${apiConfig.endpoints.loans}`,
            {
                headers: {
                    Authorization: `Bearer ${tokenToUse}`
                },
                data: {
                    customerName: 'Amsu',
                    loanAmount: 200000,
                    loanTenure: 36,
                    employmentType: 'Salaried',
                    monthlyIncome: 50000
                }
            }
        );
    });

    console.log('Final API Status:', response.status());

    expect(response.status()).toBe(201);

    const responseBody = await response.json();

    expect(responseBody.data.customerName).toBe('Amsu');

    console.log('Token refresh and retry successful');
});
