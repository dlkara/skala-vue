import axios from 'axios'

import { computed, ref } from 'vue'

import { defineStore } from 'pinia'

import { withObjectParticle, withTopicParticle } from '@/utils/formatKoreanParticle'
import { getChosung } from '@/utils/getChosung'
import { getWeatherRegion, WEATHER_REGION_LABELS } from '@/utils/getWeatherRegion'

// ========================================
// OpenWeather 설정
// ========================================

const OPEN_WEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY

const CURRENT_WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather'

const NOMINATIM_API_URL = (
  import.meta.env.VITE_NOMINATIM_API_URL || 'https://nominatim.openstreetmap.org'
).replace(/\/$/, '')

const KOREAN_LEGAL_SI_DATA_URL =
  import.meta.env.VITE_KOREAN_LEGAL_SI_DATA_URL || 'https://kr-legal-dong.github.io/data/si.json'

const KOREAN_LEGAL_GU_DATA_URL =
  import.meta.env.VITE_KOREAN_LEGAL_GU_DATA_URL || 'https://kr-legal-dong.github.io/data/gu.json'

const KOREAN_LEGAL_DONG_DATA_URL =
  import.meta.env.VITE_KOREAN_LEGAL_DONG_DATA_URL ||
  'https://kr-legal-dong.github.io/data/dong.json'

const LOCATION_SEARCH_RESULT_LIMIT = 5

const CURRENT_LOCATION_LOADING_MIN_DURATION = 500

// ========================================
// Local Storage 키
// ========================================

const ADDED_LOCATIONS_STORAGE_KEY = 'weather-dashboard-added-locations'

const FAVORITE_IDS_STORAGE_KEY = 'weather-dashboard-favorite-ids'

const REVERSE_GEOCODING_CACHE_STORAGE_KEY = 'weather-dashboard-reverse-geocoding-cache'

const LOCATION_SEARCH_CACHE_STORAGE_KEY = 'weather-dashboard-location-search-cache'

const LOCATION_SEARCH_CACHE_TTL = 1000 * 60 * 60 * 24 * 30

const LOCATION_SEARCH_CACHE_VERSION = 3

let koreanAdministrativeAreaListPromise = null

// ========================================
// 현재 위치 대체 데이터
// ========================================

const CURRENT_LOCATION_ID = 'current-location'

/**
 * 브라우저 위치를 가져오지 못해도 홈이 비어 있지 않도록 사용하는 대체 위치입니다.
 * 실제 현재 위치인 것처럼 보이지 않도록 `isFallbackLocation`을 함께 보관합니다.
 */
const FALLBACK_CURRENT_LOCATION = {
  id: CURRENT_LOCATION_ID,
  name: '서울특별시',
  apiName: '서울특별시',
  state: '서울특별시',
  countryCode: 'KR',
  legalCode: '1100000000',
  administrativeLevel: 'si',
  administrativeLevelLabel: '시·도',
  administrativeRank: 1,
  regionCode: 'capital',
  region: '수도권',
  coord: {
    lat: 37.5665,
    lon: 126.978,
  },
  isCurrentLocation: true,
  isFallbackLocation: true,
  addedByUser: false,
}

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

const normalizeLocationName = (value) => {
  return value?.trim().toLowerCase().replaceAll(' ', '') || ''
}

/**
 * 시·도, 시·군·구, 읍·면·동 목록을 함께 불러와
 * 검색 결과의 행정구역 단계를 구분합니다.
 */
const getKoreanAdministrativeAreaList = async () => {
  if (!koreanAdministrativeAreaListPromise) {
    const dataSources = [
      {
        url: KOREAN_LEGAL_SI_DATA_URL,
        administrativeLevel: 'si',
        administrativeLevelLabel: '시·도',
        administrativeRank: 1,
      },
      {
        url: KOREAN_LEGAL_GU_DATA_URL,
        administrativeLevel: 'gu',
        administrativeLevelLabel: '시·군·구',
        administrativeRank: 2,
      },
      {
        url: KOREAN_LEGAL_DONG_DATA_URL,
        administrativeLevel: 'dong',
        administrativeLevelLabel: '읍·면·동',
        administrativeRank: 3,
      },
    ]

    koreanAdministrativeAreaListPromise = Promise.all(
      dataSources.map(async (source) => {
        const response = await axios.get(source.url, {
          timeout: 8000,
        })
        const locations = Array.isArray(response.data) ? response.data : []

        return locations.map((location) => ({
          ...location,
          fullName: location.fullName || location.name,
          administrativeLevel: source.administrativeLevel,
          administrativeLevelLabel: source.administrativeLevelLabel,
          administrativeRank: source.administrativeRank,
        }))
      }),
    )
      .then((locationGroups) => locationGroups.flat())
      .catch((error) => {
        koreanAdministrativeAreaListPromise = null

        throw error
      })
  }

  return koreanAdministrativeAreaListPromise
}

