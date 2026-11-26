
const apiConfig = require('../tests/Loan/config/apiConfig');
const { requestWithAuth } = require('./authHelper');

async function createLoan(request, loanData) {
    return await requestWithAuth(request, (token) =>
        request.post(
            `${apiConfig.baseURL}${apiConfig.endpoints.loans}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: loanData
            }
        )
    );
}

async function getLoan(request, loanId) {
    return await requestWithAuth(request, (token) =>
        request.get(
            `${apiConfig.baseURL}${apiConfig.endpoints.loans}/${loanId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
    );
}

async function updateLoan(request, loanId, loanData) {
    return await requestWithAuth(request, (token) =>
        request.put(
            `${apiConfig.baseURL}${apiConfig.endpoints.loans}/${loanId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: loanData
            }
        )
    );
}

async function updateLoanStatus(request, loanId, status) {
    return await requestWithAuth(request, (token) =>
        request.patch(
            `${apiConfig.baseURL}${apiConfig.endpoints.loans}/${loanId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: { status }
            }
        )
    );
}

async function deleteLoan(request, loanId) {
    return await requestWithAuth(request, (token) =>
        request.delete(
            `${apiConfig.baseURL}${apiConfig.endpoints.loans}/${loanId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
    );
}

module.exports = {
    createLoan,
    getLoan,
    updateLoan,
    updateLoanStatus,
    deleteLoan
};
