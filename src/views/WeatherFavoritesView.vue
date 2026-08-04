<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'

import { weatherList, toggleFavorite } from '@/state/weatherState'

const router = useRouter()

/**
 * 전체 날씨 데이터 중 favorite가 true인 도시만 반환합니다.
 */
const favoriteWeatherList = computed(() => {
  return weatherList.value.filter((city) => {
    return city.favorite
  })
})

/**
 * 상세정보 버튼 클릭 시
 * 해당 도시의 동적 상세 경로로 이동합니다.
 */
const moveToDetail = (cityId) => {
  router.push({
    name: 'weather-detail',
    params: {
      cityId,
    },
  })
}

/**
 * 즐겨찾기 페이지에서는 별 표시를 다시 클릭하면
 * 해당 도시가 목록에서 즉시 제거됩니다.
 */
const handleToggleFavorite = (city) => {
  toggleFavorite(city.id)
}
</script>

<template>
  <div class="favorites-page">
    <main class="favorites-container">
      <header class="page-header">
        <div>
          <p class="eyebrow">FAVORITES</p>

          <h1>즐겨찾는 지역</h1>

          <p>메인 대시보드에서 저장한 도시의 날씨를 한곳에서 확인할 수 있습니다.</p>
        </div>

        <span class="favorite-count"> {{ favoriteWeatherList.length }}개 도시 </span>
      </header>

      <BaseDashboardCard title="즐겨찾기 날씨 현황">
        <div v-if="favoriteWeatherList.length > 0" class="weather-grid">
          <WeatherCard
            v-for="city in favoriteWeatherList"
            :key="city.id"
            :city="city"
            :selected="false"
            :searched="false"
            @click-detail="moveToDetail"
            @toggle-favorite="handleToggleFavorite"
          />
        </div>

        <div v-else class="empty-favorites">
          <p class="empty-icon">☆</p>

          <h2>즐겨찾기한 도시가 없습니다.</h2>

          <p>메인 대시보드에서 관심 있는 도시를 즐겨찾기에 추가해 보세요.</p>

          <RouterLink to="/" class="home-link"> 메인 대시보드로 이동 </RouterLink>
        </div>
      </BaseDashboardCard>
    </main>
  </div>
</template>

<style scoped>
.favorites-page {
  min-height: calc(100vh - 70px);
  padding: 40px clamp(24px, 5vw, 80px) 64px;
  background-color: #f5f7fb;
  color: #1f2937;
}

.favorites-page *,
.favorites-page *::before,
.favorites-page *::after {
  box-sizing: border-box;
}

.favorites-container {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 34px;
}

.eyebrow {
  margin: 0 0 6px;
  color: #d97706;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.page-header h1 {
  margin: 0;
  color: #172033;
  font-size: clamp(26px, 3vw, 36px);
}

.page-header div > p:last-child {
  margin: 9px 0 0;
  color: #64748b;
  line-height: 1.6;
}

.favorite-count {
  flex-shrink: 0;
  padding: 9px 13px;
  border-radius: 999px;
  background-color: #fef3c7;
  color: #92400e;
  font-size: 14px;
  font-weight: 800;
}

.weather-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
  gap: 22px;
}

.empty-favorites {
  padding: 44px 20px;
  text-align: center;
}

.empty-icon {
  margin: 0;
  color: #d97706;
  font-size: 54px;
  line-height: 1;
}

.empty-favorites h2 {
  margin: 14px 0 0;
  color: #172033;
  font-size: 22px;
}

.empty-favorites > p:not(.empty-icon) {
  margin: 10px 0 24px;
  color: #64748b;
  line-height: 1.6;
}

.home-link {
  display: inline-block;
  padding: 11px 16px;
  border-radius: 9px;
  background-color: #2563eb;
  color: #ffffff;
  font-weight: 800;
  text-decoration: none;
}

@media (max-width: 900px) {
  .weather-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .favorites-page {
    padding: 24px 16px 40px;
  }

  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .weather-grid {
    grid-template-columns: 1fr;
  }
}
</style>
