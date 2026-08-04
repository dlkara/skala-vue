<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { storeToRefs } from 'pinia'

import { useRouter } from 'vue-router'

import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import SearchBar from '@/components/exercise/SearchBar.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'

import { useWeatherStore } from '@/stores/weatherStore'

import { getChosung } from '@/utils/getChosung'

// ========================================
// Router 및 Store
// ========================================

const router = useRouter()

const weatherStore = useWeatherStore()

const {
  weatherList,
  searchResults,

  isLoading,
  isSearching,

  errorMessage,
  searchErrorMessage,

  formattedLastUpdatedAt,
} = storeToRefs(weatherStore)

// ========================================
// 화면 상태
// ========================================

const searchQuery = ref('')

const selectedRegion = ref('all')

const selectedCityId = ref(null)

const actionMessage = ref('')

const favoriteMessage = ref('')

/**
 * 자동 API 검색용 setTimeout ID입니다.
 */
let searchTimer = null

// ========================================
// 지역 필터
// ========================================

const regionLabels = {
  all: '전체 지역',
  capital: '수도권',
  chungcheong: '충청권',
  jeju: '제주권',
  searched: '검색 추가 지역',
}

const regionOptions = computed(() => {
  const usedRegionCodes = new Set(weatherList.value.map((city) => city.regionCode))

  return Object.entries(regionLabels)
    .filter(([value]) => {
      return value === 'all' || usedRegionCodes.has(value)
    })
    .map(([value, label]) => ({
      value,
      label,
    }))
})

// ========================================
// 검색어 분석
// ========================================

const normalizedSearchQuery = computed(() => {
  return searchQuery.value.trim().toLowerCase()
})

const isChosungQuery = computed(() => {
  const query = searchQuery.value.trim()

  return query.length > 0 && /^[ㄱ-ㅎ]+$/.test(query)
})

/**
 * 대시보드에 이미 등록된 카드의
 * 검색 및 지역 필터 결과입니다.
 */
const filteredWeatherList = computed(() => {
  const query = normalizedSearchQuery.value

  return weatherList.value.filter((city) => {
    const matchesRegion = selectedRegion.value === 'all' || city.regionCode === selectedRegion.value

    if (!matchesRegion) {
      return false
    }

    if (!query) {
      return true
    }

    const cityName = city.name?.toLowerCase() || ''

    const apiName = city.apiName?.toLowerCase() || ''

    const state = city.state?.toLowerCase() || ''

    const cityChosung = getChosung(city.name || '')

    return (
      cityName.includes(query) ||
      apiName.includes(query) ||
      state.includes(query) ||
      cityChosung.includes(query)
    )
  })
})

const selectedCity = computed(() => {
  if (!selectedCityId.value) {
    return null
  }

  return weatherList.value.find((city) => {
    return city.id === selectedCityId.value
  })
})

const resultMessage = computed(() => {
  return `${filteredWeatherList.value.length}개의 ` + '도시가 표시되었습니다.'
})

const shouldShowSearchResults = computed(() => {
  return searchQuery.value.trim().length > 0 && !isChosungQuery.value
})

// ========================================
// 검색 결과 표시 함수
// ========================================

/**
 * 행정구역 표시값을 반환합니다.
 */
const getAdministrativeArea = (result) => {
  if (result.administrativeArea) {
    return result.administrativeArea
  }

  if (result.state && result.countryCode) {
    return `${result.state} · ` + result.countryCode
  }

  if (result.state) {
    return result.state
  }

  if (result.countryCode) {
    return `행정구역 정보 없음 · ` + result.countryCode
  }

  return '행정구역 정보 없음'
}

/**
 * 좌표를 소수점 넷째 자리까지 표시합니다.
 */
const formatCoordinate = (coordinate) => {
  const numberCoordinate = Number(coordinate)

  if (Number.isNaN(numberCoordinate)) {
    return '-'
  }

  return numberCoordinate.toFixed(4)
}

// ========================================
// 자동 API 검색
// ========================================

const clearSearchTimer = () => {
  if (!searchTimer) {
    return
  }

  clearTimeout(searchTimer)

  searchTimer = null
}

const handleSearchQuery = (newQuery) => {
  searchQuery.value = newQuery

  actionMessage.value = ''
}

const clearSearch = () => {
  clearSearchTimer()

  searchQuery.value = ''
  selectedCityId.value = null

  actionMessage.value = ''

  weatherStore.clearSearchResults()
}

/**
 * 검색어가 변경되면 600ms 후
 * OpenWeather API를 자동 호출합니다.
 */
