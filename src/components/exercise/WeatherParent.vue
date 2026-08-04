<script setup>
import { computed, ref, watch, watchEffect } from 'vue'

import BaseDashboardCard from './BaseDashboardCard.vue'
import SearchBar from './SearchBar.vue'
import WeatherCard from './WeatherCard.vue'

import { getChosung } from '@/utils/getChosung'

// ========================================
// 지역 코드
//
// 화면에 표시되는 한글 지역명과
// 내부에서 사용하는 값을 분리했습니다.
//
// 나중에 지역명이 바뀌더라도
// 데이터의 regionCode를 유지할 수 있습니다.
// ========================================

const REGION = {
  CAPITAL: 'capital',
  GANGWON: 'gangwon',
  CHUNGCHEONG: 'chungcheong',
  JEOLLA: 'jeolla',
  GYEONGSANG: 'gyeongsang',
  JEJU: 'jeju',
}

// 지역 코드별 화면 표시 이름
const regionLabels = {
  all: '전체 지역',
  [REGION.CAPITAL]: '수도권',
  [REGION.GANGWON]: '강원권',
  [REGION.CHUNGCHEONG]: '충청권',
  [REGION.JEOLLA]: '전라권',
  [REGION.GYEONGSANG]: '경상권',
  [REGION.JEJU]: '제주권',
}

// ========================================
// 임시 날씨 데이터
//
// 아직 API를 배우지 않았기 때문에
// 현재 날씨 값은 직접 작성했습니다.
//
// id, name, regionCode, lat, lon은
// 애플리케이션에서 관리할 기본 도시 정보입니다.
//
// 기온, 습도, 풍속, iconCode 등은
// 향후 API 응답으로 교체할 수 있습니다.
// ========================================

