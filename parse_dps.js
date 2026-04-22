const fs = require('fs');

const raw = fs.readFileSync('raw_dps.txt', 'utf8');
const lines = raw.split('\n').filter(l => l.trim().length > 0);

const dps = [];

for (const line of lines) {
  // Format: S.N  DPID  DP NAME
  // e.g. "1\t20600\tAakash Bhairab Securities Ltd"
  const parts = line.split('\t');
  if (parts.length >= 3) {
    const id = parts[0].trim();
    const dpId = parts[1].trim();
    let name = parts[2].trim();
    
    // Capitalize properly or just use as is. Since user provided it from site, we'll use it as is.
    
    dps.push({ id, code: dpId, name });
  }
}

// Sort alphabetically by name
dps.sort((a, b) => a.name.localeCompare(b.name));

let tsContent = `export interface Bank {
  id: string;
  name: string;
  dp_code?: string;
}

export const NEPAL_BANKS: Bank[] = [
`;

dps.forEach((dp, index) => {
  const safeName = dp.name.replace(/'/g, "\\'");
  tsContent += `  { id: '${index + 1}', name: '${safeName}', dp_code: '${dp.code}' },\n`;
});

tsContent += `];\n`;

fs.writeFileSync('src/constants/banks.ts', tsContent);
console.log('Successfully updated banks.ts with ' + dps.length + ' DPs.');
