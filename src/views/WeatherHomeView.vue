<script setup>
import { computed, ref, watch, watchEffect } from 'vue'

import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import SearchBar from '@/components/exercise/SearchBar.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'

import { regionLabels } from '@/data/weatherData'

import { useWeatherStore } from '@/stores/weatherStore'

import { getChosung } from '@/utils/getChosung'

// ========================================
// Router
// ========================================

/**
 * 상세 날씨 페이지로 이동할 때 사용합니다.
 */
const router = useRouter()

// ========================================
// Pinia Store
// ========================================

/**
 * 날씨 데이터와 즐겨찾기 상태를 관리하는
 * Pinia Store 인스턴스입니다.
 */
const weatherStore = useWeatherStore()

/**
 * Store의 state를 구조 분해할 때
 * 반응성이 유지되도록 storeToRefs를 사용합니다.
 *
 * action은 storeToRefs로 꺼내지 않고
 * weatherStore.toggleFavorite() 형태로 직접 호출합니다.
 */
const { weatherList } = storeToRefs(weatherStore)

// ========================================
// 화면 상태
// ========================================

/**
 * 검색창에 입력된 도시 이름 또는 초성입니다.
 */
const searchQuery = ref('')

/**
 * 현재 선택한 지역 필터입니다.
 *
 * all은 전체 지역을 의미합니다.
 */
const selectedRegion = ref('all')

/**
 * 현재 선택한 도시의 ID입니다.
 */
const selectedCityId = ref(null)

/**
 * 즐겨찾기 변경 결과를 스크린리더에
 * 전달하기 위한 메시지입니다.
 */
const favoriteMessage = ref('')

// ========================================
// 검색어 변경
// ========================================

/**
 * SearchBar 컴포넌트에서 전달한 검색어를 저장합니다.
 *
 * @param {string} newQuery
 */
const updateSearchQuery = (newQuery) => {
  searchQuery.value = newQuery
}

// ========================================
// 도시 이름 및 초성 검색
// ========================================

/**
 * 전체 날씨 목록에서 도시 이름 또는
 * 한글 초성이 검색어와 일치하는 도시를 반환합니다.
 *
 * 예:
 * 서울 → 서울
 * ㅅㅇ → 서울, 수원
 */
const searchedWeatherList = computed(() => {
  const keyword = searchQuery.value.trim()

  if (keyword === '') {
    return weatherList.value
  }

  return weatherList.value.filter((city) => {
    const cityChosung = getChosung(city.name)

    return city.name.includes(keyword) || cityChosung.includes(keyword)
  })
})

// ========================================
// 지역 필터
// ========================================

/**
 * 이름 및 초성 검색 결과에
 * 지역 필터를 추가로 적용합니다.
 */
const displayedWeatherList = computed(() => {
  if (selectedRegion.value === 'all') {
    return searchedWeatherList.value
  }

  return searchedWeatherList.value.filter((city) => {
    return city.regionCode === selectedRegion.value
  })
})

// ========================================
// 검색 결과 안내
// ========================================

/**
 * 현재 검색 및 필터 결과를 설명하는 문구입니다.
 *
 * 화면과 aria-live 영역에서 함께 사용합니다.
 */
const resultMessage = computed(() => {
  const resultCount = displayedWeatherList.value.length

  if (resultCount === 0) {
    return '검색 조건에 맞는 도시가 없습니다.'
  }

  return `${regionLabels[selectedRegion.value]}에서 ${resultCount}개의 도시가 표시되었습니다.`
})

// ========================================
// 도시 선택
// ========================================

/**
 * WeatherCard가 전달한 도시를 선택 상태로 변경합니다.
 *
 * @param {Object} city
 */
const selectCity = (city) => {
  selectedCityId.value = city.id
}

/**
 * 현재 선택된 도시의 이름입니다.
 */
const selectedCityName = computed(() => {
  const selectedCity = weatherList.value.find((city) => {
    return city.id === selectedCityId.value
  })

  return selectedCity?.name ?? ''
})

// ========================================
// 즐겨찾기
// ========================================

/**
 * Pinia Store의 action을 호출해
 * 도시의 즐겨찾기 상태를 변경합니다.
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
 * 도시 ID를 동적 경로 파라미터로 전달합니다.
 *
 * 예:
 * city_01 → /weather/city_01
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

// ========================================
// 검색 결과 카드 강조
// ========================================

/**
 * 도시 이름 또는 초성이 현재 검색어와
 * 일치하는지 확인합니다.
 *
 * 검색어가 없을 때는 강조하지 않습니다.
 *
 * @param {Object} city
 * @returns {boolean}
 */
const isSearchedCity = (city) => {
  const keyword = searchQuery.value.trim()

  if (keyword === '') {
    return false
  }

  return city.name.includes(keyword) || getChosung(city.name).includes(keyword)
}

