
const { test, expect } = require('@playwright/test');

const {
    createLoan,
    getLoan,
    updateLoanStatus
} = require('../../utils/apiHelper');

test('Create loan, update status using PATCH and verify', async ({ request }) => {

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

    // Step 2: Update loan status using API Helper
    const updateResponse = await updateLoanStatus(
        request,
        loanId,
        'Under Review'
    );

    expect(updateResponse.status()).toBe(200);

    const updateBody = await updateResponse.json();

    expect(updateBody.message).toBe('Loan status updated successfully');
    expect(updateBody.data.status).toBe('Under Review');

    // Step 3: Verify updated status using API Helper
    const getResponse = await getLoan(request, loanId);

    expect(getResponse.status()).toBe(200);

    const getBody = await getResponse.json();

    expect(getBody.data.loanId).toBe(loanId);
    expect(getBody.data.customerName).toBe('Amsu');
    expect(getBody.data.status).toBe('Under Review');

    console.log('Final Updated Loan:');
    console.log(JSON.stringify(getBody, null, 2));

});
