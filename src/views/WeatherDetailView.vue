<script setup>
import { computed, ref } from 'vue'

import { useRoute, useRouter } from 'vue-router'

import { useTemperature } from '@/composables/useTemperature'

import { useConfigStore } from '@/stores/configStore'

import { useWeatherStore } from '@/stores/weatherStore'

import { getWeatherIconUrl } from '@/utils/getWeatherIconUrl'

// ========================================
// Router
// ========================================

const route = useRoute()
const router = useRouter()

// ========================================
// Pinia Store
// ========================================

/**
 * 날씨 데이터와 즐겨찾기를 관리합니다.
 */
const weatherStore = useWeatherStore()

/**
 * 온도 단위 설정을 관리합니다.
 *
 * Store를 직접 참조하므로 단위가 변경되면
 * 템플릿에 표시되는 이름과 기호도 갱신됩니다.
 */
const configStore = useConfigStore()

// ========================================
// 화면 상태
// ========================================

/**
 * 즐겨찾기 변경 결과를
 * 스크린리더에 전달합니다.
 */
const favoriteMessage = ref('')

// ========================================
// 도시 조회
// ========================================

/**
 * weatherStore의 getter를 이용해
 * URL의 cityId와 일치하는 도시를 조회합니다.
 *
 * 예:
 * /weather/city_01
 * → city_01에 해당하는 도시
 */
const city = computed(() => {
  return weatherStore.getWeatherById(route.params.cityId)
})

// ========================================
// 날씨 아이콘
// ========================================

/**
 * OpenWeatherMap 아이콘 코드로
 * 공식 날씨 아이콘 주소를 생성합니다.
 */
const weatherIconUrl = computed(() => {
  if (!city.value) {
    return ''
  }

  return getWeatherIconUrl(city.value.weather.icon, '4x')
})

// ========================================
// 온도 원본 값
// ========================================

/**
 * useTemperature에 전달할 섭씨 원본입니다.
 *
 * 도시 정보가 없거나 값이 없으면 null을 반환합니다.
 */
const currentTemp = computed(() => {
  return city.value?.main.temp ?? null
})

const feelsLikeTemp = computed(() => {
  return city.value?.main.feelsLike ?? null
})

const minimumTemp = computed(() => {
  return city.value?.main.tempMin ?? null
})

const maximumTemp = computed(() => {
  return city.value?.main.tempMax ?? null
})

// ========================================
// 온도 단위 변환
// ========================================

/**
 * 각 온도 값에 동일한 Composable을 적용합니다.
 *
 * configStore의 unit이 변경되면
 * 네 온도 값이 동시에 다시 계산됩니다.
 */
const {
  displayTemperature: currentDisplayTemperature,

  formattedTemperature: formattedCurrentTemperature,
} = useTemperature(currentTemp)

const {
  displayTemperature: feelsLikeDisplayTemperature,

  formattedTemperature: formattedFeelsLikeTemperature,
} = useTemperature(feelsLikeTemp)

const {
  displayTemperature: minimumDisplayTemperature,

  formattedTemperature: formattedMinimumTemperature,
} = useTemperature(minimumTemp)

const {
  displayTemperature: maximumDisplayTemperature,

  formattedTemperature: formattedMaximumTemperature,
} = useTemperature(maximumTemp)

// ========================================
// 가시거리
// ========================================

/**
 * OpenWeatherMap의 가시거리 단위인 미터를
 * 킬로미터로 변환합니다.
 */
const visibilityKilometers = computed(() => {
  const visibility = city.value?.visibility

  if (visibility === null || visibility === undefined) {
    return null
  }

  return Math.round(visibility / 100) / 10
})

// ========================================
// 즐겨찾기
// ========================================

/**
 * 현재 도시의 즐겨찾기를 변경합니다.
 */
