
async function testFetch() {
  const url = 'https://nepsealpha.com/api/v1/trading-view/history?symbol=NEPSE&resolution=1D&from=1713312000&to=1713398400';
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://www.nepsealpha.com/trading/chart'
      }
    });
    console.log('Status:', response.status);
    const data = await response.text();
    console.log('Data (first 100 chars):', data.substring(0, 100));
  } catch (error) {
    console.error('Error:', error);
  }
}

testFetch();
