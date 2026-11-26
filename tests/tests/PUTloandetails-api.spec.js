
const { test, expect } = require('@playwright/test');

test('Update complete loan details using PUT', async ({ request }) => {

    // Send PUT request
    const response = await request.put(
        'https://jsonplaceholder.typicode.com/posts/1',
        {
            data: {
                userId: 1,
                title: 'FinnOne Loan',
                body: 'Loan Amount: 300000, Status: Approved'
            }
        }
    );

    // Validate status code
    expect(response.status()).toBe(200);

    // Extract response
    const responseBody = await response.json();

    console.log(responseBody);

    // Validate response
    expect(responseBody.id).toBe(1);
    expect(responseBody.title).toBe('FinnOne Loan');
    expect(responseBody.body).toBe('Loan Amount: 300000, Status: Approved');
    expect(responseBody.userId).toBe(1);

});
