
const { test, expect } = require('@playwright/test');

test('Delete loan application', async ({ request }) => {

    const response = await request.delete(
        'https://jsonplaceholder.typicode.com/posts/1'
    );

    // Validate status code
    expect(response.status()).toBe(200);

    // Extract response
    const responseBody = await response.json();

    console.log(responseBody);

    // Validate empty response
    expect(responseBody).toEqual({});

});
