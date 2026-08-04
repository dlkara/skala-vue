// src/state/weatherState.js

import { ref } from 'vue'

import { weatherData } from '@/data/weatherData'

/**
 * 여러 페이지에서 공유하는 반응형 날씨 목록입니다.
 */
export const weatherList = ref(
  weatherData.map((city) => ({
    ...city,
  })),
)

/**
 * 전달받은 도시 ID의 즐겨찾기 상태를 반전합니다.
 */
export const toggleFavorite = (cityId) => {
  const city = weatherList.value.find((item) => item.id === cityId)

  if (!city) {
    return
  }

  city.favorite = !city.favorite
}
