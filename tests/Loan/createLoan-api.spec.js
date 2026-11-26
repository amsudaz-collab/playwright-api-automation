
const { test, expect } = require('@playwright/test');

const loanData = require('../../test-data/loanTestData.json');
const { createLoan } = require('../../utils/apiHelper');

test.describe('Dynamic Loan API Tests - Excel Data', () => {

    // Dynamically register one test for every Excel record
    for (const data of loanData) {

        test(`${data.TC_ID} - ${data.CustomerName}`, async ({ request }) => {

            console.log(`\nStarting Test Case: ${data.TC_ID}`);

            // Prepare loan request payload
            const loanDetails = {
                customerName: data.CustomerName,
                loanAmount: data.LoanAmount,
                loanTenure: data.LoanTenure,
                monthlyIncome: data.MonthlyIncome
            };

            console.log('Request Payload:', loanDetails);

            // Execute API request using centralized helper
            const response = await createLoan(request, loanDetails);

            const actualStatus = response.status();

            console.log(`${data.TC_ID} Response Status:`, actualStatus);

            // Validate HTTP status code
            expect(actualStatus).toBe(data.ExpectedStatus);

            // Validate response body for successful loan creation
            if (data.ExpectedStatus === 201) {

                const responseBody = await response.json();

                console.log(
                    'Full API Response:',
                    JSON.stringify(responseBody, null, 2)
                );

                // Access nested data object
                const loan = responseBody.data;

                // Validate loan details
                expect(loan.customerName).toBe(data.CustomerName);
                expect(loan.loanAmount).toBe(data.LoanAmount);
                expect(loan.loanTenure).toBe(data.LoanTenure);
                expect(loan.monthlyIncome).toBe(data.MonthlyIncome);

                // Validate generated loan ID
                expect(loan.loanId).toBeTruthy();

                // Validate initial loan status
                expect(loan.status).toBe('Created');

                console.log(`${data.TC_ID} Loan ID: ${loan.loanId}`);
                console.log(
                    `${data.TC_ID}: Loan created and validated successfully`
                );
            }

            // Log negative test case result
            if (data.ExpectedStatus === 400) {
                console.log(
                    `${data.TC_ID}: Invalid loan data rejected successfully`
                );
            }
        });
    }
});
