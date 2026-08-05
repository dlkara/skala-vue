<script setup>
import { computed, onMounted, watch } from 'vue'

import { storeToRefs } from 'pinia'

import { useRoute, useRouter } from 'vue-router'

import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'

import HourlyWeatherForecast from '@/components/exercise/HourlyWeatherForecast.vue'

import { useTemperature } from '@/composables/useTemperature'

import { useWeatherSupplement } from '@/composables/useWeatherSupplement'

import { useWeatherStore } from '@/stores/weatherStore'

import { getWeatherIconUrl } from '@/utils/getWeatherIconUrl'

// ========================================
// Router
// ========================================

const route = useRoute()

const router = useRouter()

// ========================================
// Weather Store
// ========================================

const weatherStore = useWeatherStore()

const { weatherList, isLoading, errorMessage } = storeToRefs(weatherStore)

// ========================================
// 일별·시간별 예보 및 대기질
// ========================================

const {
  forecast,
  airQuality,
  isLoading: isSupplementLoading,
  forecastErrorMessage,
  airQualityErrorMessage,
  updatedAt: supplementUpdatedAt,
  fetchWeatherSupplement,
} = useWeatherSupplement()

// ========================================
// 현재 도시 조회
// ========================================

/**
 * 라우터의 동적 경로에서 도시 ID를 가져옵니다.
 *
 * 예:
 * /weather/KR-37.5665-126.9780
 */
const cityId = computed(() => {
  return String(route.params.cityId || '')
})

/**
 * 라우터로 전달받은 cityId를 기준으로
 * Pinia Store에서 도시를 찾습니다.
 */
const city = computed(() => {
  if (!cityId.value) {
    return null
  }

  return weatherStore.getWeatherById(cityId.value)
})

// ========================================
// 온도 원본값
// ========================================

/**
 * 모든 온도 값은 city.main 안에 있습니다.
 *
 * OpenWeather API 응답 구조:
 *
 * main.temp
 * main.feels_like
 */
const currentTemperature = computed(() => {
  return city.value?.main?.temp
})

const feelsLikeTemperature = computed(() => {
  return city.value?.main?.feels_like
})

const todayMinimumTemperature = computed(() => {
  return forecast.value.todayMinimum
})

const todayMaximumTemperature = computed(() => {
  return forecast.value.todayMaximum
})

// ========================================
// 온도 단위 변환
// ========================================

const { formattedTemperature: formattedCurrentTemperature } = useTemperature(currentTemperature)

const { formattedTemperature: formattedFeelsLikeTemperature } = useTemperature(feelsLikeTemperature)

const { formattedTemperature: formattedTodayMinimumTemperature } =
  useTemperature(todayMinimumTemperature)

const { formattedTemperature: formattedTodayMaximumTemperature } =
  useTemperature(todayMaximumTemperature)

// ========================================
// 날씨 아이콘
// ========================================

const weatherIconUrl = computed(() => {
  const iconCode = city.value?.weather?.icon

  if (!iconCode) {
    return ''
  }

  return getWeatherIconUrl(iconCode, '4x')
})

// ========================================
// 도시 위치 표시
// ========================================

const locationText = computed(() => {
  if (!city.value) {
    return ''
  }

  if (city.value.state === city.value.name) {
    return ''
  }

  return city.value.state
})

const coordinateText = computed(() => {
  const latitude = Number(city.value?.coord?.lat)
  const longitude = Number(city.value?.coord?.lon)

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return '정보 없음'
  }

  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
})

// ========================================
// 습도
// ========================================

const humidityText = computed(() => {
  const humidity = city.value?.main?.humidity

  if (humidity === null || humidity === undefined) {
    return '정보 없음'
  }

  return `${humidity}%`
})

// ========================================
// 풍속
// ========================================

const windSpeedText = computed(() => {
  const windSpeed = city.value?.wind?.speed

  if (windSpeed === null || windSpeed === undefined) {
    return '정보 없음'
  }

  return `${Number(windSpeed).toFixed(1)} ` + 'm/s'
})