watch(searchQuery, (newQuery) => {
  clearSearchTimer()

  const normalizedQuery = newQuery.trim()

  weatherStore.clearSearchResults()

  if (!normalizedQuery) {
    return
  }

  if (/^[ㄱ-ㅎ]+$/.test(normalizedQuery)) {
    return
  }

  if (normalizedQuery.length < 2) {
    return
  }

  searchTimer = setTimeout(() => {
    weatherStore.searchLocation(normalizedQuery)
  }, 600)
})

// ========================================
// 검색 결과 추가
// ========================================

const handleAddLocation = async (candidate) => {
  actionMessage.value = ''

  const result = await weatherStore.addLocation(candidate)

  actionMessage.value = result.message

  if (result.success) {
    selectedRegion.value = 'all'

    selectedCityId.value = candidate.id
  }
}

// ========================================
// 카드 이벤트
// ========================================

const handleSelectCity = (city) => {
  selectedCityId.value = city.id
}

const moveToDetail = (cityId) => {
  if (!cityId) {
    console.error('상세 페이지 이동 실패: 도시 ID가 없습니다.')

    return
  }

  router.push({
    name: 'weather-detail',

    params: {
      cityId,
    },
  })
}

const handleToggleFavorite = (city) => {
  const willBeFavorite = !city.favorite

  weatherStore.toggleFavorite(city.id)

  favoriteMessage.value = willBeFavorite
    ? `${city.name}을 즐겨찾기에 추가했습니다.`
    : `${city.name}을 즐겨찾기에서 해제했습니다.`
}

const handleRemoveLocation = (city) => {
  const confirmed = window.confirm(`${city.name}을 대시보드에서 삭제하시겠습니까?`)

  if (!confirmed) {
    return
  }

  const result = weatherStore.removeLocation(city.id)

  actionMessage.value = result.message

  if (selectedCityId.value === city.id) {
    selectedCityId.value = null
  }

  const regionStillExists = weatherList.value.some((weatherCity) => {
    return weatherCity.regionCode === selectedRegion.value
  })

  if (selectedRegion.value !== 'all' && !regionStillExists) {
    selectedRegion.value = 'all'
  }
}

const resetFilters = () => {
  clearSearch()

  selectedRegion.value = 'all'

  selectedCityId.value = null

  actionMessage.value = ''
}

// ========================================
// 생명주기
// ========================================

onMounted(() => {
  weatherStore.fetchAllWeather()
})

onBeforeUnmount(() => {
  clearSearchTimer()
})
</script>

