<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import axios from 'axios'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import { Refresh } from '@element-plus/icons-vue'

import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'

import { KOREA_WEATHER_LOCATIONS } from '@/data/koreaWeatherLocations'

import { useConfigStore } from '@/stores/configStore'

import { getWeatherIconUrl } from '@/utils/getWeatherIconUrl'

const OPEN_WEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const CURRENT_WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather'
const NATIONAL_WEATHER_CACHE_KEY = 'weather-dashboard-national-map-v1'
const NATIONAL_WEATHER_CACHE_TTL = 1000 * 60 * 10

const configStore = useConfigStore()

const sectionElement = ref(null)
const mapElement = ref(null)
const nationalWeatherList = ref([])
const selectedCityId = ref('seoul')
const isLoading = ref(false)
const hasStarted = ref(false)
const errorMessage = ref('')
const noticeMessage = ref('')
const lastUpdatedAt = ref(null)

let map = null
let markerLayer = null
let intersectionObserver = null
let isDisposed = false

const selectedWeather = computed(() => {
  return (
    nationalWeatherList.value.find((city) => city.id === selectedCityId.value) ||
    nationalWeatherList.value[0] ||
    null
  )
})

const nationalLocationCount = computed(() => {
  return nationalWeatherList.value.length || KOREA_WEATHER_LOCATIONS.length
})

const formattedUpdatedAt = computed(() => {
  if (!lastUpdatedAt.value) {
    return ''
  }

  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(lastUpdatedAt.value)
})

const formatTemperature = (temperature) => {
  const celsiusTemperature = Number(temperature)

  if (!Number.isFinite(celsiusTemperature)) {
    return '-'
  }

  if (configStore.unit === 'fahrenheit') {
    return `${Math.round((celsiusTemperature * 9) / 5 + 32)}℉`
  }

  return `${Math.round(celsiusTemperature)}℃`
}

