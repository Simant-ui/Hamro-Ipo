const fs = require('fs');

function extractHistory(html) {
    const historyRegex = /<div[^>]*id="divHistory"[\s\S]*?<table[^>]*>([\s\S]*?)<\/table>/i;
    const match = html.match(historyRegex);
    if (!match) return "History section not found";

    const tableContent = match[1];
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    const rows = [];
    let rowMatch;
    
    while ((rowMatch = rowRegex.exec(tableContent)) !== null) {
        const row = rowMatch[1];
        const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
        const cells = [];
        let cellMatch;
        while ((cellMatch = cellRegex.exec(row)) !== null) {
            cells.push(cellMatch[1].replace(/<[^>]*>/g, '').trim());
        }
        if (cells.length > 0) rows.push(cells);
    }
    return rows.slice(0, 11); // Header + 10 rows
}

const html = fs.readFileSync('scratch/nica_detail.html', 'utf8');
const history = extractHistory(html);
console.log(JSON.stringify(history, null, 2));
