const fs = require('fs');

async function fetchDPs() {
  const res = await fetch('https://meroshare.cdsc.com.np/api/meroShare/capital/');
  const data = await res.json();
  
  data.sort((a, b) => a.name.localeCompare(b.name));
  
  let content = `export interface DP {
  id: string;
  name: string;
  dp_code: string;
}

export const ALL_DP_LIST: DP[] = [
`;

  data.forEach(dp => {
    // Escape single quotes in names
    const safeName = dp.name.replace(/'/g, "\\'");
    content += `  { id: '${dp.id}', name: '${safeName}', dp_code: '${dp.code}' },\n`;
  });

  content += `];\n`;
  
  fs.writeFileSync('src/constants/banks.ts', content);
  console.log('Successfully updated banks.ts');
}

fetchDPs().catch(console.error);
