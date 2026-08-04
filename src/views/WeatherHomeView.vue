<script setup>
import { computed, onMounted, ref, watch, watchEffect } from 'vue'

import { storeToRefs } from 'pinia'

import { useRouter } from 'vue-router'

import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import SearchBar from '@/components/exercise/SearchBar.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'

import { regionLabels } from '@/data/weatherData'

import { useWeatherStore } from '@/stores/weatherStore'

import { getChosung } from '@/utils/getChosung'

// ========================================
// Router 및 Store
// ========================================

const router = useRouter()

const weatherStore = useWeatherStore()

const {
  weatherList,
  isLoading,
  isSearching,
  errorMessage,
  searchErrorMessage,
  formattedLastUpdatedAt,
} = storeToRefs(weatherStore)

// ========================================
// 검색 및 필터 상태
// ========================================

/**
 * 하나의 검색어로 다음 두 기능을 처리합니다.
 *
 * 1. 입력 중:
 *    현재 등록된 도시 카드 필터링
 *
 * 2. Enter 또는 검색 버튼:
 *    등록되지 않은 도시라면 API 검색 후 카드 추가
 */
const searchQuery = ref('')

/**
 * 현재 선택된 지역 필터입니다.
 */
const selectedRegion = ref('all')

/**
 * 사용자가 선택한 도시 ID입니다.
 */
const selectedCityId = ref(null)

/**
 * 즐겨찾기 변경 결과를
 * 스크린리더에 전달할 메시지입니다.
 */
const favoriteMessage = ref('')

/**
 * API 검색으로 도시를 추가하거나
 * 도시를 삭제한 결과 메시지입니다.
 */
const locationMessage = ref('')

// ========================================
// 지역 필터 목록
// ========================================

/**
 * 현재 날씨 카드에 실제로 존재하는
 * 지역 코드만 select에 표시합니다.
 */
const regionOptions = computed(() => {
  const usedRegionCodes = new Set(weatherList.value.map((city) => city.regionCode))

  return Object.entries(regionLabels)
    .filter(([regionCode]) => {
      return regionCode === 'all' || usedRegionCodes.has(regionCode)
    })
    .map(([value, label]) => ({
      value,
      label,
    }))
})

// ========================================
// 검색어 분석
// ========================================

/**
 * 검색어를 앞뒤 공백 제거 후
 * 소문자로 변환합니다.
 */
const normalizedSearchQuery = computed(() => {
  return searchQuery.value.trim().toLowerCase()
})

/**
 * 검색어가 한글 초성으로만 구성됐는지 확인합니다.
 *
 * 초성 검색은 기존 카드 필터에만 사용하며
 * OpenWeather API 요청에는 사용하지 않습니다.
 */
const isChosungQuery = computed(() => {
  const query = searchQuery.value.trim()

  if (!query) {
    return false
  }

  return /^[ㄱ-ㅎ]+$/.test(query)
})

/**
 * 지역 필터를 제외하고,
 * 현재 등록된 도시 중 검색어와 일치하는 도시가
 * 있는지 확인합니다.
 *
 * API 검색 여부를 결정할 때 사용합니다.
 */
const matchingRegisteredCities = computed(() => {
  const query = normalizedSearchQuery.value

  if (!query) {
    return []
  }

  return weatherList.value.filter((city) => {
    const cityName = city.name?.trim().toLowerCase() ?? ''

    const apiName = city.apiName?.trim().toLowerCase() ?? ''

    const cityChosung = getChosung(city.name ?? '')

    return cityName.includes(query) || apiName.includes(query) || cityChosung.includes(query)
  })
})

// ========================================
// 카드 검색 및 필터 결과
// ========================================

