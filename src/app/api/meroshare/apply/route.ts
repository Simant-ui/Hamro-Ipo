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
    const { clientId, username, password, kandaElementId, appliedKitta, crnNumber, transactionPin } = body

    if (!clientId || !username || !password || !kandaElementId || !appliedKitta || !crnNumber || !transactionPin) {
      return NextResponse.json({ success: false, message: 'Missing required application data' }, { status: 400 })
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

    // 2. Get Bank Details (to find IDs)
    const bankResponse = await fetch(`${MEROSHARE_API}/meroShare/bank/`, {
      headers: await getMeroShareHeaders(token)
    })

    if (!bankResponse.ok) {
      return NextResponse.json({ success: false, message: 'Failed to fetch bank details' }, { status: 500 })
    }

    const bankData = await bankResponse.json()
    if (!bankData || bankData.length === 0) {
      return NextResponse.json({ success: false, message: 'No CASBA bank account found' }, { status: 404 })
    }

    // Use the first bank account found
    const primaryBank = bankData[0]

    // 3. Apply for IPO
    const applyResponse = await fetch(`${MEROSHARE_API}/meroShare/ipo/apply/`, {
      method: 'POST',
      headers: await getMeroShareHeaders(token),
      body: JSON.stringify({
        kandaElementId: parseInt(kandaElementId),
        bankId: primaryBank.bankId,
        accountNumber: primaryBank.accountNumber,
        branchId: primaryBank.branchId,
        appliedKitta: parseInt(appliedKitta),
        crnNumber: crnNumber,
        transactionPin: transactionPin,
        remark: "Applied via Hamro IPO"
      })
    })

    const result = await applyResponse.json()

    if (!applyResponse.ok) {
      return NextResponse.json({ 
        success: false, 
        message: result.message || 'Application failed',
        details: result
      }, { status: applyResponse.status })
    }

    return NextResponse.json({
      success: true,
      message: result.message || 'Application successful',
      data: result
    })

  } catch (error: any) {
    console.error('MeroShare Apply API Error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to connect to MeroShare servers' 
    }, { status: 500 })
  }
}
