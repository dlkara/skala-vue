import { createLocationId } from '@/utils/createLocationId'

/**
 * 대시보드에 처음 표시할 기본 지역입니다.
 *
 * 실제 기온, 습도, 풍속, 날씨 상태는
 * OpenWeather API에서 받아옵니다.
 *
 * 이 파일에는 API 요청에 필요한
 * 지역 이름과 좌표만 저장합니다.
 */
export const initialLocations = [
  {
    id: createLocationId('KR', 37.5665, 126.978),

    name: '서울',
    apiName: 'Seoul',

    countryCode: 'KR',

    regionCode: 'capital',
    region: '수도권',

    coord: {
      lat: 37.5665,
      lon: 126.978,
    },

    /**
     * 기본 지역이므로 사용자가
     * 검색해서 추가한 지역이 아닙니다.
     */
    addedByUser: false,
  },

  {
    id: createLocationId('KR', 36.3504, 127.3845),

    name: '대전',
    apiName: 'Daejeon',

    countryCode: 'KR',

    regionCode: 'chungcheong',
    region: '충청권',

    coord: {
      lat: 36.3504,
      lon: 127.3845,
    },

    addedByUser: false,
  },

  {
    id: createLocationId('KR', 33.4996, 126.5312),

    name: '제주',
    apiName: 'Jeju',

    countryCode: 'KR',

    regionCode: 'jeju',
    region: '제주권',

    coord: {
      lat: 33.4996,
      lon: 126.5312,
    },

    addedByUser: false,
  },
]

/**
 * 지역 필터에서 사용할 표시 이름입니다.
 */
export const regionLabels = {
  all: '전체 지역',
  capital: '수도권',
  gangwon: '강원권',
  chungcheong: '충청권',
  jeolla: '전라권',
  gyeongsang: '경상권',
  jeju: '제주권',

  /**
   * 사용자가 API 검색으로 추가한 지역은
   * 하나의 별도 필터로 분류합니다.
   */
  searched: '검색 추가 지역',
}
