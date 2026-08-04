<script setup>
import { computed, ref } from 'vue'

import { useRoute, useRouter } from 'vue-router'

import { weatherList, toggleFavorite } from '@/state/weatherState'

import { getWeatherIconUrl } from '@/utils/getWeatherIconUrl'

const route = useRoute()
const router = useRouter()

const favoriteMessage = ref('')

const city = computed(() => {
  return weatherList.value.find((item) => {
    return item.id === route.params.cityId
  })
})

const weatherIconUrl = computed(() => {
  if (!city.value) {
    return ''
  }

  return getWeatherIconUrl(city.value.weather.icon, '4x')
})

const visibilityKilometers = computed(() => {
  if (city.value?.visibility === null || city.value?.visibility === undefined) {
    return null
  }

  return Math.round(city.value.visibility / 100) / 10
})

const handleToggleFavorite = () => {
  if (!city.value) {
    return
  }

  const willBeFavorite = !city.value.favorite

  toggleFavorite(city.value.id)

  favoriteMessage.value = willBeFavorite
    ? `${city.value.name}을 즐겨찾기에 추가했습니다.`
    : `${city.value.name}을 즐겨찾기에서 해제했습니다.`
}

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="detail-page">
    <div class="detail-container">
      <button type="button" class="back-button" @click="goBack">
        <span aria-hidden="true"> ← </span>

        이전 페이지로 돌아가기
      </button>

      <p class="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {{ favoriteMessage }}
      </p>

      <article v-if="city" class="detail-card" :aria-labelledby="`detail-title-${city.id}`">
        <header class="detail-header">
          <div>
            <p class="region">
              {{ city.region }}
            </p>

            <h1 :id="`detail-title-${city.id}`">{{ city.name }} 상세 날씨</h1>

            <p class="description">
              현재 {{ city.name }}의 날씨는 {{ city.weather.description }}입니다.
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

            {{ city.favorite ? '즐겨찾기 해제' : '즐겨찾기 추가' }}
          </button>
        </header>

        <section class="current-weather" aria-labelledby="current-weather-title">
          <h2 id="current-weather-title" class="sr-only">현재 날씨</h2>

          <img
            v-if="weatherIconUrl"
            :src="weatherIconUrl"
            alt=""
            class="weather-icon"
            aria-hidden="true"
          />

          <div>
            <p class="temperature">
              <template v-if="city.main.temp !== null">
                <span aria-hidden="true"> {{ city.main.temp }}℃ </span>

                <span class="sr-only">
                  현재 기온 섭씨
                  {{ city.main.temp }}도
                </span>
              </template>

              <span v-else> 기온 정보 없음 </span>
            </p>

            <p class="weather-status">
              {{ city.weather.description }}
            </p>
          </div>
        </section>

        <section class="weather-information" aria-labelledby="weather-information-title">
          <h2 id="weather-information-title">상세 정보</h2>

          <dl class="detail-list">
            <div class="detail-item">
              <dt>체감 기온</dt>

              <dd>
                <template v-if="city.main.feelsLike !== null">
                  {{ city.main.feelsLike }}℃
                </template>

                <span v-else> 정보 없음 </span>
              </dd>
            </div>

            <div class="detail-item">
              <dt>최저 기온</dt>

              <dd>
                <template v-if="city.main.tempMin !== null"> {{ city.main.tempMin }}℃ </template>

                <span v-else> 정보 없음 </span>
              </dd>
            </div>

            <div class="detail-item">
              <dt>최고 기온</dt>

              <dd>
                <template v-if="city.main.tempMax !== null"> {{ city.main.tempMax }}℃ </template>

                <span v-else> 정보 없음 </span>
              </dd>
            </div>

            <div class="detail-item">
              <dt>습도</dt>

              <dd>
                <template v-if="city.main.humidity !== null"> {{ city.main.humidity }}% </template>

                <span v-else> 정보 없음 </span>
              </dd>
            </div>

            <div class="detail-item">
              <dt>기압</dt>

              <dd>
                <template v-if="city.main.pressure !== null">
                  {{ city.main.pressure }} hPa
                </template>

                <span v-else> 정보 없음 </span>
              </dd>
            </div>

            <div class="detail-item">
              <dt>풍속</dt>

              <dd>
                <template v-if="city.wind.speed !== null"> {{ city.wind.speed }} m/s </template>

                <span v-else> 정보 없음 </span>
              </dd>
            </div>

            <div class="detail-item">
              <dt>돌풍</dt>

              <dd>
                <template v-if="city.wind.gust !== null"> {{ city.wind.gust }} m/s </template>

                <span v-else> 정보 없음 </span>
              </dd>
            </div>

            <div class="detail-item">
              <dt>가시거리</dt>

              <dd>
                <template v-if="visibilityKilometers !== null">
                  {{ visibilityKilometers }} km
                </template>

                <span v-else> 정보 없음 </span>
              </dd>
            </div>
          </dl>
        </section>
      </article>

      <section v-else class="not-found" role="alert">
        <h1>도시 정보를 찾을 수 없습니다</h1>

        <p>주소가 올바른지 확인하거나 날씨 홈에서 도시를 다시 선택하세요.</p>

        <RouterLink to="/" class="home-link"> 날씨 홈으로 이동 </RouterLink>
      </section>
    </div>
  </div>
</template>

<style scoped>
.detail-page {
  min-height: calc(100vh - 70px);
  padding: 44px clamp(24px, 5vw, 80px) 72px;

  background-color: #f5f7fb;
}

.detail-container {
  width: min(940px, 100%);
  margin: 0 auto;
}

.back-button {
  display: inline-flex;
  align-items: center;
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

.detail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
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
}

.description {
  margin: 13px 0 0;

  color: #64748b;
  line-height: 1.7;
}

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
}

.current-weather {
  display: flex;
  align-items: center;
  gap: 28px;

  padding: 34px;

  border: 1px solid #dbeafe;
  border-radius: 18px;

  background: linear-gradient(135deg, #eff6ff 0%, #e8f1ff 100%);
}

.weather-icon {
  flex-shrink: 0;

  width: 112px;
  height: 112px;

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

  .weather-icon {
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
    justify-content: center;
  }
}
</style>