const handleToggleFavorite = () => {
  if (!city.value) {
    return
  }

  const willBeFavorite = !city.value.favorite

  weatherStore.toggleFavorite(city.value.id)

  favoriteMessage.value = willBeFavorite
    ? `${city.value.name}을 즐겨찾기에 추가했습니다.`
    : `${city.value.name}을 즐겨찾기에서 해제했습니다.`
}

// ========================================
// 이전 페이지
// ========================================

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="detail-page">
    <div class="detail-container">
      <!-- 이전 페이지 -->
      <button type="button" class="back-button" @click="goBack">
        <span aria-hidden="true"> ← </span>

        이전 페이지로 돌아가기
      </button>

      <!-- 즐겨찾기 변경 결과 음성 안내 -->
      <p class="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {{ favoriteMessage }}
      </p>

      <!-- ========================================
           정상적인 도시 정보
      ========================================= -->
      <article v-if="city" class="detail-card" :aria-labelledby="`detail-title-${city.id}`">
        <!-- 도시 제목 -->
        <header class="detail-header">
          <div class="detail-heading">
            <p class="region">
              {{ city.region }}
            </p>

            <h1 :id="`detail-title-${city.id}`">{{ city.name }} 상세 날씨</h1>

            <p class="description">
              현재 {{ city.name }}의 날씨는 {{ city.weather.description }}입니다.
            </p>

            <!--
              현재 적용 중인 온도 단위를
              화면에서도 명확하게 표시합니다.
            -->
            <p class="unit-information">
              현재 온도 단위:
              <strong>
                {{ configStore.unitLabel }}
                ({{ configStore.unitSymbol }})
              </strong>
            </p>
          </div>

          <button
            type="button"
            class="favorite-button"
            :class="{
              active: city.favorite,
            }"
            :aria-pressed="city.favorite"
            :aria-label="
              city.favorite ? `${city.name} 즐겨찾기 해제` : `${city.name} 즐겨찾기 추가`
            "
            @click="handleToggleFavorite"
          >
            <span class="favorite-icon" aria-hidden="true">
              {{ city.favorite ? '★' : '☆' }}
            </span>

            <span>
              {{ city.favorite ? '즐겨찾기 해제' : '즐겨찾기 추가' }}
            </span>
          </button>
        </header>

        <!-- ========================================
             현재 날씨 요약
        ========================================= -->
        <section class="current-weather" aria-labelledby="current-weather-title">
          <h2 id="current-weather-title" class="sr-only">현재 날씨</h2>

          <img
            v-if="weatherIconUrl"
            :src="weatherIconUrl"
            alt=""
            class="weather-icon"
            aria-hidden="true"
          />

          <div v-else class="weather-icon-placeholder" aria-hidden="true" />

          <div>
            <p class="temperature">
              <span aria-hidden="true">
                {{ formattedCurrentTemperature }}
              </span>

              <span v-if="currentDisplayTemperature !== null" class="sr-only">
                현재 기온
                {{ configStore.unitLabel }}
                {{ currentDisplayTemperature }}도
              </span>

              <span v-else class="sr-only"> 현재 기온 정보 없음 </span>
            </p>

            <p class="weather-status">
              {{ city.weather.description }}
            </p>
          </div>
        </section>

        <!-- ========================================
             상세 정보
        ========================================= -->
        <section class="weather-information" aria-labelledby="weather-information-title">
          <h2 id="weather-information-title">상세 정보</h2>

          <dl class="detail-list">
            <!-- 체감 기온 -->
            <div class="detail-item">
              <dt>체감 기온</dt>

              <dd>
                <span aria-hidden="true">
                  {{ formattedFeelsLikeTemperature }}
                </span>

                <span v-if="feelsLikeDisplayTemperature !== null" class="sr-only">
                  {{ configStore.unitLabel }}
                  {{ feelsLikeDisplayTemperature }}도
                </span>

                <span v-else class="sr-only"> 정보 없음 </span>
              </dd>
            </div>

            <!-- 최저 기온 -->
            <div class="detail-item">
              <dt>최저 기온</dt>

              <dd>
                <span aria-hidden="true">
                  {{ formattedMinimumTemperature }}
                </span>

                <span v-if="minimumDisplayTemperature !== null" class="sr-only">
                  {{ configStore.unitLabel }}
                  {{ minimumDisplayTemperature }}도
                </span>

                <span v-else class="sr-only"> 정보 없음 </span>
              </dd>
            </div>

            <!-- 최고 기온 -->
            <div class="detail-item">
              <dt>최고 기온</dt>

              <dd>
                <span aria-hidden="true">
                  {{ formattedMaximumTemperature }}
                </span>

                <span v-if="maximumDisplayTemperature !== null" class="sr-only">
                  {{ configStore.unitLabel }}
                  {{ maximumDisplayTemperature }}도
                </span>

                <span v-else class="sr-only"> 정보 없음 </span>
              </dd>
            </div>

            <!-- 습도 -->
            <div class="detail-item">
              <dt>습도</dt>

              <dd>
                <template v-if="city.main.humidity !== null">
                  <span aria-hidden="true"> {{ city.main.humidity }}% </span>

                  <span class="sr-only"> {{ city.main.humidity }}퍼센트 </span>
                </template>

                <span v-else> 정보 없음 </span>
              </dd>
            </div>

            <!-- 기압 -->
            <div class="detail-item">
              <dt>기압</dt>

              <dd>
                <template v-if="city.main.pressure !== null">
                  {{ city.main.pressure }} hPa
                </template>

                <span v-else> 정보 없음 </span>
              </dd>
            </div>

            <!-- 풍속 -->
            <div class="detail-item">
              <dt>풍속</dt>

              <dd>
                <template v-if="city.wind.speed !== null">
                  <span aria-hidden="true"> {{ city.wind.speed }} m/s </span>

                  <span class="sr-only"> 초속 {{ city.wind.speed }}미터 </span>
                </template>

                <span v-else> 정보 없음 </span>
              </dd>
            </div>

            <!-- 돌풍 -->
            <div class="detail-item">
              <dt>돌풍</dt>

              <dd>
                <template v-if="city.wind.gust !== null">
                  <span aria-hidden="true"> {{ city.wind.gust }} m/s </span>

                  <span class="sr-only"> 초속 {{ city.wind.gust }}미터 </span>
                </template>

                <span v-else> 정보 없음 </span>
              </dd>
            </div>

            <!-- 가시거리 -->
            <div class="detail-item">
              <dt>가시거리</dt>

              <dd>
                <template v-if="visibilityKilometers !== null">
                  <span aria-hidden="true"> {{ visibilityKilometers }} km </span>

                  <span class="sr-only"> {{ visibilityKilometers }}킬로미터 </span>
                </template>

                <span v-else> 정보 없음 </span>
              </dd>
            </div>
          </dl>
        </section>
      </article>

      <!-- ========================================
           도시 정보 없음
      ========================================= -->
      <section v-else class="not-found" role="alert" aria-labelledby="city-not-found-title">
        <h1 id="city-not-found-title">도시 정보를 찾을 수 없습니다</h1>

        <p>주소가 올바른지 확인하거나 날씨 홈에서 도시를 다시 선택하세요.</p>

        <RouterLink to="/" class="home-link"> 날씨 홈으로 이동 </RouterLink>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* ========================================
   전체 페이지
