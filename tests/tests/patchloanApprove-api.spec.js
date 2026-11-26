
const { test, expect } = require('@playwright/test');

test('Update loan details using PATCH', async ({ request }) => {

    // Send PATCH request
    const response = await request.patch(
        'https://jsonplaceholder.typicode.com/posts/1',
        {
            data: {
                title: 'FinnOne Loan Approved'
            }
        }
    );

    // Validate status code
    expect(response.status()).toBe(200);

    // Get response body
    const responseBody = await response.json();

    console.log(responseBody);

    // Validate updated field
    expect(responseBody.title).toBe('FinnOne Loan Approved');

    // Validate existing field
    expect(responseBody.id).toBe(1);

});