const escapeHtml = (value) => {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

const readCachedWeather = () => {
  try {
    const cachedValue = sessionStorage.getItem(NATIONAL_WEATHER_CACHE_KEY)

    if (!cachedValue) {
      return null
    }

    const cachedWeather = JSON.parse(cachedValue)

    if (
      !Array.isArray(cachedWeather.weatherList) ||
      Date.now() - Number(cachedWeather.cachedAt) >= NATIONAL_WEATHER_CACHE_TTL
    ) {
      return null
    }

    return cachedWeather
  } catch (error) {
    console.warn('전국 날씨 캐시 읽기 실패:', error)

    return null
  }
}

const cacheWeather = (weatherList, cachedAt) => {
  try {
    sessionStorage.setItem(
      NATIONAL_WEATHER_CACHE_KEY,
      JSON.stringify({
        weatherList,
        cachedAt,
      }),
    )
  } catch (error) {
    console.warn('전국 날씨 캐시 저장 실패:', error)
  }
}

const normalizeNationalWeather = (location, apiData) => {
  return {
    ...location,
    temperature: apiData.main?.temp,
    feelsLike: apiData.main?.feels_like,
    humidity: apiData.main?.humidity,
    windSpeed: apiData.wind?.speed,
    description: apiData.weather?.[0]?.description || '날씨 정보 없음',
    icon: apiData.weather?.[0]?.icon || '',
    observedAt: apiData.dt ?? null,
  }
}

const fetchNationalWeather = async ({ force = false } = {}) => {
  if (!force) {
    const cachedWeather = readCachedWeather()

    if (cachedWeather) {
      nationalWeatherList.value = cachedWeather.weatherList
      lastUpdatedAt.value = new Date(cachedWeather.cachedAt)

      return
    }
  }

  if (!OPEN_WEATHER_API_KEY) {
    errorMessage.value = '전국 날씨 지도를 불러오려면 OpenWeather API 키가 필요합니다.'

    return
  }

  isLoading.value = true
  errorMessage.value = ''
  noticeMessage.value = ''

  try {
    const settledResults = await Promise.allSettled(
      KOREA_WEATHER_LOCATIONS.map(async (location) => {
        const response = await axios.get(CURRENT_WEATHER_API_URL, {
          params: {
            lat: location.lat,
            lon: location.lon,
            appid: OPEN_WEATHER_API_KEY,
            units: 'metric',
            lang: 'kr',
          },
          timeout: 8000,
        })

        return normalizeNationalWeather(location, response.data)
      }),
    )

    if (isDisposed) {
      return
    }

    const weatherList = settledResults
      .filter((result) => result.status === 'fulfilled')
      .map((result) => result.value)
    const failedCount = settledResults.length - weatherList.length

    if (weatherList.length === 0) {
      errorMessage.value = '전국 주요 도시의 날씨를 불러오지 못했습니다.'

      return
    }

    nationalWeatherList.value = weatherList
    lastUpdatedAt.value = new Date()
    cacheWeather(weatherList, lastUpdatedAt.value.getTime())

    if (failedCount > 0) {
      noticeMessage.value = `${failedCount}개 지역은 일시적으로 날씨를 불러오지 못했습니다.`
    }

    if (!weatherList.some((city) => city.id === selectedCityId.value)) {
      selectedCityId.value = weatherList[0].id
    }
  } catch (error) {
    console.error('전국 날씨 조회 실패:', error)

    errorMessage.value = '전국 날씨를 불러오는 중 오류가 발생했습니다.'
  } finally {
    if (!isDisposed) {
      isLoading.value = false
    }
  }
}

const createMarkerHtml = (city) => {
  const isSelected = city.id === selectedCityId.value
  const weatherIcon = getWeatherIconUrl(city.icon, '2x')

  return `
    <div class="national-map-marker city-${escapeHtml(city.id)}${isSelected ? ' is-selected' : ''}">
      <span class="national-map-marker-icon">
        <img src="${escapeHtml(weatherIcon)}" alt="" />
      </span>
      <span class="national-map-marker-label">
        <strong>${escapeHtml(city.name)}</strong>
        <em>${escapeHtml(formatTemperature(city.temperature))}</em>
      </span>
    </div>
  `
}

const renderMarkers = () => {
  if (!map || !markerLayer) {
    return
  }

  markerLayer.clearLayers()

  nationalWeatherList.value.forEach((city) => {
    const markerIcon = L.divIcon({
      className: 'national-weather-div-icon',
      html: createMarkerHtml(city),
      iconSize: [96, 58],
      iconAnchor: [48, 29],
    })
    const marker = L.marker([city.lat, city.lon], {
      icon: markerIcon,
      keyboard: true,
      title: `${city.name} ${formatTemperature(city.temperature)}`,
      alt: `${city.name} 날씨`,
    })

    marker.on('click', () => {
      selectedCityId.value = city.id
    })

    marker.addTo(markerLayer)
  })
}

const initializeMap = () => {
  if (map || !mapElement.value) {
    return
  }

  map = L.map(mapElement.value, {
    center: [36.1, 127.8],
    zoom: 6.35,
    minZoom: 5.5,
    maxZoom: 10,
    zoomSnap: 0.25,
    zoomControl: false,
    scrollWheelZoom: false,
    maxBounds: [
      [31.5, 122.5],
      [40.5, 133],
    ],
  })

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map)

  L.control
    .zoom({
      position: 'topright',
    })
    .addTo(map)

  markerLayer = L.layerGroup().addTo(map)

  map.fitBounds(
    [
      [32.9, 124.5],
      [39.1, 131.5],
    ],
    {
      padding: [18, 18],
    },
  )

  renderMarkers()
}

const startMap = async () => {
  if (hasStarted.value) {
    return
  }

  hasStarted.value = true

  await nextTick()

  initializeMap()
  await fetchNationalWeather()
}

const focusCity = (city) => {
  selectedCityId.value = city.id

  if (map) {
    map.flyTo([city.lat, city.lon], Math.max(map.getZoom(), 7), {
      duration: 0.65,
    })
  }
}

const refreshNationalWeather = async () => {
  await fetchNationalWeather({ force: true })
}

const handleWindowResize = () => {
  map?.invalidateSize({ pan: false })
}

watch(
  [nationalWeatherList, () => configStore.unit, selectedCityId],
  () => {
    renderMarkers()
  },
  { deep: true },
)

