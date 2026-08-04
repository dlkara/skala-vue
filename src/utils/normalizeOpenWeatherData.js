/**
 * 숫자를 소수 첫째 자리까지 반올림합니다.
 */
const roundWeatherValue = (value) => {
  if (typeof value !== 'number') {
    return null
  }

  return Math.round(value * 10) / 10
}

/**
 * OpenWeatherMap Current Weather API 응답을
 * Weather Now 화면용 객체로 변환합니다.
 *
 * API 원본:
 * apiData.weather[0].description
 * apiData.main.feels_like
 *
 * 화면용 객체:
 * city.weather.description
 * city.main.feelsLike
 */
export const normalizeOpenWeatherData = (apiData, cityConfig, favorite = false) => {
  const currentWeather = apiData.weather?.[0] ?? {}

  return {
    // Weather Now 내부 정보
    id: cityConfig.id,
    name: cityConfig.name,
    apiName: cityConfig.apiName,

    countryCode: apiData.sys?.country ?? cityConfig.countryCode ?? 'KR',

    regionCode: cityConfig.regionCode,
    region: cityConfig.region,

    // 위치
    coord: {
      lat: apiData.coord?.lat ?? cityConfig.coord?.lat ?? null,

      lon: apiData.coord?.lon ?? cityConfig.coord?.lon ?? null,
    },

    // 대표 날씨
    weather: {
      id: currentWeather.id ?? null,
      main: currentWeather.main ?? 'Unknown',

      description: currentWeather.description ?? '날씨 정보 없음',

      icon: currentWeather.icon ?? '',
    },

    // 기온 및 대기
    main: {
      temp: roundWeatherValue(apiData.main?.temp),

      feelsLike: roundWeatherValue(apiData.main?.feels_like),

      tempMin: roundWeatherValue(apiData.main?.temp_min),

      tempMax: roundWeatherValue(apiData.main?.temp_max),

      pressure: apiData.main?.pressure ?? null,

      humidity: apiData.main?.humidity ?? null,
    },

    // 바람
    wind: {
      speed: roundWeatherValue(apiData.wind?.speed),

      deg: apiData.wind?.deg ?? null,

      gust: roundWeatherValue(apiData.wind?.gust),
    },

    // 일출·일몰
    sys: {
      country: apiData.sys?.country ?? cityConfig.countryCode ?? 'KR',

      sunrise: apiData.sys?.sunrise ?? null,

      sunset: apiData.sys?.sunset ?? null,
    },

    // 기타 API 데이터
    visibility: apiData.visibility ?? null,

    observedAt: apiData.dt ?? null,

    timezone: apiData.timezone ?? null,

    openWeatherId: apiData.id ?? null,

    // Weather Now 내부 상태
    favorite,
  }
}
