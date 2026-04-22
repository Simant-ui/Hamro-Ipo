export async function fetchLivePortfolio(credentials: { clientId: string, username: string, password: string }) {
  const response = await fetch('/api/meroshare/portfolio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch live portfolio')
  }

  return data.data
}

export async function fetchLiveIssues(credentials: { clientId: string, username: string, password: string }) {
  const response = await fetch('/api/meroshare/issues', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch live issues')
  }

  return data.data
}