// ========================================
// 검색 조건 초기화
// ========================================

/**
 * 검색어와 지역 필터를 초기 상태로 되돌립니다.
 */
const resetSearchConditions = () => {
  searchQuery.value = ''
  selectedRegion.value = 'all'
}

// ========================================
// watch
// ========================================

/**
 * 선택 도시와 지역 필터의 변경을 감시합니다.
 */
watch(
  [selectedCityId, selectedRegion],

  (
    [newCityId, newRegion],

    [oldCityId, oldRegion],
  ) => {
    const changes = []

    if (newCityId !== oldCityId) {
      const newCityName =
        weatherList.value.find((city) => city.id === newCityId)?.name ?? '선택 없음'

      const oldCityName =
        weatherList.value.find((city) => city.id === oldCityId)?.name ?? '선택 없음'

      changes.push(`선택 도시: ${oldCityName} → ${newCityName}`)
    }

    if (newRegion !== oldRegion) {
      changes.push(`지역: ${regionLabels[oldRegion]} → ${regionLabels[newRegion]}`)
    }

    if (changes.length > 0) {
      console.log(`[watch] ${changes.join(' / ')}`)
    }
  },
)

// ========================================
// watchEffect
// ========================================

/**
 * 검색어, 지역, 결과 개수를 자동으로 추적합니다.
 */
watchEffect(() => {
  const keyword = searchQuery.value.trim() || '전체'

  console.log(
    `[watchEffect] 검색: ${keyword} / 지역: ${regionLabels[selectedRegion.value]} / 결과: ${displayedWeatherList.value.length}개`,
  )
})
</script>

<template>
  <div class="weather-page">
    <div class="weather-container">
      <!-- ========================================
           페이지 제목
      ========================================= -->
      <header class="page-header">
        <h1>지역별 날씨 대시보드</h1>

        <p>도시 이름이나 초성으로 검색하고, 원하는 지역의 날씨를 확인하세요.</p>

        <p class="page-help">
          도시 이름을 직접 입력하거나 한글 초성을 입력할 수 있습니다. 예: 서울, 대전, ㅅㅇ, ㄷㅈ
        </p>
      </header>

      <!-- ========================================
           검색 및 지역 필터
      ========================================= -->
      <BaseDashboardCard title="도시 검색 및 지역 필터">
        <SearchBar :search-query="searchQuery" @update-query="updateSearchQuery" />

        <div class="filter-panel">
          <label for="region-filter" class="filter-label"> 지역 선택 </label>

          <p id="region-filter-help" class="filter-help">
            특정 지역의 도시만 확인하려면 아래 목록에서 지역을 선택하세요.
          </p>

          <select
            id="region-filter"
            v-model="selectedRegion"
            class="filter-select"
            aria-describedby="region-filter-help"
          >
            <option value="all">전체 지역</option>

            <option value="capital">수도권</option>

            <option value="gangwon">강원권</option>

            <option value="chungcheong">충청권</option>

            <option value="jeolla">전라권</option>

            <option value="gyeongsang">경상권</option>

            <option value="jeju">제주권</option>
          </select>

          <p class="filter-result">
            현재 선택:
            <strong>
              {{ regionLabels[selectedRegion] }}
            </strong>

            <span aria-hidden="true"> · </span>

            <span> {{ displayedWeatherList.length }}개 도시 </span>
          </p>
        </div>
      </BaseDashboardCard>

      <!-- ========================================
           날씨 카드 목록
      ========================================= -->
      <BaseDashboardCard :title="`${regionLabels[selectedRegion]} 날씨 현황`">
        <p class="result-status" role="status" aria-live="polite" aria-atomic="true">
          {{ resultMessage }}
        </p>

        <p class="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {{ favoriteMessage }}
        </p>

        <div v-if="displayedWeatherList.length > 0" class="weather-grid">
          <WeatherCard
            v-for="city in displayedWeatherList"
            :key="city.id"
            :city="city"
            :selected="selectedCityId === city.id"
            :searched="isSearchedCity(city)"
            @select-card="selectCity"
            @click-detail="moveToDetail"
            @toggle-favorite="handleToggleFavorite"
          />
        </div>

        <!-- 검색 및 필터 결과 없음 -->
        <div v-else class="empty-result" role="status">
          <p class="empty-message">선택한 지역과 검색 조건에 일치하는 도시가 없습니다.</p>

          <p class="empty-help">도시 이름이나 초성을 다시 확인하거나, 전체 지역을 선택해 보세요.</p>

          <button type="button" class="reset-button" @click="resetSearchConditions">
            검색 조건 초기화
          </button>
        </div>
      </BaseDashboardCard>

      <!-- ========================================
           선택 도시 안내
      ========================================= -->
      <p v-if="selectedCityName" class="selected-message" role="status" aria-live="polite">
        <strong>
          {{ selectedCityName }}
        </strong>
        이(가) 선택되었습니다. 상세 기온과 습도, 풍속은 ‘상세 날씨 보기’ 버튼에서 확인할 수
        있습니다.
      </p>

      <p v-else class="empty-message bottom-message">
        확인할 도시의 ‘도시 선택’ 버튼을 눌러 보세요.
      </p>
    </div>
  </div>