const findMatchingLegalLocations = async (query) => {
  const normalizedQuery = normalizeLocationName(query)
  const isChosungQuery = /^[ㄱ-ㅎ]+$/.test(normalizedQuery)
  const administrativeAreaList = await getKoreanAdministrativeAreaList()

  return administrativeAreaList
    .filter((location) => {
      const normalizedName = normalizeLocationName(location.name)
      const normalizedFullName = normalizeLocationName(location.fullName)
      const normalizedNameChosung = normalizeLocationName(getChosung(location.name || ''))
      const normalizedFullNameChosung = normalizeLocationName(getChosung(location.fullName || ''))

      return (
        location.active &&
        (isChosungQuery
          ? normalizedNameChosung.includes(normalizedQuery) ||
            normalizedFullNameChosung.includes(normalizedQuery)
          : normalizedName.includes(normalizedQuery) || normalizedFullName.includes(normalizedQuery))
      )
    })
    .sort((firstLocation, secondLocation) => {
      if (firstLocation.administrativeRank !== secondLocation.administrativeRank) {
        return firstLocation.administrativeRank - secondLocation.administrativeRank
      }

      const firstName = normalizeLocationName(firstLocation.name)
      const secondName = normalizeLocationName(secondLocation.name)
      const firstExactScore = firstName === normalizedQuery ? 0 : 1
      const secondExactScore = secondName === normalizedQuery ? 0 : 1

      if (firstExactScore !== secondExactScore) {
        return firstExactScore - secondExactScore
      }

      const firstPrefixScore = firstName.startsWith(normalizedQuery) ? 0 : 1
      const secondPrefixScore = secondName.startsWith(normalizedQuery) ? 0 : 1

      if (firstPrefixScore !== secondPrefixScore) {
        return firstPrefixScore - secondPrefixScore
      }

      const nameComparison = firstName.localeCompare(secondName, 'ko')

      if (nameComparison !== 0) {
        return nameComparison
      }

      return firstLocation.fullName.localeCompare(secondLocation.fullName, 'ko')
    })
    .map((location, legalSearchOrder) => ({
      ...location,
      legalSearchOrder,
    }))
}

/**
 * `발산동`처럼 앞에 다른 글자가 붙을 수 있는 동 이름은
 * Nominatim에서 `발산`으로도 조회해 부분 일치 후보를 넓힙니다.
 */
const createBroadLocationQuery = (query) => {
  const normalizedQuery = query.trim()

  if (/^[가-힣]{2,}동$/.test(normalizedQuery)) {
    return normalizedQuery.slice(0, -1)
  }

  return normalizedQuery
}

