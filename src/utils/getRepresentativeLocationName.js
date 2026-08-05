/**
 * 행정구역 데이터의 이름에 상위 지역이 함께 들어 있으면
 * 검색에 사용할 마지막 지역 단위만 반환합니다.
 *
 * 예: `서울특별시 강서구` → `강서구`
 * 예: `고양시 일산동구` → `일산동구`
 */
export const getRepresentativeLocationName = (locationName = '') => {
  return locationName.trim().split(/\s+/).filter(Boolean).at(-1) || ''
}
