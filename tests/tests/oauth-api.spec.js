
const { test, expect } = require('@playwright/test');

const { generateToken } =
    require('../../utils/tokenManager');

test('Access protected API using token', async ({ request }) => {

    // Generate token
    const token = await generateToken(request);

    // Pass Bearer token
    const response = await request.get(
        'https://dummyjson.com/auth/me',
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    expect(response.status()).toBe(200);

    const responseBody = await response.json();

    console.log(responseBody);

    expect(responseBody.username).toBe('emilys');

});
