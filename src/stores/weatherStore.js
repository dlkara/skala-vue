import axios from 'axios'

import { computed, ref } from 'vue'

import { defineStore } from 'pinia'

// ========================================
// OpenWeather 설정
// ========================================

const OPEN_WEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY

const CURRENT_WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather'

const GEOCODING_API_URL = 'https://api.openweathermap.org/geo/1.0/direct'

// ========================================
// Local Storage 키
// ========================================

const ADDED_LOCATIONS_STORAGE_KEY = 'weather-dashboard-added-locations'

const HIDDEN_LOCATION_IDS_STORAGE_KEY = 'weather-dashboard-hidden-location-ids'

const FAVORITE_IDS_STORAGE_KEY = 'weather-dashboard-favorite-ids'

// ========================================
// 기본 지역
// ========================================

/**
 * 기본 지역은 위치 정보만 직접 등록합니다.
 *
 * 기온, 습도, 풍속 등의 날씨 값은
 * OpenWeather API에서 불러옵니다.
 */
const defaultLocations = [
  {
    id: 'KR-37.5665-126.9780',

    name: '서울',
    apiName: 'Seoul',

    state: '서울특별시',
    countryCode: 'KR',

    regionCode: 'capital',
    region: '수도권',

    coord: {
      lat: 37.5665,
      lon: 126.978,
    },

    addedByUser: false,
  },

  {
    id: 'KR-36.3504-127.3845',

    name: '대전',
    apiName: 'Daejeon',

    state: '대전광역시',
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
    id: 'KR-33.4996-126.5312',

    name: '제주',
    apiName: 'Jeju City',

    state: '제주특별자치도',
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

// ========================================
// 공통 유틸리티
// ========================================

/**
 * 국가 코드와 좌표를 이용해
 * 지역 고유 ID를 생성합니다.
 *
 * 대시보드 저장용 ID이므로
 * 좌표를 소수점 넷째 자리까지 사용합니다.
 */
const createLocationId = (countryCode, lat, lon) => {
  const normalizedCountryCode = countryCode?.trim().toUpperCase() || 'UNKNOWN'

  const normalizedLat = Number(lat).toFixed(4)

  const normalizedLon = Number(lon).toFixed(4)

  return `${normalizedCountryCode}-` + `${normalizedLat}-` + `${normalizedLon}`
}

/**
 * 검색 결과의 중복 판별용 키를 생성합니다.
 *
 * Geocoding API에서는 서로 다른 이름을 가진 후보가
 * 실제로 같은 현재 날씨 좌표로 연결될 수 있습니다.
 *
 * Current Weather API가 반환한 좌표를 기준으로
 * 같은 좌표의 결과를 하나로 묶습니다.
 */
const createWeatherCoordinateKey = (countryCode, lat, lon) => {
  const normalizedCountryCode = countryCode?.trim().toUpperCase() || 'UNKNOWN'

  const normalizedLat = Number(lat).toFixed(4)

  const normalizedLon = Number(lon).toFixed(4)

  return `${normalizedCountryCode}-` + `${normalizedLat}-` + `${normalizedLon}`
}

/**
 * Local Storage에 저장된 JSON을 안전하게 읽습니다.
 */
const readStorage = (key, fallbackValue) => {
  try {
    const storedValue = localStorage.getItem(key)

    if (!storedValue) {
      return fallbackValue
    }

    return JSON.parse(storedValue)
  } catch (error) {
    console.error(`Local Storage 읽기 실패: ${key}`, error)

    return fallbackValue
  }
}

/**
 * Local Storage에 JSON 데이터를 저장합니다.
 */
const writeStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Local Storage 저장 실패: ${key}`, error)
  }
}

/**
 * API 오류를 사용자용 메시지로 변환합니다.
 */
const getApiErrorMessage = (error, fallbackMessage) => {
  if (error?.response?.status === 401) {
    return 'OpenWeather API 키가 올바르지 않습니다. ' + '.env 설정을 확인하세요.'
  }

  if (error?.response?.status === 404) {
    return '날씨 정보를 찾을 수 없습니다.'
  }

  if (error?.code === 'ERR_NETWORK' || !error?.response) {
    return '네트워크 연결을 확인한 후 다시 시도하세요.'
  }

  return fallbackMessage
}

/**
 * 위도·경도와 국가 코드를 기준으로
 * 기본 지역과 일치하는지 확인합니다.
 */
const findDefaultLocation = (countryCode, lat, lon) => {
  const locationId = createLocationId(countryCode, lat, lon)

  return defaultLocations.find((location) => location.id === locationId)
}

/**
 * Geocoding API가 반환한 지역명을
 * 화면에 표시하기 좋은 형태로 가져옵니다.
 */
const createDisplayName = (geocodingItem) => {
  const koreanName = geocodingItem.local_names?.ko

  if (koreanName) {
    return koreanName
  }

  return geocodingItem.name || '이름 없는 지역'
}

/**
 * 행정구역 표시값을 생성합니다.
 */
const createAdministrativeArea = (state, countryCode) => {
  const normalizedState = state?.trim()

  const normalizedCountryCode = countryCode?.trim().toUpperCase()

  if (normalizedState && normalizedCountryCode) {
    return `${normalizedState} · ` + normalizedCountryCode
  }

  if (normalizedState) {
    return normalizedState
  }

  if (normalizedCountryCode) {
    return `행정구역 정보 없음 · ` + normalizedCountryCode
  }

  return '행정구역 정보 없음'
}

/**
 * OpenWeather 현재 날씨 응답을
 * 프로젝트의 공통 도시 객체로 변환합니다.
 */
const normalizeWeatherData = (apiData, location) => {
  const countryCode = location.countryCode || apiData.sys?.country || ''

  const state = location.state || ''

  const latitude = apiData.coord?.lat ?? location.coord.lat

  const longitude = apiData.coord?.lon ?? location.coord.lon

  return {
    /**
     * 대시보드에 저장하는 ID는
     * Geocoding 검색 후보의 좌표를 기준으로 유지합니다.
     */
    id: location.id || createLocationId(countryCode, location.coord.lat, location.coord.lon),

    name: location.name || apiData.name,

    apiName: location.apiName || apiData.name,

    state,

    administrativeArea: createAdministrativeArea(state, countryCode),

    countryCode,

    regionCode: location.regionCode || 'searched',

    region: location.region || '검색 추가 지역',

    /**
     * Current Weather API가 실제로 반환한 좌표입니다.
     *
     * 검색 결과 중복 제거에서도 이 값을 사용합니다.
     */
    coord: {
      lat: latitude,
      lon: longitude,
    },

    /**
     * Geocoding API가 반환한 원래 검색 좌표입니다.
     *
     * Local Storage에 저장하거나
     * 검색 후보를 식별할 때 사용할 수 있습니다.
     */
    searchCoord: {
      lat: location.coord.lat,

      lon: location.coord.lon,
    },

    main: {
      temp: apiData.main?.temp,

      feels_like: apiData.main?.feels_like,

      temp_min: apiData.main?.temp_min,

      temp_max: apiData.main?.temp_max,

      pressure: apiData.main?.pressure,

      humidity: apiData.main?.humidity,
    },

    weather: {
      main: apiData.weather?.[0]?.main || '',

      description: apiData.weather?.[0]?.description || '',

      icon: apiData.weather?.[0]?.icon || '',
    },

    wind: {
      speed: apiData.wind?.speed ?? 0,

      deg: apiData.wind?.deg ?? null,
    },

    clouds: {
      all: apiData.clouds?.all ?? 0,
    },

    visibility: apiData.visibility ?? null,

    sys: {
      sunrise: apiData.sys?.sunrise ?? null,

      sunset: apiData.sys?.sunset ?? null,
    },

    timezone: apiData.timezone ?? 0,

    dt: apiData.dt ?? null,

    favorite: Boolean(location.favorite),

    addedByUser: Boolean(location.addedByUser),
  }
}

// ========================================
// Pinia Store
// ========================================

export const useWeatherStore = defineStore('weather', () => {
  // ==================================
  // 상태
  // ==================================

  /**
   * 대시보드에 실제로 표시되는 도시 목록입니다.
   */
  const weatherList = ref([])

  /**
   * 사용자가 API 검색 후 추가한 위치 목록입니다.
   *
   * 날씨 값은 저장하지 않고
   * 이름과 좌표 등의 위치 정보만 저장합니다.
   */
  const addedLocations = ref(readStorage(ADDED_LOCATIONS_STORAGE_KEY, []))

  /**
   * 사용자가 삭제한 기본 도시 ID입니다.
   */
  const hiddenLocationIds = ref(readStorage(HIDDEN_LOCATION_IDS_STORAGE_KEY, []))

  /**
   * 즐겨찾기 도시 ID 목록입니다.
   */
  const favoriteIds = ref(readStorage(FAVORITE_IDS_STORAGE_KEY, []))

  /**
   * 자동 API 검색 결과입니다.
   */
  const searchResults = ref([])

  const isLoading = ref(false)

  const isSearching = ref(false)

  const errorMessage = ref('')

  const searchErrorMessage = ref('')

  const lastUpdatedAt = ref(null)

  // ==================================
  // 계산 속성
  // ==================================

  const favoriteWeatherList = computed(() => {
    return weatherList.value.filter((city) => city.favorite)
  })

  const formattedLastUpdatedAt = computed(() => {
    if (!lastUpdatedAt.value) {
      return ''
    }

    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(lastUpdatedAt.value)
  })

  // ==================================
  // 저장 함수
  // ==================================

  const persistAddedLocations = () => {
    writeStorage(ADDED_LOCATIONS_STORAGE_KEY, addedLocations.value)
  }

  const persistHiddenLocationIds = () => {
    writeStorage(HIDDEN_LOCATION_IDS_STORAGE_KEY, hiddenLocationIds.value)
  }

  const persistFavorites = () => {
    writeStorage(FAVORITE_IDS_STORAGE_KEY, favoriteIds.value)
  }

  // ==================================
  // 날씨 API
  // ==================================

  /**
   * 하나의 위치에 대한 현재 날씨를 조회합니다.
   */
  const fetchWeatherByLocation = async (location) => {
    const response = await axios.get(CURRENT_WEATHER_API_URL, {
      params: {
        lat: location.coord.lat,

        lon: location.coord.lon,

        appid: OPEN_WEATHER_API_KEY,

        units: 'metric',

        lang: 'kr',
      },
    })

    return normalizeWeatherData(response.data, {
      ...location,

      favorite: favoriteIds.value.includes(location.id),
    })
  }

  /**
   * 현재 대시보드에 표시할 모든 위치를 반환합니다.
   */
  const getVisibleLocations = () => {
    const visibleDefaults = defaultLocations.filter((location) => {
      return !hiddenLocationIds.value.includes(location.id)
    })

    const locationMap = new Map()

    ;[...visibleDefaults, ...addedLocations.value].forEach((location) => {
      locationMap.set(location.id, location)
    })

    return Array.from(locationMap.values())
  }

  /**
   * 대시보드의 전체 날씨를 불러옵니다.
   */
  const fetchAllWeather = async () => {
    if (!OPEN_WEATHER_API_KEY) {
      errorMessage.value = 'VITE_OPENWEATHER_API_KEY가 설정되지 않았습니다.'

      weatherList.value = []

      return
    }

    isLoading.value = true
    errorMessage.value = ''

    try {
      const locations = getVisibleLocations()

      if (locations.length === 0) {
        weatherList.value = []
        lastUpdatedAt.value = new Date()

        return
      }

      const settledResults = await Promise.allSettled(
        locations.map((location) => {
          return fetchWeatherByLocation(location)
        }),
      )

      const successfulWeather = settledResults
        .filter((result) => result.status === 'fulfilled')
        .map((result) => result.value)

      weatherList.value = successfulWeather

      lastUpdatedAt.value = new Date()

      const failedCount = settledResults.length - successfulWeather.length

      if (successfulWeather.length === 0 && failedCount > 0) {
        errorMessage.value = '날씨 정보를 불러오지 못했습니다.'
      } else if (failedCount > 0) {
        errorMessage.value = `${failedCount}개 지역의 날씨를 불러오지 못했습니다.`
      }
    } catch (error) {
      console.error('전체 날씨 조회 실패:', error)

      errorMessage.value = getApiErrorMessage(error, '날씨 정보를 불러오지 못했습니다.')
    } finally {
      isLoading.value = false
    }
  }

  const refreshWeather = async () => {
    await fetchAllWeather()
  }

  // ==================================
  // 자동 지역 검색
  // ==================================

  /**
   * 지역명을 API에서 검색합니다.
   *
   * 검색 결과만 가져오며,
   * 사용자가 추가 버튼을 누르기 전까지
   * 대시보드와 Local Storage는 변경하지 않습니다.
   */
  const searchLocation = async (query) => {
    const normalizedQuery = query.trim()

    searchResults.value = []
    searchErrorMessage.value = ''

    if (!normalizedQuery) {
      return []
    }

    if (!OPEN_WEATHER_API_KEY) {
      searchErrorMessage.value = 'VITE_OPENWEATHER_API_KEY가 설정되지 않았습니다.'

      return []
    }

    isSearching.value = true

    try {
      /**
       * 1단계:
       * 입력한 검색어를 그대로 사용해
       * 최대 5개의 좌표 후보를 가져옵니다.
       */
      const geocodingResponse = await axios.get(GEOCODING_API_URL, {
        params: {
          q: normalizedQuery,

          limit: 5,

          appid: OPEN_WEATHER_API_KEY,
        },
      })

      const geocodingList = geocodingResponse.data

      if (!Array.isArray(geocodingList) || geocodingList.length === 0) {
        searchErrorMessage.value = `'${normalizedQuery}'에 해당하는 지역을 찾지 못했습니다.`

        return []
      }

      /**
       * Geocoding 단계에서 국가와 좌표가
       * 완전히 같은 후보를 먼저 제거합니다.
       */
      const uniqueGeocodingMap = new Map()

      geocodingList.forEach((item) => {
        const geocodingId = createLocationId(item.country, item.lat, item.lon)

        if (uniqueGeocodingMap.has(geocodingId)) {
          return
        }

        const defaultLocation = findDefaultLocation(item.country, item.lat, item.lon)

        const state = defaultLocation?.state || item.state || ''

        const countryCode = item.country || ''

        uniqueGeocodingMap.set(geocodingId, {
          id: geocodingId,

          name: defaultLocation?.name || createDisplayName(item),

          apiName: item.name,

          state,

          administrativeArea: createAdministrativeArea(state, countryCode),

          countryCode,

          regionCode: defaultLocation?.regionCode || 'searched',

          region: defaultLocation?.region || '검색 결과',

          coord: {
            lat: Number(item.lat),

            lon: Number(item.lon),
          },

          addedByUser: !defaultLocation,
        })
      })

      const candidateLocations = Array.from(uniqueGeocodingMap.values())

      /**
       * 2단계:
       * 각 후보 좌표의 현재 날씨를 요청합니다.
       */
      const settledWeatherResults = await Promise.allSettled(
        candidateLocations.map((location) => {
          return fetchWeatherByLocation(location)
        }),
      )

      const successfulResults = settledWeatherResults
        .filter((result) => result.status === 'fulfilled')
        .map((result) => result.value)

      /**
       * 3단계:
       * Current Weather API가 반환한 실제 좌표를
       * 기준으로 중복 결과를 제거합니다.
       *
       * 이름이 서로 다르더라도
       * 국가 코드와 좌표가 같으면
       * 첫 번째 결과만 유지합니다.
       */
      const uniqueWeatherMap = new Map()

      successfulResults.forEach((city) => {
        const coordinateKey = createWeatherCoordinateKey(
          city.countryCode,
          city.coord.lat,
          city.coord.lon,
        )

        if (uniqueWeatherMap.has(coordinateKey)) {
          return
        }

        uniqueWeatherMap.set(coordinateKey, {
          ...city,

          isAdded: weatherList.value.some((weatherCity) => {
            return weatherCity.id === city.id
          }),
        })
      })

      const deduplicatedResults = Array.from(uniqueWeatherMap.values())

      searchResults.value = deduplicatedResults

      if (deduplicatedResults.length === 0) {
        searchErrorMessage.value = '검색 후보의 날씨 정보를 불러오지 못했습니다.'
      }

      return deduplicatedResults
    } catch (error) {
      console.error('지역 자동 검색 실패:', error)

      searchErrorMessage.value = getApiErrorMessage(error, '지역 검색 중 오류가 발생했습니다.')

      return []
    } finally {
      isSearching.value = false
    }
  }

  /**
   * 검색 결과를 대시보드에 추가합니다.
   */
  const addLocation = async (candidate) => {
    if (!candidate?.id) {
      return {
        success: false,

        message: '추가할 지역 정보가 올바르지 않습니다.',
      }
    }

    const alreadyExists = weatherList.value.some((city) => city.id === candidate.id)

    if (alreadyExists) {
      return {
        success: false,

        message: `${candidate.name}은 이미 대시보드에 있습니다.`,
      }
    }

    const defaultLocation = defaultLocations.find((location) => location.id === candidate.id)

    /**
     * 삭제했던 기본 도시를 다시 추가하는 경우
     * hiddenLocationIds에서 제거합니다.
     */
    if (defaultLocation) {
      hiddenLocationIds.value = hiddenLocationIds.value.filter((id) => id !== candidate.id)

      persistHiddenLocationIds()
    } else {
      /**
       * 새 지역은 날씨 값이 아니라
       * 검색에 필요한 위치 정보만 저장합니다.
       *
       * 검색 후보의 원래 좌표가 있다면
       * 해당 좌표를 우선 저장합니다.
       */
      const storageCoordinate = candidate.searchCoord || candidate.coord

      const locationForStorage = {
        id: candidate.id,

        name: candidate.name,

        apiName: candidate.apiName,

        state: candidate.state || '',

        administrativeArea: createAdministrativeArea(candidate.state, candidate.countryCode),

        countryCode: candidate.countryCode,

        regionCode: 'searched',

        region: '검색 추가 지역',

        coord: {
          lat: storageCoordinate.lat,

          lon: storageCoordinate.lon,
        },

        addedByUser: true,
      }

      const locationExists = addedLocations.value.some(
        (location) => location.id === locationForStorage.id,
      )

      if (!locationExists) {
        addedLocations.value.push(locationForStorage)

        persistAddedLocations()
      }
    }

    const weatherToAdd = {
      ...candidate,

      regionCode: defaultLocation?.regionCode || 'searched',

      region: defaultLocation?.region || '검색 추가 지역',

      administrativeArea: createAdministrativeArea(candidate.state, candidate.countryCode),

      addedByUser: !defaultLocation,

      favorite: favoriteIds.value.includes(candidate.id),
    }

    weatherList.value.push(weatherToAdd)

    searchResults.value = searchResults.value.map((result) => {
      if (result.id !== candidate.id) {
        return result
      }

      return {
        ...result,
        isAdded: true,
      }
    })

    return {
      success: true,

      message: `${candidate.name}을 대시보드에 추가했습니다.`,
    }
  }

  // ==================================
  // 도시 삭제
  // ==================================

  /**
   * 기본 도시와 검색 추가 도시를 모두 삭제합니다.
   */
  const removeLocation = (cityId) => {
    const targetCity = weatherList.value.find((city) => city.id === cityId)

    if (!targetCity) {
      return {
        success: false,

        message: '삭제할 도시를 찾지 못했습니다.',
      }
    }

    const isDefaultLocation = defaultLocations.some((location) => location.id === cityId)

    if (isDefaultLocation) {
      if (!hiddenLocationIds.value.includes(cityId)) {
        hiddenLocationIds.value.push(cityId)

        persistHiddenLocationIds()
      }
    } else {
      addedLocations.value = addedLocations.value.filter((location) => location.id !== cityId)

      persistAddedLocations()
    }

    weatherList.value = weatherList.value.filter((city) => city.id !== cityId)

    favoriteIds.value = favoriteIds.value.filter((id) => id !== cityId)

    persistFavorites()

    searchResults.value = searchResults.value.map((result) => {
      if (result.id !== cityId) {
        return result
      }

      return {
        ...result,
        isAdded: false,
      }
    })

    return {
      success: true,

      message: `${targetCity.name}을 대시보드에서 삭제했습니다.`,
    }
  }

  // ==================================
  // 즐겨찾기
  // ==================================

  const toggleFavorite = (cityId) => {
    const targetCity = weatherList.value.find((city) => city.id === cityId)

    if (!targetCity) {
      return
    }

    targetCity.favorite = !targetCity.favorite

    if (targetCity.favorite) {
      if (!favoriteIds.value.includes(cityId)) {
        favoriteIds.value.push(cityId)
      }
    } else {
      favoriteIds.value = favoriteIds.value.filter((id) => id !== cityId)
    }

    persistFavorites()
  }

  // ==================================
  // 검색 초기화
  // ==================================

  const clearSearchResults = () => {
    searchResults.value = []
    searchErrorMessage.value = ''
  }

  // ==================================
  // 도시 조회
  // ==================================

  const getWeatherById = (cityId) => {
    return weatherList.value.find((city) => city.id === cityId)
  }

  return {
    weatherList,
    searchResults,

    isLoading,
    isSearching,

    errorMessage,
    searchErrorMessage,

    lastUpdatedAt,
    formattedLastUpdatedAt,

    favoriteWeatherList,

    fetchAllWeather,
    refreshWeather,

    searchLocation,
    addLocation,
    removeLocation,

    toggleFavorite,
    persistFavorites,

    clearSearchResults,
    getWeatherById,
  }
})
