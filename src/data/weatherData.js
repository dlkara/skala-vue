import { normalizeOpenWeatherData } from '@/utils/normalizeOpenWeatherData.js'

/**
 * 지역 필터 코드와 표시 이름입니다.
 */
export const regionLabels = {
  all: '전체 지역',
  capital: '수도권',
  gangwon: '강원권',
  chungcheong: '충청권',
  jeolla: '전라권',
  gyeongsang: '경상권',
  jeju: '제주권',
}

/**
 * OpenWeatherMap 응답에 포함되지 않는
 * Weather Now 내부 도시 설정입니다.
 *
 * 실제 API 연결 시에도 이 설정은 유지합니다.
 */
export const cityConfigs = [
  {
    id: 'city_01',
    name: '서울',
    apiName: 'Seoul',
    countryCode: 'KR',
    regionCode: 'capital',
    region: '수도권',

    coord: {
      lat: 37.5665,
      lon: 126.978,
    },
  },

  {
    id: 'city_02',
    name: '수원',
    apiName: 'Suwon',
    countryCode: 'KR',
    regionCode: 'capital',
    region: '수도권',

    coord: {
      lat: 37.2636,
      lon: 127.0286,
    },
  },

  {
    id: 'city_03',
    name: '부산',
    apiName: 'Busan',
    countryCode: 'KR',
    regionCode: 'gyeongsang',
    region: '경상권',

    coord: {
      lat: 35.1796,
      lon: 129.0756,
    },
  },

  {
    id: 'city_04',
    name: '인천',
    apiName: 'Incheon',
    countryCode: 'KR',
    regionCode: 'capital',
    region: '수도권',

    coord: {
      lat: 37.4563,
      lon: 126.7052,
    },
  },

  {
    id: 'city_05',
    name: '대전',
    apiName: 'Daejeon',
    countryCode: 'KR',
    regionCode: 'chungcheong',
    region: '충청권',

    coord: {
      lat: 36.3504,
      lon: 127.3845,
    },
  },

  {
    id: 'city_06',
    name: '대구',
    apiName: 'Daegu',
    countryCode: 'KR',
    regionCode: 'gyeongsang',
    region: '경상권',

    coord: {
      lat: 35.8714,
      lon: 128.6014,
    },
  },

  {
    id: 'city_07',
    name: '광주',
    apiName: 'Gwangju',
    countryCode: 'KR',
    regionCode: 'jeolla',
    region: '전라권',

    coord: {
      lat: 35.1595,
      lon: 126.8526,
    },
  },

  {
    id: 'city_08',
    name: '울산',
    apiName: 'Ulsan',
    countryCode: 'KR',
    regionCode: 'gyeongsang',
    region: '경상권',

    coord: {
      lat: 35.5384,
      lon: 129.3114,
    },
  },

  {
    id: 'city_09',
    name: '강릉',
    apiName: 'Gangneung',
    countryCode: 'KR',
    regionCode: 'gangwon',
    region: '강원권',

    coord: {
      lat: 37.7519,
      lon: 128.8761,
    },
  },

  {
    id: 'city_10',
    name: '제주',
    apiName: 'Jeju City',
    countryCode: 'KR',
    regionCode: 'jeju',
    region: '제주권',

    coord: {
      lat: 33.4996,
      lon: 126.5312,
    },
  },
]

/**
 * 실제 OpenWeatherMap 응답과 동일한 형태의 Mock Data입니다.
 */