<template>
  <section class="weather-home page-container">
    <!-- ======================================
         페이지 제목
    ======================================= -->

    <header class="page-header">
      <p class="page-eyebrow">Weather Dashboard</p>

      <h1 class="page-title">실시간 날씨 대시보드</h1>

      <p class="page-description">
        지역을 자동 검색하고 원하는 결과만 대시보드에 추가할 수 있습니다.
      </p>
    </header>

    <!-- ======================================
         검색 및 지역 필터
    ======================================= -->

    <BaseDashboardCard title="도시 검색 및 지역 필터">
      <div class="filter-layout">
        <div class="search-area">
          <SearchBar
            :query="searchQuery"
            :is-searching="isSearching"
            @update-query="handleSearchQuery"
            @clear="clearSearch"
          />
        </div>

        <div class="region-area">
          <label for="region-filter" class="form-label"> 대시보드 지역 필터 </label>

          <select id="region-filter" v-model="selectedRegion" class="region-select">
            <option v-for="option in regionOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <button type="button" class="secondary-button reset-button" @click="resetFilters">
          검색 및 필터 초기화
        </button>
      </div>

      <p v-if="searchQuery.trim().length === 1 && !isChosungQuery" class="input-guide">
        API 자동 검색은 두 글자 이상 입력하면 시작됩니다.
      </p>

      <p v-if="isChosungQuery" class="input-guide">
        초성 검색은 현재 대시보드 카드에만 적용됩니다.
      </p>

      <p v-if="searchErrorMessage" class="message message-error" role="alert">
        {{ searchErrorMessage }}
      </p>

      <p v-if="actionMessage" class="message message-success" role="status" aria-live="polite">
        {{ actionMessage }}
      </p>

      <!-- ==================================
           자동 API 검색 결과
      =================================== -->

      <section
        v-if="shouldShowSearchResults"
        class="api-search-section"
        aria-labelledby="
          api-search-result-title
        "
      >
        <div class="search-result-heading">
          <div>
            <h2
              id="
                api-search-result-title
              "
            >
              지역 검색 결과
            </h2>

            <p>행정구역과 좌표를 확인한 후 추가 버튼을 눌러주세요.</p>
          </div>

          <span v-if="searchResults.length > 0" class="result-count">
            {{ searchResults.length }}개
          </span>
        </div>

        <div v-if="searchResults.length > 0" class="api-result-list">
          <article v-for="result in searchResults" :key="result.id" class="api-result-item">
            <div class="api-result-main">
              <img
                v-if="result.weather?.icon"
                :src="`https://openweathermap.org/img/wn/${result.weather.icon}@2x.png`"
                alt=""
                class="result-weather-icon"
              />

              <div class="result-location">
                <h3>
                  {{ result.name }}
                </h3>

                <!-- 행정구역 -->
                <p class="result-administrative-area">
                  {{ getAdministrativeArea(result) }}
                </p>

                <!-- 좌표 -->
                <p class="result-coordinate">
                  위도
                  {{ formatCoordinate(result.coord?.lat) }}

                  <span aria-hidden="true"> · </span>

                  경도
                  {{ formatCoordinate(result.coord?.lon) }}
                </p>

                <p class="result-description">
                  {{ result.weather?.description || '날씨 정보 없음' }}
                </p>
              </div>
            </div>

            <div class="api-result-actions">
              <p class="result-temperature">{{ Math.round(result.main?.temp) }}℃</p>

              <button
                type="button"
                class="add-location-button"
                :disabled="result.isAdded"
                @click="handleAddLocation(result)"
              >
                {{ result.isAdded ? '추가됨' : '대시보드에 추가' }}
              </button>
            </div>
          </article>
        </div>

        <p v-else-if="!isSearching && !searchErrorMessage" class="waiting-message">
          검색 결과를 기다리고 있습니다.
        </p>
      </section>
    </BaseDashboardCard>

    <!-- ======================================
         대시보드 날씨 카드
    ======================================= -->

    <BaseDashboardCard title="현재 날씨">
      <div class="weather-status">
        <p v-if="isLoading" class="loading-message" role="status" aria-live="polite">
          실시간 날씨 정보를 불러오고 있습니다.
        </p>

        <div v-else-if="errorMessage" class="error-box" role="alert">
          <p>
            {{ errorMessage }}
          </p>

          <button type="button" class="primary-button" @click="weatherStore.refreshWeather()">
            다시 불러오기
          </button>
        </div>

        <div v-else class="weather-update">
          <p>
            OpenWeather의 실시간 날씨를 표시하고 있습니다.

            <span v-if="formattedLastUpdatedAt">
              마지막 갱신:
              {{ formattedLastUpdatedAt }}
            </span>
          </p>

          <button
            type="button"
            class="primary-button"
            :disabled="isLoading"
            @click="weatherStore.refreshWeather()"
          >
            날씨 새로고침
          </button>
        </div>
      </div>

      <p class="result-status" role="status" aria-live="polite">
        {{ resultMessage }}
      </p>

      <div v-if="filteredWeatherList.length > 0" class="weather-grid">
        <WeatherCard
          v-for="city in filteredWeatherList"
          :key="city.id"
          :city="city"
          :selected="selectedCityId === city.id"
          @select="handleSelectCity"
          @click-detail="moveToDetail"
          @toggle-favorite="handleToggleFavorite"
          @remove="handleRemoveLocation"
        />
      </div>

      <div v-else-if="!isLoading" class="empty-state">
        <p>표시할 날씨 카드가 없습니다.</p>

        <p>도시를 검색한 후 ‘대시보드에 추가’ 버튼을 눌러주세요.</p>

        <button type="button" class="secondary-button" @click="resetFilters">
          검색 조건 초기화
        </button>
      </div>

      <p class="sr-only" role="status" aria-live="polite">
        {{ favoriteMessage }}
      </p>

      <div v-if="selectedCity" class="selected-message">
        선택한 도시:

        <strong>
          {{ selectedCity.name }}
        </strong>
      </div>
    </BaseDashboardCard>
  </section>
</template>

<style scoped>
/* ========================================
   검색과 지역 필터
======================================== */

.filter-layout {
  display: grid;

  grid-template-columns:
    minmax(0, 1fr)
    220px;

  grid-template-areas:
    'search region'
    'reset reset';

  align-items: start;

  gap: 16px 18px;
}

.search-area {
  grid-area: search;
  min-width: 0;
}

.region-area {
  grid-area: region;
  min-width: 0;
}

.form-label {
  display: block;

  margin-bottom: 7px;

  color: #334155;

  font-size: 14px;
  font-weight: 800;
}

.region-select {
  box-sizing: border-box;

  width: 100%;
  min-height: 48px;

  padding: 10px 14px;

  border: 1px solid #cbd5e1;
  border-radius: 10px;

  background-color: #ffffff;
  color: #1e293b;

  font: inherit;
}

.region-select:hover {
  border-color: #94a3b8;
}

.region-select:focus {
  border-color: #2563eb;

  outline: none;

  box-shadow: 0 0 0 3px rgb(37 99 235 / 18%);
}