const filteredWeatherList = computed(() => {
  const query = normalizedSearchQuery.value

  return weatherList.value.filter((city) => {
    /**
     * 지역 필터를 확인합니다.
     */
    const matchesRegion = selectedRegion.value === 'all' || city.regionCode === selectedRegion.value

    if (!matchesRegion) {
      return false
    }

    /**
     * 검색어가 없으면 지역 필터 결과를
     * 그대로 표시합니다.
     */
    if (!query) {
      return true
    }

    const cityName = city.name?.trim().toLowerCase() ?? ''

    const apiName = city.apiName?.trim().toLowerCase() ?? ''

    const cityChosung = getChosung(city.name ?? '')

    return cityName.includes(query) || apiName.includes(query) || cityChosung.includes(query)
  })
})

/**
 * 화면과 스크린리더에 전달할
 * 검색 결과 개수입니다.
 */
const resultMessage = computed(() => {
  return `${filteredWeatherList.value.length}개의 ` + `도시가 표시되었습니다.`
})

/**
 * 현재 선택한 도시 객체입니다.
 */
const selectedCity = computed(() => {
  if (!selectedCityId.value) {
    return null
  }

  return weatherList.value.find((city) => city.id === selectedCityId.value)
})

// ========================================
// 검색 이벤트
// ========================================

/**
 * SearchBar가 전달한 입력값을 저장합니다.
 *
 * 값을 입력하는 동안에는
 * API를 호출하지 않고 카드 필터만 적용됩니다.
 */
const handleSearchQuery = (newQuery) => {
  searchQuery.value = newQuery

  /**
   * 새 검색을 시작하면
   * 이전 성공 메시지와 API 오류를 지웁니다.
   */
  locationMessage.value = ''
  weatherStore.searchErrorMessage = ''
}

/**
 * Enter 또는 검색 버튼을 눌렀을 때 실행됩니다.
 */
const handleSearch = async () => {
  const searchText = searchQuery.value.trim()

  locationMessage.value = ''
  weatherStore.searchErrorMessage = ''

  /**
   * 검색어가 없으면 API를 호출하지 않습니다.
   */
  if (!searchText) {
    weatherStore.searchErrorMessage = '검색할 도시명을 입력하세요.'

    return
  }

  /**
   * 현재 등록된 도시가 검색되면
   * API를 호출하지 않고 해당 카드만 표시합니다.
   */
  if (matchingRegisteredCities.value.length > 0) {
    selectedRegion.value = 'all'

    /**
     * 검색 결과가 하나라면
     * 해당 도시를 선택 상태로 만듭니다.
     */
    if (matchingRegisteredCities.value.length === 1) {
      selectedCityId.value = matchingRegisteredCities.value[0].id
    }

    locationMessage.value =
      `${matchingRegisteredCities.value.length}개의 ` + `등록된 도시를 찾았습니다.`

    return
  }

  /**
   * 초성은 OpenWeather에서 정상적인 지역명으로
   * 검색할 수 없으므로 API를 호출하지 않습니다.
   */
  if (isChosungQuery.value) {
    weatherStore.searchErrorMessage = `'${searchText}'에 해당하는 등록된 도시가 없습니다.`

    return
  }

  /**
   * 등록된 도시가 없으면
   * OpenWeather API에서 지역을 검색합니다.
   */
  const addedWeather = await weatherStore.searchAndAddLocation(searchText)

  if (!addedWeather) {
    return
  }

  /**
   * 새 카드가 바로 보이도록
   * 지역 필터를 전체로 변경합니다.
   *
   * 검색어는 추가한 도시 이름으로 변경해
   * 새 카드만 표시합니다.
   */
  selectedRegion.value = 'all'
  searchQuery.value = addedWeather.name
  selectedCityId.value = addedWeather.id

  locationMessage.value = `${addedWeather.name} 날씨 카드를 추가했습니다.`
}

// ========================================
// 카드 이벤트
// ========================================

/**
 * 날씨 카드를 선택합니다.
 */
const handleSelectCity = (city) => {
  selectedCityId.value = city.id
}

/**
 * 도시 상세 페이지로 이동합니다.
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
 */
const handleToggleFavorite = (city) => {
  const willBeFavorite = !city.favorite

  weatherStore.toggleFavorite(city.id)

  favoriteMessage.value = willBeFavorite
    ? `${city.name}을 즐겨찾기에 추가했습니다.`
    : `${city.name}을 즐겨찾기에서 해제했습니다.`
}

