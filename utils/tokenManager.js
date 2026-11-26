
const apiConfig = require('../tests/Loan/config/apiConfig');

let accessToken = null;

async function generateToken(request) {

    const response = await request.post(
    `${apiConfig.baseURL}${apiConfig.endpoints.login}`,
    {
        data: apiConfig.credentials,
        timeout: apiConfig.timeout
    }
);

    if (!response.ok()) {
        throw new Error(`Login failed: ${response.status()}`);
    }

    const responseBody = await response.json();

    if (!responseBody.accessToken) {
        throw new Error('Access token not found');
    }

    accessToken = responseBody.accessToken;

    console.log('Local access token generated successfully');

    return accessToken;
}

async function getToken(request) {

    if (!accessToken) {
        console.log('Token missing. Generating new token');
        await generateToken(request);
    } else {
        console.log('Using existing access token');
    }

    return accessToken;
}

async function refreshToken(request) {

    console.log('Refreshing access token');

    accessToken = null;

    return await generateToken(request);
}

module.exports = {
    generateToken,
    getToken,
    refreshToken
};
