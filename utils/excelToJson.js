
const readXlsxFile = require('read-excel-file/node');
const path = require('path');
const fs = require('fs');

async function convertExcelToJson() {
    const excelPath = path.join(
        __dirname,
        '..',
        'test-data',
        'LoanTestData.xlsx'
    );

    const result = await readXlsxFile(excelPath, {
        sheet: 'LoanData'
    });

    const rows = result[0].data;

    if (rows.length < 2) {
        throw new Error('No test data found in Excel');
    }

    const headers = rows[0].map(header => String(header).trim());

    const records = rows.slice(1)
        .filter(row => row.some(value =>
            value !== null && value !== undefined && value !== ''
        ))
        .map(row => {
            const record = {};

            headers.forEach((header, index) => {
                record[header] = row[index];
            });

            return record;
        });

    const jsonPath = path.join(
        __dirname,
        '..',
        'test-data',
        'loanTestData.json'
    );

    fs.writeFileSync(
        jsonPath,
        JSON.stringify(records, null, 2)
    );

    console.log(`Successfully converted ${records.length} Excel records to JSON`);
}

convertExcelToJson().catch(error => {
    console.error('Excel conversion failed:', error);
    process.exit(1);
});
