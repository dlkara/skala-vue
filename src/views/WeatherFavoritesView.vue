<script setup>
import { onMounted, ref } from 'vue'

import { storeToRefs } from 'pinia'

import { useRouter } from 'vue-router'

import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'

import { useWeatherStore } from '@/stores/weatherStore'

// ========================================
// Router 및 Store
// ========================================

const router = useRouter()

const weatherStore = useWeatherStore()

const { favoriteWeatherList, favoriteCount, isLoading, errorMessage } = storeToRefs(weatherStore)

/**
 * 즐겨찾기 해제 결과를
 * 스크린리더에 전달할 메시지입니다.
 */
const favoriteMessage = ref('')

// ========================================
// 이벤트
// ========================================

/**
 * 상세 페이지로 이동합니다.
 */
const moveToDetail = (city) => {
  router.push({
    name: 'weather-detail',

    params: {
      cityId: city.id,
    },
  })
}

/**
 * 즐겨찾기 상태를 변경합니다.
 *
 * 이 화면에서는 현재 즐겨찾기 도시만 보이므로
 * 해제하면 해당 카드가 목록에서 바로 사라집니다.
 */
const handleToggleFavorite = (city) => {
  const willBeFavorite = !city.favorite

  weatherStore.toggleFavorite(city.id)

  favoriteMessage.value = willBeFavorite
    ? `${city.name}을 즐겨찾기에 추가했습니다.`
    : `${city.name}을 즐겨찾기에서 해제했습니다.`
}

/**
 * 홈 화면으로 이동합니다.
 */
const moveToHome = () => {
  router.push({
    name: 'weather-home',
  })
}

// ========================================
// 최초 API 요청
// ========================================

/**
 * 사용자가 /favorites 주소로 바로 접속해도
 * 날씨 목록을 불러올 수 있도록 API를 호출합니다.
 *
 * Store의 hasFetched 조건 때문에
 * 이미 불러온 경우에는 중복 요청하지 않습니다.
 */
onMounted(() => {
  weatherStore.fetchAllWeather()
})
</script>

<template>
  <section class="favorites-view page-container">
    <header class="page-header">
      <p class="page-eyebrow">Favorite Cities</p>

      <h1 class="page-title">즐겨찾기 도시</h1>

      <p class="page-description">즐겨찾기에 등록한 도시의 현재 날씨를 모아서 확인합니다.</p>
    </header>

    <BaseDashboardCard :title="`즐겨찾기 목록 (${favoriteCount})`">
      <p v-if="isLoading" class="loading-message" role="status" aria-live="polite">
        즐겨찾기 도시의 날씨를 불러오고 있습니다.
      </p>

      <div v-else-if="errorMessage" class="error-box" role="alert">
        <p>
          {{ errorMessage }}
        </p>

        <button type="button" class="primary-button" @click="weatherStore.refreshWeather()">
          다시 불러오기
        </button>
      </div>

      <div v-else-if="favoriteWeatherList.length > 0" class="weather-grid">
        <WeatherCard
          v-for="city in favoriteWeatherList"
          :key="city.id"
          :city="city"
          :selected="false"
          @click-detail="moveToDetail"
          @toggle-favorite="handleToggleFavorite"
        />
      </div>

      <div v-else class="empty-state">
        <p>아직 즐겨찾기에 등록한 도시가 없습니다.</p>

        <button type="button" class="primary-button" @click="moveToHome">날씨 도시 확인하기</button>
      </div>

      <p class="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {{ favoriteMessage }}
      </p>
    </BaseDashboardCard>
  </section>
</template>

<style scoped>
.favorites-view {
  display: grid;
  gap: 24px;

  width: 100%;
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

.primary-button {
  min-height: 42px;

  padding: 9px 14px;

  border: 1px solid #2563eb;
  border-radius: 9px;

  background-color: #2563eb;
  color: #ffffff;

  font: inherit;
  font-size: 13px;
  font-weight: 800;

  cursor: pointer;
}

.primary-button:hover {
  background-color: #1d4ed8;
}

.weather-grid {
  display: grid;

  grid-template-columns: repeat(3, minmax(0, 1fr));

  gap: 32px 22px;

  width: 100%;
}

.weather-grid > :only-child {
  width: 100%;
  max-width: 420px;
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

@media (max-width: 1100px) {
  .weather-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .weather-grid > :only-child {
    max-width: 400px;
  }
}

@media (max-width: 600px) {
  .error-box {
    align-items: stretch;
    flex-direction: column;
  }

  .primary-button {
    width: 100%;
  }

  .weather-grid {
    grid-template-columns: 1fr;

    row-gap: 32px;
  }

  .weather-grid > :only-child {
    max-width: none;
  }
}
</style>
