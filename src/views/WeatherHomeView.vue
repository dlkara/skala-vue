<script setup>
import { computed, ref, watch, watchEffect } from 'vue'

import { useRouter } from 'vue-router'

import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import SearchBar from '@/components/exercise/SearchBar.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'

import { regionLabels } from '@/data/weatherData'

import { weatherList, toggleFavorite } from '@/state/weatherState'

import { getChosung } from '@/utils/getChosung'

// ========================================
// Router
// ========================================

/**
 * 상세정보 버튼을 눌렀을 때
 * 도시 상세 페이지로 이동하기 위해 사용합니다.
 */
const router = useRouter()

// ========================================
// 화면 상태
// ========================================

/**
 * 검색창에 입력된 문자열입니다.
 */
const searchQuery = ref('')

/**
 * 현재 선택한 지역 필터입니다.
 *
 * 기본값 all은 전체 지역을 의미합니다.
 */
const selectedRegion = ref('all')

/**
 * 현재 선택된 날씨 카드의 도시 ID입니다.
 */
const selectedCityId = ref(null)

// ========================================
// 검색어 변경
// ========================================

/**
 * SearchBar 컴포넌트에서 전달된 검색어를
 * 부모 컴포넌트 상태에 저장합니다.
 */
const updateSearchQuery = (newQuery) => {
  searchQuery.value = newQuery
}

// ========================================
// 1단계: 도시명 및 초성 검색
// ========================================

/**
 * 전체 날씨 데이터에서
 * 도시 이름 또는 초성과 일치하는 도시만 반환합니다.
 *
 * 예:
 * 서울 → 서울
 * ㅅㅇ → 서울, 수원
 */
const searchedWeatherList = computed(() => {
  const keyword = searchQuery.value.trim()

  // 검색어가 없으면 전체 날씨 목록 반환
  if (keyword === '') {
    return weatherList.value
  }

  return weatherList.value.filter((city) => {
    // 도시 이름에서 초성을 자동으로 추출
    const cityChosung = getChosung(city.name)

    return city.name.includes(keyword) || cityChosung.includes(keyword)
  })
})

// ========================================
// 2단계: 지역 필터
// ========================================

/**
 * 검색된 결과에 지역 필터를 추가로 적용합니다.
 *
 * 처리 순서:
 * 전체 날씨 목록
 * → 도시명 및 초성 검색
 * → 지역 필터
 * → 최종 화면 출력
 */
const displayedWeatherList = computed(() => {
  // 전체 지역을 선택한 경우
  // 검색 결과를 그대로 반환
  if (selectedRegion.value === 'all') {
    return searchedWeatherList.value
  }

  // 선택한 지역 코드와 같은 도시만 반환
  return searchedWeatherList.value.filter((city) => {
    return city.regionCode === selectedRegion.value
  })
})

// ========================================
// 카드 선택
// ========================================

/**
 * 날씨 카드 전체를 클릭하면
 * 해당 도시를 선택 상태로 변경합니다.
 */
const selectCity = (city) => {
  selectedCityId.value = city.id
}

// ========================================
// 즐겨찾기
// ========================================

/**
 * WeatherCard에서 전달받은 도시 객체의 ID를 이용해
 * 공유 상태의 즐겨찾기를 변경합니다.
 *
 * weatherState.js의 weatherList를 수정하므로
 * 홈과 즐겨찾기 페이지에서 같은 상태를 사용합니다.
 */
const handleToggleFavorite = (city) => {
  toggleFavorite(city.id)
}

// ========================================
// 도시 상세 페이지 이동
// ========================================

/**
 * 상세정보 버튼을 누르면
 * 도시 ID를 동적 경로 파라미터로 전달합니다.
 *
 * 예:
 * city_01 → /weather/city_01
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
// 검색 결과 카드 확인
// ========================================

/**
 * 현재 도시가 검색어와 일치하는지 확인합니다.
 *
 * 검색어가 없는 경우에는
 * 검색 강조 상태를 적용하지 않습니다.
 */
const isSearchedCity = (city) => {
  const keyword = searchQuery.value.trim()

  if (keyword === '') {
    return false
  }

  return city.name.includes(keyword) || getChosung(city.name).includes(keyword)
}

// ========================================
// 선택된 도시 이름
// ========================================

