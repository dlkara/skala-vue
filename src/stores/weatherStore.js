import { defineStore } from 'pinia'

import { weatherData } from '@/data/weatherData'

// ========================================
// localStorage 설정
// ========================================

/**
 * 즐겨찾기 도시 ID 목록을 저장할 키입니다.
 */
const FAVORITES_STORAGE_KEY = 'weather-now-favorite-city-ids'

/**
 * localStorage에서 즐겨찾기 도시 ID 목록을 불러옵니다.
 *
 * 정상적인 문자열 배열이 아니면
 * 빈 배열을 반환합니다.
 *
 * @returns {string[]}
 */
const loadFavoriteCityIds = () => {
  try {
    const savedValue = localStorage.getItem(FAVORITES_STORAGE_KEY)

    if (!savedValue) {
      return []
    }

    const parsedValue = JSON.parse(savedValue)

    /**
     * 저장된 값이 배열인지 확인합니다.
     */
    if (!Array.isArray(parsedValue)) {
      return []
    }

    /**
     * 도시 ID는 문자열이므로
     * 문자열 값만 남깁니다.
     */
    return parsedValue.filter((cityId) => {
      return typeof cityId === 'string'
    })
  } catch (error) {
    /**
     * JSON 파싱 오류나 localStorage 접근 오류가 있어도
     * 애플리케이션은 빈 즐겨찾기로 정상 실행합니다.
     */
    console.error('즐겨찾기 불러오기 실패:', error)

    return []
  }
}

/**
 * 즐겨찾기 도시 ID 목록을 localStorage에 저장합니다.
 *
 * @param {string[]} favoriteCityIds
 */
const saveFavoriteCityIds = (favoriteCityIds) => {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteCityIds))
  } catch (error) {
    console.error('즐겨찾기 저장 실패:', error)
  }
}

// ========================================
// 날씨 데이터 복사
// ========================================

/**
 * 날씨 객체와 내부 중첩 객체를 복사합니다.
 *
 * weatherData 원본을 직접 변경하지 않도록
 * 새로운 객체를 생성합니다.
 */
const cloneWeatherCity = (city) => {
  return {
    ...city,

    coord: {
      ...city.coord,
    },

    weather: {
      ...city.weather,
    },

    main: {
      ...city.main,
    },

    wind: {
      ...city.wind,
    },

    sys: {
      ...city.sys,
    },
  }
}

/**
 * 초기 날씨 목록을 생성합니다.
 *
 * localStorage에서 불러온 즐겨찾기 도시 ID를
 * 각 도시의 favorite 속성에 반영합니다.
 */
const createInitialWeatherList = () => {
  const favoriteCityIds = loadFavoriteCityIds()

  return weatherData.map((city) => {
    return {
      ...cloneWeatherCity(city),

      favorite: favoriteCityIds.includes(city.id),
    }
  })
}

// ========================================
// Weather Store
// ========================================

/**
 * 날씨 데이터와 즐겨찾기 상태를 관리하는 Store입니다.
 */
