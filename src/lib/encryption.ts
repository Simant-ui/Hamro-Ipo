import CryptoJS from 'crypto-js'

const SECRET = process.env.ENCRYPTION_SECRET || 'hamro_ipo_super_secret_key_32ch!!'

export function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, SECRET).toString()
}

export function decrypt(ciphertext: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET)
  return bytes.toString(CryptoJS.enc.Utf8)
}

export function maskBOID(boid: string): string {
  if (!boid || boid.length < 6) return '****'
  return boid.slice(0, 4) + '****' + boid.slice(-4)
}

export function maskAccountNumber(acc: string): string {
  if (!acc || acc.length < 6) return '****'
  return acc.slice(0, 3) + '****' + acc.slice(-3)
}
