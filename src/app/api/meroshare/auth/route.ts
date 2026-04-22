import { NextResponse } from 'next/server'

// Use the verified webbackend host for reliability
const API_HOST = 'https://webbackend.cdsc.com.np/api'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { clientId, username, password } = body

    if (!clientId || !username || !password) {
      return NextResponse.json({ success: false, message: 'Missing credentials' }, { status: 400 })
    }

    // 1. Authenticate with MeroShare
    const response = await fetch(`${API_HOST}/meroShare/auth/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Origin': 'https://meroshare.cdsc.com.np',
        'Referer': 'https://meroshare.cdsc.com.np/',
      },
      body: JSON.stringify({
        clientId: parseInt(clientId.toString()),
        username: username.trim(),
        password: password.trim(),
      }),
    })

    const responseText = await response.text()
    
    if (!response.ok) {
      let errorMsg = 'Invalid credentials'
      try {
        const errorData = JSON.parse(responseText)
        errorMsg = errorData.message || 'Invalid Username or Password'
      } catch (e) {
        if (response.status === 403) errorMsg = 'MeroShare blocked the request. Try again later.'
      }
      return NextResponse.json({ success: false, message: errorMsg }, { status: response.status })
    }

    const authHeader = response.headers.get('authorization')
    let authData: any = {}
    try {
      authData = JSON.parse(responseText)
    } catch (e) {}

    // 2. Fetch User Details (Name and BOID) - only if we have a token
    if (authHeader) {
      try {
        const detailResponse = await fetch(`${API_HOST}/meroShare/ownDetail/`, {
          headers: {
            'Authorization': authHeader,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
          }
        })
        
        if (detailResponse.ok) {
          const detailData = await detailResponse.json()
          return NextResponse.json({ 
            success: true, 
            message: 'Verified successfully',
            user: {
              name: detailData.name,
              boid: detailData.boid,
              username: authData.username
            }
          })
        }
      } catch (e) {
        console.error('Detail fetch failed:', e)
      }
    }

    // Fallback if detail fetch fails but auth succeeded
    return NextResponse.json({ 
      success: true, 
      message: 'Verified successfully',
      user: {
        name: authData.name || username,
        username: authData.username || username
      }
    })

  } catch (error: any) {
    console.error('MeroShare Auth Error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to connect to MeroShare servers.' 
    }, { status: 500 })
  }
}
