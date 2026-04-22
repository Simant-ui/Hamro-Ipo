async function testNepseAlpha() {
    const symbol = 'NICA';
    const to = Math.floor(Date.now() / 1000);
    const from = to - (30 * 24 * 60 * 60); // 30 days ago
    const url = `https://nepsealpha.com/trading-view/history?symbol=${symbol}&resolution=1D&from=${from}&to=${to}`;
    
    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://nepsealpha.com/technical-chart'
            }
        });
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error:', err.message);
    }
}
testNepseAlpha();