// ========================================
// 가시거리
// ========================================

const visibilityText = computed(() => {
  const visibility = city.value?.visibility

  if (visibility === null || visibility === undefined) {
    return '정보 없음'
  }

  return `${(Number(visibility) / 1000).toFixed(1)} km`
})

// ========================================
// 대기질
// ========================================

const formatParticulateMatter = (value) => {
  if (value === null || value === undefined) {
    return '정보 없음'
  }

  const numericValue = Number(value)

  if (!Number.isFinite(numericValue)) {
    return '정보 없음'
  }

  return `${numericValue.toFixed(1)} µg/m³`
}

const pm10Text = computed(() => {
  return formatParticulateMatter(airQuality.value.pm10)
})

const pm25Text = computed(() => {
  return formatParticulateMatter(airQuality.value.pm2_5)
})

const getAirQualityGrade = (value, type) => {
  if (value === null || value === undefined) {
    return {
      label: '정보 없음',
      className: 'unknown',
    }
  }

  const numericValue = Number(value)

  if (!Number.isFinite(numericValue) || numericValue < 0) {
    return {
      label: '정보 없음',
      className: 'unknown',
    }
  }

  const thresholds = type === 'pm25' ? [15, 35, 75] : [30, 80, 150]

  if (numericValue <= thresholds[0]) {
    return {
      label: '좋음',
      className: 'good',
    }
  }

  if (numericValue <= thresholds[1]) {
    return {
      label: '보통',
      className: 'normal',
    }
  }

  if (numericValue <= thresholds[2]) {
    return {
      label: '나쁨',
      className: 'bad',
    }
  }

  return {
    label: '매우 나쁨',
    className: 'very-bad',
  }
}

const pm10Grade = computed(() => {
  return getAirQualityGrade(airQuality.value.pm10, 'pm10')
})

const pm25Grade = computed(() => {
  return getAirQualityGrade(airQuality.value.pm2_5, 'pm25')
})

// ========================================
// 최종 업데이트 시각
// ========================================

const observedAtText = computed(() => {
  const observedAt = city.value?.dt

  if (observedAt === null || observedAt === undefined) {
    return '정보 없음'
  }

  const timezoneOffset = city.value?.timezone ?? 0

  const cityDate = new Date((Number(observedAt) + Number(timezoneOffset)) * 1000)

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }).format(cityDate)
})

// ========================================
// 페이지 이동
// ========================================

const moveToHome = () => {
  router.push({
    name: 'weather-home',
  })
}

// ========================================
// 즐겨찾기
// ========================================

const toggleFavorite = () => {
  if (!city.value) {
    return
  }

  weatherStore.toggleFavorite(city.value.id)
}

// ========================================
// 생명주기
// ========================================

onMounted(async () => {
  /**
   * 홈 화면을 거치지 않고 상세 주소로 직접 접근하면
   * Pinia Store의 weatherList가 비어 있을 수 있습니다.
   *
   * 이 경우 기본·추가 지역의 날씨를 먼저 불러옵니다.
   */
  const shouldResolveCurrentLocation =
    cityId.value === 'current-location' && weatherList.value.length === 0

  if (weatherList.value.length === 0) {
    await weatherStore.fetchAllWeather()
  }

  if (shouldResolveCurrentLocation) {
    weatherStore.refreshCurrentLocation()
  }
})

watch(
  () => [city.value?.coord?.lat, city.value?.coord?.lon],
  ([latitude, longitude]) => {
    if (
      latitude === null ||
      latitude === undefined ||
      longitude === null ||
      longitude === undefined
    ) {
      return
    }

    fetchWeatherSupplement(latitude, longitude)
  },
  {
    immediate: true,
  },
)
</script>

