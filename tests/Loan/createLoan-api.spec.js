
const { test, expect } = require('@playwright/test');

const loanData = require('../../test-data/loanTestData.json');
const { createLoan } = require('../../utils/apiHelper');

const {
    getLoanById,
    closeDB
} = require('../../utils/DBUtils');

test.describe('Dynamic Loan API Tests - Excel Data + SQL', () => {

    for (const data of loanData) {

        test(`${data.TC_ID} - ${data.CustomerName}`, async ({ request }) => {

            console.log(`\nStarting Test Case: ${data.TC_ID}`);

            // 1. Prepare loan payload
            const loanDetails = {
                customerName: data.CustomerName,
                loanAmount: data.LoanAmount,
                loanTenure: data.LoanTenure,
                monthlyIncome: data.MonthlyIncome
            };

            console.log('Request Payload:', loanDetails);

            // 2. Create loan using API
            const response = await createLoan(request, loanDetails);

            const actualStatus = response.status();

            console.log('API Response Status:', actualStatus);

            expect(actualStatus).toBe(data.ExpectedStatus);

            // 3. Validate successful loan creation
            if (data.ExpectedStatus === 201) {

                const responseBody = await response.json();
                const loan = responseBody.data;

                console.log('API Response:', responseBody);

                expect(loan.customerName).toBe(data.CustomerName);
                expect(loan.loanAmount).toBe(data.LoanAmount);
                expect(loan.loanTenure).toBe(data.LoanTenure);
                expect(loan.monthlyIncome).toBe(data.MonthlyIncome);

                expect(loan.loanId).toBeTruthy();
                expect(loan.status).toBe('Created');

                console.log('Generated Loan ID:', loan.loanId);

                // 4. Fetch loan record from MySQL
                const dbRecords = await getLoanById(loan.loanId);

                // 5. Validate database record exists
                expect(dbRecords.length).toBe(1);

                const dbLoan = dbRecords[0];

                // 6. Compare API response with database
                expect(String(dbLoan.loan_id)).toBe(String(loan.loanId));

                expect(dbLoan.customer_name).toBe(loan.customerName);

                expect(Number(dbLoan.loan_amount))
                    .toBe(Number(loan.loanAmount));

                expect(dbLoan.status.toLowerCase())
                    .toBe(loan.status.toLowerCase());

                console.log('SQL Database Validation Successful');

                console.log('Database Record:', dbLoan);

                console.log(
                    `${data.TC_ID}: API and SQL validation passed`
                );
            }

            // 7. Negative test case
            if (data.ExpectedStatus === 400) {

                console.log(
                    `${data.TC_ID}: Invalid loan data rejected successfully`
                );
            }
        });
    }
});

// Close database connection after all tests
test.afterAll(async () => {
    await closeDB();
});