onMounted(() => {
  window.addEventListener('resize', handleWindowResize)

  if (!('IntersectionObserver' in window)) {
    startMap()

    return
  }

  intersectionObserver = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) {
        return
      }

      intersectionObserver?.disconnect()
      startMap()
    },
    {
      rootMargin: '240px 0px',
    },
  )

  if (sectionElement.value) {
    intersectionObserver.observe(sectionElement.value)
  }
})

onBeforeUnmount(() => {
  isDisposed = true

  intersectionObserver?.disconnect()
  window.removeEventListener('resize', handleWindowResize)

  map?.remove()
  map = null
  markerLayer = null
})
</script>

<template>
  <BaseDashboardCard>
    <section ref="sectionElement" class="national-weather" aria-labelledby="national-map-title">
      <header class="national-weather-header">
        <h2 id="national-map-title">
          전국 날씨 지도
          <span class="national-weather-count" role="status">
            (주요 {{ nationalLocationCount }}개 도시)
          </span>
        </h2>

        <el-button
          type="primary"
          plain
          size="small"
          :icon="Refresh"
          :loading="isLoading"
          :disabled="!hasStarted"
          @click="refreshNationalWeather"
        >
          새로고침
        </el-button>
      </header>

      <p v-if="formattedUpdatedAt" class="national-weather-updated-at">
        마지막 갱신 {{ formattedUpdatedAt }}
      </p>

      <el-alert
        v-if="errorMessage"
        :title="errorMessage"
        type="error"
        :closable="false"
        show-icon
      />

      <el-alert
        v-else-if="noticeMessage"
        :title="noticeMessage"
        type="warning"
        :closable="false"
        show-icon
      />

      <div class="national-map-shell" :aria-busy="isLoading">
        <div
          ref="mapElement"
          class="national-map-canvas"
          role="application"
          aria-label="대한민국 주요 도시 현재 날씨 지도"
        ></div>

        <div v-if="!hasStarted || isLoading" class="national-map-loading" role="status">
          <el-skeleton animated>
            <template #template>
              <el-skeleton-item variant="rect" class="map-skeleton-main" />
            </template>
          </el-skeleton>

          <p>{{ hasStarted ? '전국 날씨를 불러오고 있습니다.' : '지도를 준비하고 있습니다.' }}</p>
        </div>

        <article v-if="selectedWeather" class="selected-weather-panel" aria-live="polite">
          <div class="selected-weather-heading">
            <div>
              <span>선택 지역</span>
              <h3>{{ selectedWeather.name }}</h3>
            </div>

            <img
              v-if="selectedWeather.icon"
              :src="getWeatherIconUrl(selectedWeather.icon, '2x')"
              :alt="`${selectedWeather.description} 아이콘`"
            />
          </div>

          <p class="selected-weather-temperature">
            {{ formatTemperature(selectedWeather.temperature) }}
          </p>

          <p class="selected-weather-description">{{ selectedWeather.description }}</p>

          <dl class="selected-weather-details">
            <div>
              <dt>체감</dt>
              <dd>{{ formatTemperature(selectedWeather.feelsLike) }}</dd>
            </div>

            <div>
              <dt>습도</dt>
              <dd>{{ selectedWeather.humidity ?? '-' }}%</dd>
            </div>

            <div>
              <dt>풍속</dt>
              <dd>{{ selectedWeather.windSpeed ?? '-' }}m/s</dd>
            </div>
          </dl>
        </article>
      </div>

      <div
        v-if="nationalWeatherList.length > 0"
        class="city-weather-strip"
        aria-label="지역 빠른 선택"
      >
        <button
          v-for="city in nationalWeatherList"
          :key="city.id"
          type="button"
          class="city-weather-chip"
          :class="{ 'is-active': city.id === selectedCityId }"
          :aria-pressed="city.id === selectedCityId"
          @click="focusCity(city)"
        >
          <img v-if="city.icon" :src="getWeatherIconUrl(city.icon)" alt="" />

          <span>{{ city.name }}</span>

          <strong>{{ formatTemperature(city.temperature) }}</strong>
        </button>
      </div>

      <p class="national-weather-attribution">
        지도 ©
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">
          OpenStreetMap contributors
        </a>
        <span aria-hidden="true"> · </span>
        날씨
        <a href="https://openweathermap.org/" target="_blank" rel="noopener noreferrer">
          OpenWeather
        </a>
      </p>
    </section>
  </BaseDashboardCard>
</template>