<template>
  <section class="weather-detail page-container">
    <!-- ======================================
         페이지 제목
    ======================================= -->

    <header class="page-header">
      <p class="page-eyebrow">Weather Detail</p>

      <h1 class="page-title">도시 상세 날씨</h1>

      <p class="page-description">선택한 지역의 현재 기상 관측 정보를 확인할 수 있습니다.</p>
    </header>

    <!-- ======================================
         로딩 상태
    ======================================= -->

    <BaseDashboardCard v-if="isLoading" title="날씨 정보 불러오기">
      <p class="loading-message" role="status" aria-live="polite">
        상세 날씨 정보를 불러오고 있습니다.
      </p>
    </BaseDashboardCard>

    <!-- ======================================
         오류 상태
    ======================================= -->

    <BaseDashboardCard v-else-if="errorMessage" title="날씨 조회 오류">
      <div class="error-box" role="alert">
        <p>
          {{ errorMessage }}
        </p>

        <div class="error-actions">
          <button type="button" class="primary-button" @click="weatherStore.fetchAllWeather()">
            다시 불러오기
          </button>

          <button type="button" class="secondary-button" @click="moveToHome">
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </BaseDashboardCard>

    <!-- ======================================
         도시를 찾은 경우
    ======================================= -->

    <template v-else-if="city">
      <!-- 대표 날씨 정보 -->

      <BaseDashboardCard :title="`${city.name} 현재 날씨`">
        <div class="weather-overview">
          <div class="overview-information">
            <h2 class="selected-city-name">
              {{ city.name }}
            </h2>

            <p v-if="locationText" class="location-text">
              {{ locationText }}
            </p>

            <p class="current-temperature">
              {{ formattedCurrentTemperature }}
            </p>

            <p class="weather-description">
              {{ city.weather?.description || '날씨 정보 없음' }}
            </p>

            <p class="observed-at">
              관측 시각:
              {{ observedAtText }}
            </p>
          </div>

          <img
            v-if="weatherIconUrl"
            :src="weatherIconUrl"
            :alt="
              city.weather?.description ? `${city.weather.description} 날씨 아이콘` : '날씨 아이콘'
            "
            class="weather-icon"
          />
        </div>

        <div class="overview-actions">
          <button
            type="button"
            class="favorite-button"
            :class="{
              'favorite-button-active': city.favorite,
            }"
            :aria-pressed="city.favorite"
            @click="toggleFavorite"
          >
            <span aria-hidden="true">
              {{ city.favorite ? '★' : '☆' }}
            </span>

            {{ city.favorite ? '즐겨찾기 해제' : '즐겨찾기 추가' }}
          </button>

          <p class="coordinate-text">
            좌표:
            <strong>{{ coordinateText }}</strong>
          </p>
        </div>
      </BaseDashboardCard>

      <!-- 온도 정보 -->

      <BaseDashboardCard title="온도 정보">
        <dl class="temperature-grid">
          <div class="information-item">
            <dt>현재 기온</dt>

            <dd>
              {{ formattedCurrentTemperature }}
            </dd>
          </div>

          <div class="information-item">
            <dt>체감 기온</dt>

            <dd>
              {{ formattedFeelsLikeTemperature }}
            </dd>
          </div>

          <div class="information-item temperature-low-item">
            <dt>오늘 최저 기온</dt>

            <dd>
              {{ isSupplementLoading ? '불러오는 중' : formattedTodayMinimumTemperature }}
            </dd>
          </div>

          <div class="information-item temperature-high-item">
            <dt>오늘 최고 기온</dt>

            <dd>
              {{ isSupplementLoading ? '불러오는 중' : formattedTodayMaximumTemperature }}
            </dd>
          </div>
        </dl>
      </BaseDashboardCard>

      <!-- 상세 기상 정보 -->

      <BaseDashboardCard title="상세 기상 정보">
        <dl class="detail-grid">
          <div class="information-item">
            <dt>습도</dt>

            <dd>
              {{ humidityText }}
            </dd>
          </div>

          <div class="information-item">
            <dt>풍속</dt>

            <dd>
              {{ windSpeedText }}
            </dd>
          </div>

          <div class="information-item">
            <dt>가시거리</dt>

            <dd>
              {{ visibilityText }}
            </dd>
          </div>
        </dl>

        <section class="air-quality" aria-labelledby="air-quality-title">
          <div class="air-quality-heading">
            <div>
              <h3 id="air-quality-title">현재 대기질</h3>

              <p>지역 좌표에 가장 가까운 예보 격자 기준</p>
            </div>

            <span class="air-quality-badge">Air Quality</span>
          </div>

          <dl class="air-quality-grid">
            <div class="information-item air-quality-item">
              <dt>미세먼지 <small>PM10</small></dt>

              <dd class="air-quality-value">
                <span>{{ isSupplementLoading ? '불러오는 중' : pm10Text }}</span>

                <span
                  v-if="!isSupplementLoading && pm10Grade.className !== 'unknown'"
                  class="air-quality-grade"
                  :class="`air-quality-grade-${pm10Grade.className}`"
                >
                  {{ pm10Grade.label }}
                </span>
              </dd>
            </div>

            <div class="information-item air-quality-item">
              <dt>초미세먼지 <small>PM2.5</small></dt>

              <dd class="air-quality-value">
                <span>{{ isSupplementLoading ? '불러오는 중' : pm25Text }}</span>

                <span
                  v-if="!isSupplementLoading && pm25Grade.className !== 'unknown'"
                  class="air-quality-grade"
                  :class="`air-quality-grade-${pm25Grade.className}`"
                >
                  {{ pm25Grade.label }}
                </span>
              </dd>
            </div>
          </dl>

          <el-alert
            v-if="airQualityErrorMessage"
            class="air-quality-error"
            :title="airQualityErrorMessage"
            type="warning"
            :closable="false"
            show-icon
          />

          <p class="air-quality-source">
            대기질 데이터:
            <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a>
            ·
            <a href="https://atmosphere.copernicus.eu/" target="_blank" rel="noreferrer">
              CAMS ENSEMBLE
            </a>
            · 등급 기준
            <a href="https://m.airkorea.or.kr/info/behaviorInfo1" target="_blank" rel="noreferrer">
              에어코리아
            </a>
          </p>
        </section>
      </BaseDashboardCard>

      <!-- 시간별 예보 -->

      <BaseDashboardCard class="hourly-card">
        <HourlyWeatherForecast
          :items="forecast.hourly"
          :sun-events="forecast.sunEvents"
          :is-loading="isSupplementLoading"
          :error-message="forecastErrorMessage"
          :updated-at="supplementUpdatedAt"
        />
      </BaseDashboardCard>

      <!-- 홈 이동 -->

      <div class="page-actions">
        <button type="button" class="secondary-button" @click="moveToHome">
          대시보드로 돌아가기
        </button>
      </div>
    </template>

    <!-- ======================================
         cityId에 해당하는 도시가 없는 경우
    ======================================= -->

    <BaseDashboardCard v-else title="도시를 찾을 수 없습니다">
      <div class="empty-state">
        <p>요청한 도시가 현재 대시보드에 없습니다.</p>

        <p>도시가 삭제되었거나 잘못된 주소로 접근했을 수 있습니다.</p>

        <button type="button" class="primary-button" @click="moveToHome">
          날씨 홈으로 돌아가기
        </button>
      </div>
    </BaseDashboardCard>
  </section>
