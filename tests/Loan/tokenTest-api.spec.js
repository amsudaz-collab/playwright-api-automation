
const { test, expect } = require('@playwright/test');

const { getToken } = require('../../utils/tokenManager');

test('Generate access token successfully', async ({ request }) => {

    const token = await getToken(request);

    expect(token).toBeTruthy();

    console.log('Access token generated successfully');

});
