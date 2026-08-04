/**
 * OpenWeather API 응답을
 * 프로젝트에서 사용하는 날씨 객체로 변환합니다.
 *
 * 예:
 * API 응답의 main.feels_like
 * → 프로젝트의 main.feelsLike
 *
 *** @param {Object} apiData OpenWeather API 응답
 *** @param {Object} location 프로젝트의 지역 객체
 *** @param {boolean} favorite 즐겨찾기 여부
 *** @returns {Object}
 */
export const normalizeOpenWeatherData = (apiData, location, favorite = false) => {
  /**
   * OpenWeather의 weather는 배열입니다.
   * 첫 번째 항목을 대표 날씨로 사용합니다.
   */
  const weatherInfo = apiData.weather?.[0] ?? {}

  return {
    // ========================================
    // 지역 기본 정보
    // ========================================

    id: location.id,

    name: location.name ?? apiData.name ?? '지역 이름 없음',

    apiName: location.apiName ?? apiData.name ?? '',

    countryCode: location.countryCode ?? apiData.sys?.country ?? '',

    regionCode: location.regionCode ?? 'searched',

    region: location.region ?? '검색 추가 지역',

    addedByUser: location.addedByUser ?? false,

    favorite,

    // ========================================
    // 좌표
    // ========================================

    coord: {
      lat: apiData.coord?.lat ?? location.coord?.lat ?? null,

      lon: apiData.coord?.lon ?? location.coord?.lon ?? null,
    },

    // ========================================
    // 대표 날씨 정보
    // ========================================

    weather: {
      id: weatherInfo.id ?? null,

      main: weatherInfo.main ?? 'Unknown',

      description: weatherInfo.description ?? '날씨 정보 없음',

      icon: weatherInfo.icon ?? '',
    },

    // ========================================
    // 기온 및 대기 정보
    // ========================================

    main: {
      temp: apiData.main?.temp ?? null,

      feelsLike: apiData.main?.feels_like ?? null,

      tempMin: apiData.main?.temp_min ?? null,

      tempMax: apiData.main?.temp_max ?? null,

      pressure: apiData.main?.pressure ?? null,

      humidity: apiData.main?.humidity ?? null,
    },

    // ========================================
    // 바람
    // ========================================

    wind: {
      speed: apiData.wind?.speed ?? null,

      deg: apiData.wind?.deg ?? null,

      gust: apiData.wind?.gust ?? null,
    },

    // ========================================
    // 일출 및 일몰
    // ========================================

    sys: {
      country: apiData.sys?.country ?? location.countryCode ?? '',

      sunrise: apiData.sys?.sunrise ?? null,

      sunset: apiData.sys?.sunset ?? null,
    },

    // ========================================
    // 기타 정보
    // ========================================

    visibility: apiData.visibility ?? null,

    observedAt: apiData.dt ?? null,

    /**
     * OpenWeather가 반환한
     * 해당 지역의 UTC 기준 시차입니다.
     */
    timezone: apiData.timezone ?? null,

    /**
     * OpenWeather 내부 지역 ID입니다.
     *
     * 프로젝트에서는 이 값이 아니라
     * 직접 생성한 location ID를 사용합니다.
     */
    openWeatherId: apiData.id ?? null,
  }
}