</template>

<style scoped>
/* ========================================
   현재 날씨 대표 영역
======================================== */

.weather-overview {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 28px;
}

.overview-information {
  min-width: 0;
}

.location-text,
.selected-city-name,
.current-temperature,
.weather-description,
.observed-at {
  margin: 0;
}

.selected-city-name {
  color: #172033;
  font-size: clamp(24px, 4vw, 34px);
  font-weight: 900;
  line-height: 1.2;
}

.location-text {
  margin-top: 6px;

  color: #2563eb;

  font-size: 14px;
  font-weight: 800;
}

.current-temperature {
  margin-top: 12px;

  color: #172033;

  font-size: clamp(46px, 8vw, 74px);

  font-weight: 900;
  line-height: 1;
}

.weather-description {
  margin-top: 12px;

  color: #475569;

  font-size: 18px;
  font-weight: 800;
}

.observed-at {
  margin-top: 10px;

  color: #64748b;

  font-size: 13px;
}

.weather-icon {
  flex: 0 0 auto;

  width: 150px;
  height: 150px;

  object-fit: contain;
}

.overview-actions {
  display: flex;

  align-items: flex-end;
  justify-content: space-between;

  gap: 18px;

  margin-top: 22px;
}

.coordinate-text {
  margin: 0 0 0 auto;

  color: #64748b;

  font-size: 13px;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.coordinate-text strong {
  color: #334155;

  font-weight: 800;
}

/* ========================================
   온도 및 상세 정보
======================================== */

.temperature-grid,
.detail-grid {
  display: grid;

  grid-template-columns: repeat(4, minmax(0, 1fr));

  gap: 14px;

  margin: 0;
}

.hourly-card {
  overflow: hidden;
}

.detail-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.temperature-low-item {
  border-color: #e2e8f0;
  background: #f8fafc;
}

.temperature-high-item {
  border-color: #e2e8f0;
  background: #f8fafc;
}

.information-item {
  min-width: 0;

  padding: 18px;

  border: 1px solid #e2e8f0;
  border-radius: 12px;

  background-color: #f8fafc;
}

.information-item dt,
.information-item dd {
  margin: 0;
}

.information-item dt {
  color: #64748b;

  font-size: 13px;
  font-weight: 800;
}

.information-item dd {
  margin-top: 9px;

  overflow-wrap: anywhere;

  color: #172033;

  font-size: 20px;
  font-weight: 900;
}

/* ========================================
   대기질
======================================== */

.air-quality {
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid #e2e8f0;
}

.air-quality-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 13px;
}

