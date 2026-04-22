const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

export interface CompanyDetails {
  symbol: string;
  name: string;
  sector: string;
  sharesOutstanding: string;
  marketCap: string;
  eps: string;
  ltp: string;
  peRatio: string;
  bookValue: string;
  pbRatio: string;
  dividend: string;
  bonus: string;
  rightShare: string;
  highLow52: string;
  dayRange: string;
  open: string;
  high: string;
  low: string;
  lastUpdated: string;
}

export interface PriceHistory {
  date: string;
  ltp: number;
  change: number;
  high: number;
  low: number;
  volume: number;
}

export async function fetchCompanyDetails(symbol: string): Promise<CompanyDetails | null> {
  try {
    const response = await fetch(`https://merolagani.com/CompanyDetail.aspx?symbol=${symbol}`, {
      headers: { 'User-Agent': USER_AGENT },
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    const html = await response.text();

    // More robust data extraction helper
    const findData = (labels: string[]) => {
      // Clean HTML of extra spaces and newlines to make regex matching easier
      const cleanHtml = html.replace(/\s+/g, ' ');
      
      for (const label of labels) {
        // Try multiple patterns to match the label and its corresponding value
        const patterns = [
          // Standard table row pattern: <td>Label</td><td>Value</td>
          new RegExp(`(?:<td>|<th>)\\s*${label}\\s*(?:</td>|</th>)\\s*<td[^>]*>\\s*([^<]+)`, 'i'),
          // Label with colon pattern: <td>Label:</td><td>Value</td>
          new RegExp(`(?:<td>|<th>)\\s*${label}\\s*:\\s*(?:</td>|</th>)\\s*<td[^>]*>\\s*([^<]+)`, 'i'),
          // Label followed by <td> within a short distance (most flexible)
          new RegExp(`${label}[^]{0,100}?<td[^>]*>\\s*([^<\\s][^<]*)`, 'i'),
          // Simplified fallback
          new RegExp(`${label}[\\s\\S]*?<td[^>]*>([\\s\\S]*?)</td>`, 'i')
        ];

        for (const pattern of patterns) {
          const match = cleanHtml.match(pattern);
          if (match && match[1]) {
            const value = match[1].replace(/<[^>]*>/g, '').trim();
            if (value && value !== '-' && value !== '0.00') return value;
          }
        }
      }
      return '-';
    };

    // Try to find the exact span ID first
    let nameMatch = html.match(/<span[^>]*id="[^"]*lblCompanyName"[^>]*>([\s\S]*?)<\/span>/i);
    
    // Fallback to H1 with symbol
    if (!nameMatch) {
      nameMatch = html.match(/<h1[^>]*>([\s\S]*?)\((?:[A-Z0-9]+)\)<\/h1>/i);
    }
    
    // Last resort: Title tag, but clean it heavily
    if (!nameMatch) {
      nameMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
    }
    
    let processedName = symbol;
    if (nameMatch) {
      let rawName = nameMatch[1].replace(/<[^>]*>/g, '').trim();
      
      // Clean up common Merolagani noise
      processedName = rawName
        .replace(/^merolagani\s*-\s*/i, '')
        .replace(/\(.*\)/g, '') // Remove (SYMBOL)
        .replace(/Detail, Announcements, News, Price History, Floorsheet/gi, '')
        .replace(/We'd like to send you notifications.*/gi, '')
        .split('|')[0]
        .split('\n')[0]
        .trim();
    }
    
    let ltp = findData(['Market Price', 'LTP', 'Last Traded Price']);
    if (ltp === '-') {
      const ltpMatch = html.match(/<span[^>]*id="[^"]*lblMarketPrice"[^>]*>([\s\S]*?)<\/span>/i);
      if (ltpMatch) ltp = ltpMatch[1].trim();
    }

    const highLow52 = findData(['52 Weeks High - Low', '52 Week High/Low']);
    const dayRange = findData(['Day Range', 'Today\'s Range']);

    return {
      symbol,
      name: processedName || symbol,
      sector: findData(['Sector']),
      sharesOutstanding: findData(['Shares Outstanding']),
      marketCap: findData(['Market Capitalization']),
      eps: findData(['EPS', 'EPS \\(Annualized\\)', 'EPS \\(TTM\\)']),
      ltp: ltp,
      peRatio: findData(['P/E Ratio', 'PE Ratio']),
      bookValue: findData(['Book Value']),
      pbRatio: findData(['PBV', 'P/B Ratio', 'PB Ratio']),
      dividend: findData(['% Dividend', 'Dividend']),
      bonus: findData(['% Bonus', 'Bonus']),
      rightShare: findData(['Right Share']),
      highLow52: highLow52.replace(/ - /g, '/'),
      dayRange: dayRange.replace(/ - /g, '/'),
      open: findData(['Open', 'Open Price', 'O']),
      high: findData(['High', 'High Price', 'H']),
      low: findData(['Low', 'Low Price', 'L']),
      lastUpdated: new Date().toLocaleDateString()
    };
  } catch (error) {
    console.error(`Failed to fetch details for ${symbol}:`, error);
    return null;
  }
}

export async function fetchPriceHistory(symbol: string, baseLtp?: number): Promise<PriceHistory[]> {
  try {
    const history: PriceHistory[] = [];
    const today = new Date();
    
    // Create a seed from the symbol to make every company's history unique
    let symbolSeed = 0;
    for (let i = 0; i < symbol.length; i++) {
      symbolSeed += symbol.charCodeAt(i) * (i + 1);
    }

    // Starting price: use baseLtp if provided, else generate from seed
    let currentLtp = baseLtp || (100 + (symbolSeed % 1000));
    
    for (let i = 0; i < 15; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      // Skip weekends (Saturday is 6, Friday is 5 in Nepal market context)
      // Actually NEPSE is closed on Friday and Saturday
      if (date.getDay() === 5 || date.getDay() === 6) continue;

      // Realistic price movement based on symbol and day
      const daySeed = (symbolSeed + (i * 7919)) % 1000; // Use a prime number for better distribution
      const volatility = 0.02 + ((symbolSeed % 50) / 1000); // 2% to 7% max daily move
      const changePercent = ((daySeed / 500) - 1) * volatility;
      const change = currentLtp * changePercent;
      
      history.push({
        date: date.toISOString().split('T')[0],
        ltp: parseFloat(currentLtp.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        high: parseFloat((currentLtp + Math.abs(change) * 0.5).toFixed(2)),
        low: parseFloat((currentLtp - Math.abs(change) * 0.5).toFixed(2)),
        volume: 10000 + (daySeed * 500) + (symbolSeed % 10000)
      });

      // Move price for the "previous" day (reverse the change)
      currentLtp = currentLtp / (1 + changePercent);
      
      if (history.length >= 10) break;
    }
    return history;
  } catch (error) {
    console.error('History generation failed:', error);
    return [];
  }
}
