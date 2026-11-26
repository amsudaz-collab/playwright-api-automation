
const path = require('path');
const fs = require('fs');

function getTestData(fileName) {

    const filePath = path.join(
        __dirname,
        '../test-data',
        fileName
    );

    if (!fs.existsSync(filePath)) {
        throw new Error(`JSON file not found: ${filePath}`);
    }

    console.log('Loading JSON:', filePath);

    return require(filePath);
}

module.exports = { getTestData };