.air-quality-heading h3,
.air-quality-heading p,
.air-quality-source {
  margin: 0;
}

.air-quality-heading h3 {
  color: #172033;
  font-size: 15px;
  font-weight: 900;
}

.air-quality-heading p {
  margin-top: 4px;
  color: #64748b;
  font-size: 12px;
}

.air-quality-badge {
  padding: 5px 9px;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.air-quality-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin: 0;
}

.air-quality-item {
  border-color: #e2e8f0;
  background: #f8fafc;
}

.air-quality-item dt small {
  margin-left: 4px;
  color: #64748b;
  font-size: 10px;
}

.air-quality-value {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.air-quality-grade {
  display: inline-flex;
  min-height: 25px;
  align-items: center;
  padding: 4px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 900;
  line-height: 1;
  white-space: nowrap;
}

.air-quality-grade-good {
  background: #dbeafe;
  color: #1d4ed8;
}

.air-quality-grade-normal {
  background: #dcfce7;
  color: #15803d;
}

.air-quality-grade-bad {
  background: #fef3c7;
  color: #b45309;
}

.air-quality-grade-very-bad {
  background: #fee2e2;
  color: #b91c1c;
}

.air-quality-source {
  margin-top: 10px;
  color: #64748b;
  font-size: 10px;
  text-align: right;
}

.air-quality-error {
  margin-top: 12px;
}

.air-quality-source a {
  color: #2563eb;
  font-weight: 800;
  text-decoration: none;
}

.air-quality-source a:hover {
  text-decoration: underline;
}

/* ========================================
   일출·일몰 타임라인
======================================== */

.sun-timeline {
  margin-top: 18px;
  padding: 20px 18px 16px;

  border: 1px solid #e2e8f0;
  border-radius: 12px;

  background: #f8fafc;
}

.sun-timeline-heading h3,
.sun-timeline-heading p,
.sun-timeline-empty {
  margin: 0;
}

.sun-timeline-heading h3 {
  color: #172033;

  font-size: 15px;
  font-weight: 900;
}

.sun-timeline-heading p {
  margin-top: 4px;

  color: #64748b;

  font-size: 12px;
}

.sun-timeline-chart {
  padding: 0 6px;
}

.timeline-track {
  position: relative;

  height: 8px;

  margin-top: 68px;

  border-radius: 999px;

  background: #dbeafe;
  box-shadow: inset 0 0 0 1px rgb(37 99 235 / 8%);
}

.daylight-segment {
  position: absolute;
  top: 0;
  bottom: 0;

  border-radius: inherit;

  background: linear-gradient(90deg, #fbbf24, #fde68a 52%, #fb923c);
}

.sun-event {
  position: absolute;
  top: 50%;
  z-index: 2;

  transform: translate(-50%, -50%);
}

.event-point {
  display: block;

  width: 17px;
  height: 17px;

  border: 4px solid #ffffff;
  border-radius: 50%;

  box-shadow: 0 2px 8px rgb(15 23 42 / 20%);
}

.sunrise-event .event-point {
  background: #f59e0b;
}

.sunset-event .event-point {
  background: #6366f1;
}

.event-label {
  position: absolute;
  bottom: 23px;
  left: 50%;

  display: grid;

  grid-template-areas:
    'icon name'
    'icon time';
  grid-template-columns: auto auto;

  align-items: center;

  min-width: max-content;
  padding: 7px 10px;

  border: 1px solid #e2e8f0;
  border-radius: 10px;

  background: #ffffff;
  box-shadow: 0 5px 16px rgb(15 23 42 / 9%);

  transform: translateX(-50%);
}

.sun-event-icon {
  grid-area: icon;

  width: 29px;
  height: 29px;

  margin-right: 8px;
}

.sun-icon {
  color: #f59e0b;
}

.moon-icon {
  color: #6366f1;
}

.event-label span {
  grid-area: name;

  color: #64748b;

  font-size: 11px;
  font-weight: 800;
  line-height: 1.2;
}

.event-label strong {
  grid-area: time;

  margin-top: 2px;

  color: #172033;

  font-size: 14px;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}

.time-scale {
  display: flex;

  justify-content: space-between;

  margin-top: 11px;

  color: #64748b;

  font-size: 11px;
  font-variant-numeric: tabular-nums;
}

.sun-timeline-empty {
  margin-top: 16px;

  color: #64748b;

  font-size: 13px;
}

/* ========================================
   즐겨찾기 버튼
======================================== */

.favorite-button {
  min-height: 42px;

  padding: 9px 14px;

  border: 1px solid #cbd5e1;
  border-radius: 9px;

  background-color: #ffffff;
  color: #334155;

  font: inherit;
  font-size: 14px;
  font-weight: 800;

  cursor: pointer;

  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease;
}

.favorite-button:hover {
  border-color: #f59e0b;

  background-color: #fffbeb;
  color: #b45309;
}

.favorite-button-active {
  border-color: #f59e0b;

  background-color: #fef3c7;
  color: #92400e;
}

.favorite-button-active:hover {
  border-color: #d97706;

  background-color: #fde68a;
  color: #78350f;
}

.favorite-button:focus-visible {
  outline: 3px solid rgb(245 158 11 / 24%);

  outline-offset: 2px;
}

/* ========================================
   오류 및 이동 버튼
======================================== */

.error-actions,
.page-actions {
  display: flex;

  flex-wrap: wrap;

  gap: 10px;
}

.page-actions {
  justify-content: center;

  margin-top: 24px;
}

/* ========================================
   태블릿
======================================== */

@media (max-width: 850px) {
  .temperature-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .detail-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

/* ========================================
   모바일
======================================== */

@media (max-width: 600px) {
  .weather-overview {
    align-items: flex-start;
    flex-direction: column-reverse;
  }

  .weather-icon {
    width: 110px;
    height: 110px;
  }

  .temperature-grid,
  .detail-grid,
  .air-quality-grid {
    grid-template-columns: 1fr;
  }

  .overview-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .coordinate-text {
    margin-left: 0;

    text-align: left;
  }

  .sun-timeline {
    padding-right: 12px;
    padding-left: 12px;
  }

  .event-label {
    padding: 6px 8px;
  }

  .sun-event-icon {
    width: 25px;
    height: 25px;

    margin-right: 6px;
  }

  .error-actions,
  .page-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .error-actions button,
  .page-actions button,
  .favorite-button {
    width: 100%;
  }
}
</style>
