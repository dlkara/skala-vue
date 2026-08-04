<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { weatherData } from '@/data/weatherData'

// 현재 경로 정보
const route = useRoute()

// 뒤로 가기 및 다른 페이지 이동
const router = useRouter()

/**
 * URL 예:
 * /weather/city_01
 *
 * route.params.cityId:
 * city_01
 */
const cityId = computed(() => {
  return String(route.params.cityId)
})

/**
 * URL의 cityId와 일치하는 도시 검색
 */
const city = computed(() => {
  return weatherData.find((item) => {
    return item.id === cityId.value
  })
})

const getWeatherAdvice = (targetCity) => {
  if (!targetCity) {
    return ''
  }

  if (['rain', 'shower', 'rainSnow'].includes(targetCity.weatherCode)) {
    return '우산을 챙기고 미끄러운 길을 조심하세요.'
  }

  if (targetCity.temp >= 30) {
    return '야외 활동을 줄이고 수분을 충분히 섭취하세요.'
  }

  if (targetCity.weatherCode === 'wind' || targetCity.wind >= 7) {
    return '강한 바람에 날릴 수 있는 물건을 주의하세요.'
  }

  if (targetCity.weatherCode === 'clear' && targetCity.temp >= 25) {
    return '자외선 차단제를 준비하고 물을 자주 마시세요.'
  }

  return '가벼운 외출이나 산책을 하기 좋은 날씨입니다.'
}

const goHome = () => {
  router.push({
    name: 'weather-home',
  })
}

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="detail-page">
    <main class="detail-container">
      <!-- 정상적인 도시 ID인 경우 -->
      <template v-if="city">
        <header class="detail-header">
          <div>
            <p class="region-label">
              {{ city.region }}
            </p>

            <h1>{{ city.name }} 상세 날씨</h1>

            <p class="description">
              {{ city.description }}
            </p>
          </div>

          <span class="large-weather-icon" aria-hidden="true">
            {{ city.icon }}
          </span>
        </header>

        <section class="temperature-summary">
          <div>
            <span>현재 기온</span>

            <strong> {{ city.temp }}℃ </strong>
          </div>

          <span v-if="city.temp >= 25" class="temperature-badge hot-badge"> 더움 </span>

          <span v-else class="temperature-badge cool-badge"> 선선함 </span>
        </section>

        <section class="detail-card">
          <h2>상세 관측 정보</h2>

          <dl class="weather-information">
            <div>
              <dt>날씨 상태</dt>
              <dd>{{ city.status }}</dd>
            </div>

            <div>
              <dt>최저 기온</dt>
              <dd>{{ city.tempMin }}℃</dd>
            </div>

            <div>
              <dt>최고 기온</dt>
              <dd>{{ city.tempMax }}℃</dd>
            </div>

            <div>
              <dt>습도</dt>
              <dd>{{ city.humidity }}%</dd>
            </div>

            <div>
              <dt>풍속</dt>
              <dd>{{ city.wind }}m/s</dd>
            </div>

            <div>
              <dt>위도·경도</dt>
              <dd>
                {{ city.lat }},
                {{ city.lon }}
              </dd>
            </div>

            <div>
              <dt>기상청 격자</dt>
              <dd>nx {{ city.nx }}, ny {{ city.ny }}</dd>
            </div>
          </dl>
        </section>

        <section class="advice-card">
          <h2>날씨 안내</h2>

          <p>
            {{ getWeatherAdvice(city) }}
          </p>
        </section>

        <div class="page-actions">
          <button type="button" class="secondary-button" @click="goBack">이전 페이지</button>

          <button type="button" class="primary-button" @click="goHome">메인 대시보드</button>
        </div>
      </template>

      <!-- 존재하지 않는 cityId인 경우 -->
      <section v-else class="invalid-city">
        <h1>도시 정보를 찾을 수 없습니다.</h1>

        <p>URL의 도시 코드가 올바르지 않습니다.</p>

        <button type="button" class="primary-button" @click="goHome">메인 대시보드로 이동</button>
      </section>
    </main>
  </div>