/**
 * 검색어와 지역 필터를 초기화합니다.
 */
const resetFilters = () => {
  searchQuery.value = ''
  selectedRegion.value = 'all'
  selectedCityId.value = null

  locationMessage.value = ''
  weatherStore.searchErrorMessage = ''
}

/**
 * 검색으로 추가한 지역을 삭제합니다.
 */
const handleRemoveLocation = (city) => {
  weatherStore.removeAddedLocation(city.id)

  if (selectedCityId.value === city.id) {
    selectedCityId.value = null
  }

  /**
   * 삭제한 도시 이름이 검색창에 남아 있으면
   * 검색 결과가 0개가 되므로 검색어를 초기화합니다.
   */
  searchQuery.value = ''

  /**
   * 검색 추가 지역이 더 이상 없는데
   * 해당 필터가 선택되어 있다면
   * 전체 지역으로 돌립니다.
   */
  const searchedCityExists = weatherList.value.some(
    (weatherCity) => weatherCity.regionCode === 'searched',
  )

  if (selectedRegion.value === 'searched' && !searchedCityExists) {
    selectedRegion.value = 'all'
  }

  locationMessage.value = `${city.name} 날씨 카드를 삭제했습니다.`
}

// ========================================
// Watch
// ========================================

/**
 * 지역 필터가 변경되면
 * 기존 카드 선택을 해제합니다.
 *
 * 검색어 변화는 handleSearchQuery에서 처리하므로
 * selectedCity를 자동으로 지우지 않습니다.
 */
watch(selectedRegion, () => {
  selectedCityId.value = null
})

/**
 * 선택된 도시 변경을 확인하기 위한
 * 수업용 watch 예시입니다.
 */
watch(selectedCityId, (newCityId, oldCityId) => {
  console.log('[watch 감지] 선택 도시 ID 변경:', oldCityId, '→', newCityId)
})

/**
 * 검색어와 검색 결과가 변경될 때마다
 * 자동으로 실행됩니다.
 */
watchEffect(() => {
  console.log(
    `[watchEffect 자동 호출] 현재 검색어 ` +
      `"${searchQuery.value}"에 매칭되는 ` +
      `${filteredWeatherList.value.length}개의 ` +
      `도시를 표시합니다.`,
  )
})

// ========================================
// 최초 API 요청
// ========================================

/**
 * 홈 화면 최초 진입 시
 * 기본 지역과 저장된 추가 지역의
 * 실시간 날씨를 불러옵니다.
 */
onMounted(() => {
  weatherStore.fetchAllWeather()
})
</script>

<template>
  <section class="weather-home">
    <!-- ======================================
         페이지 제목
    ======================================= -->

    <header class="page-header">
      <p class="page-eyebrow">Weather Dashboard</p>

      <h1 class="page-title">실시간 날씨 대시보드</h1>

      <p class="page-description">
        지역별 현재 날씨를 확인하고 원하는 지역의 날씨 카드를 추가할 수 있습니다.
      </p>
    </header>

    <!-- ======================================
         통합 검색 및 지역 필터
    ======================================= -->

    <BaseDashboardCard title="도시 검색 및 지역 추가">
      <div class="filter-layout">
        <div class="search-area">
          <SearchBar
            :query="searchQuery"
            :is-searching="isSearching"
            @update-query="handleSearchQuery"
            @search="handleSearch"
          />
        </div>

        <div class="region-area">
          <label for="region-filter" class="form-label"> 지역 </label>

          <select id="region-filter" v-model="selectedRegion" class="region-select">
            <option v-for="option in regionOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <button type="button" class="secondary-button reset-button" @click="resetFilters">
          검색 초기화
        </button>
      </div>

      <p v-if="searchErrorMessage" class="message message-error" role="alert">
        {{ searchErrorMessage }}
      </p>

      <p
        v-if="locationMessage"
        class="message message-success"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {{ locationMessage }}
      </p>
    </BaseDashboardCard>

    <!-- ======================================
         현재 날씨 카드
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

      <p class="result-status" role="status" aria-live="polite" aria-atomic="true">
        {{ resultMessage }}
      </p>

      <div v-if="filteredWeatherList.length > 0" class="weather-grid">
        <div v-for="city in filteredWeatherList" :key="city.id" class="weather-card-item">
          <WeatherCard
            :city="city"
            :selected="selectedCityId === city.id"
            @select="handleSelectCity"
            @click-detail="moveToDetail"
            @toggle-favorite="handleToggleFavorite"
          />

          <button
            v-if="city.addedByUser"
            type="button"
            class="remove-location-button"
            @click="handleRemoveLocation(city)"
          >
            대시보드에서 삭제
          </button>
        </div>
      </div>

      <div v-else-if="!isLoading" class="empty-state">
        <p>검색 조건에 맞는 도시가 없습니다.</p>

        <button type="button" class="secondary-button" @click="resetFilters">
          검색 조건 초기화
        </button>
      </div>

      <p class="sr-only" role="status" aria-live="polite" aria-atomic="true">
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
.weather-home {
  display: grid;
  gap: 24px;

  box-sizing: border-box;

  width: 100%;
  max-width: 1440px;

  margin: 0 auto;

  padding: 32px clamp(24px, 5vw, 80px) 56px;
}

