<script setup>
import '@/assets/exercise.css'
import { ref, computed, watch, watchEffect } from 'vue'

// =========================
// 날씨 데이터
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

const handleSearchInput = (event) => {
  searchQuery.value = event.target.value
}

const filteredWeatherList = computed(() => {
  const keyword = searchQuery.value.trim()

  if (keyword === '') {
    return weatherList.value
  }

  return weatherList.value.filter(
    (city) => city.name.includes(keyword) || city.chosung.includes(keyword),
  )
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

// =========================
// watchEffect
// =========================

watchEffect(() => {
  console.log(
    `[watchEffect 자동 호출] 현재 검색어 "${searchQuery.value}"에 매칭되는 API 데이터를 필터링합니다.`,
  )
})

// =========================
// 테마 변경
// =========================

const theme = ref('light')

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

// =========================
// 즐겨찾기
// =========================

const showFavorites = ref(false)

const favoriteWeatherList = computed(() => {
  return weatherList.value.filter((city) => city.favorite)
})

const toggleFavorite = (city) => {
  city.favorite = !city.favorite
}

const removeFavorite = (city) => {
  city.favorite = false
}
</script>

<template>
  <div class="weather-page" :class="theme === 'dark' ? 'dark-mode' : 'light-mode'">
    <div class="weather-container">
      <!-- 제목 및 테마 버튼 -->
      <header class="page-header">
        <h2>🌤️ 과제 1: 날씨 (Composition API)</h2>

        <button type="button" class="theme-button" @click="toggleTheme">
          {{ theme === 'light' ? '🌙 다크 모드' : '☀️ 라이트 모드' }}
        </button>
      </header>

      <!-- 도시 검색 -->
      <section class="weather-section">
        <h3>🔍 도시 검색</h3>

        <div class="search-box">
          <input
            :value="searchQuery"
            type="text"
            placeholder="도시 이름 또는 초성 입력 (예: 대전, ㄷㅈ)"
            @input="handleSearchInput"
            @compositionupdate="handleSearchInput"
          />
        </div>

        <p class="search-result">
          검색 중인 도시:
          {{ searchQuery.trim() || '없음' }}
        </p>
      </section>

      <!-- 즐겨찾기 -->
      <section class="weather-section favorite-section">
        <button
          type="button"
          class="favorite-toggle-button"
          @click="showFavorites = !showFavorites"
        >
          {{
            showFavorites
              ? '⭐ 즐겨찾기 목록 닫기'
              : `⭐ 즐겨찾기 목록 보기 (${favoriteWeatherList.length})`
          }}
        </button>

        <div v-if="showFavorites" class="favorite-content">
          <p v-if="favoriteWeatherList.length === 0" class="favorite-empty">
            아직 즐겨찾기한 도시가 없습니다.
          </p>

          <div v-else class="favorite-list">
            <div
              v-for="city in favoriteWeatherList"
              :key="`favorite-${city.id}`"
              class="favorite-item"
              @click="selectCity(city)"
            >
              <span class="favorite-city"> {{ city.icon }} {{ city.name }} </span>

              <span class="favorite-weather"> {{ city.temp }}℃ · {{ city.status }} </span>

              <button
                type="button"
                class="favorite-remove-button"
                @click.stop="removeFavorite(city)"
              >
                즐겨찾기 해제
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 지역별 날씨 -->
      <section class="weather-section">
        <h3>🏙️ 지역별 날씨 현황</h3>

        <div v-if="filteredWeatherList.length > 0" class="weather-grid">
          <article
            v-for="city in filteredWeatherList"
            :key="city.id"
            class="weather-card"
            :class="[
              city.temp >= 25 ? 'hot' : 'cool',
              {
                selected: selectedCityInfo === city.name,
                searched:
                  searchQuery.trim() !== '' &&
                  (city.name.includes(searchQuery.trim()) ||
                    city.chosung.includes(searchQuery.trim())),
              },
            ]"
            @click="selectCity(city)"
          >
            <h4>
              {{ city.icon }}
              {{ city.name }}
              ({{ city.status }})
            </h4>

            <p>현재 기온: {{ city.temp }}℃</p>
            <p>습도: {{ city.humidity }}%</p>
            <p>풍속: {{ city.wind }}m/s</p>

            <p v-if="city.temp >= 25">🔥 더움 (25℃ 이상)</p>

            <p v-else>❄️ 선선함 (25℃ 미만)</p>

            <div class="weather-message">
              <p v-if="city.status === '비' || city.status === '소나기'">
                우산을 챙기고 미끄러운 길을 조심하세요.
              </p>

              <p v-else-if="city.status === '폭염'">야외 활동을 줄이고 수분을 충분히 섭취하세요.</p>

              <p v-else-if="city.status === '강풍'">강한 바람에 날릴 수 있는 물건을 주의하세요.</p>

              <p v-else-if="city.status === '맑음' && city.temp >= 25">
                자외선 차단제를 준비하고 수분을 섭취하세요.
              </p>

              <p v-else>가벼운 외출이나 산책을 하기 좋은 날씨입니다.</p>
            </div>

            <p
              v-if="
                searchQuery.trim() !== '' &&
                (city.name.includes(searchQuery.trim()) ||
                  city.chosung.includes(searchQuery.trim()))
              "
              class="searched-message"
            >
              🔍 현재 검색 조건과 일치하는 도시입니다.
            </p>

            <div class="weather-actions">
              <button type="button" class="detail-button" @click.stop="showDetail(city)">
                상세보기
              </button>

              <button type="button" class="favorite-button" @click.stop="toggleFavorite(city)">
                {{ city.favorite ? '★ 즐겨찾기 해제' : '☆ 즐겨찾기' }}
              </button>
            </div>
          </article>
        </div>

        <p v-else class="empty-message">검색 결과와 일치하는 도시가 없습니다.</p>
      </section>

      <!-- 상세 정보 및 지도 -->
      <section v-if="selectedCityDetail" class="weather-detail">
        <div class="detail-header">
          <h3>
            {{ selectedCityDetail.icon }}
            {{ selectedCityDetail.name }} 상세 날씨
          </h3>

          <button type="button" class="detail-close-button" @click="closeDetail">닫기</button>
        </div>

        <div class="detail-content">
          <div class="detail-information">
            <p>
              <strong>날씨 상태</strong>
              <span>{{ selectedCityDetail.status }}</span>
            </p>

            <p>
              <strong>현재 기온</strong>
              <span>{{ selectedCityDetail.temp }}℃</span>
            </p>

            <p>
              <strong>습도</strong>
              <span>{{ selectedCityDetail.humidity }}%</span>
            </p>

            <p>
              <strong>풍속</strong>
              <span>{{ selectedCityDetail.wind }}m/s</span>
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

      <!-- 선택 상태 -->
      <p v-if="selectedCityInfo" class="selected-message">
        {{ selectedCityInfo }}이(가) 선택되었습니다.
      </p>

      <p v-else class="empty-message">카드를 클릭하거나 상세보기 버튼을 눌러보세요.</p>
    </div>
  </div>
</template>
