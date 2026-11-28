
const { getToken, refreshToken } = require('./tokenManager');

async function requestWithAuth(request, apiCall) {

    // Get existing or new token
    let token = await getToken(request);

    // First API request
    let response = await apiCall(token);

    // Handle authentication failure
    if (response.status() === 401) {

        console.log('401 Unauthorized received');

        // Refresh token
        token = await refreshToken(request);

        // Retry request once
        console.log('Retrying API request');

        response = await apiCall(token);
    }

    return response;
}


module.exports = {
    requestWithAuth
};
