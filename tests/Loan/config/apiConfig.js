
require('dotenv').config();

const apiConfig = {
    baseURL: process.env.BASE_URL,

    endpoints: {
        loans: '/api/loans',
        login: '/api/auth/login'
    },

    credentials: {
        username: process.env.API_USERNAME,
        password: process.env.API_PASSWORD
    },

    timeout: 30000
};

module.exports = apiConfig;