.reset-button {
  grid-area: reset;
  justify-self: start;
}

.input-guide {
  margin: 15px 0 0;

  color: #64748b;

  font-size: 13px;
}

/* ========================================
   결과 메시지
======================================== */

.message {
  margin: 16px 0 0;

  padding: 12px 14px;

  border-radius: 9px;

  font-size: 14px;
  font-weight: 700;
}

.message-error {
  background-color: #fef2f2;
  color: #b91c1c;
}

.message-success {
  background-color: #ecfdf5;
  color: #047857;
}

/* ========================================
   API 자동 검색 결과
======================================== */

.api-search-section {
  margin-top: 24px;
  padding-top: 24px;

  border-top: 1px solid #e2e8f0;
}

.search-result-heading {
  display: flex;

  align-items: flex-start;
  justify-content: space-between;

  gap: 16px;

  margin-bottom: 15px;
}

.search-result-heading h2,
.search-result-heading p {
  margin: 0;
}

.search-result-heading h2 {
  color: #172033;

  font-size: 18px;
}

.search-result-heading p {
  margin-top: 5px;

  color: #64748b;

  font-size: 13px;
}

.result-count {
  flex: 0 0 auto;

  padding: 5px 9px;

  border-radius: 999px;

  background-color: #eff6ff;
  color: #1d4ed8;

  font-size: 12px;
  font-weight: 850;
}

.api-result-list {
  display: grid;
  gap: 10px;
}

.api-result-item {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 18px;

  padding: 14px 16px;

  border: 1px solid #e2e8f0;
  border-radius: 12px;

  background-color: #f8fafc;
}

.api-result-main {
  display: flex;

  align-items: center;

  min-width: 0;

  gap: 12px;
}

.result-weather-icon {
  flex: 0 0 auto;

  width: 54px;
  height: 54px;

  object-fit: contain;
}

.result-location {
  min-width: 0;
}

.result-location h3,
.result-location p {
  margin: 0;
}

.result-location h3 {
  overflow-wrap: anywhere;

  color: #172033;

  font-size: 16px;
}

/* 행정구역 */
.result-administrative-area {
  margin-top: 4px !important;

  color: #475569 !important;

  font-size: 13px !important;
  font-weight: 750;
}

/* 좌표 */
.result-coordinate {
  margin-top: 4px !important;

  color: #94a3b8 !important;

  font-size: 11px !important;
  line-height: 1.5;
}

.result-description {
  margin-top: 5px !important;

  color: #475569 !important;

  font-size: 13px !important;
  font-weight: 700;
}

.api-result-actions {
  display: flex;

  flex: 0 0 auto;

  align-items: center;

  gap: 14px;
}

.result-temperature {
  margin: 0;

  color: #172033;

  font-size: 21px;
  font-weight: 900;

  white-space: nowrap;
}

.add-location-button {
  min-height: 40px;

  padding: 8px 13px;

  border: 1px solid #2563eb;
  border-radius: 9px;

  background-color: #2563eb;
  color: #ffffff;

  font: inherit;
  font-size: 13px;
  font-weight: 800;

  white-space: nowrap;

  cursor: pointer;
}

.add-location-button:hover {
  background-color: #1d4ed8;
}

.add-location-button:disabled {
  border-color: #cbd5e1;

  background-color: #e2e8f0;
  color: #64748b;

  cursor: not-allowed;
}

.waiting-message {
  margin: 0;

  color: #64748b;

  font-size: 14px;
}

/* ========================================
   날씨 상태
======================================== */

.weather-status {
  margin-bottom: 18px;
}

.weather-update {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 16px;

  margin: 0;
  padding: 14px 16px;

  border-radius: 10px;

  background-color: #ecfdf5;
  color: #047857;

  font-size: 14px;
  font-weight: 700;
}

.weather-update p {
  margin: 0;
}

.result-status {
  margin: 0 0 18px;

  color: #475569;

  font-size: 14px;
  font-weight: 700;
}

.selected-message {
  margin-top: 20px;

  padding: 14px 16px;

  border-radius: 10px;

  background-color: #f8fafc;
  color: #334155;
}

/* ========================================
   태블릿
======================================== */

@media (max-width: 850px) {
  .filter-layout {
    grid-template-columns: 1fr;

    grid-template-areas:
      'search'
      'region'
      'reset';
  }

  .reset-button {
    justify-self: stretch;
  }

  .api-result-item {
    align-items: stretch;
    flex-direction: column;
  }

  .api-result-actions {
    justify-content: space-between;
  }
}

/* ========================================
   모바일
======================================== */

@media (max-width: 600px) {
  .api-result-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .add-location-button {
    width: 100%;
  }

  .weather-update {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
