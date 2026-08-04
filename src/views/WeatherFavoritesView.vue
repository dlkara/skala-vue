<script setup>
import { computed, ref } from 'vue'

import { useRouter } from 'vue-router'

import WeatherCard from '@/components/exercise/WeatherCard.vue'

import { weatherList, toggleFavorite } from '@/state/weatherState'

const router = useRouter()

const favoriteMessage = ref('')

const favoriteWeatherList = computed(() => {
  return weatherList.value.filter((city) => city.favorite)
})

const handleToggleFavorite = (city) => {
  const willBeFavorite = !city.favorite

  toggleFavorite(city.id)

  favoriteMessage.value = willBeFavorite
    ? `${city.name}을 즐겨찾기에 추가했습니다.`
    : `${city.name}을 즐겨찾기에서 해제했습니다.`
}

const moveToDetail = (cityId) => {
  router.push({
    name: 'weather-detail',

    params: {
      cityId,
    },
  })
}

const selectCity = () => {
  /**
   * 즐겨찾기 화면에서는 선택 상태를 별도로
   * 관리하지 않으므로 비워둡니다.
   */
}
</script>

<template>
  <div class="favorites-page">
    <div class="favorites-container">
      <header class="page-header">
        <h1>즐겨찾기 도시</h1>

        <p>관심 있는 도시의 날씨를 한곳에서 확인할 수 있습니다.</p>
      </header>

      <p class="result-status" role="status" aria-live="polite">
        즐겨찾기한 도시
        {{ favoriteWeatherList.length }}개가 표시되었습니다.
      </p>

      <p class="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {{ favoriteMessage }}
      </p>

      <div v-if="favoriteWeatherList.length > 0" class="weather-grid">
        <WeatherCard
          v-for="city in favoriteWeatherList"
          :key="city.id"
          :city="city"
          @select-card="selectCity"
          @click-detail="moveToDetail"
          @toggle-favorite="handleToggleFavorite"
        />
      </div>

      <section v-else class="empty-state">
        <h2>즐겨찾기한 도시가 없습니다</h2>

        <p>날씨 홈에서 ‘즐겨찾기 추가’ 버튼을 누르면 이곳에서 도시를 모아 볼 수 있습니다.</p>

        <RouterLink to="/" class="home-link"> 날씨 홈으로 이동 </RouterLink>
      </section>
    </div>
  </div>
</template>

<style scoped>
.favorites-page {
  min-height: calc(100vh - 70px);
  padding: 40px clamp(24px, 5vw, 80px) 64px;

  background-color: #f5f7fb;
}

.favorites-container {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0;

  color: #172033;
  font-size: clamp(26px, 3vw, 36px);
}

.page-header p {
  margin: 9px 0 0;

  color: #64748b;
  line-height: 1.6;
}

.result-status {
  margin: 0 0 20px;

  color: #475569;
  font-weight: 700;
}

.weather-grid {
  display: grid;

  grid-template-columns: repeat(auto-fill, minmax(270px, 420px));

  justify-content: start;

  gap: 32px 22px;
}

.empty-state {
  padding: 48px 24px;

  border: 1px solid #dbe3ee;
  border-radius: 18px;

  background-color: #ffffff;

  text-align: center;
}

.empty-state h2 {
  margin: 0;

  color: #172033;
}

.empty-state p {
  margin: 13px 0 0;

  color: #64748b;
  line-height: 1.7;
}

.home-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-height: 44px;
  margin-top: 22px;
  padding: 9px 17px;

  border-radius: 9px;

  background-color: #2563eb;
  color: #ffffff;

  font-weight: 850;
  text-decoration: none;
}

@media (max-width: 600px) {
  .favorites-page {
    padding: 24px 16px 40px;
  }

  .weather-grid {
    grid-template-columns: 1fr;
  }
}
</style>
