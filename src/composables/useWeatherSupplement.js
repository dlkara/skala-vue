import { ref } from 'vue'

import axios from 'axios'

const FORECAST_API_URL = 'https://api.open-meteo.com/v1/forecast'

const AIR_QUALITY_API_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality'

const CACHE_DURATION = 30 * 60 * 1000

const STALE_CACHE_DURATION = 6 * 60 * 60 * 1000

const DEFAULT_RATE_LIMIT_COOLDOWN = 2 * 60 * 1000

const MAX_RATE_LIMIT_COOLDOWN = 60 * 60 * 1000

const CACHE_VERSION = 1

const FORECAST_CACHE_PREFIX = `weather-forecast-cache-v${CACHE_VERSION}`

const AIR_QUALITY_CACHE_PREFIX = `weather-air-quality-cache-v${CACHE_VERSION}`

const FORECAST_RATE_LIMIT_KEY = `weather-forecast-rate-limit-v${CACHE_VERSION}`

const AIR_QUALITY_RATE_LIMIT_KEY = `weather-air-quality-rate-limit-v${CACHE_VERSION}`

const forecastMemoryCache = new Map()

const airQualityMemoryCache = new Map()

const forecastRequestMap = new Map()

const airQualityRequestMap = new Map()

const rateLimitMemory = {
  forecast: 0,
  airQuality: 0,
}

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

const readSessionStorage = (key) => {
  try {
    const storedValue = sessionStorage.getItem(key)

    return storedValue ? JSON.parse(storedValue) : null
  } catch (error) {
    console.warn(`Session Storage 읽기 실패: ${key}`, error)

    return null
  }
}

const writeSessionStorage = (key, value) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn(`Session Storage 저장 실패: ${key}`, error)
  }
}

const getCacheStorageKey = (cachePrefix, coordinateKey) => {
  return `${cachePrefix}:${coordinateKey}`
}

const readCacheEntry = (memoryCache, cachePrefix, coordinateKey) => {
  const memoryEntry = memoryCache.get(coordinateKey)

  if (memoryEntry) {
    return memoryEntry
  }

  const storedEntry = readSessionStorage(getCacheStorageKey(cachePrefix, coordinateKey))

  if (!storedEntry?.savedAt || !storedEntry?.data) {
    return null
  }

  memoryCache.set(coordinateKey, storedEntry)

  return storedEntry
}

const writeCacheEntry = (memoryCache, cachePrefix, coordinateKey, data) => {
  const cacheEntry = {
    data,
    savedAt: Date.now(),
  }

  memoryCache.set(coordinateKey, cacheEntry)
  writeSessionStorage(getCacheStorageKey(cachePrefix, coordinateKey), cacheEntry)

  return cacheEntry
}

const getRateLimitStorageKey = (section) => {
  return section === 'forecast' ? FORECAST_RATE_LIMIT_KEY : AIR_QUALITY_RATE_LIMIT_KEY
}

const getRateLimitUntil = (section) => {
  const storedValue = Number(readSessionStorage(getRateLimitStorageKey(section))?.blockedUntil)
  const storedBlockedUntil = Number.isFinite(storedValue) ? storedValue : 0

  return Math.max(rateLimitMemory[section], storedBlockedUntil)
}

const getRetryDelay = (error) => {
  const retryAfter = error?.response?.headers?.['retry-after']

  if (!retryAfter) {
    return DEFAULT_RATE_LIMIT_COOLDOWN
  }

  const retryAfterSeconds = Number(retryAfter)

  if (Number.isFinite(retryAfterSeconds)) {
    return Math.min(retryAfterSeconds * 1000, MAX_RATE_LIMIT_COOLDOWN)
  }

  const retryAt = new Date(retryAfter).getTime()

  if (!Number.isFinite(retryAt)) {
    return DEFAULT_RATE_LIMIT_COOLDOWN
  }

  return Math.min(Math.max(retryAt - Date.now(), DEFAULT_RATE_LIMIT_COOLDOWN), MAX_RATE_LIMIT_COOLDOWN)
}

const setRateLimitCooldown = (section, error) => {
  const blockedUntil = Date.now() + getRetryDelay(error)

  rateLimitMemory[section] = blockedUntil
  writeSessionStorage(getRateLimitStorageKey(section), { blockedUntil })

  return blockedUntil
}

const createRateLimitError = (blockedUntil) => {
  const error = new Error('Open-Meteo 요청 제한 대기 중')

  error.code = 'OPEN_METEO_RATE_LIMITED'
  error.blockedUntil = blockedUntil

  return error
}

const isRateLimitError = (error) => {
  return error?.code === 'OPEN_METEO_RATE_LIMITED' || error?.response?.status === 429
}

const getRateLimitMinutes = (error) => {
  const remainingTime = Math.max(0, Number(error?.blockedUntil || 0) - Date.now())

  return Math.max(1, Math.ceil(remainingTime / (60 * 1000)))
}

const getSectionMessage = (section, error, isStale) => {
  const sectionLabel = section === 'forecast' ? '시간별 예보' : '대기질 정보'

  if (isRateLimitError(error)) {
    if (isStale) {
      return `요청이 많아 이전에 저장한 ${sectionLabel}를 표시합니다.`
    }

    return `요청이 많아 ${sectionLabel}를 불러오지 못했습니다. 약 ${getRateLimitMinutes(error)}분 후 다시 확인해 주세요.`
  }

  if (isStale) {
    return `최신 ${sectionLabel}를 가져오지 못해 이전 저장 데이터를 표시합니다.`
  }

  return `${sectionLabel}를 불러오지 못했습니다.`
}

