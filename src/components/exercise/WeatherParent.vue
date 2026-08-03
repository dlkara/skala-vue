<script setup>
import { computed, ref, watch, watchEffect } from 'vue'

import BaseDashboardCard from './BaseDashboardCard.vue'
import SearchBar from './SearchBar.vue'
import WeatherCard from './WeatherCard.vue'

// =========================
// 날씨 데이터
// 모든 반응형 데이터는 부모에서 관리
// =========================

const weatherList = ref([
  {
    id: 'city_01',
    name: '서울',
    chosung: 'ㅅㅇ',
    temp: 28,
    status: '맑음',
    icon: '☀️',
    humidity: 62,
    wind: 2.4,
    favorite: false,
  },
  {
    id: 'city_02',
    name: '수원',
    chosung: 'ㅅㅇ',
    temp: 24,
    status: '비',
    icon: '🌧️',
    humidity: 81,
    wind: 3.7,
    favorite: false,
  },
  {
    id: 'city_03',
    name: '부산',
    chosung: 'ㅂㅅ',
    temp: 26,
    status: '구름',
    icon: '☁️',
    humidity: 73,
    wind: 4.2,
    favorite: false,
  },
  {
    id: 'city_04',
    name: '인천',
    chosung: 'ㅇㅊ',
    temp: 25,
    status: '흐림',
    icon: '🌥️',
    humidity: 76,
    wind: 5.1,
    favorite: false,
  },
  {
    id: 'city_05',
    name: '대전',
    chosung: 'ㄷㅈ',
    temp: 29,
    status: '맑음',
    icon: '☀️',
    humidity: 58,
    wind: 1.8,
    favorite: false,
  },
  {
    id: 'city_06',
    name: '대구',
    chosung: 'ㄷㄱ',
    temp: 31,
    status: '폭염',
    icon: '🥵',
    humidity: 55,
    wind: 2.0,
    favorite: false,
  },
  {
    id: 'city_07',
    name: '광주',
    chosung: 'ㄱㅈ',
    temp: 27,
    status: '소나기',
    icon: '🌦️',
    humidity: 79,
    wind: 3.3,
    favorite: false,
  },
  {
    id: 'city_08',
    name: '울산',
    chosung: 'ㅇㅅ',
    temp: 26,
    status: '구름',
    icon: '☁️',
    humidity: 70,
    wind: 4.8,
    favorite: false,
  },
  {
    id: 'city_09',
    name: '강릉',
    chosung: 'ㄱㄹ',
    temp: 23,
    status: '맑음',
    icon: '🌤️',
    humidity: 66,
    wind: 5.6,
    favorite: false,
  },
  {
    id: 'city_10',
    name: '제주',
    chosung: 'ㅈㅈ',
    temp: 25,
    status: '강풍',
    icon: '💨',
    humidity: 84,
    wind: 8.7,
    favorite: false,
  },
])

// =========================
// 검색
// =========================

const searchQuery = ref('')

const updateSearchQuery = (newQuery) => {
  searchQuery.value = newQuery
}

const filteredWeatherList = computed(() => {
  const keyword = searchQuery.value.trim()

  if (keyword === '') {
    return weatherList.value
  }

  return weatherList.value.filter((city) => {
    return city.name.includes(keyword) || city.chosung.includes(keyword)
  })
})

// =========================
// 필터
// =========================

const filterOption = ref('all')

const filterLabels = {
  all: '전체 도시',
  hot: '더운 지역',
  cool: '선선한 지역',
  rain: '비 오는 지역',
  sunny: '맑은 지역',
  windy: '바람이 강한 지역',
  favorite: '즐겨찾기한 지역',
}

const displayedWeatherList = computed(() => {
  const list = filteredWeatherList.value

  if (filterOption.value === 'hot') {
    return list.filter((city) => city.temp >= 25)
  }

  if (filterOption.value === 'cool') {
    return list.filter((city) => city.temp < 25)
  }

  if (filterOption.value === 'rain') {
    return list.filter((city) => {
      return city.status === '비' || city.status === '소나기'
    })
  }

  if (filterOption.value === 'sunny') {
    return list.filter((city) => {
      return city.status === '맑음'
    })
  }

  if (filterOption.value === 'windy') {
    return list.filter((city) => {
      return city.status === '강풍' || city.wind >= 5
    })
  }

  if (filterOption.value === 'favorite') {
    return list.filter((city) => city.favorite)
  }

  return list
})