const mockOpenWeatherResponses = {
  city_01: {
    coord: {
      lon: 126.978,
      lat: 37.5665,
    },

    weather: [
      {
        id: 800,
        main: 'Clear',
        description: '맑음',
        icon: '01d',
      },
    ],

    main: {
      temp: 28,
      feels_like: 29.1,
      temp_min: 25,
      temp_max: 31,
      pressure: 1008,
      humidity: 62,
    },

    visibility: 10000,

    wind: {
      speed: 2.4,
      deg: 180,
    },

    sys: {
      country: 'KR',
      sunrise: 1785789000,
      sunset: 1785838800,
    },

    timezone: 32400,
    id: 1835848,
    name: 'Seoul',
    dt: 1785801600,
    cod: 200,
  },

  city_02: {
    coord: {
      lon: 127.0286,
      lat: 37.2636,
    },

    weather: [
      {
        id: 500,
        main: 'Rain',
        description: '약한 비',
        icon: '10d',
      },
    ],

    main: {
      temp: 24,
      feels_like: 25.3,
      temp_min: 22,
      temp_max: 26,
      pressure: 1005,
      humidity: 81,
    },

    visibility: 7000,

    wind: {
      speed: 3.7,
      deg: 210,
    },

    sys: {
      country: 'KR',
      sunrise: 1785789000,
      sunset: 1785838800,
    },

    timezone: 32400,
    id: 1835553,
    name: 'Suwon',
    dt: 1785801600,
    cod: 200,
  },

  city_03: {
    coord: {
      lon: 129.0756,
      lat: 35.1796,
    },

    weather: [
      {
        id: 803,
        main: 'Clouds',
        description: '구름 많음',
        icon: '04d',
      },
    ],

    main: {
      temp: 26,
      feels_like: 27.2,
      temp_min: 24,
      temp_max: 28,
      pressure: 1007,
      humidity: 73,
    },

    visibility: 10000,

    wind: {
      speed: 4.2,
      deg: 160,
    },

    sys: {
      country: 'KR',
      sunrise: 1785789000,
      sunset: 1785838800,
    },

    timezone: 32400,
    id: 1838524,
    name: 'Busan',
    dt: 1785801600,
    cod: 200,
  },

  city_04: {
    coord: {
      lon: 126.7052,
      lat: 37.4563,
    },

    weather: [
      {
        id: 804,
        main: 'Clouds',
        description: '흐림',
        icon: '04d',
      },
    ],

    main: {
      temp: 25,
      feels_like: 26.1,
      temp_min: 23,
      temp_max: 27,
      pressure: 1006,
      humidity: 76,
    },

    visibility: 9000,

    wind: {
      speed: 5.1,
      deg: 230,
      gust: 7.2,
    },

    sys: {
      country: 'KR',
      sunrise: 1785789000,
      sunset: 1785838800,
    },

    timezone: 32400,
    id: 1843564,
    name: 'Incheon',
    dt: 1785801600,
    cod: 200,
  },

  city_05: {
    coord: {
      lon: 127.3845,
      lat: 36.3504,
    },

    weather: [
      {
        id: 800,
        main: 'Clear',
        description: '맑음',
        icon: '01d',
      },
    ],

    main: {
      temp: 29,
      feels_like: 30.5,
      temp_min: 26,
      temp_max: 32,
      pressure: 1008,
      humidity: 58,
    },

    visibility: 10000,

    wind: {
      speed: 1.8,
      deg: 190,
    },

    sys: {
      country: 'KR',
      sunrise: 1785789000,
      sunset: 1785838800,
    },

    timezone: 32400,
    id: 1835235,
    name: 'Daejeon',
    dt: 1785801600,
    cod: 200,
  },

  city_06: {
    coord: {
      lon: 128.6014,
      lat: 35.8714,
    },

    weather: [
      {
        id: 800,
        main: 'Clear',
        description: '맑음',
        icon: '01d',
      },
    ],

    main: {
      temp: 31,
      feels_like: 34.2,
      temp_min: 28,
      temp_max: 34,
      pressure: 1007,
      humidity: 55,
    },

    visibility: 10000,

    wind: {
      speed: 2,
      deg: 170,
    },

    sys: {
      country: 'KR',
      sunrise: 1785789000,
      sunset: 1785838800,
    },

    timezone: 32400,
    id: 1835329,
    name: 'Daegu',
    dt: 1785801600,
    cod: 200,
  },

  city_07: {
    coord: {
      lon: 126.8526,
      lat: 35.1595,
    },

    weather: [
      {
        id: 521,
        main: 'Rain',
        description: '소나기',
        icon: '09d',
      },
    ],

    main: {
      temp: 27,
      feels_like: 29.3,
      temp_min: 24,
      temp_max: 29,
      pressure: 1005,
      humidity: 79,
    },

    visibility: 6000,

    wind: {
      speed: 3.3,
      deg: 200,
    },

    sys: {
      country: 'KR',
      sunrise: 1785789000,
      sunset: 1785838800,
    },

    timezone: 32400,
    id: 1841811,
    name: 'Gwangju',
    dt: 1785801600,
    cod: 200,
  },

  city_08: {
    coord: {
      lon: 129.3114,
      lat: 35.5384,
    },

    weather: [
      {
        id: 803,
        main: 'Clouds',
        description: '구름 많음',
        icon: '04d',
      },
    ],

    main: {
      temp: 26,
      feels_like: 27,
      temp_min: 24,
      temp_max: 28,
      pressure: 1007,
      humidity: 70,
    },

    visibility: 10000,

    wind: {
      speed: 4.8,
      deg: 150,
    },

    sys: {
      country: 'KR',
      sunrise: 1785789000,
      sunset: 1785838800,
    },

    timezone: 32400,
    id: 1833747,
    name: 'Ulsan',
    dt: 1785801600,
    cod: 200,
  },

  city_09: {
    coord: {
      lon: 128.8761,
      lat: 37.7519,
    },

    weather: [
      {
        id: 801,
        main: 'Clouds',
        description: '구름 조금',
        icon: '02d',
      },
    ],

    main: {
      temp: 23,
      feels_like: 23.2,
      temp_min: 21,
      temp_max: 25,
      pressure: 1009,
      humidity: 66,
    },

    visibility: 10000,

    wind: {
      speed: 5.6,
      deg: 90,
      gust: 7.4,
    },

    sys: {
      country: 'KR',
      sunrise: 1785789000,
      sunset: 1785838800,
    },

    timezone: 32400,
    id: 1843137,
    name: 'Gangneung',
    dt: 1785801600,
    cod: 200,
  },

  city_10: {
    coord: {
      lon: 126.5312,
      lat: 33.4996,
    },

    weather: [
      {
        id: 771,
        main: 'Squall',
        description: '강한 바람',
        icon: '50d',
      },
    ],

    main: {
      temp: 25,
      feels_like: 26.4,
      temp_min: 22,
      temp_max: 27,
      pressure: 1003,
      humidity: 84,
    },

    visibility: 8000,

    wind: {
      speed: 8.7,
      deg: 220,
      gust: 11.4,
    },

    sys: {
      country: 'KR',
      sunrise: 1785789000,
      sunset: 1785838800,
    },

    timezone: 32400,
    id: 1846266,
    name: 'Jeju City',
    dt: 1785801600,
    cod: 200,
  },
}

/**
 * Mock API 응답을 화면용 데이터로 정규화합니다.
 */
export const weatherData = cityConfigs.map((cityConfig) => {
  const mockResponse = mockOpenWeatherResponses[cityConfig.id]

  return normalizeOpenWeatherData(mockResponse, cityConfig, false)
})
