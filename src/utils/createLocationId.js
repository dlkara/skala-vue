/**
 * 국가 코드와 위도·경도를 조합해
 * 지역을 식별할 고유 ID를 생성합니다.
 *
 * 기본 지역과 API로 검색한 지역 모두
 * 이 함수를 사용하므로 ID 생성 규칙이 일관됩니다.
 *
 * 생성 예시:
 * location-kr-37.5665-126.9780
 *
 *** @param {string} countryCode 국가 코드
 *** @param {number} latitude 위도
 *** @param {number} longitude 경도
 *** @returns {string}
 */

export const createLocationId = (countryCode, latitude, longitude) => {
  const normalizedCountryCode = String(countryCode || 'unknown')
    .trim()
    .toLowerCase()

  const normalizedLatitude = Number(latitude).toFixed(4)

  const normalizedLongitude = Number(longitude).toFixed(4)

  return `location-${normalizedCountryCode}-` + `${normalizedLatitude}-${normalizedLongitude}`
}
