<script setup>
import { computed, onMounted } from 'vue'

import { storeToRefs } from 'pinia'

import { useRoute, useRouter } from 'vue-router'

import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'

import { useTemperature } from '@/composables/useTemperature'

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
 * main.temp_min
 * main.temp_max
 */
const currentTemperature = computed(() => {
  return city.value?.main?.temp
})

const feelsLikeTemperature = computed(() => {
  return city.value?.main?.feels_like
})

const minimumTemperature = computed(() => {
  return city.value?.main?.temp_min
})

const maximumTemperature = computed(() => {
  return city.value?.main?.temp_max
})

// ========================================
// 온도 단위 변환
// ========================================

const { formattedTemperature: formattedCurrentTemperature } = useTemperature(currentTemperature)

const { formattedTemperature: formattedFeelsLikeTemperature } = useTemperature(feelsLikeTemperature)

const { formattedTemperature: formattedMinimumTemperature } = useTemperature(minimumTemperature)

const { formattedTemperature: formattedMaximumTemperature } = useTemperature(maximumTemperature)

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

  const locationParts = []

  if (city.value.state) {
    locationParts.push(city.value.state)
  }

  if (city.value.countryCode) {
    locationParts.push(city.value.countryCode)
  }

  return locationParts.join(' · ')
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
// 기압
// ========================================

const pressureText = computed(() => {
  const pressure = city.value?.main?.pressure

  if (pressure === null || pressure === undefined) {
    return '정보 없음'
  }

  return `${pressure} hPa`
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
// 구름량
// ========================================

const cloudinessText = computed(() => {
  const cloudiness = city.value?.clouds?.all

  if (cloudiness === null || cloudiness === undefined) {
    return '정보 없음'
  }

  return `${cloudiness}%`
})

// ========================================
// 일출·일몰 시간
// ========================================

/**
 * OpenWeather의 sunrise와 sunset은
 * Unix timestamp 초 단위 값입니다.
 *
 * 도시의 timezone 값도 초 단위이므로
 * 두 값을 이용해 해당 도시 기준 시각을 표시합니다.
 */
const formatCityTime = (unixTimestamp) => {
  if (unixTimestamp === null || unixTimestamp === undefined) {
    return '정보 없음'
  }

  const timezoneOffset = city.value?.timezone ?? 0

  /**
   * timestamp와 도시 timezone을 더한 후
   * UTC 기준으로 시·분만 출력합니다.
   */
  const cityDate = new Date((Number(unixTimestamp) + Number(timezoneOffset)) * 1000)

  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }).format(cityDate)
}

const sunriseText = computed(() => {
  return formatCityTime(city.value?.sys?.sunrise)
})

const sunsetText = computed(() => {
  return formatCityTime(city.value?.sys?.sunset)
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
  if (weatherList.value.length === 0) {
    await weatherStore.fetchAllWeather()
  }
})
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

          <!-- <div class="information-item">
            <dt>최저 기온</dt>

            <dd>
              {{ formattedMinimumTemperature }}
            </dd>
          </div>

          <div class="information-item">
            <dt>최고 기온</dt>

            <dd>
              {{ formattedMaximumTemperature }}
            </dd>
          </div> -->
        </dl>

        <p class="temperature-notice">
          최저·최고 기온은 일일 예보값이 아니라 OpenWeather Current Weather API가 제공하는 현재 관측
          범위의 최저·최고값입니다. 따라서 현재 기온과 동일하게 표시될 수 있습니다.
        </p>
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

          <div class="information-item">
            <dt>일출</dt>

            <dd>
              {{ sunriseText }}
            </dd>
          </div>

          <div class="information-item">
            <dt>일몰</dt>

            <dd>
              {{ sunsetText }}
            </dd>
          </div>

          <div class="information-item">
            <dt>좌표</dt>

            <dd>
              <template v-if="city.coord?.lat !== undefined && city.coord?.lon !== undefined">
                {{ Number(city.coord.lat).toFixed(4) }},
                {{ Number(city.coord.lon).toFixed(4) }}
              </template>

              <template v-else> 정보 없음 </template>
            </dd>
          </div>
        </dl>
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
.current-temperature,
.weather-description,
.observed-at {
  margin: 0;
}

.location-text {
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
  margin-top: 22px;
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

.detail-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
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

.temperature-notice {
  margin: 16px 0 0;

  padding: 14px 16px;

  border-left: 4px solid #2563eb;
  border-radius: 0 10px 10px 0;

  background-color: #eff6ff;
  color: #475569;

  font-size: 13px;
  line-height: 1.7;
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
  .temperature-grid,
  .detail-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
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
  .detail-grid {
    grid-template-columns: 1fr;
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
