import axios from 'axios'
import { defineStore } from 'pinia'

import { initialLocations } from '@/data/weatherData'

import { createLocationId } from '@/utils/createLocationId'

import { normalizeOpenWeatherData } from '@/utils/normalizeOpenWeatherData'

// ========================================
// OpenWeather API 설정
// ========================================

/**
 * 지역명을 위도와 경도로 변환하는
 * OpenWeather Direct Geocoding API입니다.
 */
const GEOCODING_API_URL = 'https://api.openweathermap.org/geo/1.0/direct'

/**
 * 위도와 경도를 이용해 현재 날씨를 조회하는
 * OpenWeather Current Weather API입니다.
 */
const CURRENT_WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather'

/**
 * 프로젝트 최상위 .env 파일에서
 * OpenWeather API 키를 가져옵니다.
 */
const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY

// ========================================
// Local Storage 키
// ========================================

/**
 * 즐겨찾기한 도시 ID 목록을 저장하는 키입니다.
 */
const FAVORITES_STORAGE_KEY = 'weather-now-favorite-city-ids'

/**
 * 사용자가 API 검색으로 추가한 지역 정보를
 * 저장하는 키입니다.
 */
const ADDED_LOCATIONS_STORAGE_KEY = 'weather-now-added-locations'

// ========================================
// Local Storage 공통 함수
// ========================================

/**
 * Local Storage에서 JSON 데이터를 불러옵니다.
 *
 * 저장값이 없거나 JSON 변환 중 오류가 발생하면
 * 전달받은 기본값을 반환합니다.
 *
 * @param {string} key
 * @param {*} defaultValue
 * @returns {*}
 */
const loadStorage = (key, defaultValue) => {
  try {
    const savedValue = localStorage.getItem(key)

    if (savedValue === null) {
      return defaultValue
    }

    return JSON.parse(savedValue)
  } catch (error) {
    console.error(`${key} 불러오기 실패:`, error)

    return defaultValue
  }
}

/**
 * 데이터를 JSON 문자열로 바꿔
 * Local Storage에 저장합니다.
 *
 * @param {string} key
 * @param {*} value
 */
const saveStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`${key} 저장 실패:`, error)
  }
}

// ========================================
// 저장 데이터 불러오기
// ========================================

/**
 * 저장된 즐겨찾기 도시 ID를 불러옵니다.
 *
 * @returns {string[]}
 */
const loadFavoriteCityIds = () => {
  const savedValue = loadStorage(FAVORITES_STORAGE_KEY, [])

  if (!Array.isArray(savedValue)) {
    return []
  }

  return savedValue.filter((cityId) => typeof cityId === 'string')
}

/**
 * 사용자가 검색으로 추가한 지역을 불러옵니다.
 *
 * @returns {Object[]}
 */
const loadAddedLocations = () => {
  const savedValue = loadStorage(ADDED_LOCATIONS_STORAGE_KEY, [])

  if (!Array.isArray(savedValue)) {
    return []
  }

  return savedValue
}

/**
 * 서울·대전·제주 기본 지역과
 * Local Storage에 저장된 추가 지역을 합칩니다.
 *
 * 같은 ID가 이미 있으면 중복으로 넣지 않습니다.
 *
 * Map 대신 some()과 push()를 사용해
 * 수업에서 설명하기 쉬운 형태로 구성했습니다.
 *
 * @returns {Object[]}
 */
const createInitialLocationList = () => {
  const locationList = [...initialLocations]

  const addedLocations = loadAddedLocations()

  addedLocations.forEach((addedLocation) => {
    const alreadyExists = locationList.some((location) => location.id === addedLocation.id)

    if (!alreadyExists) {
      locationList.push(addedLocation)
    }
  })

  return locationList
}

// ========================================
// Geocoding 결과 변환
// ========================================

/**
 * Geocoding API 검색 결과를
 * 프로젝트의 지역 객체로 변환합니다.
 *
 * 기본 지역과 동일하게
 * 국가 코드와 위도·경도로 ID를 생성합니다.
 *
 * @param {Object} result
 * @returns {Object}
 */