// =========================
// 도시 선택 및 상세보기
// =========================

const selectedCityInfo = ref('')
const selectedCityDetail = ref(null)

const selectCity = (city) => {
  selectedCityInfo.value = city.name
}

const showDetail = (city) => {
  selectedCityInfo.value = city.name
  selectedCityDetail.value = city
}

const closeDetail = () => {
  selectedCityDetail.value = null
}

// =========================
// 즐겨찾기
// 실제 데이터 변경은 부모가 담당
// =========================

const toggleFavorite = (city) => {
  city.favorite = !city.favorite
}

// =========================
// 검색 결과 카드 표시 여부
// =========================

const isSearchedCity = (city) => {
  const keyword = searchQuery.value.trim()

  if (keyword === '') {
    return false
  }

  return city.name.includes(keyword) || city.chosung.includes(keyword)
}

// =========================
// 날씨 안내 문구
// =========================

const getWeatherAdvice = (city) => {
  if (!city) {
    return ''
  }

  if (city.status === '비' || city.status === '소나기') {
    return '우산을 챙기고 미끄러운 길을 조심하세요.'
  }

  if (city.status === '폭염') {
    return '야외 활동을 줄이고 수분을 충분히 섭취하세요.'
  }

  if (city.status === '강풍') {
    return '강한 바람에 날릴 수 있는 물건을 주의하세요.'
  }

  if (city.status === '맑음' && city.temp >= 25) {
    return '자외선 차단제를 준비하고 물을 자주 마시세요.'
  }

  return '가벼운 외출이나 산책을 하기 좋은 날씨입니다.'
}

// =========================
// 지도 주소
// =========================

const getMapUrl = (cityName) => {
  const address = encodeURIComponent(`${cityName} 대한민국`)

  return `https://www.google.com/maps?q=${address}&output=embed`
}

// =========================
// watch
// =========================

watch(selectedCityInfo, (newValue, oldValue) => {
  console.log(
    `[watch 감지] 선택된 도시가 "${oldValue || '없음'}"에서 "${newValue}"로 변경되었습니다.`,
  )
})

watch(filterOption, (newValue, oldValue) => {
  console.log(
    `[watch 감지] 날씨 필터가 "${filterLabels[oldValue]}"에서 "${filterLabels[newValue]}"로 변경되었습니다.`,
  )

  console.log(
    `[필터 결과] "${filterLabels[newValue]}" 조건에 맞는 도시는 ${displayedWeatherList.value.length}개입니다.`,
  )
})

// =========================
// watchEffect
// =========================

watchEffect(() => {
  console.log(
    `[watchEffect 자동 호출] 현재 검색어 "${searchQuery.value}"에 해당하는 도시는 ${filteredWeatherList.value.length}개입니다.`,
  )
})
</script>

