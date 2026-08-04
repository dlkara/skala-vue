<script setup>
import { computed, onMounted, ref } from 'vue'

import { storeToRefs } from 'pinia'

import { useRoute, useRouter } from 'vue-router'

import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'

import { useTemperature } from '@/composables/useTemperature'

import { useWeatherStore } from '@/stores/weatherStore'

import { getWeatherIconUrl } from '@/utils/getWeatherIconUrl'

// ========================================
// Router 및 Store
// ========================================

const route = useRoute()

const router = useRouter()

const weatherStore = useWeatherStore()

const { isLoading, errorMessage } = storeToRefs(weatherStore)

/**
 * 즐겨찾기 변경 안내입니다.
 */
const favoriteMessage = ref('')

// ========================================
// 현재 도시
// ========================================

/**
 * URL의 cityId에 해당하는
 * 날씨 객체를 Store에서 찾습니다.
 */
const city = computed(() => {
  const cityId = String(route.params.cityId ?? '')

  return weatherStore.getWeatherById(cityId)
})

// ========================================
// 온도 단위 변환
// ========================================

const currentTemperatureSource = computed(() => {
  return city.value?.main?.temp
})

const feelsLikeSource = computed(() => {
  return city.value?.main?.feelsLike
})

const minimumTemperatureSource = computed(() => {
  return city.value?.main?.tempMin
})

const maximumTemperatureSource = computed(() => {
  return city.value?.main?.tempMax
})

const { formattedTemperature: currentTemperature } = useTemperature(currentTemperatureSource)

const { formattedTemperature: feelsLikeTemperature } = useTemperature(feelsLikeSource)

const { formattedTemperature: minimumTemperature } = useTemperature(minimumTemperatureSource)

const { formattedTemperature: maximumTemperature } = useTemperature(maximumTemperatureSource)

// ========================================
// 화면 표시값
// ========================================

/**
 * OpenWeather 공식 아이콘 주소입니다.
 */
const weatherIconUrl = computed(() => {
  return getWeatherIconUrl(city.value?.weather?.icon, '4x')
})

const humidityText = computed(() => {
  const humidity = city.value?.main?.humidity

  if (humidity === null || humidity === undefined) {
    return '정보 없음'
  }

  return `${humidity}%`
})

const pressureText = computed(() => {
  const pressure = city.value?.main?.pressure

  if (pressure === null || pressure === undefined) {
    return '정보 없음'
  }

  return `${pressure} hPa`
})

const windSpeedText = computed(() => {
  const windSpeed = city.value?.wind?.speed

  if (windSpeed === null || windSpeed === undefined) {
    return '정보 없음'
  }

  return `${windSpeed} m/s`
})

const visibilityText = computed(() => {
  const visibility = city.value?.visibility

  if (visibility === null || visibility === undefined) {
    return '정보 없음'
  }

  return `${(visibility / 1000).toFixed(1)} km`
})

/**
 * 도시의 timezone 초 단위를 더한 뒤
 * UTC 기준으로 표시해 도시 현지 시각을 계산합니다.
 */
