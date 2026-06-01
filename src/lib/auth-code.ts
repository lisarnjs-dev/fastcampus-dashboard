const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateAuthCode(length = 8): string {
  let code = ''
  for (let i = 0; i < length; i++) {
    code += CHARSET[Math.floor(Math.random() * CHARSET.length)]
  }
  return code
}

export function assignGroup(index: number, groupSize = 50): string {
  const groupIndex = Math.floor(index / groupSize)
  return String.fromCharCode(65 + groupIndex) // A, B, C...
}
