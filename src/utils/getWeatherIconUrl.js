/**
 * OpenWeatherMap이 전달한 아이콘 코드를
 * 공식 날씨 아이콘 이미지 주소로 변환합니다.
 *
 * 예:
 * 01d → 맑은 낮
 * 01n → 맑은 밤
 * 10d → 비가 오는 낮
 */
export const getWeatherIconUrl = (iconCode, size = '2x') => {
  if (!iconCode) {
    return ''
  }

  return `https://openweathermap.org/img/wn/${iconCode}@${size}.png`
}