const normalizeLocationResult = (result) => {
  /**
   * OpenWeather가 한글 지역명을 제공하면
   * 한글 이름을 우선 사용합니다.
   */
  const locationName = result.local_names?.ko ?? result.name

  const countryCode = result.country ?? 'unknown'

  return {
    id: createLocationId(countryCode, result.lat, result.lon),

    name: locationName,

    apiName: result.name,

    countryCode,

    /**
     * 검색으로 추가한 지역은
     * 별도 지역 필터로 구분합니다.
     */
    regionCode: 'searched',

    region: result.state ?? result.country ?? '검색 추가 지역',

    coord: {
      lat: result.lat,
      lon: result.lon,
    },

    addedByUser: true,
  }
}

// ========================================
// API 키 검사
// ========================================

/**
 * API 요청 전에 환경변수에
 * API 키가 존재하는지 확인합니다.
 */
const validateApiKey = () => {
  if (!OPENWEATHER_API_KEY) {
    throw new Error('OpenWeather API 키가 설정되지 않았습니다.')
  }
}

// ========================================
// Weather Store
// ========================================

export const useWeatherStore = defineStore('weather', {
  // ========================================
  // State
  // ========================================

  state: () => ({
    /**
     * OpenWeather API에서 받아온
     * 실제 날씨 카드 목록입니다.
     */
    weatherList: [],

    /**
     * 날씨를 조회할 지역 목록입니다.
     *
     * 기본 지역:
     * 서울, 대전, 제주
     *
     * 추가 지역:
     * 사용자가 Geocoding API로 검색한 지역
     */
    locationList: createInitialLocationList(),

    /**
     * 전체 날씨 요청 중인지 나타냅니다.
     */
    isLoading: false,

    /**
     * 새로운 지역을 검색 중인지 나타냅니다.
     */
    isSearching: false,

    /**
     * 전체 날씨 요청 오류 메시지입니다.
     */
    errorMessage: '',

    /**
     * 지역 검색 오류 메시지입니다.
     */
    searchErrorMessage: '',

    /**
     * 날씨 API를 한 번 이상
     * 정상적으로 호출했는지 나타냅니다.
     */
    hasFetched: false,

    /**
     * 마지막 API 요청 성공 시각입니다.
     */
    lastUpdatedAt: null,
  }),

  // ========================================
  // Getters
  // ========================================

  getters: {
    /**
     * 즐겨찾기한 도시만 반환합니다.
     */
    favoriteWeatherList: (state) => {
      return state.weatherList.filter((city) => city.favorite)
    },

    /**
     * 즐겨찾기한 도시 개수입니다.
     */
    favoriteCount() {
      return this.favoriteWeatherList.length
    },

    /**
     * 즐겨찾기한 도시의 ID 목록입니다.
     */
    favoriteCityIds: (state) => {
      return state.weatherList.filter((city) => city.favorite).map((city) => city.id)
    },

    /**
     * 도시 ID를 받아 해당 날씨 객체를 반환합니다.
     *
     * 사용 예:
     * weatherStore.getWeatherById(cityId)
     */
    getWeatherById: (state) => {
      return (cityId) => {
        return state.weatherList.find((city) => city.id === cityId)
      }
    },

    /**
     * 마지막 갱신 시각을 화면용 문장으로 변환합니다.
     */
    formattedLastUpdatedAt: (state) => {
      if (!state.lastUpdatedAt) {
        return ''
      }

      return new Intl.DateTimeFormat('ko-KR', {
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(state.lastUpdatedAt)
    },
  },

  // ========================================
  // Actions
  // ========================================

  actions: {
    // ========================================
    // 즐겨찾기
    // ========================================

    /**
     * 현재 즐겨찾기한 도시 ID를
     * Local Storage에 저장합니다.
     */
    persistFavorites() {
      const favoriteCityIds = this.weatherList
        .filter((city) => city.favorite)
        .map((city) => city.id)

      saveStorage(FAVORITES_STORAGE_KEY, favoriteCityIds)
    },

    /**
     * 도시의 즐겨찾기 상태를 변경하고
     * Local Storage에 저장합니다.
     *
     * @param {string} cityId
     */
    toggleFavorite(cityId) {
      const city = this.weatherList.find((item) => item.id === cityId)

      if (!city) {
        console.warn(`도시를 찾을 수 없습니다: ${cityId}`)

        return
      }

      city.favorite = !city.favorite

      /**
       * 실제로 정의된 action과
       * 같은 이름을 호출해야 합니다.
       */
      this.persistFavorites()
    },

    // ========================================
    // 추가 지역 저장
    // ========================================

    /**
     * 사용자가 검색으로 추가한 지역만
     * Local Storage에 저장합니다.
     */
    persistAddedLocations() {
      const addedLocations = this.locationList.filter((location) => location.addedByUser)

      saveStorage(ADDED_LOCATIONS_STORAGE_KEY, addedLocations)
    },

    // ========================================
    // 도시 하나 날씨 요청
    // ========================================

    /**
     * 하나의 지역 객체를 받아
     * 현재 날씨 API를 호출합니다.
     *
     * @param {Object} location
     * @returns {Promise<Object>}
     */
    async fetchWeather(location) {
      validateApiKey()

      const response = await axios.get(CURRENT_WEATHER_API_URL, {
        params: {
          lat: location.coord.lat,

          lon: location.coord.lon,

          appid: OPENWEATHER_API_KEY,

          /**
           * Store의 원본 기온은
           * 항상 섭씨로 유지합니다.
           */
          units: 'metric',

          /**
           * 날씨 설명을 한국어로 요청합니다.
           */
          lang: 'kr',
        },

        timeout: 10000,
      })

      /**
       * API 갱신 전의 도시 상태를 찾습니다.
       * 기존 즐겨찾기 상태를 유지하기 위해 사용합니다.
       */
      const previousCity = this.weatherList.find((city) => city.id === location.id)

      /**
       * 브라우저 새로고침 직후에는
       * weatherList가 비어 있으므로
       * Local Storage의 즐겨찾기도 확인합니다.
       */
      const savedFavoriteCityIds = loadFavoriteCityIds()

      const favorite = previousCity?.favorite ?? savedFavoriteCityIds.includes(location.id)

      return normalizeOpenWeatherData(response.data, location, favorite)
    },

    // ========================================
    // 전체 날씨 요청
    // ========================================

    /**
     * locationList에 등록된 모든 지역의
     * 현재 날씨를 불러옵니다.
     *
     * @param {Object} options
     * @param {boolean} options.force 강제 갱신 여부
     */
    async fetchAllWeather({ force = false } = {}) {
      /**
       * 이미 날씨를 불러왔고
       * 강제 갱신 요청이 아니라면
       * API를 다시 호출하지 않습니다.
       */
      if (this.hasFetched && !force) {
        return
      }

      /**
       * 현재 요청 중이면
       * 중복 요청하지 않습니다.
       */
      if (this.isLoading) {
        return
      }

      this.isLoading = true
      this.errorMessage = ''

      try {
        validateApiKey()

        /**
         * 모든 지역의 날씨를 동시에 요청합니다.
         *
         * Promise.all은 모든 요청이 성공하면
         * 결과 배열을 반환합니다.
         */
        const newWeatherList = await Promise.all(
          this.locationList.map((location) => {
            return this.fetchWeather(location)
          }),
        )

        this.weatherList = newWeatherList

        this.hasFetched = true

        this.lastUpdatedAt = new Date()
      } catch (error) {
        console.error('날씨 정보 불러오기 실패:', error)

        if (!OPENWEATHER_API_KEY) {
          this.errorMessage = 'OpenWeather API 키가 설정되지 않았습니다.'
        } else if (error.response?.status === 401) {
          this.errorMessage = 'OpenWeather API 키가 올바르지 않거나 아직 활성화되지 않았습니다.'
        } else if (error.response?.status === 429) {
          this.errorMessage = 'OpenWeather API 요청 한도를 초과했습니다.'
        } else {
          this.errorMessage = '실시간 날씨 정보를 불러오지 못했습니다.'
        }
      } finally {
        this.isLoading = false
      }
    },

    // ========================================
    // 지역 검색 및 카드 추가
    // ========================================

    /**
     * 사용자가 입력한 지역명을 검색하고
     * 홈 화면에 날씨 카드를 추가합니다.
     *
     * 처리 순서:
     * 1. Geocoding API로 좌표 검색
     * 2. 검색 결과를 지역 객체로 변환
     * 3. 중복 지역 확인
     * 4. 현재 날씨 API 호출
     * 5. locationList에 지역 추가
     * 6. weatherList에 카드 추가
     * 7. 추가 지역 Local Storage 저장
     *
     * @param {string} query
     * @returns {Promise<Object|null>}
     */
    async searchAndAddLocation(query) {
      const searchText = query.trim()

      if (!searchText) {
        this.searchErrorMessage = '검색할 지역명을 입력하세요.'

        return null
      }

      if (this.isSearching) {
        return null
      }

      this.isSearching = true
      this.searchErrorMessage = ''

      try {
        validateApiKey()

        /**
         * 사용자가 입력한 지역명을
         * 위도와 경도로 변환합니다.
         */
        const response = await axios.get(GEOCODING_API_URL, {
          params: {
            q: searchText,

            /**
             * 현재 구현에서는
             * 첫 번째 검색 결과를 사용합니다.
             */
            limit: 1,

            appid: OPENWEATHER_API_KEY,
          },

          timeout: 10000,
        })

        const result = response.data?.[0]

        if (!result) {
          this.searchErrorMessage = `'${searchText}' 지역을 찾을 수 없습니다.`

          return null
        }

        const newLocation = normalizeLocationResult(result)

        /**
         * 동일한 국가 및 좌표로 생성된
         * 같은 ID가 있는지 확인합니다.
         */
        const sameIdExists = this.locationList.some((location) => location.id === newLocation.id)

        /**
         * 기본 데이터의 좌표와
         * Geocoding API 좌표에 작은 차이가 있을 수 있습니다.
         *
         * 같은 국가와 같은 API 지역명이 있으면
         * 이미 등록된 지역으로 판단합니다.
         */
        const sameNameExists = this.locationList.some((location) => {
          const sameCountry =
            location.countryCode?.trim().toLowerCase() ===
            newLocation.countryCode?.trim().toLowerCase()

          const sameApiName =
            location.apiName?.trim().toLowerCase() === newLocation.apiName?.trim().toLowerCase()

          return sameCountry && sameApiName
        })

        if (sameIdExists || sameNameExists) {
          this.searchErrorMessage = `${newLocation.name}은 이미 추가된 지역입니다.`

          return null
        }

        /**
         * 날씨 요청에 성공한 경우에만
         * 실제 목록에 지역을 추가합니다.
         */
        const newWeather = await this.fetchWeather(newLocation)

        this.locationList.push(newLocation)

        this.weatherList.push(newWeather)

        this.persistAddedLocations()

        this.lastUpdatedAt = new Date()

        return newWeather
      } catch (error) {
        console.error('지역 검색 실패:', error)

        if (!OPENWEATHER_API_KEY) {
          this.searchErrorMessage = 'OpenWeather API 키가 설정되지 않았습니다.'
        } else if (error.response?.status === 401) {
          this.searchErrorMessage = 'OpenWeather API 키를 확인하세요.'
        } else if (error.response?.status === 429) {
          this.searchErrorMessage = 'OpenWeather API 요청 한도를 초과했습니다.'
        } else {
          this.searchErrorMessage = '지역 검색 중 오류가 발생했습니다.'
        }

        return null
      } finally {
        this.isSearching = false
      }
    },

    // ========================================
    // 검색 추가 지역 삭제
    // ========================================

    /**
     * 사용자가 검색으로 추가한 지역을 삭제합니다.
     *
     * 서울·대전·제주는 addedByUser가 false이므로
     * 이 함수로 삭제되지 않습니다.
     *
     * @param {string} cityId
     */
    removeAddedLocation(cityId) {
      const location = this.locationList.find((item) => item.id === cityId)

      if (!location || !location.addedByUser) {
        return
      }

      this.locationList = this.locationList.filter((item) => item.id !== cityId)

      this.weatherList = this.weatherList.filter((city) => city.id !== cityId)

      /**
       * 삭제된 지역이 Local Storage와
       * 즐겨찾기 목록에도 남지 않도록 저장합니다.
       */
      this.persistAddedLocations()
      this.persistFavorites()
    },

    // ========================================
    // 날씨 새로고침
    // ========================================

    /**
     * 기존 요청 여부와 관계없이
     * 전체 지역의 날씨를 다시 불러옵니다.
     */
    async refreshWeather() {
      await this.fetchAllWeather({
        force: true,
      })
    },
  },
})