/* ========================================
   페이지 제목
======================================== */

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

  line-height: 1.2;
}

.page-description {
  color: #64748b;

  line-height: 1.7;
}

/* ========================================
   공통 폼
======================================== */

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

/* ========================================
   통합 검색 및 필터
======================================== */

.filter-layout {
  display: grid;

  grid-template-columns:
    minmax(0, 1fr)
    180px;

  grid-template-areas:
    'search region'
    'reset region';

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

.reset-button {
  grid-area: reset;

  justify-self: start;
  align-self: start;
}

/* ========================================
   버튼
======================================== */

.primary-button,
.secondary-button,
.remove-location-button {
  min-height: 42px;

  padding: 9px 14px;

  border-radius: 9px;

  font: inherit;
  font-size: 13px;
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

.primary-button:disabled {
  opacity: 0.55;

  cursor: not-allowed;
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

/* ========================================
   검색 결과 메시지
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
   API 상태
======================================== */

.weather-status {
  margin-bottom: 18px;
}

.loading-message,
.error-box,
.weather-update {
  margin: 0;

  padding: 14px 16px;

  border-radius: 10px;

  font-size: 14px;
  font-weight: 700;
}

.loading-message {
  background-color: #eff6ff;
  color: #1d4ed8;
}

.error-box,
.weather-update {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 16px;
}

.error-box {
  background-color: #fef2f2;
  color: #b91c1c;
}

.weather-update {
  background-color: #ecfdf5;
  color: #047857;
}

.error-box p,
.weather-update p {
  margin: 0;
}

/* ========================================
   날씨 카드
======================================== */

.result-status {
  margin: 0 0 18px;

  color: #475569;

  font-size: 14px;
  font-weight: 700;
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

.weather-card-item {
  display: grid;

  align-content: start;

  gap: 10px;

  min-width: 0;
}

.remove-location-button {
  width: 100%;

  border: 1px solid #fecaca;

  background-color: #ffffff;
  color: #b91c1c;
}

.remove-location-button:hover {
  background-color: #fef2f2;
}

.empty-state {
  display: grid;

  justify-items: start;

  gap: 12px;

  padding: 26px 0;

  color: #64748b;
}

.empty-state p {
  margin: 0;
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
  .weather-home {
    padding: 24px 18px 40px;
  }

  .filter-layout {
    grid-template-columns: 1fr;

    grid-template-areas:
      'search'
      'region'
      'reset';
  }

  .reset-button {
    width: 100%;

    justify-self: stretch;
  }

  .primary-button,
  .secondary-button {
    width: 100%;
  }

  .error-box,
  .weather-update {
    align-items: stretch;
    flex-direction: column;
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