const weatherList = ref([
  {
    id: 'city_01',
    name: '서울',

    regionCode: REGION.CAPITAL,
    region: '수도권',

    lat: 37.5665,
    lon: 126.978,

    temp: 28,
    feelsLike: 29,
    tempMin: 23,
    tempMax: 30,
    humidity: 62,
    wind: 2.4,

    weatherCode: 'Clear',
    status: '맑음',
    description: '맑은 하늘',
    iconCode: '01d',

    favorite: false,
  },
  {
    id: 'city_02',
    name: '수원',

    regionCode: REGION.CAPITAL,
    region: '수도권',

    lat: 37.2636,
    lon: 127.0286,

    temp: 24,
    feelsLike: 24,
    tempMin: 21,
    tempMax: 26,
    humidity: 81,
    wind: 3.7,

    weatherCode: 'Rain',
    status: '비',
    description: '약한 비',
    iconCode: '10d',

    favorite: false,
  },
  {
    id: 'city_03',
    name: '인천',

    regionCode: REGION.CAPITAL,
    region: '수도권',

    lat: 37.4563,
    lon: 126.7052,

    temp: 25,
    feelsLike: 26,
    tempMin: 22,
    tempMax: 27,
    humidity: 76,
    wind: 5.1,

    weatherCode: 'Clouds',
    status: '흐림',
    description: '흐린 하늘',
    iconCode: '03d',

    favorite: false,
  },
  {
    id: 'city_04',
    name: '강릉',

    regionCode: REGION.GANGWON,
    region: '강원권',

    lat: 37.7519,
    lon: 128.8761,

    temp: 23,
    feelsLike: 22,
    tempMin: 19,
    tempMax: 25,
    humidity: 66,
    wind: 5.6,

    weatherCode: 'Clear',
    status: '맑음',
    description: '대체로 맑음',
    iconCode: '02d',

    favorite: false,
  },
  {
    id: 'city_05',
    name: '대전',

    regionCode: REGION.CHUNGCHEONG,
    region: '충청권',

    lat: 36.3504,
    lon: 127.3845,

    temp: 29,
    feelsLike: 31,
    tempMin: 24,
    tempMax: 31,
    humidity: 58,
    wind: 1.8,

    weatherCode: 'Clear',
    status: '맑음',
    description: '맑은 하늘',
    iconCode: '01d',

    favorite: false,
  },
  {
    id: 'city_06',
    name: '광주',

    regionCode: REGION.JEOLLA,
    region: '전라권',

    lat: 35.1595,
    lon: 126.8526,

    temp: 27,
    feelsLike: 29,
    tempMin: 23,
    tempMax: 29,
    humidity: 79,
    wind: 3.3,

    weatherCode: 'Rain',
    status: '소나기',
    description: '한때 소나기',
    iconCode: '09d',

    favorite: false,
  },
  {
    id: 'city_07',
    name: '부산',

    regionCode: REGION.GYEONGSANG,
    region: '경상권',

    lat: 35.1796,
    lon: 129.0756,

    temp: 26,
    feelsLike: 27,
    tempMin: 23,
    tempMax: 28,
    humidity: 73,
    wind: 4.2,

    weatherCode: 'Clouds',
    status: '구름',
    description: '구름 많음',
    iconCode: '04d',

    favorite: false,
  },
  {
    id: 'city_08',
    name: '대구',

    regionCode: REGION.GYEONGSANG,
    region: '경상권',

    lat: 35.8714,
    lon: 128.6014,

    temp: 31,
    feelsLike: 34,
    tempMin: 26,
    tempMax: 33,
    humidity: 55,
    wind: 2,

    weatherCode: 'Clear',
    status: '폭염',
    description: '매우 더운 날씨',
    iconCode: '01d',

    favorite: false,
  },
  {
    id: 'city_09',
    name: '울산',

    regionCode: REGION.GYEONGSANG,
    region: '경상권',

    lat: 35.5384,
    lon: 129.3114,

    temp: 26,
    feelsLike: 27,
    tempMin: 22,
    tempMax: 28,
    humidity: 70,
    wind: 4.8,

    weatherCode: 'Clouds',
    status: '구름',
    description: '구름 많음',
    iconCode: '04d',

    favorite: false,
  },
  {
    id: 'city_10',
    name: '제주',

    regionCode: REGION.JEJU,
    region: '제주권',

    lat: 33.4996,
    lon: 126.5312,

    temp: 25,
    feelsLike: 26,
    tempMin: 22,
    tempMax: 27,
    humidity: 84,
    wind: 8.7,

    weatherCode: 'Wind',
    status: '강풍',
    description: '바람이 매우 강함',
    iconCode: '50d',

    favorite: false,
  },
])

// ========================================
// 화면에서 사용하는 반응형 상태
// ========================================

// SearchBar의 검색어
const searchQuery = ref('')

// 지역 필터의 현재 선택값
const selectedRegion = ref('all')

// 현재 선택된 도시 ID
const selectedCityId = ref(null)

// 상세정보 모달에 표시할 도시 객체
const selectedCityDetail = ref(null)

// ========================================
// 검색어 변경
// ========================================

/**
 * SearchBar에서 전달된 검색어로
 * 부모의 searchQuery를 변경합니다.
 */
const updateSearchQuery = (newQuery) => {
  searchQuery.value = newQuery
}

// ========================================
// 1단계: 도시명 및 초성 검색
// ========================================

const searchedWeatherList = computed(() => {
  const keyword = searchQuery.value.trim()

  // 검색어가 없으면 전체 목록 반환
  if (keyword === '') {
    return weatherList.value
  }

  return weatherList.value.filter((city) => {
    // 도시명에서 초성을 자동 생성
    const cityChosung = getChosung(city.name)

    return city.name.includes(keyword) || cityChosung.includes(keyword)
  })
})

// ========================================
// 2단계: 지역 필터
//
// 검색된 목록을 다시 지역 기준으로 필터링합니다.
//
// 예:
// 전체 목록
// → "ㅂㅅ" 검색
// → 부산 검색 결과
// → 경상권 필터
// → 부산 유지
// ========================================

