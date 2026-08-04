import { ref } from 'vue'

import { weatherData } from '@/data/weatherData'

/**
 * 중첩 객체까지 복사합니다.
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
 * 홈·즐겨찾기·상세 페이지가 공유하는 상태입니다.
 *
 * 추후 Pinia Store로 이전할 수 있습니다.
 */
export const weatherList = ref(weatherData.map(cloneWeatherCity))

/**
 * 도시 ID를 기준으로 즐겨찾기를 변경합니다.
 */
export const toggleFavorite = (cityId) => {
  const city = weatherList.value.find((item) => item.id === cityId)

  if (!city) {
    return
  }

  city.favorite = !city.favorite
}
