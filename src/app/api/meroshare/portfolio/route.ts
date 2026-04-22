import { NextResponse } from 'next/server'

const MEROSHARE_API = 'https://webapi.cdsc.com.np/api'

async function getMeroShareHeaders(token?: string) {
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/plain, */*',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    'Origin': 'https://meroshare.cdsc.com.np',
    'Referer': 'https://meroshare.cdsc.com.np/',
    ...(token ? { 'Authorization': token } : {})
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { clientId, username, password } = body

    if (!clientId || !username || !password) {
      return NextResponse.json({ success: false, message: 'Missing credentials' }, { status: 400 })
    }

    // 1. Authenticate to get token
    const authResponse = await fetch(`${MEROSHARE_API}/meroShare/auth/`, {
      method: 'POST',
      headers: await getMeroShareHeaders(),
      body: JSON.stringify({
        clientId: parseInt(clientId.toString()),
        username,
        password,
      }),
    })

    if (!authResponse.ok) {
      return NextResponse.json({ success: false, message: 'Authentication failed' }, { status: 401 })
    }

    const token = authResponse.headers.get('authorization')
    if (!token) {
      return NextResponse.json({ success: false, message: 'Failed to retrieve auth token' }, { status: 500 })
    }

    // 2. Fetch Portfolio
    const portfolioResponse = await fetch(`${MEROSHARE_API}/meroShareView/myPortfolio/`, {
      headers: await getMeroShareHeaders(token)
    })

    if (!portfolioResponse.ok) {
      return NextResponse.json({ success: false, message: 'Failed to fetch portfolio' }, { status: portfolioResponse.status })
    }

    const portfolioData = await portfolioResponse.json()

    return NextResponse.json({
      success: true,
      data: portfolioData
    })

  } catch (error: any) {
    console.error('MeroShare API Error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to connect to MeroShare servers' 
    }, { status: 500 })
  }
}
