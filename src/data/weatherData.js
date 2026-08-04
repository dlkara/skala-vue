// src/data/weatherData.js

/**
 * 지역 코드
 *
 * 필터링에는 영문 코드값을 사용하고,
 * 화면에는 region 값을 표시합니다.
 */
export const REGION = {
  CAPITAL: 'capital',
  GANGWON: 'gangwon',
  CHUNGCHEONG: 'chungcheong',
  JEOLLA: 'jeolla',
  GYEONGSANG: 'gyeongsang',
  JEJU: 'jeju',
}

/**
 * 지역 코드에 대응하는 화면 표시 이름
 */
export const regionLabels = {
  all: '전체 지역',
  [REGION.CAPITAL]: '수도권',
  [REGION.GANGWON]: '강원권',
  [REGION.CHUNGCHEONG]: '충청권',
  [REGION.JEOLLA]: '전라권',
  [REGION.GYEONGSANG]: '경상권',
  [REGION.JEJU]: '제주권',
}

/**
 * API 연결 전 임시 날씨 데이터
 *
 * 추후 공공데이터포털 API를 연결할 때는
 * nx, ny를 요청 좌표로 사용하고,
 * 날씨 값은 API 응답으로 교체합니다.
 */
export const weatherData = [
  {
    id: 'city_01',
    name: '서울',

    regionCode: REGION.CAPITAL,
    region: '수도권',

    lat: 37.5665,
    lon: 126.978,

    // 향후 기상청 API 요청용 격자 좌표
    nx: 60,
    ny: 127,

    temp: 28,
    tempMin: 23,
    tempMax: 30,
    humidity: 62,
    wind: 2.4,

    weatherCode: 'clear',
    status: '맑음',
    description: '맑은 날씨',
    icon: '☀️',

    favorite: false,
  },
  {
    id: 'city_02',
    name: '수원',

    regionCode: REGION.CAPITAL,
    region: '수도권',

    lat: 37.2636,
    lon: 127.0286,

    nx: 60,
    ny: 121,

    temp: 24,
    tempMin: 21,
    tempMax: 26,
    humidity: 81,
    wind: 3.7,

    weatherCode: 'rain',
    status: '비',
    description: '약한 비가 내리는 날씨',
    icon: '🌧️',

    favorite: false,
  },
  {
    id: 'city_03',
    name: '인천',

    regionCode: REGION.CAPITAL,
    region: '수도권',

    lat: 37.4563,
    lon: 126.7052,

    nx: 55,
    ny: 124,

    temp: 25,
    tempMin: 22,
    tempMax: 27,
    humidity: 76,
    wind: 5.1,

    weatherCode: 'overcast',
    status: '흐림',
    description: '흐린 날씨',
    icon: '☁️',

    favorite: false,
  },
  {
    id: 'city_04',
    name: '강릉',

    regionCode: REGION.GANGWON,
    region: '강원권',

    lat: 37.7519,
    lon: 128.8761,

    nx: 92,
    ny: 131,

    temp: 23,
    tempMin: 19,
    tempMax: 25,
    humidity: 66,
    wind: 5.6,

    weatherCode: 'cloudy',
    status: '구름 많음',
    description: '구름이 많은 날씨',
    icon: '⛅',

    favorite: false,
  },
  {
    id: 'city_05',
    name: '대전',

    regionCode: REGION.CHUNGCHEONG,
    region: '충청권',

    lat: 36.3504,
    lon: 127.3845,

    nx: 67,
    ny: 100,

    temp: 29,
    tempMin: 24,
    tempMax: 31,
    humidity: 58,
    wind: 1.8,

    weatherCode: 'clear',
    status: '맑음',
    description: '맑은 날씨',
    icon: '☀️',

    favorite: false,
  },
  {
    id: 'city_06',
    name: '광주',

    regionCode: REGION.JEOLLA,
    region: '전라권',

    lat: 35.1595,
    lon: 126.8526,

    nx: 58,
    ny: 74,

    temp: 27,
    tempMin: 23,
    tempMax: 29,
    humidity: 79,
    wind: 3.3,

    weatherCode: 'shower',
    status: '소나기',
    description: '한때 소나기가 오는 날씨',
    icon: '🌦️',

    favorite: false,
  },
  {
    id: 'city_07',
    name: '부산',

    regionCode: REGION.GYEONGSANG,
    region: '경상권',

    lat: 35.1796,
    lon: 129.0756,

    nx: 98,
    ny: 76,

    temp: 26,
    tempMin: 23,
    tempMax: 28,
    humidity: 73,
    wind: 4.2,

    weatherCode: 'cloudy',
    status: '구름 많음',
    description: '구름이 많은 날씨',
    icon: '⛅',

    favorite: false,
  },
  {
    id: 'city_08',
    name: '대구',

    regionCode: REGION.GYEONGSANG,
    region: '경상권',

    lat: 35.8714,
    lon: 128.6014,

    nx: 89,
    ny: 90,

    temp: 31,
    tempMin: 26,
    tempMax: 33,
    humidity: 55,
    wind: 2,

    weatherCode: 'clear',
    status: '폭염',
    description: '매우 더운 날씨',
    icon: '☀️',

    favorite: false,
  },
  {
    id: 'city_09',
    name: '울산',

    regionCode: REGION.GYEONGSANG,
    region: '경상권',

    lat: 35.5384,
    lon: 129.3114,

    nx: 102,
    ny: 84,

    temp: 26,
    tempMin: 22,
    tempMax: 28,
    humidity: 70,
    wind: 4.8,

    weatherCode: 'cloudy',
    status: '구름 많음',
    description: '구름이 많은 날씨',
    icon: '⛅',

    favorite: false,
  },
  {
    id: 'city_10',
    name: '제주',

    regionCode: REGION.JEJU,
    region: '제주권',

    lat: 33.4996,
    lon: 126.5312,

    nx: 52,
    ny: 38,

    temp: 25,
    tempMin: 22,
    tempMax: 27,
    humidity: 84,
    wind: 8.7,

    weatherCode: 'wind',
    status: '강풍',
    description: '바람이 매우 강한 날씨',
    icon: '💨',

    favorite: false,
  },
]
