import { NextResponse } from 'next/server'

const MEROSHARE_API = 'https://webbackend.cdsc.com.np/api'

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

    // 1. Authenticate
    const authResponse = await fetch(`${MEROSHARE_API}/meroShare/auth/`, {
      method: 'POST',
      headers: await getMeroShareHeaders(),
      body: JSON.stringify({
        clientId: parseInt(clientId.toString()),
        username: username.trim(),
        password: password.trim(),
      }),
    })

    if (!authResponse.ok) {
      return NextResponse.json({ success: false, message: 'Authentication failed - check credentials' }, { status: 401 })
    }

    const token = authResponse.headers.get('authorization')
    if (!token) {
      return NextResponse.json({ success: false, message: 'Failed to retrieve auth token' }, { status: 500 })
    }

    // 2. Fetch IPO Issues
    const issuesResponse = await fetch(`${MEROSHARE_API}/meroShare/ipo/issue/`, {
      method: 'GET', // IPO issues list is a GET request on webbackend
      headers: await getMeroShareHeaders(token),
    })

    if (!issuesResponse.ok) {
      // Try POST if GET fails (some versions/endpoints vary)
      const issuesResponsePost = await fetch(`${MEROSHARE_API}/meroShare/ipo/issue/`, {
        method: 'POST',
        headers: await getMeroShareHeaders(token),
        body: JSON.stringify({
          filterField: "unapplied",
          filterValue: "",
          page: 1,
          size: 50,
          searchChat: ""
        })
      })
      
      if (!issuesResponsePost.ok) {
        return NextResponse.json({ success: false, message: 'Failed to fetch issues' }, { status: issuesResponsePost.status })
      }
      
      const issuesData = await issuesResponsePost.json()
      return NextResponse.json({
        success: true,
        data: issuesData.object || []
      })
    }

    const issuesData = await issuesResponse.json()

    return NextResponse.json({
      success: true,
      data: issuesData || []
    })

  } catch (error: any) {
    console.error('MeroShare Issues API Error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to connect to MeroShare servers' 
    }, { status: 500 })
  }
}
