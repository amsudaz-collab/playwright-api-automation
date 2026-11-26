
const apiConfig = require('./config/apiConfig');
const { test, expect } = require('@playwright/test');

test('Create loan and retrieve loan using generated Loan ID', async ({ request }) => {

    // Step 1: Create loan using POST
    const createResponse = await request.post(
        `${apiConfig.baseURL}${apiConfig.endpoints.loans}`,
        {
            data: {
                customerName: 'Amsu',
                loanAmount: 200000,
                loanTenure: 36,
                employmentType: 'Salaried',
                monthlyIncome: 50000
            }
        }
    );

    expect(createResponse.status()).toBe(201);

    const createBody = await createResponse.json();

    // Step 2: Capture generated Loan ID
    const loanId = createBody.data.loanId;

    expect(loanId).toBeTruthy();

    console.log('Generated Loan ID:', loanId);

    // Step 3: Retrieve loan using GET
    const getResponse = await request.get(
        `${apiConfig.baseURL}${apiConfig.endpoints.loans}/${loanId}`
    );

    expect(getResponse.status()).toBe(200);

    const getBody = await getResponse.json();

    // Step 4: Validate retrieved loan details
    expect(getBody.message).toBe('Loan details retrieved successfully');
    expect(getBody.data.loanId).toBe(loanId);
    expect(getBody.data.customerName).toBe('Amsu');
    expect(getBody.data.loanAmount).toBe(200000);
    expect(getBody.data.status).toBe('Created');

});
