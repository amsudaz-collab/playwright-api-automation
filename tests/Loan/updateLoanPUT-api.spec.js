
const { test, expect } = require('@playwright/test');

const {
    createLoan,
    getLoan,
    updateLoan
} = require('../../utils/apiHelper');

test('Create loan, update complete details using PUT and verify', async ({ request }) => {

    // 1. Create loan using API Helper
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

    // 2. Update complete loan details using API Helper
    const updatedLoanData = {
        customerName: 'Amsu',
        loanAmount: 300000,
        loanTenure: 48,
        employmentType: 'Salaried',
        monthlyIncome: 60000,
        status: 'Under Review'
    };

    const updateResponse = await updateLoan(
        request,
        loanId,
        updatedLoanData
    );

    expect(updateResponse.status()).toBe(200);

    const updateBody = await updateResponse.json();

    expect(updateBody.message).toBe('Loan details updated successfully');
    expect(updateBody.data.loanAmount).toBe(300000);
    expect(updateBody.data.loanTenure).toBe(48);

    // 3. Verify using API Helper GET
    const getResponse = await getLoan(request, loanId);

    expect(getResponse.status()).toBe(200);

    const getBody = await getResponse.json();

    expect(getBody.data.loanAmount).toBe(300000);
    expect(getBody.data.loanTenure).toBe(48);
    expect(getBody.data.monthlyIncome).toBe(60000);

    console.log('Final Updated Loan:');
    console.log(JSON.stringify(getBody, null, 2));

});