</template>

<style scoped>
/* ========================================
   전체 페이지
======================================== */

.weather-page {
  min-height: calc(100vh - 70px);
  padding: 40px clamp(24px, 5vw, 80px) 64px;

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

/* ========================================
   페이지 제목
======================================== */

.page-header {
  margin-bottom: 34px;
}

.page-header h1 {
  margin: 0;

  color: #172033;
  font-size: clamp(26px, 3vw, 36px);
}

.page-header > p {
  margin: 9px 0 0;

  color: #64748b;
  line-height: 1.6;
}

.page-header .page-help {
  max-width: 720px;
  margin-top: 12px;
  padding-left: 12px;

  border-left: 3px solid #93c5fd;

  color: #475569;
  font-size: 14px;
}

/* ========================================
   지역 필터
======================================== */

.filter-panel {
  margin-top: 16px;
  padding: 18px;

  border: 1px solid #dbe3ee;
  border-radius: 12px;

  background-color: #f8fafc;
}

.filter-label {
  display: block;
  margin-bottom: 6px;

  color: #334155;
  font-weight: 700;
}

.filter-help {
  margin: 0 0 10px;

  color: #64748b;
  font-size: 13px;
  line-height: 1.6;
}

.filter-select {
  width: 100%;
  min-height: 48px;
  padding: 0 14px;

  border: 1px solid #cbd5e1;
  border-radius: 10px;

  background-color: #ffffff;
  color: #1e293b;

  font: inherit;
  font-weight: 600;

  outline: none;
  cursor: pointer;
}

.filter-select:hover {
  border-color: #94a3b8;
}

.filter-select:focus {
  border-color: #2563eb;

  box-shadow: 0 0 0 3px rgb(37 99 235 / 18%);
}

.filter-result {
  margin: 10px 0 0;

  color: #64748b;
  font-size: 13px;
  font-weight: 700;
}

.filter-result strong {
  color: #334155;
}

/* ========================================
   검색 결과 안내
======================================== */

.result-status {
  margin: 0 0 18px;

  color: #475569;
  font-size: 14px;
  font-weight: 700;
}

/* ========================================
   날씨 카드 목록
======================================== */

.weather-grid {
  display: grid;

  /*
    데스크톱 화면에서는 3열로 표시합니다.
  */
  grid-template-columns: repeat(3, minmax(0, 1fr));

  gap: 32px 22px;

  width: 100%;
}

/*
  결과가 한 개뿐일 때는
  카드가 전체 너비로 늘어나지 않도록 제한합니다.
*/
.weather-grid > :only-child {
  width: 100%;
  max-width: 420px;
}

/* ========================================
   상태 메시지
======================================== */

.empty-message,
.selected-message {
  margin: 0;
  padding: 15px 18px;

  border-radius: 10px;

  font-weight: 700;
  text-align: center;
}

.empty-message {
  background-color: #e2e8f0;
  color: #475569;
}

.selected-message {
  margin-top: 28px;

  background-color: #dcfce7;
  color: #166534;

  line-height: 1.7;
}

.selected-message strong {
  color: #14532d;
}

.bottom-message {
  margin-top: 28px;
}

/* ========================================
   검색 결과 없음
======================================== */

.empty-result {
  text-align: center;
}

.empty-help {
  margin: 12px 0 0;

  color: #64748b;
  font-size: 14px;
  line-height: 1.6;
}

.reset-button {
  min-height: 44px;
  margin-top: 16px;
  padding: 9px 16px;

  border: 1px solid #2563eb;
  border-radius: 9px;

  background-color: #2563eb;
  color: #ffffff;

  font: inherit;
  font-weight: 800;

  cursor: pointer;
}

.reset-button:hover {
  background-color: #1d4ed8;
}

/* ========================================
   태블릿
======================================== */

@media (max-width: 1100px) {
  .weather-page {
    padding: 32px 28px 52px;
  }

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
  .weather-page {
    padding: 24px 16px 40px;
  }

  .weather-grid {
    grid-template-columns: 1fr;
    row-gap: 32px;
  }

  .weather-grid > :only-child {
    max-width: none;
  }

  .page-header .page-help {
    padding-left: 10px;
  }

  .selected-message {
    text-align: left;
  }

  .reset-button {
    width: 100%;
  }
}
</style>