<template>
  <div class="weather-page">
    <div class="weather-container">
      <!-- 페이지 제목 -->
      <header class="page-header">
        <h2>🌤️ 과제 3: 날씨 (컴포넌트)</h2>
      </header>

      <!-- 검색 및 필터 영역 -->
      <BaseDashboardCard title="🔍 도시 검색 및 필터">
        <SearchBar :search-query="searchQuery" @update-query="updateSearchQuery" />

        <div class="filter-panel">
          <div class="filter-header">
            <p class="filter-title">날씨 필터</p>

            <p class="filter-description">원하는 날씨 조건을 선택하세요.</p>
          </div>

          <div class="filter-control">
            <select id="weather-filter" v-model="filterOption" aria-label="날씨 필터 선택">
              <option value="all">전체 도시</option>

              <option value="hot">더운 지역</option>

              <option value="cool">선선한 지역</option>

              <option value="rain">비 오는 지역</option>

              <option value="sunny">맑은 지역</option>

              <option value="windy">바람이 강한 지역</option>

              <option value="favorite">즐겨찾기한 지역</option>
            </select>
          </div>
        </div>
      </BaseDashboardCard>

      <!-- 날씨 카드 목록 -->
      <BaseDashboardCard title="🏙️ 지역별 날씨 현황">
        <div v-if="displayedWeatherList.length > 0" class="weather-grid">
          <WeatherCard
            v-for="city in displayedWeatherList"
            :key="city.id"
            :city="city"
            :selected="selectedCityInfo === city.name"
            :searched="isSearchedCity(city)"
            @select-card="selectCity"
            @click-detail="showDetail"
            @toggle-favorite="toggleFavorite"
          />
        </div>

        <p v-else class="empty-message">
          {{
            filterOption === 'favorite'
              ? '즐겨찾기한 도시가 없습니다.'
              : '검색 또는 필터 조건과 일치하는 도시가 없습니다.'
          }}
        </p>
      </BaseDashboardCard>

      <!-- 상세 날씨 -->
      <section v-if="selectedCityDetail" class="weather-detail">
        <div class="detail-header">
          <h3>
            {{ selectedCityDetail.icon }}
            {{ selectedCityDetail.name }}
            상세 날씨
          </h3>

          <button type="button" class="detail-close-button" @click="closeDetail">닫기</button>
        </div>

        <div class="detail-content">
          <div class="detail-information">
            <p>
              <strong>날씨 상태</strong>
              <span>
                {{ selectedCityDetail.status }}
              </span>
            </p>

            <p>
              <strong>현재 기온</strong>
              <span> {{ selectedCityDetail.temp }}℃ </span>
            </p>

            <p>
              <strong>습도</strong>
              <span> {{ selectedCityDetail.humidity }}% </span>
            </p>

            <p>
              <strong>풍속</strong>
              <span> {{ selectedCityDetail.wind }}m/s </span>
            </p>

            <p>
              <strong>체감 상태</strong>

              <span>
                {{ selectedCityDetail.temp >= 25 ? '더운 날씨' : '선선한 날씨' }}
              </span>
            </p>

            <p>
              <strong>즐겨찾기</strong>

              <span>
                {{ selectedCityDetail.favorite ? '등록됨' : '등록되지 않음' }}
              </span>
            </p>

            <div class="detail-advice">
              <strong>💡 날씨 안내</strong>

              <p>
                {{ getWeatherAdvice(selectedCityDetail) }}
              </p>
            </div>
          </div>

          <div class="map-container">
            <iframe
              :src="getMapUrl(selectedCityDetail.name)"
              :title="`${selectedCityDetail.name} 지도`"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>

      <!-- 선택 결과 -->
      <p v-if="selectedCityInfo" class="selected-message">
        {{ selectedCityInfo }}이(가) 선택되었습니다.
      </p>

      <p v-else class="empty-message bottom-message">
        카드를 클릭하거나 상세보기 버튼을 눌러보세요.
      </p>
    </div>
  </div>
</template>

<style scoped>
/* =========================
   전체 페이지
========================= */

.weather-page {
  width: 100%;
  min-height: 100vh;
  padding: 40px clamp(24px, 5vw, 80px) 64px;
  box-sizing: border-box;
  background-color: #f5f7fb;
  color: #1f2937;
}

.weather-page *,
.weather-page *::before,
.weather-page *::after {
  box-sizing: border-box;
}

.weather-container {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
}

/* =========================
   상단 헤더
========================= */

.page-header {
  width: 100%;
  margin-bottom: 34px;
}

.page-header h2 {
  margin: 0;
  color: #172033;
  font-size: clamp(26px, 3vw, 36px);
  line-height: 1.3;
}

/* =========================
   필터 패널
========================= */

.filter-panel {
  margin-top: 16px;
  padding: 18px;
  border: 1px solid #dbe3ee;
  border-radius: 14px;
  background-color: #f8fafc;
}

.filter-header {
  margin-bottom: 14px;
}