const formatCityTime = (unixTimestamp) => {
  if (!unixTimestamp || !city.value) {
    return '정보 없음'
  }

  const timezoneOffset = city.value.timezone ?? 0

  const cityDate = new Date((unixTimestamp + timezoneOffset) * 1000)

  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
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
// 이벤트
// ========================================

const handleToggleFavorite = () => {
  if (!city.value) {
    return
  }

  const willBeFavorite = !city.value.favorite

  const cityName = city.value.name

  weatherStore.toggleFavorite(city.value.id)

  favoriteMessage.value = willBeFavorite
    ? `${cityName}을 즐겨찾기에 추가했습니다.`
    : `${cityName}을 즐겨찾기에서 해제했습니다.`
}

const goBack = () => {
  router.back()
}

const moveToHome = () => {
  router.push({
    name: 'weather-home',
  })
}

// ========================================
// 최초 API 요청
// ========================================

/**
 * 상세 URL로 직접 접근한 경우에도
 * weatherList를 채울 수 있도록 API를 호출합니다.
 */
onMounted(async () => {
  await weatherStore.fetchAllWeather()
})
</script>

<template>
  <section class="detail-view">
    <header class="page-header">
      <p class="page-eyebrow">Weather Detail</p>

      <h1 class="page-title">상세 날씨</h1>

      <p class="page-description">선택한 지역의 상세 기상 정보를 확인합니다.</p>
    </header>

    <BaseDashboardCard title="지역별 상세 날씨">
      <p v-if="isLoading" class="loading-message" role="status" aria-live="polite">
        상세 날씨 정보를 불러오고 있습니다.
      </p>

      <div v-else-if="errorMessage" class="error-box" role="alert">
        <p>
          {{ errorMessage }}
        </p>

        <button type="button" class="primary-button" @click="weatherStore.refreshWeather()">
          다시 불러오기
        </button>
      </div>

      <article v-else-if="city" class="weather-detail">
        <div class="detail-summary">
          <div>
            <p class="city-region">
              {{ city.region }}
              ·
              {{ city.countryCode }}
            </p>

            <h2 class="city-name">
              {{ city.name }}
            </h2>

            <p class="weather-description">
              {{ city.weather.description }}
            </p>
          </div>

          <img v-if="weatherIconUrl" :src="weatherIconUrl" alt="" class="weather-icon" />
        </div>

        <div class="temperature-summary">
          <p class="current-temperature">
            {{ currentTemperature }}
          </p>

          <p class="feels-like">
            체감 온도:
            {{ feelsLikeTemperature }}
          </p>
        </div>

        <dl class="detail-grid">
          <div class="detail-item">
            <dt>최저 기온</dt>

            <dd>
              {{ minimumTemperature }}
            </dd>
          </div>

          <div class="detail-item">
            <dt>최고 기온</dt>

            <dd>
              {{ maximumTemperature }}
            </dd>
          </div>

          <div class="detail-item">
            <dt>습도</dt>

            <dd>
              {{ humidityText }}
            </dd>
          </div>

          <div class="detail-item">
            <dt>기압</dt>

            <dd>
              {{ pressureText }}
            </dd>
          </div>

          <div class="detail-item">
            <dt>풍속</dt>

            <dd>
              {{ windSpeedText }}
            </dd>
          </div>

          <div class="detail-item">
            <dt>가시거리</dt>

            <dd>
              {{ visibilityText }}
            </dd>
          </div>

          <div class="detail-item">
            <dt>일출</dt>

            <dd>
              {{ sunriseText }}
            </dd>
          </div>

          <div class="detail-item">
            <dt>일몰</dt>

            <dd>
              {{ sunsetText }}
            </dd>
          </div>
        </dl>

        <div class="detail-actions">
          <button
            type="button"
            class="favorite-button"
            :aria-pressed="city.favorite"
            @click="handleToggleFavorite"
          >
            {{ city.favorite ? '★ 즐겨찾기 해제' : '☆ 즐겨찾기 추가' }}
          </button>

          <button type="button" class="secondary-button" @click="goBack">이전 페이지</button>
        </div>

        <p class="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {{ favoriteMessage }}
        </p>
      </article>

      <div v-else class="empty-state">
        <p>해당 도시의 날씨 정보를 찾을 수 없습니다.</p>

        <button type="button" class="primary-button" @click="moveToHome">홈으로 돌아가기</button>
      </div>
    </BaseDashboardCard>
  </section>
</template>

<style scoped>
.detail-view {
  display: grid;
  gap: 24px;

  width: 100%;
}

.page-header {
  display: grid;
  gap: 8px;
}

.page-eyebrow,
.page-title,
.page-description {
  margin: 0;
}

.page-eyebrow {
  color: #2563eb;

  font-size: 14px;
  font-weight: 800;
}

.page-title {
  color: #0f172a;

  font-size: clamp(28px, 4vw, 42px);
}

.page-description {
  color: #64748b;

  line-height: 1.7;
}

.loading-message {
  margin: 0;

  padding: 14px 16px;

  border-radius: 10px;

  background-color: #eff6ff;
  color: #1d4ed8;

  font-size: 14px;
  font-weight: 700;
}

.error-box {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 16px;

  padding: 14px 16px;

  border-radius: 10px;

  background-color: #fef2f2;
  color: #b91c1c;
}

.error-box p {
  margin: 0;
}

.weather-detail {
  display: grid;
  gap: 24px;
}

.detail-summary {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 24px;
}

.city-region,
.city-name,
.weather-description {
  margin: 0;
}

.city-region {
  margin-bottom: 6px;

  color: #64748b;

  font-size: 14px;
  font-weight: 700;
}

.city-name {
  color: #0f172a;

  font-size: clamp(28px, 5vw, 44px);
}

.weather-description {
  margin-top: 8px;

  color: #475569;

  font-size: 17px;
}

.weather-icon {
  width: 120px;
  height: 120px;

  object-fit: contain;
}

.temperature-summary {
  padding: 22px;

  border-radius: 14px;

  background-color: #eff6ff;
}

.current-temperature,
.feels-like {
  margin: 0;
}

.current-temperature {
  color: #1d4ed8;

  font-size: clamp(42px, 8vw, 64px);
  font-weight: 900;
}

.feels-like {
  margin-top: 5px;

  color: #475569;

  font-size: 15px;
  font-weight: 700;
}

.detail-grid {
  display: grid;

  grid-template-columns: repeat(4, minmax(0, 1fr));

  gap: 14px;

  margin: 0;
}

.detail-item {
  padding: 16px;

  border: 1px solid #e2e8f0;
  border-radius: 12px;

  background-color: #f8fafc;
}

.detail-item dt {
  color: #64748b;

  font-size: 13px;
  font-weight: 700;
}

.detail-item dd {
  margin: 8px 0 0;

  color: #0f172a;

  font-size: 18px;
  font-weight: 900;
}

.detail-actions {
  display: flex;
  flex-wrap: wrap;

  gap: 10px;
}

.primary-button,
.secondary-button,
.favorite-button {
  min-height: 44px;

  padding: 10px 15px;

  border-radius: 9px;

  font: inherit;
  font-size: 14px;
  font-weight: 800;

  cursor: pointer;
}

.primary-button {
  border: 1px solid #2563eb;

  background-color: #2563eb;
  color: #ffffff;
}

.primary-button:hover {
  background-color: #1d4ed8;
}

.secondary-button {
  border: 1px solid #cbd5e1;

  background-color: #ffffff;
  color: #334155;
}

.secondary-button:hover {
  border-color: #2563eb;

  color: #1d4ed8;
}

.favorite-button {
  border: 1px solid #f59e0b;

  background-color: #fffbeb;
  color: #b45309;
}

.favorite-button:hover {
  background-color: #fef3c7;
}

.empty-state {
  display: grid;

  justify-items: start;

  gap: 14px;

  padding: 30px 0;

  color: #64748b;
}

.empty-state p {
  margin: 0;
}

@media (max-width: 900px) {
  .detail-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .error-box {
    align-items: stretch;
    flex-direction: column;
  }

  .detail-summary {
    align-items: flex-start;
    flex-direction: column-reverse;
  }

  .weather-icon {
    width: 100px;
    height: 100px;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .detail-actions {
    flex-direction: column;
  }

  .primary-button,
  .secondary-button,
  .favorite-button {
    width: 100%;
  }
}
</style>