======================================== */

.detail-page {
  min-height: calc(100vh - 70px);
  padding: 44px clamp(24px, 5vw, 80px) 72px;

  background-color: #f5f7fb;
}

.detail-container {
  width: min(940px, 100%);
  margin: 0 auto;
}

/* ========================================
   이전 페이지 버튼
======================================== */

.back-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;

  min-height: 44px;
  margin-bottom: 22px;
  padding: 9px 15px;

  border: 1px solid #cbd5e1;
  border-radius: 10px;

  background-color: #ffffff;
  color: #334155;

  font: inherit;
  font-weight: 800;

  cursor: pointer;
}

.back-button:hover {
  background-color: #f8fafc;
}

/* ========================================
   상세 카드
======================================== */

.detail-card {
  display: flex;
  flex-direction: column;
  gap: 32px;

  padding: 36px;

  border: 1px solid #dbe3ee;
  border-radius: 22px;

  background-color: #ffffff;

  box-shadow: 0 12px 32px rgb(15 23 42 / 8%);
}

/* ========================================
   상세 페이지 제목
======================================== */

.detail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.detail-heading {
  min-width: 0;
}

.region {
  margin: 0 0 7px;

  color: #2563eb;
  font-size: 14px;
  font-weight: 850;
}

.detail-header h1 {
  margin: 0;

  color: #172033;
  font-size: clamp(29px, 5vw, 41px);
  line-height: 1.25;
}

