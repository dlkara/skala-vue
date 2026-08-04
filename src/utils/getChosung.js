// 한글 초성 목록
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
 * getChosung('서울') → 'ㅅㅇ'
 * getChosung('강릉') → 'ㄱㄹ'
 */
export const getChosung = (text) => {
  // 문자열이 아닌 값이 전달되면 빈 문자열 반환
  if (typeof text !== 'string') {
    return ''
  }

  return [...text]
    .map((character) => {
      // 가(0xAC00)를 기준으로 현재 글자의 위치를 계산
      const unicode = character.charCodeAt(0) - 0xac00

      // 완성형 한글 범위가 아니면 원래 문자 반환
      if (unicode < 0 || unicode > 11171) {
        return character
      }

      // 한 초성마다 588개의 완성형 한글이 존재
      const chosungIndex = Math.floor(unicode / 588)

      return CHOSUNG_LIST[chosungIndex]
    })
    .join('')
}
