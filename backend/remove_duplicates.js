const fs = require('fs');

const content = fs.readFileSync('prisma/schema.prisma', 'utf8');
const lines = content.split('\n');

// Remove lines 3270-3318 (0-indexed: 3269-3317)
const newLines = [...lines.slice(0, 3269), ...lines.slice(3318)];

const newContent = newLines.join('\n');
fs.writeFileSync('prisma/schema.prisma', newContent, 'utf8');

console.log('Removed duplicate enums (lines 3270-3318)');
console.log('Original total lines:', lines.length);
console.log('New total lines:', newLines.length);
