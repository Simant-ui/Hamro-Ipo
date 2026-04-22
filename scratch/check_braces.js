const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\APIT\\Desktop\\Hamro IPO\\hamro-ipo\\src\\lib\\services\\sharesansar.ts', 'utf8');
let open = 0;
const lines = content.split('\n');
lines.forEach((line, i) => {
  const matchesOpen = line.match(/{/g);
  const matchesClose = line.match(/}/g);
  if (matchesOpen) open += matchesOpen.length;
  if (matchesClose) open -= matchesClose.length;
  if (open < 0) console.log(`Unmatched closing brace at line ${i + 1}`);
});
console.log(`Final open count: ${open}`);
