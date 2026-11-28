
const loanId = 4;

async function testApprovalAPI() {
    console.log("Starting Loan Approval API test...");

    try {
        const response = await fetch(
            `http://localhost:3000/api/loans/${loanId}/approvals`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer finnone-practice-token"
                },
                body: JSON.stringify({
                    approverName: "Admin",
                    approvalStatus: "Approved",
                    remarks: "Customer eligibility verified"
                }),
                signal: AbortSignal.timeout(10000)
            }
        );

        console.log("HTTP Status:", response.status);

        const result = await response.json();

        console.log("API Response:");
        console.log(JSON.stringify(result, null, 2));

    } catch (error) {
        console.error("API Test Failed:", error.message);
    }
}

testApprovalAPI();