const displayedWeatherList = computed(() => {
  // 검색이 적용된 목록을 기준으로 시작
  const list = searchedWeatherList.value

  // 전체 지역을 선택하면 검색 결과를 그대로 반환
  if (selectedRegion.value === 'all') {
    return list
  }

  // 선택한 지역 코드와 동일한 도시만 반환
  return list.filter((city) => {
    return city.regionCode === selectedRegion.value
  })
})

// ========================================
// 카드 선택
// ========================================

/**
 * 카드 전체를 클릭하면 해당 도시를 선택합니다.
 */
const selectCity = (city) => {
  selectedCityId.value = city.id
}

// ========================================
// 상세정보 모달
// ========================================

/**
 * 상세정보 버튼을 클릭하면
 * 해당 도시를 선택하고 모달을 엽니다.
 */
const showDetail = (city) => {
  selectedCityId.value = city.id
  selectedCityDetail.value = city
}

/**
 * 상세정보 모달을 닫습니다.
 */
const closeDetail = () => {
  selectedCityDetail.value = null
}

// ========================================
// 즐겨찾기
// ========================================

/**
 * 자식 컴포넌트에서 전달받은 도시의
 * 즐겨찾기 상태를 부모에서 변경합니다.
 */
const toggleFavorite = (city) => {
  city.favorite = !city.favorite
}

// ========================================
// 검색 결과 카드 여부 확인
// ========================================

/**
 * 검색어가 입력된 상태에서 해당 도시가
 * 검색어와 일치하는지 확인합니다.
 */
const isSearchedCity = (city) => {
  const keyword = searchQuery.value.trim()

  if (keyword === '') {
    return false
  }

  return city.name.includes(keyword) || getChosung(city.name).includes(keyword)
}

// ========================================
// 날씨 상태에 따른 안내 문구
// ========================================

const getWeatherAdvice = (city) => {
  if (!city) {
    return ''
  }

  // 비 계열 날씨
  if (['Rain', 'Drizzle', 'Thunderstorm'].includes(city.weatherCode)) {
    return '우산을 챙기고 미끄러운 길을 조심하세요.'
  }

  // 고온 또는 폭염
  if (city.temp >= 30 || city.status === '폭염') {
    return '야외 활동을 줄이고 수분을 충분히 섭취하세요.'
  }

  // 강풍
  if (city.weatherCode === 'Wind' || city.wind >= 7) {
    return '강한 바람에 날릴 수 있는 물건을 주의하세요.'
  }

  // 맑고 더운 날씨
  if (city.weatherCode === 'Clear' && city.temp >= 25) {
    return '자외선 차단제를 준비하고 물을 자주 마시세요.'
  }

  return '가벼운 외출이나 산책을 하기 좋은 날씨입니다.'
}

// ========================================
// 현재 선택된 도시 이름
// ========================================

const selectedCityName = computed(() => {
  const selectedCity = weatherList.value.find((city) => {
    return city.id === selectedCityId.value
  })

  return selectedCity?.name ?? ''
})

// ========================================
// watch
//
// 선택 도시와 지역 필터를 함께 감시합니다.
// 이전 값과 새로운 값을 비교해
// 실제로 바뀐 항목만 콘솔에 출력합니다.
// ========================================