const requestSectionData = async ({
  section,
  coordinateKey,
  memoryCache,
  cachePrefix,
  requestMap,
  request,
  normalize,
}) => {
  const cachedEntry = readCacheEntry(memoryCache, cachePrefix, coordinateKey)
  const cacheAge = cachedEntry ? Date.now() - Number(cachedEntry.savedAt) : Infinity

  if (cachedEntry && cacheAge < CACHE_DURATION) {
    return {
      data: cachedEntry.data,
      savedAt: cachedEntry.savedAt,
      warning: '',
    }
  }

  const rateLimitUntil = getRateLimitUntil(section)

  if (rateLimitUntil > Date.now()) {
    const rateLimitError = createRateLimitError(rateLimitUntil)

    if (cachedEntry && cacheAge < STALE_CACHE_DURATION) {
      return {
        data: cachedEntry.data,
        savedAt: cachedEntry.savedAt,
        warning: getSectionMessage(section, rateLimitError, true),
      }
    }

    throw rateLimitError
  }

  if (requestMap.has(coordinateKey)) {
    return requestMap.get(coordinateKey)
  }

  const pendingRequest = (async () => {
    try {
      const response = await request()
      const normalizedData = normalize(response.data)
      const savedEntry = writeCacheEntry(memoryCache, cachePrefix, coordinateKey, normalizedData)

      return {
        data: savedEntry.data,
        savedAt: savedEntry.savedAt,
        warning: '',
      }
    } catch (error) {
      let requestError = error

      if (error?.response?.status === 429) {
        requestError = createRateLimitError(setRateLimitCooldown(section, error))
      }

      if (cachedEntry && cacheAge < STALE_CACHE_DURATION) {
        return {
          data: cachedEntry.data,
          savedAt: cachedEntry.savedAt,
          warning: getSectionMessage(section, requestError, true),
        }
      }

      throw requestError
    } finally {
      requestMap.delete(coordinateKey)
    }
  })()

  requestMap.set(coordinateKey, pendingRequest)

  return pendingRequest
}

const requestForecast = (coordinateKey, commonParams) => {
  return requestSectionData({
    section: 'forecast',
    coordinateKey,
    memoryCache: forecastMemoryCache,
    cachePrefix: FORECAST_CACHE_PREFIX,
    requestMap: forecastRequestMap,
    request: () => {
      return axios.get(FORECAST_API_URL, {
        params: {
          ...commonParams,
          hourly: 'temperature_2m,relative_humidity_2m,precipitation,weather_code,is_day',
          daily: 'temperature_2m_max,temperature_2m_min,sunrise,sunset',
          forecast_days: 2,
          forecast_hours: 24,
        },
      })
    },
    normalize: normalizeForecast,
  })
}

const requestAirQuality = (coordinateKey, commonParams) => {
  return requestSectionData({
    section: 'airQuality',
    coordinateKey,
    memoryCache: airQualityMemoryCache,
    cachePrefix: AIR_QUALITY_CACHE_PREFIX,
    requestMap: airQualityRequestMap,
    request: () => {
      return axios.get(AIR_QUALITY_API_URL, {
        params: {
          ...commonParams,
          current: 'pm10,pm2_5',
        },
      })
    },
    normalize: normalizeAirQuality,
  })
}

/**
 * Open-Meteo의 일별·시간별 예보와 대기질 데이터를 조회합니다.
 * 두 API를 독립적으로 캐시해 한쪽이 실패해도 다른 데이터를 계속 표시합니다.
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
    const coordinateKey = `${numericLatitude.toFixed(4)}-${numericLongitude.toFixed(4)}`
    const commonParams = {
      latitude: numericLatitude,
      longitude: numericLongitude,
      timezone: 'auto',
    }

    isLoading.value = true
    errorMessage.value = ''
    forecastErrorMessage.value = ''
    airQualityErrorMessage.value = ''
    forecast.value = createEmptyForecast()
    airQuality.value = createEmptyAirQuality()

    try {
      const [forecastResult, airQualityResult] = await Promise.allSettled([
        requestForecast(coordinateKey, commonParams),
        requestAirQuality(coordinateKey, commonParams),
      ])

      if (currentRequestId !== requestId) {
        return
      }

      const failedSections = []
      let forecastUpdatedAt = null

      if (forecastResult.status === 'fulfilled') {
        forecast.value = forecastResult.value.data
        forecastErrorMessage.value = forecastResult.value.warning
        forecastUpdatedAt = forecastResult.value.savedAt
      } else {
        forecast.value = createEmptyForecast()
        forecastErrorMessage.value = getSectionMessage('forecast', forecastResult.reason, false)
        failedSections.push('시간별 예보')
      }

      if (airQualityResult.status === 'fulfilled') {
        airQuality.value = airQualityResult.value.data
        airQualityErrorMessage.value = airQualityResult.value.warning
      } else {
        airQuality.value = createEmptyAirQuality()
        airQualityErrorMessage.value = getSectionMessage(
          'airQuality',
          airQualityResult.reason,
          false,
        )
        failedSections.push('대기질')
      }

      errorMessage.value = failedSections.length
        ? `${failedSections.join('·')} 정보를 불러오지 못했습니다.`
        : ''

      updatedAt.value = forecastUpdatedAt ? new Date(forecastUpdatedAt) : null
    } finally {
      if (currentRequestId === requestId) {
        isLoading.value = false
      }
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
