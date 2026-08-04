const CHOSUNG_LIST = [
  'ㄱ',
  'ㄲ',
  'ㄴ',
  'ㄷ',
  'ㄸ',
  'ㄹ',
  'ㅁ',
  'ㅂ',
  'ㅃ',
  'ㅅ',
  'ㅆ',
  'ㅇ',
  'ㅈ',
  'ㅉ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
]

/**
 * 한글 문자열에서 초성을 추출합니다.
 *
 * 예:
 * 서울 → ㅅㅇ
 * 부산 → ㅂㅅ
 */
export const getChosung = (text = '') => {
  return [...text]
    .map((character) => {
      const characterCode = character.charCodeAt(0)

      /**
       * 완성형 한글 범위가 아니면
       * 원래 문자를 그대로 반환합니다.
       */
      if (characterCode < 0xac00 || characterCode > 0xd7a3) {
        return character
      }

      const chosungIndex = Math.floor((characterCode - 0xac00) / 588)

      return CHOSUNG_LIST[chosungIndex]
    })
    .join('')
}