export const useWeatherStore = defineStore('weather', {
  // ========================================
  // State
  // ========================================

  state: () => ({
    /**
     * Store가 생성될 때 localStorage의 즐겨찾기 상태를
     * 반영한 날씨 목록을 초기값으로 사용합니다.
     */
    weatherList: createInitialWeatherList(),
  }),

  // ========================================
  // Getters
  // ========================================

  getters: {
    /**
     * 즐겨찾기로 등록된 도시 목록입니다.
     */
    favoriteWeatherList: (state) => {
      return state.weatherList.filter((city) => city.favorite)
    },

    /**
     * 즐겨찾기 도시 개수입니다.
     */
    favoriteCount() {
      return this.favoriteWeatherList.length
    },

    /**
     * 현재 즐겨찾기한 도시의 ID 목록입니다.
     *
     * localStorage에 저장할 때도 사용할 수 있습니다.
     */
    favoriteCityIds: (state) => {
      return state.weatherList.filter((city) => city.favorite).map((city) => city.id)
    },

    /**
     * 도시 ID로 날씨 객체를 찾습니다.
     *
     * 사용 예:
     * weatherStore.getWeatherById('city_01')
     */
    getWeatherById: (state) => {
      return (cityId) => {
        return state.weatherList.find((city) => {
          return city.id === cityId
        })
      }
    },

    /**
     * 특정 도시가 즐겨찾기인지 확인합니다.
     *
     * 사용 예:
     * weatherStore.isFavorite('city_01')
     */
    isFavorite: (state) => {
      return (cityId) => {
        return Boolean(
          state.weatherList.find((city) => {
            return city.id === cityId
          })?.favorite,
        )
      }
    },
  },

  // ========================================
  // Actions
  // ========================================

  actions: {
    /**
     * 현재 Store의 즐겨찾기 도시 ID를
     * localStorage에 저장합니다.
     *
     * Store 내부에서 반복되는 저장 코드를
     * 한곳으로 분리합니다.
     */
    saveFavorites() {
      const favoriteCityIds = this.weatherList
        .filter((city) => city.favorite)
        .map((city) => city.id)

      saveFavoriteCityIds(favoriteCityIds)
    },

    /**
     * 도시 ID를 기준으로
     * 즐겨찾기 상태를 변경합니다.
     *
     * 상태 변경 후 localStorage에도 즉시 저장합니다.
     *
     * @param {string} cityId
     */
    toggleFavorite(cityId) {
      const city = this.weatherList.find((item) => {
        return item.id === cityId
      })

      if (!city) {
        console.warn(`도시를 찾을 수 없습니다: ${cityId}`)

        return
      }

      city.favorite = !city.favorite

      this.saveFavorites()
    },

    /**
     * 특정 도시를 즐겨찾기에 추가합니다.
     *
     * 이미 즐겨찾기인 경우에는 변경하지 않습니다.
     *
     * @param {string} cityId
     */
    addFavorite(cityId) {
      const city = this.weatherList.find((item) => {
        return item.id === cityId
      })

      if (!city || city.favorite) {
        return
      }

      city.favorite = true
      this.saveFavorites()
    },

    /**
     * 특정 도시를 즐겨찾기에서 해제합니다.
     *
     * @param {string} cityId
     */
    removeFavorite(cityId) {
      const city = this.weatherList.find((item) => {
        return item.id === cityId
      })

      if (!city || !city.favorite) {
        return
      }

      city.favorite = false
      this.saveFavorites()
    },

    /**
     * 모든 즐겨찾기를 해제합니다.
     */
    clearFavorites() {
      this.weatherList.forEach((city) => {
        city.favorite = false
      })

      this.saveFavorites()
    },

    /**
     * 날씨 목록을 새 데이터로 교체합니다.
     *
     * 추후 OpenWeatherMap API 요청이 완료되었을 때
     * 정규화된 데이터 목록을 전달하면 됩니다.
     *
     * localStorage에 저장된 즐겨찾기 상태를
     * 새 API 데이터에도 다시 반영합니다.
     *
     * @param {Object[]} newWeatherList
     */
    setWeatherList(newWeatherList) {
      if (!Array.isArray(newWeatherList)) {
        console.warn('날씨 목록은 배열이어야 합니다.')

        return
      }

      const favoriteCityIds = loadFavoriteCityIds()

      this.weatherList = newWeatherList.map((newCity) => {
        return {
          ...cloneWeatherCity(newCity),

          favorite: favoriteCityIds.includes(newCity.id),
        }
      })
    },

    /**
     * 저장된 즐겨찾기를 다시 읽어
     * 현재 날씨 목록에 반영합니다.
     */
    restoreFavorites() {
      const favoriteCityIds = loadFavoriteCityIds()

      this.weatherList.forEach((city) => {
        city.favorite = favoriteCityIds.includes(city.id)
      })
    },
  },
})
