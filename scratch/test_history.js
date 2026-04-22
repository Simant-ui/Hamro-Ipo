async function test() {
  const symbol = 'NICA';
  const url = `https://merolagani.com/Handlers/TechnicalChartHandler.ashx?type=history&symbol=${symbol}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const data = await res.json();
    console.log(JSON.stringify(data.slice(0, 5), null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
}
test();
