const hasFinalConsonant = (value) => {
  const lastCharacter = [...String(value || '').trim()].at(-1)

  if (!lastCharacter) {
    return false
  }

  const characterCode = lastCharacter.charCodeAt(0)

  if (characterCode < 0xac00 || characterCode > 0xd7a3) {
    return false
  }

  return (characterCode - 0xac00) % 28 !== 0
}

const appendParticle = (value, consonantParticle, vowelParticle) => {
  const text = String(value || '')
  const particle = hasFinalConsonant(text) ? consonantParticle : vowelParticle

  return `${text}${particle}`
}

export const withObjectParticle = (value) => {
  return appendParticle(value, '을', '를')
}

export const withTopicParticle = (value) => {
  return appendParticle(value, '은', '는')
}