.filter-title {
  margin: 0;
  color: #1e293b;
  font-size: 16px;
  font-weight: 800;
}

.filter-description {
  margin: 5px 0 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.5;
}

.filter-control {
  width: 100%;
}

.filter-control select {
  width: 100%;
  min-height: 48px;
  padding: 0 44px 0 14px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background-color: #ffffff;
  color: #1e293b;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.filter-control select:hover {
  border-color: #94a3b8;
}

.filter-control select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgb(37 99 235 / 18%);
}

/* =========================
   날씨 카드 목록
========================= */

.weather-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 22px;
}

/* =========================
   빈 상태 및 선택 메시지
========================= */

.empty-message,
.selected-message {
  margin: 0;
  padding: 15px 18px;
  border-radius: 10px;
  font-weight: 700;
  text-align: center;
}

.bottom-message,
.selected-message {
  margin-top: 28px;
}

.empty-message {
  background-color: #e2e8f0;
  color: #475569;
}

.selected-message {
  background-color: #dcfce7;
  color: #166534;
}

/* =========================
   상세 날씨 영역
========================= */

.weather-detail {
  margin-top: 32px;
  padding: 24px;
  border: 1px solid #dbe3ee;
  border-radius: 16px;
  background-color: #ffffff;
  color: #1f2937;
  box-shadow: 0 8px 24px rgb(15 23 42 / 8%);
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.detail-header h3 {
  min-width: 0;
  margin: 0;
  color: #172033;
  font-size: 24px;
  line-height: 1.4;
}

.detail-close-button {
  flex-shrink: 0;
  margin-left: auto;
  padding: 8px 14px;
  border: 0;
  border-radius: 8px;
  background-color: #e2e8f0;
  color: #334155;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.detail-close-button:hover {
  background-color: #cbd5e1;
}

.detail-content {
  display: grid;
  grid-template-columns:
    minmax(260px, 0.8fr)
    minmax(320px, 1.2fr);
  align-items: stretch;
  gap: 24px;
}

.detail-information {
  padding: 18px;
  border-radius: 12px;
  background-color: #f8fafc;
}

.detail-information > p {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 0;
  padding: 11px 0;
  border-bottom: 1px solid #e2e8f0;
}

.detail-information > p:last-of-type {
  border-bottom: 0;
}

.detail-information strong {
  flex-shrink: 0;
}

.detail-advice {
  margin-top: 18px;
  padding: 14px;
  border-radius: 10px;
  background-color: #eff6ff;
  color: #1e3a8a;
}

.detail-advice p {
  margin: 8px 0 0;
  line-height: 1.6;
}

/* =========================
   지도
========================= */

.map-container {
  width: 100%;
  min-height: 360px;
  overflow: hidden;
  border: 1px solid #dbe3ee;
  border-radius: 12px;
  background-color: #e2e8f0;
}

.map-container iframe {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 360px;
  border: 0;
}

/* =========================
   태블릿
========================= */

@media (max-width: 900px) {
  .weather-page {
    padding: 32px 28px 52px;
  }

  .weather-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .detail-content {
    grid-template-columns: 1fr;
  }

  .map-container,
  .map-container iframe {
    min-height: 320px;
  }
}

/* =========================
   모바일
========================= */

@media (max-width: 600px) {
  .weather-page {
    padding: 24px 16px 40px;
  }

  .page-header {
    margin-bottom: 28px;
  }

  .page-header h2 {
    font-size: 22px;
  }

  .filter-panel {
    padding: 15px;
  }

  .weather-grid {
    grid-template-columns: 1fr;
  }

  .weather-detail {
    padding: 18px;
  }

  .detail-header {
    align-items: flex-start;
  }

  .detail-header h3 {
    font-size: 21px;
  }

  .detail-close-button {
    padding: 7px 10px;
    font-size: 13px;
  }

  .detail-content {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .detail-information {
    padding: 14px;
  }

  .detail-information > p {
    align-items: flex-start;
    flex-direction: column;
    gap: 5px;
  }

  .map-container,
  .map-container iframe {
    min-height: 280px;
  }
}
</style>