const getNominatimLocationName = (location) => {
  return (
    location.namedetails?.['name:ko'] ||
    location.namedetails?.name ||
    location.name ||
    location.display_name?.split(',')[0]?.trim() ||
    '이름 없는 지역'
  )
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

  const detectedWeatherRegion = getWeatherRegion({
    countryCode,
    state,
    name: location.name || apiData.name,
    apiName: location.apiName || apiData.name,
  })

  const hasResolvedStoredRegion =
    Boolean(WEATHER_REGION_LABELS[location.regionCode]) &&
    location.regionCode !== 'all' &&
    location.regionCode !== 'domesticOther'

  const weatherRegion = hasResolvedStoredRegion
    ? {
        code: location.regionCode,
        label: WEATHER_REGION_LABELS[location.regionCode],
      }
    : detectedWeatherRegion

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

    regionCode: weatherRegion.code,

    region: weatherRegion.label,

    administrativeLevel: location.administrativeLevel || '',

    administrativeLevelLabel: location.administrativeLevelLabel || '',

    administrativeRank: location.administrativeRank ?? 99,

    legalCode: location.legalCode || '',

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

    isCurrentLocation: Boolean(location.isCurrentLocation),

    isFallbackLocation: Boolean(location.isFallbackLocation),
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
   * 현재 위치는 저장 도시와 분리해 항상 첫 번째 카드로 유지합니다.
   * 초기값은 권한 거부·미지원 환경에서 사용할 서울 대체 위치입니다.
   */
  const currentLocation = ref({
    ...FALLBACK_CURRENT_LOCATION,
    coord: { ...FALLBACK_CURRENT_LOCATION.coord },
  })

  const currentLocationStatus = ref('fallback')

  const currentLocationMessage = ref(
    '위치 권한을 허용하면 현재 지역을 표시합니다. 지금은 서울특별시 날씨를 대신 보여드립니다.',
  )

  const isLocatingCurrentPosition = ref(false)

  /**
   * 사용자가 API 검색 후 추가한 위치 목록입니다.
   *
   * 날씨 값은 저장하지 않고
   * 이름과 좌표 등의 위치 정보만 저장합니다.
   */
  const addedLocations = ref(readStorage(ADDED_LOCATIONS_STORAGE_KEY, []))

  /**
   * 즐겨찾기 도시 ID 목록입니다.
   */
  const favoriteIds = ref(readStorage(FAVORITE_IDS_STORAGE_KEY, []))

  /**
   * 같은 좌표를 Nominatim에 반복 요청하지 않도록 저장하는 역지오코딩 캐시입니다.
   */
  const reverseGeocodingCache = ref(readStorage(REVERSE_GEOCODING_CACHE_STORAGE_KEY, {}))

  /**
   * 동일한 국내 검색어로 Nominatim을 반복 호출하지 않도록 저장하는 검색 캐시입니다.
   */
  const locationSearchCache = ref(readStorage(LOCATION_SEARCH_CACHE_STORAGE_KEY, {}))

  /**
   * 국내 지역 API 검색 결과입니다.
   */
  const searchResults = ref([])

  const isLoading = ref(false)

  const isSearching = ref(false)

  const errorMessage = ref('')

  const searchErrorMessage = ref('')

  const lastUpdatedAt = ref(null)

  /**
   * 현재 대시보드 구성을 한 번이라도 정상적으로 불러왔는지 나타냅니다.
   * 페이지를 이동할 때 같은 날씨 요청이 반복되는 것을 방지합니다.
   */
  const hasFetched = ref(false)

  // ==================================
  // 계산 속성
  // ==================================

  const favoriteWeatherList = computed(() => {
    return weatherList.value.filter((city) => {
      return city.favorite && city.countryCode?.trim().toUpperCase() === 'KR'
    })
  })

  const favoriteCount = computed(() => {
    return favoriteWeatherList.value.length
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

  const persistFavorites = () => {
    writeStorage(FAVORITE_IDS_STORAGE_KEY, favoriteIds.value)
  }

  const persistReverseGeocodingCache = () => {
    writeStorage(REVERSE_GEOCODING_CACHE_STORAGE_KEY, reverseGeocodingCache.value)
  }

  const persistLocationSearchCache = () => {
    writeStorage(LOCATION_SEARCH_CACHE_STORAGE_KEY, locationSearchCache.value)
  }

  const preloadKoreanAdministrativeAreaList = () => {
    getKoreanAdministrativeAreaList().catch((error) => {
      console.warn('국내 행정구역 목록 미리 불러오기 실패:', error)
    })
  }

  // ==================================
  // 국내 권역 보완
  // ==================================

  let lastNominatimRequestAt = 0
  let nominatimRequestQueue = Promise.resolve()

  const createReverseGeocodingCacheKey = (location) => {
    return `${Number(location.coord?.lat).toFixed(4)},${Number(location.coord?.lon).toFixed(4)}`
  }

  /**
   * 공개 Nominatim 정책의 초당 1회 제한을 지키기 위해 요청을 순서대로 실행합니다.
   */
  const requestNominatim = (path, params) => {
    const queuedRequest = nominatimRequestQueue.then(async () => {
      const elapsedTime = Date.now() - lastNominatimRequestAt
      const waitTime = Math.max(0, 1100 - elapsedTime)

      if (waitTime > 0) {
        await new Promise((resolve) => {
          window.setTimeout(resolve, waitTime)
        })
      }

      lastNominatimRequestAt = Date.now()

      return axios.get(`${NOMINATIM_API_URL}/${path}`, {
        params,
        timeout: 8000,
      })
    })

    nominatimRequestQueue = queuedRequest.catch(() => undefined)

    return queuedRequest
  }

  const requestReverseGeocoding = (location, zoom = 5) => {
    return requestNominatim('reverse', {
      format: 'jsonv2',
      lat: location.coord.lat,
      lon: location.coord.lon,
      zoom,
      addressdetails: 1,
      layer: 'address',
      'accept-language': 'ko',
    })
  }

  const searchNominatimLocations = async (query, limit = 20) => {
    const response = await requestNominatim('search', {
      format: 'jsonv2',
      q: query,
      countrycodes: 'kr',
      layer: 'address',
      addressdetails: 1,
      namedetails: 1,
      limit,
      'accept-language': 'ko',
    })

    return Array.isArray(response.data) ? response.data : []
  }

  const getNominatimAdministrativeMeta = (location) => {
    const placeRank = Number(location.place_rank)

    if (Number.isFinite(placeRank) && placeRank <= 9) {
      return {
        administrativeLevel: 'si',
        administrativeLevelLabel: '시·도',
        administrativeRank: 1,
      }
    }

    if (Number.isFinite(placeRank) && placeRank <= 16) {
      return {
        administrativeLevel: 'gu',
        administrativeLevelLabel: '시·군·구',
        administrativeRank: 2,
      }
    }

    return {
      administrativeLevel: 'dong',
      administrativeLevelLabel: '읍·면·동',
      administrativeRank: 3,
    }
  }

  const getLegalLocationState = (legalLocation) => {
    const statePartsByLevel = {
      si: [legalLocation?.name],
      gu: [legalLocation?.siName],
      dong: [legalLocation?.siName, legalLocation?.guName],
    }

    return [
      ...new Set((statePartsByLevel[legalLocation?.administrativeLevel] || []).filter(Boolean)),
    ]
      .join(' ')
      .trim()
  }

  const createDomesticLocationCandidate = (nominatimLocation, legalLocation = null) => {
    const latitude = Number(nominatimLocation?.lat)
    const longitude = Number(nominatimLocation?.lon)

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return null
    }

    const address = nominatimLocation.address || {}
    const countryCode = address.country_code?.toUpperCase() || 'KR'

    if (countryCode !== 'KR') {
      return null
    }

    const name = legalLocation?.name || getNominatimLocationName(nominatimLocation)
    const state = legalLocation
      ? getLegalLocationState(legalLocation)
      : [
          ...new Set(
            [
              address.state || address.province || address.city,
              address.borough || address.county,
            ].filter(Boolean),
          ),
        ].join(' ')
    const administrativeMeta = legalLocation || getNominatimAdministrativeMeta(nominatimLocation)
    const region = getWeatherRegion({
      countryCode,
      state,
      name,
      apiName: nominatimLocation.name,
    })

    return {
      id: createLocationId(countryCode, latitude, longitude),
      name,
      apiName: nominatimLocation.name || name,
      state,
      administrativeArea: createAdministrativeArea(state, countryCode),
      countryCode,
      regionCode: region.code,
      region: region.label,
      administrativeLevel: administrativeMeta.administrativeLevel,
      administrativeLevelLabel: administrativeMeta.administrativeLevelLabel,
      administrativeRank: administrativeMeta.administrativeRank,
      legalCode: legalLocation?.code || '',
      legalSearchOrder: legalLocation?.legalSearchOrder ?? Number.MAX_SAFE_INTEGER,
      searchImportance: Number(nominatimLocation.importance) || 0,
      coord: {
        lat: latitude,
        lon: longitude,
      },
      addedByUser: true,
    }
  }

  const createLegalLocationSearchCandidate = (legalLocation) => {
    const state = getLegalLocationState(legalLocation)
    const countryCode = 'KR'
    const region = getWeatherRegion({
      countryCode,
      state,
      name: legalLocation.name,
    })
    const isAdded = weatherList.value.some((weatherCity) => {
      return (
        !weatherCity.isCurrentLocation &&
        (weatherCity.legalCode === legalLocation.code ||
          (weatherCity.name === legalLocation.name && weatherCity.state === state))
      )
    })

    return {
      id: `KR-LEGAL-${legalLocation.code}`,
      code: legalLocation.code,
      legalCode: legalLocation.code,
      name: legalLocation.name,
      apiName: legalLocation.name,
      fullName: legalLocation.fullName,
      siName: legalLocation.siName,
      guName: legalLocation.guName,
      state,
      administrativeArea: createAdministrativeArea(state, countryCode),
      countryCode,
      regionCode: region.code,
      region: region.label,
      administrativeLevel: legalLocation.administrativeLevel,
      administrativeLevelLabel: legalLocation.administrativeLevelLabel,
      administrativeRank: legalLocation.administrativeRank,
      legalSearchOrder: legalLocation.legalSearchOrder,
      coord: null,
      requiresGeocoding: true,
      isAdded,
      addedByUser: true,
    }
  }

  const resolveSearchCandidateWeather = async (candidate) => {
    if (!candidate.requiresGeocoding) {
      return candidate
    }

    const exactResults = await searchNominatimLocations(candidate.fullName, 5)
    const exactLocation = exactResults.find((location) => {
      return (
        isDongOrHigherNominatimLocation(location) &&
        Boolean(findLegalMatchForNominatim(location, [candidate]))
      )
    })
    const resolvedLocation = createDomesticLocationCandidate(exactLocation, candidate)

    if (!resolvedLocation) {
      return null
    }

    return fetchWeatherByLocation(resolvedLocation)
  }

  const isDongOrHigherNominatimLocation = (location) => {
    const placeRank = Number(location.place_rank)
    const isAdministrativePlace = ['boundary', 'place'].includes(location.category)

    /**
     * Nominatim 기준 20보다 세부적인 주거지, 건물, 학교,
     * 도로와 POI는 날씨 대시보드의 지역 후보에서 제외합니다.
     */
    return isAdministrativePlace && Number.isFinite(placeRank) && placeRank <= 20
  }

  const findNominatimPartialMatches = (locations, query) => {
    const normalizedQuery = normalizeLocationName(query)

    return locations.filter((location) => {
      if (!isDongOrHigherNominatimLocation(location)) {
        return false
      }

      const searchableNames = [
        getNominatimLocationName(location),
        location.display_name,
        ...Object.values(location.namedetails || {}),
      ]

      return searchableNames.some((name) => {
        return normalizeLocationName(String(name)).includes(normalizedQuery)
      })
    })
  }

  const findLegalMatchForNominatim = (location, legalLocations) => {
    const normalizedLocationName = normalizeLocationName(getNominatimLocationName(location))
    const normalizedDisplayName = normalizeLocationName(location.display_name)

    const exactNameMatches = legalLocations.filter((legalLocation) => {
      const normalizedName = normalizeLocationName(legalLocation.name)
      const lastNamePart = legalLocation.name?.trim().split(/\s+/).at(-1)

      return (
        normalizedLocationName === normalizedName ||
        normalizedLocationName === normalizeLocationName(lastNamePart)
      )
    })

    const fullPathMatch = exactNameMatches.find((legalLocation) => {
      const fullNameParts = legalLocation.fullName
        .trim()
        .split(/\s+/)
        .map((namePart) => normalizeLocationName(namePart))

      return fullNameParts.every((namePart) => normalizedDisplayName.includes(namePart))
    })

    return fullPathMatch || exactNameMatches[0] || null
  }

  const sortDomesticLocationCandidates = (firstLocation, secondLocation) => {
    if (firstLocation.administrativeRank !== secondLocation.administrativeRank) {
      return firstLocation.administrativeRank - secondLocation.administrativeRank
    }

    if (firstLocation.legalSearchOrder !== secondLocation.legalSearchOrder) {
      return firstLocation.legalSearchOrder - secondLocation.legalSearchOrder
    }

    if (firstLocation.searchImportance !== secondLocation.searchImportance) {
      return secondLocation.searchImportance - firstLocation.searchImportance
    }

    return firstLocation.name.localeCompare(secondLocation.name, 'ko')
  }

  const deduplicateDomesticLocationCandidates = (locations) => {
    const uniqueLocationMap = new Map()

    locations.forEach((location) => {
      const key = location.legalCode || location.id

      if (!uniqueLocationMap.has(key)) {
        uniqueLocationMap.set(key, location)
      }
    })

    return Array.from(uniqueLocationMap.values())
  }

  /**
   * Nominatim을 한 번 조회한 결과에 국내 행정구역 정보를 결합합니다.
   * 부분 일치 후보가 누락된 경우에만 최상위 법정동 후보를 한 번 더 정확히 조회합니다.
   */
  const resolveDomesticLocations = async (query) => {
    const cacheKey = normalizeLocationName(query)
    const cachedSearch = locationSearchCache.value[cacheKey]

    if (
      Array.isArray(cachedSearch?.locations) &&
      cachedSearch.version === LOCATION_SEARCH_CACHE_VERSION &&
      Date.now() - Number(cachedSearch.cachedAt) < LOCATION_SEARCH_CACHE_TTL
    ) {
      return cachedSearch.locations
    }

    let matchingLegalLocations = []
    const broadQuery = createBroadLocationQuery(query)

    /**
     * 큰 동 목록을 내려받는 시간과 Nominatim 응답 시간을 겹쳐
     * 최초 검색 대기 시간을 줄입니다.
     */
    const [legalLocationResult, directResults] = await Promise.all([
      findMatchingLegalLocations(query).catch((error) => {
        console.warn('국내 행정구역 목록 조회 실패:', error)

        return []
      }),
      searchNominatimLocations(broadQuery, 15),
    ])

    matchingLegalLocations = legalLocationResult
    const directCandidates = findNominatimPartialMatches(directResults, query)
      .map((location) => {
        const legalMatch = findLegalMatchForNominatim(location, matchingLegalLocations)

        return createDomesticLocationCandidate(location, legalMatch)
      })
      .filter(Boolean)

    const firstLegalMatch = matchingLegalLocations[0]
    const hasFirstLegalMatch = directCandidates.some((location) => {
      return firstLegalMatch && location.legalCode === firstLegalMatch.code
    })

    if (firstLegalMatch && !hasFirstLegalMatch) {
      const exactResults = await searchNominatimLocations(firstLegalMatch.fullName, 1)
      const exactCandidate = createDomesticLocationCandidate(exactResults[0], firstLegalMatch)

      if (exactCandidate) {
        directCandidates.push(exactCandidate)
      }
    }

    const resolvedLocations = deduplicateDomesticLocationCandidates(directCandidates)
      .sort(sortDomesticLocationCandidates)
      .slice(0, LOCATION_SEARCH_RESULT_LIMIT)

    locationSearchCache.value[cacheKey] = {
      version: LOCATION_SEARCH_CACHE_VERSION,
      cachedAt: Date.now(),
      locations: resolvedLocations,
    }
    persistLocationSearchCache()

    return resolvedLocations
  }

  /**
   * OpenWeather에 광역 행정구역이 없을 때만 OSM 역지오코딩으로 권역을 보완합니다.
   */
  const enrichLocationRegion = async (location) => {
    const hasResolvedStoredRegion =
      Boolean(WEATHER_REGION_LABELS[location.regionCode]) &&
      location.regionCode !== 'all' &&
      location.regionCode !== 'domesticOther'

    if (hasResolvedStoredRegion) {
      return {
        ...location,
        region: WEATHER_REGION_LABELS[location.regionCode],
      }
    }

    const detectedRegion = getWeatherRegion(location)

    if (detectedRegion.code !== 'domesticOther') {
      return {
        ...location,
        regionCode: detectedRegion.code,
        region: detectedRegion.label,
      }
    }

    const latitude = Number(location.coord?.lat)
    const longitude = Number(location.coord?.lon)

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return location
    }

    const cacheKey = createReverseGeocodingCacheKey(location)
    const cachedLocation = reverseGeocodingCache.value[cacheKey]

    if (cachedLocation) {
      return {
        ...location,
        ...cachedLocation,
      }
    }

    try {
      const response = await requestReverseGeocoding(location)
      const address = response.data?.address || {}
      const countryCode = address.country_code?.toUpperCase() || location.countryCode
      const state = address.state || address.province || address.region || location.state || ''
      const administrativeText = [state, address.city, address.county, response.data?.display_name]
        .filter(Boolean)
        .join(' ')
      const resolvedRegion = getWeatherRegion({
        ...location,
        countryCode,
        state: administrativeText,
      })
      const enrichedLocation = {
        state,
        countryCode,
        regionCode: resolvedRegion.code,
        region: resolvedRegion.label,
      }

      reverseGeocodingCache.value[cacheKey] = enrichedLocation
      persistReverseGeocodingCache()

      return {
        ...location,
        ...enrichedLocation,
      }
    } catch (error) {
      console.warn('국내 권역 역지오코딩 실패:', error)

      return location
    }
  }

  const enrichLocationRegions = async (locations) => {
    const enrichedLocations = []

    for (const location of locations) {
      enrichedLocations.push(await enrichLocationRegion(location))
    }

    return enrichedLocations
  }

  /**
   * 기존 Local Storage 지역도 역지오코딩 결과가 한 번 적용되면 계속 재사용합니다.
   */
  const persistEnrichedAddedLocations = (enrichedLocations) => {
    const enrichedLocationMap = new Map(
      enrichedLocations.map((location) => [location.id, location]),
    )
    let hasChanges = false

    addedLocations.value = addedLocations.value.map((location) => {
      const enrichedLocation = enrichedLocationMap.get(location.id)

      if (!enrichedLocation) {
        return location
      }

      const hasChanged =
        location.state !== enrichedLocation.state ||
        location.countryCode !== enrichedLocation.countryCode ||
        location.regionCode !== enrichedLocation.regionCode ||
        location.region !== enrichedLocation.region

      if (!hasChanged) {
        return location
      }

      hasChanges = true

      return {
        ...location,
        state: enrichedLocation.state,
        countryCode: enrichedLocation.countryCode,
        regionCode: enrichedLocation.regionCode,
        region: enrichedLocation.region,
      }
    })

    if (hasChanges) {
      persistAddedLocations()
    }
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

  const replaceCurrentLocationWeather = (weather) => {
    weatherList.value = [
      weather,
      ...weatherList.value.filter((city) => !city.isCurrentLocation),
    ]
    currentLocation.value = {
      ...currentLocation.value,
      ...weather,
      coord: { ...weather.coord },
    }
    lastUpdatedAt.value = new Date()
    hasFetched.value = true
  }

  const useFallbackCurrentLocation = async (message) => {
    currentLocation.value = {
      ...FALLBACK_CURRENT_LOCATION,
      coord: { ...FALLBACK_CURRENT_LOCATION.coord },
    }
    currentLocationStatus.value = 'fallback'
    currentLocationMessage.value = message

    const displayedFallback = weatherList.value.find((city) => {
      return city.isCurrentLocation && city.isFallbackLocation
    })

    if (displayedFallback || !OPEN_WEATHER_API_KEY) {
      return displayedFallback || null
    }

    try {
      const fallbackWeather = await fetchWeatherByLocation(currentLocation.value)
      replaceCurrentLocationWeather(fallbackWeather)

      return fallbackWeather
    } catch (error) {
      console.error('현재 위치 대체 날씨 조회 실패:', error)

      return null
    }
  }

  const getBrowserPosition = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('GEOLOCATION_UNSUPPORTED'))

        return
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 1000 * 60 * 10,
      })
    })
  }

  const createCurrentLocationFromPosition = async (position) => {
    const latitude = Number(position.coords.latitude)
    const longitude = Number(position.coords.longitude)
    const coordinateLocation = {
      id: CURRENT_LOCATION_ID,
      name: '현재 위치',
      apiName: '현재 위치',
      state: '',
      countryCode: '',
      regionCode: '',
      region: '',
      coord: {
        lat: latitude,
        lon: longitude,
      },
      isCurrentLocation: true,
      isFallbackLocation: false,
      addedByUser: false,
    }

    try {
      const response = await requestReverseGeocoding(coordinateLocation, 18)
      const address = response.data?.address || {}
      const name =
        address.suburb ||
        address.quarter ||
        address.neighbourhood ||
        address.city_district ||
        address.borough ||
        address.town ||
        address.village ||
        address.city ||
        address.county ||
        address.state ||
        '현재 위치'
      const state = [
        address.state || address.province,
        address.city || address.county || address.borough,
      ]
        .filter((value, index, values) => value && value !== name && values.indexOf(value) === index)
        .join(' ')
      const countryCode = address.country_code?.toUpperCase() || ''
      const weatherRegion = getWeatherRegion({
        countryCode,
        state,
        name,
      })

      return {
        ...coordinateLocation,
        name,
        apiName: name,
        state,
        countryCode,
        regionCode: weatherRegion.code,
        region: weatherRegion.label,
      }
    } catch (error) {
      console.warn('현재 위치 이름 확인 실패:', error)

      return coordinateLocation
    }
  }

  /**
   * 브라우저 권한을 통해 현재 좌표를 가져와 고정 카드의 날씨를 갱신합니다.
   * 권한 거부, 시간 초과, 미지원 환경에서는 서울 대체 위치를 명시적으로 표시합니다.
   */
  const refreshCurrentLocation = async () => {
    if (isLocatingCurrentPosition.value) {
      return
    }

    const locatingStartedAt = Date.now()

    isLocatingCurrentPosition.value = true
    currentLocationStatus.value = 'loading'
    currentLocationMessage.value = '브라우저에서 현재 위치를 확인하고 있습니다.'

    try {
      const position = await getBrowserPosition()
      const resolvedLocation = await createCurrentLocationFromPosition(position)

      currentLocation.value = resolvedLocation

      const currentWeather = await fetchWeatherByLocation(resolvedLocation)
      replaceCurrentLocationWeather(currentWeather)

      currentLocationStatus.value = 'ready'
      currentLocationMessage.value = ''

      return currentWeather
    } catch (error) {
      const fallbackMessage =
        error?.code === 1
          ? '위치 권한이 허용되지 않아 서울특별시 날씨를 대신 보여드립니다.'
          : error?.code === 3
            ? '현재 위치 확인 시간이 초과되어 서울특별시 날씨를 대신 보여드립니다.'
            : '현재 위치를 확인할 수 없어 서울특별시 날씨를 대신 보여드립니다.'

      return useFallbackCurrentLocation(fallbackMessage)
    } finally {
      const remainingLoadingTime = Math.max(
        0,
        CURRENT_LOCATION_LOADING_MIN_DURATION - (Date.now() - locatingStartedAt),
      )

      if (remainingLoadingTime > 0) {
        await new Promise((resolve) => {
          window.setTimeout(resolve, remainingLoadingTime)
        })
      }

      isLocatingCurrentPosition.value = false
    }
  }

  /**
   * 현재 대시보드에 표시할 모든 위치를 반환합니다.
   */
  const getVisibleLocations = () => {
    const visibleAddedLocations = addedLocations.value.filter((location) => {
      return location.countryCode?.trim().toUpperCase() === 'KR'
    })

    const locationMap = new Map()
    const locationIdentitySet = new Set()

    visibleAddedLocations.forEach((location) => {
      const identity = location.legalCode ? `legal-${location.legalCode}` : `id-${location.id}`

      if (locationIdentitySet.has(identity)) {
        return
      }

      locationIdentitySet.add(identity)
      locationMap.set(location.id, location)
    })

    return [currentLocation.value, ...Array.from(locationMap.values())]
  }

  /**
   * 대시보드의 전체 날씨를 불러옵니다.
   */
  const fetchAllWeather = async ({ force = false } = {}) => {
    if (isLoading.value || (!force && hasFetched.value)) {
      return
    }

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
        hasFetched.value = true

        return
      }

      const enrichedLocations = await enrichLocationRegions(locations)

      persistEnrichedAddedLocations(enrichedLocations)

      const settledResults = await Promise.allSettled(
        enrichedLocations.map((location) => {
          return fetchWeatherByLocation(location)
        }),
      )

      const successfulWeather = settledResults
        .filter((result) => result.status === 'fulfilled')
        .map((result) => result.value)

      weatherList.value = successfulWeather

      lastUpdatedAt.value = new Date()

      hasFetched.value = successfulWeather.length > 0

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
    await fetchAllWeather({ force: true })
  }

  // ==================================
  // 국내 지역 검색
  // ==================================

  /**
   * 지역명을 API에서 검색합니다.
   *
   * 검색 결과만 가져오며,
   * 사용자가 추가 버튼을 누르기 전까지
   * 대시보드와 Local Storage는 변경하지 않습니다.
   */
  /**
   * 새 검색이 시작되거나 검색이 초기화될 때 증가합니다.
   * 비동기 응답은 자신이 가장 최근 요청인 경우에만
   * 화면 상태를 변경할 수 있습니다.
   */
  let latestSearchRequestId = 0

  const searchLocation = async (query) => {
    const requestId = ++latestSearchRequestId

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
       * 국내 행정구역 목록에서 부분 일치 후보를 찾습니다.
       * 좌표와 날씨는 실제 추가 버튼을 누를 때 한 곳만 조회합니다.
       */
      const matchingLegalLocations = await findMatchingLegalLocations(normalizedQuery)

      if (requestId !== latestSearchRequestId) {
        return []
      }

      if (matchingLegalLocations.length > 0) {
        const legalSearchResults = matchingLegalLocations
          .slice(0, LOCATION_SEARCH_RESULT_LIMIT)
          .map(createLegalLocationSearchCandidate)

        searchResults.value = legalSearchResults

        return legalSearchResults
      }

      /**
       * 법정 행정구역 목록에 없는 이름만
       * Nominatim 직접 검색으로 보완합니다.
       */
      const candidateLocations = await resolveDomesticLocations(normalizedQuery)

      if (requestId !== latestSearchRequestId) {
        return []
      }

      if (candidateLocations.length === 0) {
        searchErrorMessage.value = `'${normalizedQuery}'에 해당하는 국내 지역을 찾지 못했습니다.`

        return []
      }

      /**
       * 2단계:
       * 선택된 국내 좌표들의 현재 날씨를 병렬로 요청합니다.
       */
      const settledWeatherResults = await Promise.allSettled(
        candidateLocations.map((location) => fetchWeatherByLocation(location)),
      )

      if (requestId !== latestSearchRequestId) {
        return []
      }

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
            return !weatherCity.isCurrentLocation && weatherCity.id === city.id
          }),
        })
      })

      const deduplicatedResults = Array.from(uniqueWeatherMap.values()).slice(
        0,
        LOCATION_SEARCH_RESULT_LIMIT,
      )

      searchResults.value = deduplicatedResults

      if (deduplicatedResults.length === 0) {
        searchErrorMessage.value = '검색 후보의 날씨 정보를 불러오지 못했습니다.'
      }

      return deduplicatedResults
    } catch (error) {
      if (requestId !== latestSearchRequestId) {
        return []
      }

      console.error('국내 지역 검색 실패:', error)

      searchErrorMessage.value = getApiErrorMessage(error, '지역 검색 중 오류가 발생했습니다.')

      return []
    } finally {
      if (requestId === latestSearchRequestId) {
        isSearching.value = false
      }
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

    let resolvedCandidate = candidate

    try {
      resolvedCandidate = await resolveSearchCandidateWeather(candidate)
    } catch (error) {
      console.error('추가할 지역의 좌표 및 날씨 조회 실패:', error)

      return {
        success: false,
        message: getApiErrorMessage(error, `${candidate.name}의 날씨를 불러오지 못했습니다.`),
      }
    }

    if (!resolvedCandidate) {
      return {
        success: false,
        message: `${candidate.name}의 정확한 좌표를 찾지 못했습니다.`,
      }
    }

    const alreadyExists = weatherList.value.some((city) => {
      return (
        !city.isCurrentLocation &&
        (city.id === resolvedCandidate.id ||
          (resolvedCandidate.legalCode && city.legalCode === resolvedCandidate.legalCode))
      )
    })

    if (alreadyExists) {
      return {
        success: false,

        message: `${withTopicParticle(resolvedCandidate.name)} 이미 대시보드에 있습니다.`,
      }
    }

    const weatherRegion = getWeatherRegion(resolvedCandidate)

    /**
     * 새 지역은 날씨 값이 아니라 검색에 필요한 위치 정보만 저장합니다.
     * 검색 후보의 원래 좌표가 있다면 해당 좌표를 우선 저장합니다.
     */
    const storageCoordinate = resolvedCandidate.searchCoord || resolvedCandidate.coord

    const locationForStorage = {
      id: resolvedCandidate.id,

      name: resolvedCandidate.name,

      apiName: resolvedCandidate.apiName,

      state: resolvedCandidate.state || '',

      administrativeArea: createAdministrativeArea(
        resolvedCandidate.state,
        resolvedCandidate.countryCode,
      ),

      countryCode: resolvedCandidate.countryCode,

      legalCode: resolvedCandidate.legalCode || '',

      regionCode: weatherRegion.code,

      region: weatherRegion.label,

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

    const weatherToAdd = {
      ...resolvedCandidate,

      regionCode: weatherRegion.code,

      region: weatherRegion.label,

      administrativeArea: createAdministrativeArea(
        resolvedCandidate.state,
        resolvedCandidate.countryCode,
      ),

      addedByUser: true,

      favorite: favoriteIds.value.includes(resolvedCandidate.id),
    }

    weatherList.value.push(weatherToAdd)

    searchResults.value = searchResults.value.map((result) => {
      const isSameLocation =
        result.id === candidate.id ||
        (result.legalCode && result.legalCode === resolvedCandidate.legalCode)

      if (!isSameLocation) {
        return result
      }

      return {
        ...result,
        isAdded: true,
      }
    })

    return {
      success: true,

      locationId: weatherToAdd.id,

      message: `${withObjectParticle(weatherToAdd.name)} 대시보드에 추가했습니다.`,
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

    if (targetCity.isCurrentLocation) {
      return {
        success: false,
        message: '현재 위치 카드는 항상 표시되므로 삭제할 수 없습니다.',
      }
    }

    addedLocations.value = addedLocations.value.filter((location) => location.id !== cityId)

    persistAddedLocations()

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

      message: `${withObjectParticle(targetCity.name)} 대시보드에서 삭제했습니다.`,
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
    latestSearchRequestId += 1

    searchResults.value = []
    searchErrorMessage.value = ''
    isSearching.value = false
  }

  // ==================================
  // 도시 조회
  // ==================================

  const getWeatherById = (cityId) => {
    return weatherList.value.find((city) => city.id === cityId)
  }

  return {
    weatherList,
    currentLocation,
    currentLocationStatus,
    currentLocationMessage,
    isLocatingCurrentPosition,
    searchResults,

    isLoading,
    isSearching,

    errorMessage,
    searchErrorMessage,

    lastUpdatedAt,
    hasFetched,
    formattedLastUpdatedAt,

    favoriteWeatherList,
    favoriteCount,

    fetchAllWeather,
    refreshWeather,
    refreshCurrentLocation,
    preloadKoreanAdministrativeAreaList,

    searchLocation,
    addLocation,
    removeLocation,

    toggleFavorite,
    persistFavorites,

    clearSearchResults,
    getWeatherById,
  }
})
