
const { test, expect } = require('@playwright/test');

const {
    createLoan,
    getLoan,
    deleteLoan
} = require('../../utils/apiHelper');

test('Create loan, delete loan and verify deletion using API Helper', async ({ request }) => {

    // Step 1: Create loan using API Helper
    const createResponse = await createLoan(request, {
        customerName: 'Amsu',
        loanAmount: 200000,
        loanTenure: 36,
        employmentType: 'Salaried',
        monthlyIncome: 50000
    });

    expect(createResponse.status()).toBe(201);

    const createBody = await createResponse.json();
    const loanId = createBody.data.loanId;

    expect(loanId).toBeTruthy();

    console.log('Created Loan ID:', loanId);

    // Step 2: Delete loan using API Helper
    const deleteResponse = await deleteLoan(request, loanId);

    expect(deleteResponse.status()).toBe(200);

    const deleteBody = await deleteResponse.json();

    expect(deleteBody.message).toBe('Loan deleted successfully');

    console.log('Loan deleted successfully');

    // Step 3: Verify deletion using API Helper GET
    const getResponse = await getLoan(request, loanId);

    expect(getResponse.status()).toBe(404);

    console.log('Deletion verified successfully');

});