watch([selectedCityId, selectedRegion], ([newCityId, newRegion], [oldCityId, oldRegion]) => {
  const newCityName = weatherList.value.find((city) => city.id === newCityId)?.name ?? '선택 없음'

  const oldCityName = weatherList.value.find((city) => city.id === oldCityId)?.name ?? '선택 없음'

  const changes = []

  // 도시 선택이 변경된 경우
  if (newCityId !== oldCityId) {
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
//
// 검색어, 지역 필터, 최종 결과 개수를
// 자동으로 추적합니다.
// ========================================

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
      <!-- 페이지 설명 -->
      <header class="page-header">
        <h2>지역별 날씨 대시보드</h2>

        <p>도시 이름이나 초성으로 검색하고, 원하는 지역의 날씨를 확인하세요.</p>
      </header>

      <!-- 검색과 지역 필터 -->
      <BaseDashboardCard title="도시 검색 및 지역 필터">
        <SearchBar :search-query="searchQuery" @update-query="updateSearchQuery" />

        <div class="filter-panel">
          <label for="region-filter" class="filter-label"> 지역 선택 </label>

          <!--
            v-model을 통해 선택값이
            selectedRegion과 양방향 연결됩니다.
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

          <p class="filter-result">
            {{ regionLabels[selectedRegion] }}
            ·
            {{ displayedWeatherList.length }}개 도시
          </p>
        </div>
      </BaseDashboardCard>

      <!-- 최종 날씨 카드 목록 -->
      <BaseDashboardCard :title="`${regionLabels[selectedRegion]} 날씨 현황`">
        <div v-if="displayedWeatherList.length > 0" class="weather-grid">
          <WeatherCard
            v-for="city in displayedWeatherList"
            :key="city.id"
            :city="city"
            :selected="selectedCityId === city.id"
            :searched="isSearchedCity(city)"
            @select-card="selectCity"
            @click-detail="showDetail"
            @toggle-favorite="toggleFavorite"
          />
        </div>

        <!-- 지역 및 검색 조건에 해당하는 결과가 없는 경우 -->
        <p v-else class="empty-message">선택한 지역과 검색 조건에 일치하는 도시가 없습니다.</p>
      </BaseDashboardCard>

      <!-- 현재 선택된 도시 안내 -->
      <p v-if="selectedCityName" class="selected-message">
        {{ selectedCityName }}이(가) 선택되었습니다.
      </p>

      <p v-else class="empty-message bottom-message">날씨 카드를 선택해 보세요.</p>
    </main>

    <!-- 상세정보 모달 -->
    <div v-if="selectedCityDetail" class="modal-overlay" @click.self="closeDetail">
      <section
        class="weather-modal"
        role="dialog"
        aria-modal="true"
        :aria-label="`${selectedCityDetail.name} 상세 날씨`"
      >
        <div class="modal-header">
          <div class="modal-heading">
            <img
              :src="`https://openweathermap.org/img/wn/${selectedCityDetail.iconCode}@2x.png`"
              :alt="`${selectedCityDetail.description} 날씨 아이콘`"
              class="modal-weather-icon"
            />

            <div>
              <h3>
                {{ selectedCityDetail.name }}
              </h3>

              <p>
                {{ selectedCityDetail.region }}
                ·
                {{ selectedCityDetail.description }}
              </p>
            </div>
          </div>

          <button
            type="button"
            class="modal-close-button"
            aria-label="상세정보 닫기"
            @click="closeDetail"
          >
            ×
          </button>
        </div>

        <!-- 현재 기온과 상태 배지 -->
        <div class="modal-temperature">
          <div>
            <span>현재 기온</span>

            <strong> {{ selectedCityDetail.temp }}℃ </strong>
          </div>

          <span v-if="selectedCityDetail.temp >= 25" class="temperature-badge hot-badge">
            더움
          </span>

          <span v-else class="temperature-badge cool-badge"> 선선함 </span>
        </div>

        <!-- 상세 날씨 정보 -->
        <div class="detail-information">
          <p>
            <strong>지역</strong>

            <span>
              {{ selectedCityDetail.region }}
            </span>
          </p>

          <p>
            <strong>날씨 상태</strong>

            <span>
              {{ selectedCityDetail.status }}
            </span>
          </p>

          <p>
            <strong>체감 온도</strong>

            <span> {{ selectedCityDetail.feelsLike }}℃ </span>
          </p>

          <p>
            <strong>최저 / 최고 기온</strong>

            <span> {{ selectedCityDetail.tempMin }}℃ / {{ selectedCityDetail.tempMax }}℃ </span>
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
            <strong>위치 좌표</strong>

            <span>
              {{ selectedCityDetail.lat }},
              {{ selectedCityDetail.lon }}
            </span>
          </p>

          <p>
            <strong>즐겨찾기</strong>

            <span>
              {{ selectedCityDetail.favorite ? '등록됨' : '등록되지 않음' }}
            </span>
          </p>
        </div>

        <!-- 동적 안내 문구 -->
        <div class="detail-advice">
          <strong>날씨 안내</strong>

          <p>
            {{ getWeatherAdvice(selectedCityDetail) }}
          </p>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* ========================================
   전체 페이지
======================================== */

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

/* ========================================
   페이지 제목
======================================== */

.page-header {
  margin-bottom: 34px;
}

.page-header h2 {
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
   상세정보 모달
======================================== */

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 24px;
  background-color: rgb(15 23 42 / 55%);
}

.weather-modal {
  width: min(620px, 100%);
  max-height: calc(100vh - 48px);
  overflow-y: auto;

  padding: 26px;
  border-radius: 18px;
  background-color: #ffffff;
  box-shadow: 0 24px 60px rgb(15 23 42 / 28%);
}

.modal-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 22px;
}

.modal-heading {
  display: flex;
  align-items: center;
}

.modal-weather-icon {
  width: 76px;
  height: 76px;
  margin-left: -12px;
  object-fit: contain;
}

.modal-heading h3 {
  margin: 0;
  color: #172033;
  font-size: 26px;
}

.modal-heading p {
  margin: 5px 0 0;
  color: #64748b;
  font-size: 14px;
}

.modal-close-button {
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  margin-left: auto;

  border: 0;
  border-radius: 50%;
  background-color: #e2e8f0;
  color: #334155;

  font-size: 25px;
  line-height: 1;
  cursor: pointer;
}

.modal-close-button:hover {
  background-color: #cbd5e1;
}

/* ========================================
   모달 현재 기온
======================================== */

.modal-temperature {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;

  margin-bottom: 18px;
  padding: 18px;

  border-radius: 12px;
  background-color: #eff6ff;
}

.modal-temperature div {
  display: flex;
  align-items: center;
  gap: 9px;
}

.modal-temperature div > span {
  color: #475569;
  font-weight: 700;
}

.modal-temperature strong {
  color: #172033;
  font-size: 28px;
}

/* ========================================
   더움 / 선선함 배지
======================================== */

.temperature-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-height: 32px;
  padding: 5px 11px;

  border: 1px solid;
  border-radius: 999px;

  font-size: 13px;
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

/* ========================================
   상세 날씨 목록
======================================== */

.detail-information {
  padding: 18px;
  border-radius: 12px;
  background-color: #f8fafc;
}

.detail-information p {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  margin: 0;
  padding: 12px 0;

  border-bottom: 1px solid #e2e8f0;
}

.detail-information p:last-child {
  border-bottom: 0;
}

.detail-information strong {
  flex-shrink: 0;
}

/* ========================================
   날씨 안내 문구
======================================== */

.detail-advice {
  margin-top: 18px;
  padding: 16px;
  border-radius: 12px;
  background-color: #fff7ed;
  color: #9a3412;
}

.detail-advice p {
  margin: 8px 0 0;
  line-height: 1.6;
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

  .modal-overlay {
    padding: 14px;
  }

  .weather-modal {
    max-height: calc(100vh - 28px);
    padding: 19px;
  }

  .modal-heading h3 {
    font-size: 22px;
  }

  .detail-information {
    padding: 14px;
  }

  .detail-information p {
    align-items: flex-start;
    flex-direction: column;
    gap: 5px;
  }
}
</style>
