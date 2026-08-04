<script setup>
import { ref } from 'vue'

import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

import WeatherCard from '@/components/exercise/WeatherCard.vue'

import { useWeatherStore } from '@/stores/weatherStore'

// ========================================
// Router
// ========================================

const router = useRouter()

// ========================================
// Pinia Store
// ========================================

/**
 * 날씨와 즐겨찾기를 관리하는 Store입니다.
 */
const weatherStore = useWeatherStore()

/**
 * Store getter는 storeToRefs로 꺼내야
 * 반응성이 유지됩니다.
 */
const { favoriteWeatherList, favoriteCount } = storeToRefs(weatherStore)

// ========================================
// 화면 상태
// ========================================

/**
 * 즐겨찾기 변경 결과를
 * 스크린리더에 전달합니다.
 */
const favoriteMessage = ref('')

// ========================================
// 즐겨찾기
// ========================================

/**
 * 즐겨찾기 상태를 Pinia action으로 변경합니다.
 *
 * 즐겨찾기 페이지에서 해제하면
 * 해당 카드는 목록에서 즉시 사라집니다.
 *
 * @param {Object} city
 */
const handleToggleFavorite = (city) => {
  const willBeFavorite = !city.favorite

  weatherStore.toggleFavorite(city.id)

  favoriteMessage.value = willBeFavorite
    ? `${city.name}을 즐겨찾기에 추가했습니다.`
    : `${city.name}을 즐겨찾기에서 해제했습니다.`
}

// ========================================
// 상세 페이지 이동
// ========================================

/**
 * 선택한 도시의 상세 페이지로 이동합니다.
 *
 * @param {string} cityId
 */
const moveToDetail = (cityId) => {
  router.push({
    name: 'weather-detail',

    params: {
      cityId,
    },
  })
}
</script>

<template>
  <div class="favorites-page">
    <div class="favorites-container">
      <!-- ========================================
           페이지 제목
      ========================================= -->
      <header class="page-header">
        <h1>즐겨찾기 도시</h1>

        <p>관심 있는 도시의 현재 날씨를 한곳에서 확인할 수 있습니다.</p>
      </header>

      <!--
        즐겨찾기 개수가 변경되면
        스크린리더가 변경 내용을 읽어줍니다.
      -->
      <p class="result-status" role="status" aria-live="polite" aria-atomic="true">
        즐겨찾기한 도시
        <strong>{{ favoriteCount }}</strong
        >개가 표시되었습니다.
      </p>

      <!-- 즐겨찾기 변경 결과 음성 안내 -->
      <p class="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {{ favoriteMessage }}
      </p>

      <!-- ========================================
           즐겨찾기 카드 목록
      ========================================= -->
      <section v-if="favoriteCount > 0" aria-labelledby="favorite-list-title">
        <h2 id="favorite-list-title" class="sr-only">즐겨찾기 도시 목록</h2>

        <div class="weather-grid">
          <WeatherCard
            v-for="city in favoriteWeatherList"
            :key="city.id"
            :city="city"
            @click-detail="moveToDetail"
            @toggle-favorite="handleToggleFavorite"
          />
        </div>
      </section>

      <!-- ========================================
           즐겨찾기 없음
      ========================================= -->
      <section v-else class="empty-state" aria-labelledby="favorite-empty-title">
        <h2 id="favorite-empty-title">즐겨찾기한 도시가 없습니다</h2>

        <p>
          날씨 홈에서 도시 카드의 ‘즐겨찾기 추가’ 버튼을 누르면 이곳에서 관심 도시를 모아 볼 수
          있습니다.
        </p>

        <RouterLink to="/" class="home-link"> 날씨 홈으로 이동 </RouterLink>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* ========================================
   전체 페이지
======================================== */

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

/* ========================================
   페이지 제목
======================================== */

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

/* ========================================
   결과 안내
======================================== */

.result-status {
  margin: 0 0 20px;

  color: #475569;
  font-weight: 700;
}

.result-status strong {
  color: #1d4ed8;
}

/* ========================================
   즐겨찾기 카드 목록
======================================== */

.weather-grid {
  display: grid;

  grid-template-columns: repeat(3, minmax(0, 1fr));

  gap: 32px 22px;

  width: 100%;
}

/*
  즐겨찾기가 하나뿐일 때
  카드가 전체 너비로 늘어나지 않도록 합니다.
*/
.weather-grid > :only-child {
  width: 100%;
  max-width: 420px;
}

/* ========================================
   빈 상태
======================================== */

.empty-state {
  padding: 48px 24px;

  border: 1px solid #dbe3ee;
  border-radius: 18px;

  background-color: #ffffff;

  box-shadow: 0 8px 24px rgb(15 23 42 / 6%);

  text-align: center;
}

.empty-state h2 {
  margin: 0;

  color: #172033;
  font-size: 23px;
}

.empty-state p {
  max-width: 520px;
  margin: 13px auto 0;

  color: #64748b;
  line-height: 1.75;
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

.home-link:hover {
  background-color: #1d4ed8;
}

/* ========================================
   태블릿
======================================== */

@media (max-width: 1100px) {
  .weather-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .weather-grid > :only-child {
    max-width: 400px;
  }
}

/* ========================================
   모바일
======================================== */

@media (max-width: 600px) {
  .favorites-page {
    padding: 24px 16px 40px;
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