.description {
  margin: 13px 0 0;

  color: #64748b;
  line-height: 1.7;
}

.unit-information {
  margin: 10px 0 0;

  color: #64748b;
  font-size: 14px;
}

.unit-information strong {
  color: #1d4ed8;
}

/* ========================================
   즐겨찾기
======================================== */

.favorite-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;

  flex-shrink: 0;

  min-height: 46px;
  padding: 10px 15px;

  border: 1px solid #cbd5e1;
  border-radius: 11px;

  background-color: #ffffff;
  color: #475569;

  font: inherit;
  font-weight: 850;

  cursor: pointer;
}

.favorite-button:hover,
.favorite-button.active {
  border-color: #f59e0b;
  background-color: #fffbeb;
  color: #92400e;
}

.favorite-icon {
  font-size: 21px;
  line-height: 1;
}

/* ========================================
   현재 날씨
======================================== */

.current-weather {
  display: flex;
  align-items: center;
  gap: 28px;

  padding: 34px;

  border: 1px solid #dbeafe;
  border-radius: 18px;

  background: linear-gradient(135deg, #eff6ff 0%, #e8f1ff 100%);
}

.weather-icon,
.weather-icon-placeholder {
  flex-shrink: 0;

  width: 112px;
  height: 112px;
}

.weather-icon {
  object-fit: contain;
}

.temperature {
  margin: 0;

  color: #172033;
  font-size: clamp(48px, 8vw, 68px);
  font-weight: 900;
  line-height: 1;
}

.weather-status {
  margin: 10px 0 0;

  color: #334155;
  font-size: 19px;
  font-weight: 850;
}

/* ========================================
   상세 정보
======================================== */

.weather-information h2 {
  margin: 0 0 18px;

  color: #172033;
  font-size: 23px;
}

.detail-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;

  margin: 0;
}

.detail-item {
  padding: 20px;

  border: 1px solid #dbe3ee;
  border-radius: 14px;

  background-color: #f8fafc;
}

.detail-item dt {
  color: #64748b;
  font-size: 13px;
  font-weight: 750;
}

.detail-item dd {
  margin: 8px 0 0;

  color: #172033;
  font-size: 19px;
  font-weight: 900;
}

/* ========================================
   도시 없음
======================================== */

.not-found {
  padding: 48px 24px;

  border: 1px solid #dbe3ee;
  border-radius: 18px;

  background-color: #ffffff;

  text-align: center;
}

.not-found h1 {
  margin: 0;

  color: #172033;
}

.not-found p {
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

.home-link:hover {
  background-color: #1d4ed8;
}

/* ========================================
   태블릿 및 모바일
======================================== */

@media (max-width: 650px) {
  .detail-page {
    padding: 30px 16px 48px;
  }

  .detail-card {
    gap: 26px;
    padding: 24px;
  }

  .detail-header {
    flex-direction: column;
  }

  .favorite-button {
    width: 100%;
  }

  .current-weather {
    gap: 20px;
    padding: 26px;
  }

  .weather-icon,
  .weather-icon-placeholder {
    width: 88px;
    height: 88px;
  }

  .detail-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 420px) {
  .current-weather {
    align-items: flex-start;
    flex-direction: column;
  }

  .back-button {
    width: 100%;
  }
}
</style>
