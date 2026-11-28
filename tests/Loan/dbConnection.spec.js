
const { test, expect } = require('@playwright/test');
const { connectDB, executeQuery, closeDB } =
require('../../utils/DBUtils');
test('Verify MySQL database connection', async () => {

    await connectDB();

    const result = await executeQuery(
        'SELECT * FROM loan_details WHERE loan_id = ?',
        [1]
    );

    expect(result.length).toBe(1);
    expect(result[0].customer_name).toBe('Amsu');

    console.log('Loan details:', result);
});

test.afterAll(async () => {
    await closeDB();
});