<style scoped>
.national-weather {
  display: grid;
  gap: 14px;
}

.national-weather-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.national-weather-header h2 {
  margin: 0;
  color: #172033;
  font-size: 20px;
}

.national-weather-count {
  color: #64748b;
  font-size: 14px;
  font-weight: 800;
}

.national-weather-header :deep(.el-button) {
  flex: 0 0 auto;
  margin-left: 0;
  font-weight: 800;
}

.national-weather-updated-at {
  margin: -9px 0 0;
  color: #64748b;
  font-size: 11px;
}

.national-map-shell {
  position: relative;
  overflow: hidden;
  min-height: 570px;
  border: 1px solid #bfdbfe;
  border-radius: 18px;
  background: radial-gradient(circle at 15% 15%, rgb(255 255 255 / 72%), transparent 28%), #dbeafe;
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 45%);
}

.national-map-canvas {
  width: 100%;
  height: 570px;
  background-color: #dbeafe;
}

.national-map-loading {
  position: absolute;
  z-index: 800;
  inset: 0;
  display: grid;
  place-content: center;
  gap: 14px;
  padding: 28px;
  background: rgb(239 246 255 / 88%);
  backdrop-filter: blur(7px);
}

.national-map-loading :deep(.el-skeleton) {
  width: min(420px, 75vw);
}

.map-skeleton-main {
  width: 100%;
  height: 180px;
  border-radius: 18px;
}

.national-map-loading p {
  margin: 0;
  color: #1d4ed8;
  font-size: 14px;
  font-weight: 800;
  text-align: center;
}

.selected-weather-panel {
  position: absolute;
  z-index: 700;
  top: 20px;
  left: 20px;
  width: 220px;
  padding: 18px;
  border: 1px solid rgb(255 255 255 / 85%);
  border-radius: 16px;
  background: rgb(255 255 255 / 91%);
  box-shadow: 0 16px 36px rgb(15 23 42 / 16%);
  backdrop-filter: blur(10px);
}

.selected-weather-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.selected-weather-heading span {
  color: #64748b;
  font-size: 11px;
  font-weight: 750;
}

.selected-weather-heading h3 {
  margin: 3px 0 0;
  color: #172033;
  font-size: 18px;
}

.selected-weather-heading img {
  width: 52px;
  height: 52px;
  object-fit: contain;
}

.selected-weather-temperature {
  margin: 14px 0 0;
  color: #172033;
  font-size: 34px;
  font-weight: 900;
  letter-spacing: -0.05em;
}

.selected-weather-description {
  margin: 2px 0 0;
  color: #475569;
  font-size: 13px;
  font-weight: 700;
}

.selected-weather-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin: 16px 0 0;
}

.selected-weather-details div {
  min-width: 0;
  padding-top: 8px;
  border-top: 1px solid #dbeafe;
}

.selected-weather-details dt,
.selected-weather-details dd {
  margin: 0;
  text-align: center;
}

.selected-weather-details dt {
  color: #94a3b8;
  font-size: 10px;
}

