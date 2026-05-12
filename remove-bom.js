const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'client', 'package.json');
const content = fs.readFileSync(filePath, 'utf8');

// 移除BOM
const contentWithoutBOM = content.replace(/^\uFEFF/, '');

// 写入文件，确保没有BOM
fs.writeFileSync(filePath, contentWithoutBOM, 'utf8');

console.log('BOM removed successfully!');