</template>

<style scoped>
.detail-page {
  min-height: calc(100vh - 70px);
  padding: 48px clamp(24px, 5vw, 80px) 64px;
  background-color: #f5f7fb;
}

.detail-container {
  width: min(820px, 100%);
  margin: 0 auto;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;

  margin-bottom: 24px;
  padding: 30px;

  border: 1px solid #dbe3ee;
  border-radius: 20px;

  background-color: #ffffff;
  box-shadow: 0 10px 30px rgb(15 23 42 / 8%);
}

.region-label {
  margin: 0 0 6px;
  color: #2563eb;
  font-weight: 800;
}

.detail-header h1 {
  margin: 0;
  color: #172033;
  font-size: clamp(28px, 4vw, 40px);
}

.description {
  margin: 8px 0 0;
  color: #64748b;
}

.large-weather-icon {
  flex-shrink: 0;
  font-size: 76px;
}

.temperature-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;

  margin-bottom: 24px;
  padding: 24px;

  border-radius: 16px;
  background-color: #eff6ff;
}

.temperature-summary div {
  display: flex;
  align-items: center;
  gap: 12px;
}

.temperature-summary span {
  color: #475569;
  font-weight: 700;
}

.temperature-summary strong {
  color: #172033;
  font-size: 34px;
}

.temperature-badge {
  padding: 7px 14px;
  border: 1px solid;
  border-radius: 999px;
  font-weight: 800;
}

.hot-badge {
  border-color: #fecaca;
  background-color: #fee2e2;
  color: #b91c1c;
}

.cool-badge {
  border-color: #bfdbfe;
  background-color: #dbeafe;
  color: #1d4ed8;
}

.detail-card,
.advice-card {
  margin-bottom: 24px;
  padding: 26px;

  border: 1px solid #dbe3ee;
  border-radius: 16px;

  background-color: #ffffff;
}

.detail-card h2,
.advice-card h2 {
  margin: 0 0 18px;
  color: #172033;
  font-size: 21px;
}

.weather-information {
  margin: 0;
}

.weather-information div {
  display: flex;
  justify-content: space-between;
  gap: 20px;

  padding: 13px 0;
  border-bottom: 1px solid #e2e8f0;
}

.weather-information div:last-child {
  border-bottom: 0;
}

.weather-information dt {
  color: #475569;
  font-weight: 700;
}

.weather-information dd {
  margin: 0;
  color: #172033;
  font-weight: 700;
}

.advice-card {
  background-color: #fff7ed;
  color: #9a3412;
}

.advice-card p {
  margin: 0;
  line-height: 1.7;
}

.page-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.page-actions button,
.invalid-city button {
  min-height: 44px;
  padding: 10px 16px;

  border-radius: 9px;

  font: inherit;
  font-weight: 800;
  cursor: pointer;
}

.primary-button {
  border: 1px solid #2563eb;
  background-color: #2563eb;
  color: #ffffff;
}

.secondary-button {
  border: 1px solid #cbd5e1;
  background-color: #ffffff;
  color: #334155;
}

.invalid-city {
  padding: 50px 24px;
  border-radius: 18px;
  background-color: #ffffff;
  text-align: center;
}

.invalid-city h1 {
  margin: 0;
  color: #172033;
}

.invalid-city p {
  margin: 12px 0 24px;
  color: #64748b;
}

@media (max-width: 600px) {
  .detail-page {
    padding: 28px 16px 40px;
  }

  .detail-header {
    align-items: flex-start;
  }

  .large-weather-icon {
    font-size: 54px;
  }

  .temperature-summary {
    align-items: flex-start;
    flex-direction: column;
  }

  .weather-information div {
    align-items: flex-start;
    flex-direction: column;
    gap: 5px;
  }

  .page-actions {
    flex-direction: column-reverse;
  }

  .page-actions button {
    width: 100%;
  }
}
</style>
