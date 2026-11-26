
const readXlsxFile = require('read-excel-file/node');
const path = require('path');
const fs = require('fs');

async function readExcel(fileName, sheetName) {

    const filePath = path.join(
        __dirname,
        '..',
        'test-data',
        fileName
    );

    console.log('Excel file path:', filePath);

    if (!fs.existsSync(filePath)) {
        throw new Error('Excel file not found: ' + filePath);
    }

    const result = await readXlsxFile(filePath, {
        sheet: sheetName
    });

    // Extract actual worksheet rows
    const rows = result[0].data;

    console.log('Total rows detected:', rows.length);
    console.log('Excel row data:', JSON.stringify(rows, null, 2));

    if (rows.length < 2) {
        throw new Error('Excel file has no test data');
    }

    const headers = rows[0];

    const testData = rows.slice(1).map(row => {

        const record = {};

        headers.forEach((header, index) => {
            record[header] = row[index];
        });

        return record;
    });

    return testData;
}

module.exports = { readExcel };