/**
 * selectedCityId를 이용해
 * 현재 선택된 도시의 이름을 반환합니다.
 */
const selectedCityName = computed(() => {
  const selectedCity = weatherList.value.find((city) => {
    return city.id === selectedCityId.value
  })

  return selectedCity?.name ?? ''
})

// ========================================
// watch
// ========================================

/**
 * 선택 도시와 지역 필터를 동시에 감시합니다.
 *
 * 이전 값과 새로운 값을 비교한 뒤
 * 실제로 변경된 항목만 콘솔에 출력합니다.
 */
watch([selectedCityId, selectedRegion], ([newCityId, newRegion], [oldCityId, oldRegion]) => {
  const changes = []

  // 선택 도시가 변경된 경우
  if (newCityId !== oldCityId) {
    const newCityName = weatherList.value.find((city) => city.id === newCityId)?.name ?? '선택 없음'

    const oldCityName = weatherList.value.find((city) => city.id === oldCityId)?.name ?? '선택 없음'

    changes.push(`선택 도시: ${oldCityName} → ${newCityName}`)
  }

  // 지역 필터가 변경된 경우
  if (newRegion !== oldRegion) {
    changes.push(`지역: ${regionLabels[oldRegion]} → ${regionLabels[newRegion]}`)
  }

  console.log(`[watch] ${changes.join(' / ')}`)
})

// ========================================
// watchEffect
// ========================================

/**
 * 검색어, 선택 지역, 최종 결과 개수를
 * 자동으로 추적해 현재 조회 상태를 출력합니다.
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
    <main class="weather-container">
      <!-- 페이지 제목 -->
      <header class="page-header">
        <h1>지역별 날씨 대시보드</h1>

        <p>도시 이름이나 초성으로 검색하고, 원하는 지역의 날씨를 확인하세요.</p>
      </header>

      <!-- 검색 및 지역 필터 -->
      <BaseDashboardCard title="도시 검색 및 지역 필터">
        <SearchBar :search-query="searchQuery" @update-query="updateSearchQuery" />

        <div class="filter-panel">
          <label for="region-filter" class="filter-label"> 지역 선택 </label>

          <!--
            selectedRegion과 select 입력값을
            v-model로 양방향 연결합니다.
          -->
          <select id="region-filter" v-model="selectedRegion" class="filter-select">
            <option value="all">전체 지역</option>

            <option value="capital">수도권</option>

            <option value="gangwon">강원권</option>

            <option value="chungcheong">충청권</option>

            <option value="jeolla">전라권</option>

            <option value="gyeongsang">경상권</option>

            <option value="jeju">제주권</option>
          </select>

          <!-- 현재 필터와 결과 개수 -->
          <p class="filter-result">
            {{ regionLabels[selectedRegion] }}
            ·
            {{ displayedWeatherList.length }}개 도시
          </p>
        </div>
      </BaseDashboardCard>

      <!-- 날씨 카드 목록 -->
      <BaseDashboardCard :title="`${regionLabels[selectedRegion]} 날씨 현황`">
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

        <!-- 검색 및 지역 필터 결과가 없는 경우 -->
        <p v-else class="empty-message">선택한 지역과 검색 조건에 일치하는 도시가 없습니다.</p>
      </BaseDashboardCard>

      <!-- 현재 선택된 도시 -->
      <p v-if="selectedCityName" class="selected-message">
        {{ selectedCityName }}이(가) 선택되었습니다.
      </p>

      <p v-else class="empty-message bottom-message">날씨 카드를 선택해 보세요.</p>
    </main>
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

.page-header p {
  margin: 9px 0 0;
  color: #64748b;
  line-height: 1.6;
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
  margin-bottom: 9px;

  color: #334155;
  font-weight: 700;
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

/* ========================================
   날씨 카드 목록
======================================== */

.weather-grid {
  display: grid;

  grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));

  gap: 22px;
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
}

.bottom-message {
  margin-top: 28px;
}

/* ========================================
   반응형
======================================== */

@media (max-width: 900px) {
  .weather-page {
    padding: 32px 28px 52px;
  }

  .weather-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .weather-page {
    padding: 24px 16px 40px;
  }

  .weather-grid {
    grid-template-columns: 1fr;
  }
}
</style>