.selected-weather-details dd {
  margin-top: 3px;
  color: #334155;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}

.city-weather-strip {
  display: flex;
  overflow-x: auto;
  gap: 8px;
  padding: 2px 2px 8px;
  scrollbar-width: thin;
}

.city-weather-chip {
  display: grid;
  grid-template-columns: 28px auto;
  grid-template-rows: auto auto;
  flex: 0 0 auto;
  align-items: center;
  column-gap: 7px;
  min-width: 106px;
  padding: 8px 11px;
  border: 1px solid #dbe3ee;
  border-radius: 12px;
  background-color: #ffffff;
  color: #475569;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    transform 0.2s ease;
}

.city-weather-chip:hover {
  border-color: #93c5fd;
  transform: translateY(-1px);
}

.city-weather-chip.is-active {
  border-color: #2563eb;
  background-color: #eff6ff;
  color: #1d4ed8;
}

.city-weather-chip img {
  grid-row: 1 / 3;
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.city-weather-chip span,
.city-weather-chip strong {
  text-align: left;
}

.city-weather-chip span {
  font-size: 11px;
  font-weight: 700;
}

.city-weather-chip strong {
  font-size: 13px;
}

.national-weather-attribution {
  margin: -8px 0 0;
  color: #94a3b8;
  font-size: 10px;
  text-align: right;
}

.national-weather-attribution a {
  color: #64748b;
}

:global(.national-map-canvas .leaflet-tile-pane) {
  filter: saturate(0.62) brightness(1.06) contrast(0.92);
}

:global(.national-map-canvas .leaflet-control-zoom) {
  overflow: hidden;
  border: 1px solid #dbe3ee;
  border-radius: 10px;
  box-shadow: 0 8px 20px rgb(15 23 42 / 10%);
}

:global(.national-map-canvas .leaflet-control-zoom a) {
  border-color: #e2e8f0;
  color: #1d4ed8;
}

:global(.national-map-canvas .leaflet-control-attribution) {
  border-radius: 6px 0 0;
  background: rgb(255 255 255 / 86%);
  font-size: 9px;
}

:global(.national-weather-div-icon) {
  border: 0;
  background: transparent;
}

:global(.national-map-marker) {
  display: flex;
  align-items: center;
  width: max-content;
  min-width: 82px;
  padding: 4px 8px 4px 4px;
  border: 1px solid rgb(191 219 254 / 88%);
  border-radius: 999px;
  background: rgb(255 255 255 / 92%);
  box-shadow: 0 7px 18px rgb(15 23 42 / 14%);
  transform: translate(7px, 5px);
  transition:
    border-color 0.2s ease,
    transform 0.2s ease;
  backdrop-filter: blur(7px);
}

:global(.national-map-marker.is-selected) {
  z-index: 2;
  border-color: #2563eb;
  box-shadow: 0 9px 22px rgb(37 99 235 / 25%);
  transform: translate(7px, 3px) scale(1.04);
}

:global(.national-map-marker-icon) {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #eff6ff;
}

:global(.national-map-marker-icon img) {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

:global(.national-map-marker-label) {
  display: grid;
  margin-left: 4px;
  line-height: 1.15;
}

:global(.national-map-marker-label strong) {
  color: #334155;
  font-size: 10px;
}

:global(.national-map-marker-label em) {
  margin-top: 2px;
  color: #172033;
  font-size: 12px;
  font-style: normal;
  font-weight: 900;
}

@media (max-width: 850px) {
  .national-map-shell,
  .national-map-canvas {
    min-height: 500px;
    height: 500px;
  }
}

@media (max-width: 600px) {
  .national-weather-header {
    align-items: stretch;
    flex-direction: column;
  }

  .national-map-shell {
    display: grid;
    overflow: visible;
    height: auto;
    min-height: 0;
    border: 0;
    background: transparent;
    box-shadow: none;
  }

  .national-map-canvas {
    height: 430px;
    min-height: 430px;
    border: 1px solid #bfdbfe;
    border-radius: 16px;
  }

  .national-map-loading {
    bottom: auto;
    height: 430px;
    border-radius: 16px;
  }

  .selected-weather-panel {
    position: relative;
    z-index: 1;
    top: auto;
    left: auto;
    width: 100%;
    margin-top: 10px;
    border-color: #dbe3ee;
    box-shadow: none;
  }

  .national-weather-header :deep(.el-button) {
    width: 100%;
  }

  :global(.national-map-marker) {
    min-width: 54px;
    padding: 5px 7px;
  }

  :global(.national-map-marker-icon) {
    display: none;
  }

  :global(.national-map-marker.is-selected .national-map-marker-icon) {
    display: grid;
    width: 26px;
    height: 26px;
  }

  :global(.national-map-marker.is-selected .national-map-marker-icon img) {
    width: 31px;
    height: 31px;
  }

  :global(.national-map-marker-label) {
    margin-left: 0;
  }

  :global(.national-map-marker.is-selected .national-map-marker-label) {
    margin-left: 3px;
  }

  :global(.national-map-marker-label strong) {
    font-size: 9px;
  }

  :global(.national-map-marker-label em) {
    font-size: 11px;
  }

  :global(.national-map-marker.city-andong:not(.is-selected)),
  :global(.national-map-marker.city-jeonju:not(.is-selected)),
  :global(.national-map-marker.city-yeosu:not(.is-selected)),
  :global(.national-map-marker.city-ulsan:not(.is-selected)) {
    display: none;
  }
}
</style>
