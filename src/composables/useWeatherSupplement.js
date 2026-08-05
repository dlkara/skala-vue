import { ref } from 'vue'

import axios from 'axios'

const FORECAST_API_URL = 'https://api.open-meteo.com/v1/forecast'

const AIR_QUALITY_API_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality'

const CACHE_DURATION = 10 * 60 * 1000

const responseCache = new Map()

const createEmptyForecast = () => ({
  todayMinimum: null,
  todayMaximum: null,
  hourly: [],
  sunEvents: [],
  timezone: '',
})

const createEmptyAirQuality = () => ({
  pm10: null,
  pm2_5: null,
  observedAt: '',
})

const normalizeForecast = (data) => {
  const hourly = data?.hourly ?? {}
  const daily = data?.daily ?? {}
  const times = Array.isArray(hourly.time) ? hourly.time : []
  const firstForecastDate = times[0]?.slice(0, 10)
  const dailyDates = Array.isArray(daily.time) ? daily.time : []
  const todayIndex = Math.max(dailyDates.indexOf(firstForecastDate), 0)
  const sunEvents = dailyDates.flatMap((date, index) => {
    const events = []
    const sunrise = daily.sunrise?.[index]
    const sunset = daily.sunset?.[index]

    if (sunrise) {
      events.push({
        type: 'sunrise',
        time: sunrise,
      })
    }

    if (sunset) {
      events.push({
        type: 'sunset',
        time: sunset,
      })
    }

    return events
  })

  return {
    todayMinimum: daily.temperature_2m_min?.[todayIndex] ?? null,
    todayMaximum: daily.temperature_2m_max?.[todayIndex] ?? null,
    timezone: data?.timezone ?? '',
    sunEvents,
    hourly: times.map((time, index) => ({
      time,
      temperature: hourly.temperature_2m?.[index] ?? null,
      humidity: hourly.relative_humidity_2m?.[index] ?? null,
      precipitation: hourly.precipitation?.[index] ?? null,
      weatherCode: hourly.weather_code?.[index] ?? null,
      isDay: hourly.is_day?.[index] ?? null,
    })),
  }
}

const normalizeAirQuality = (data) => ({
  pm10: data?.current?.pm10 ?? null,
  pm2_5: data?.current?.pm2_5 ?? null,
  observedAt: data?.current?.time ?? '',
})

/**
 * Open-Meteo의 일별·시간별 예보와 대기질 데이터를 조회합니다.
 * OpenWeather 현재 관측 데이터와 역할을 분리해 상세 화면에서만 사용합니다.
 */
export const useWeatherSupplement = () => {
  const forecast = ref(createEmptyForecast())

  const airQuality = ref(createEmptyAirQuality())

  const isLoading = ref(false)

  const errorMessage = ref('')

  const forecastErrorMessage = ref('')

  const airQualityErrorMessage = ref('')

  const updatedAt = ref(null)

  let requestId = 0

  const fetchWeatherSupplement = async (latitude, longitude) => {
    const numericLatitude = Number(latitude)
    const numericLongitude = Number(longitude)

    if (!Number.isFinite(numericLatitude) || !Number.isFinite(numericLongitude)) {
      errorMessage.value = '예보를 불러올 지역 좌표가 올바르지 않습니다.'

      return
    }

    const currentRequestId = ++requestId
    const cacheKey = `${numericLatitude.toFixed(4)}-${numericLongitude.toFixed(4)}`
    const cached = responseCache.get(cacheKey)

    if (cached && Date.now() - cached.savedAt < CACHE_DURATION) {
      forecast.value = cached.forecast
      airQuality.value = cached.airQuality
      updatedAt.value = cached.updatedAt
      errorMessage.value = cached.errorMessage

      return
    }

    isLoading.value = true
    errorMessage.value = ''
    forecastErrorMessage.value = ''
    airQualityErrorMessage.value = ''

    const commonParams = {
      latitude: numericLatitude,
      longitude: numericLongitude,
      timezone: 'auto',
    }

    const [forecastResult, airQualityResult] = await Promise.allSettled([
      axios.get(FORECAST_API_URL, {
        params: {
          ...commonParams,
          hourly: 'temperature_2m,relative_humidity_2m,precipitation,weather_code,is_day',
          daily: 'temperature_2m_max,temperature_2m_min,sunrise,sunset',
          forecast_days: 2,
          forecast_hours: 24,
        },
      }),
      axios.get(AIR_QUALITY_API_URL, {
        params: {
          ...commonParams,
          current: 'pm10,pm2_5',
        },
      }),
    ])

    if (currentRequestId !== requestId) {
      return
    }

    forecast.value =
      forecastResult.status === 'fulfilled'
        ? normalizeForecast(forecastResult.value.data)
        : createEmptyForecast()

    airQuality.value =
      airQualityResult.status === 'fulfilled'
        ? normalizeAirQuality(airQualityResult.value.data)
        : createEmptyAirQuality()

    const failedSections = []

    if (forecastResult.status === 'rejected') {
      failedSections.push('시간별 예보')
      forecastErrorMessage.value = '시간별 예보를 불러오지 못했습니다.'
    }

    if (airQualityResult.status === 'rejected') {
      failedSections.push('대기질')
      airQualityErrorMessage.value = '대기질 정보를 불러오지 못했습니다.'
    }

    errorMessage.value = failedSections.length
      ? `${failedSections.join('·')} 정보를 불러오지 못했습니다.`
      : ''
    updatedAt.value = new Date()
    isLoading.value = false

    if (failedSections.length === 0) {
      responseCache.set(cacheKey, {
        forecast: forecast.value,
        airQuality: airQuality.value,
        errorMessage: errorMessage.value,
        updatedAt: updatedAt.value,
        savedAt: Date.now(),
      })
    }
  }

  return {
    forecast,
    airQuality,
    isLoading,
    errorMessage,
    forecastErrorMessage,
    airQualityErrorMessage,
    updatedAt,
    fetchWeatherSupplement,
  }
}
