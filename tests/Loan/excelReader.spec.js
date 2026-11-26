
const { test, expect } = require('@playwright/test');
const { readExcel } = require('../../utils/excelReader');

test('Read loan test data from Excel', async () => {

    const loanData = await readExcel(
        'LoanTestData.xlsx',
        'LoanData'
    );

    console.log('Total test data:', loanData.length);

    console.log('Excel records:', loanData);

    expect(loanData.length).toBe(4);

    expect(loanData[0].CustomerName).toBe('Amsu');

});
