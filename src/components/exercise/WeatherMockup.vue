<script setup>
import { ref } from 'vue'

const weatherList = ref([
  {
    id: 'city_01',
    name: '서울',
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
    temp: 25,
    status: '강풍',
    icon: '💨',
    humidity: 84,
    wind: 8.7,
    favorite: false,
  },
])

const searchCity = ref('')
const selectedCity = ref('')

const showDetail = (cityname, status) => {
  window.alert(`${cityname}의 현재 날씨는 [${status}] 상태입니다.`)
}

const theme = ref('light')

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}
const showFavorites = ref(false)
</script>

<template>
  <div class="weather-page" :class="theme === 'dark' ? 'dark-mode' : 'light-mode'">
    <h2>🌤️ 과제 1: 날씨 (Mockup)</h2>

    <!-- 테마: 다크 모드 / 라이트 모드 -->
    <button type="button" class="theme-button" @click="toggleTheme">
      {{ theme === 'light' ? '다크 모드' : '라이트 모드' }}
    </button>

    <!-- 도시 검색 -->
    <section class="weather-section">
      <h3>🔍 도시 검색</h3>

      <div class="search-box">
        <input
          :value="searchCity"
          @input="searchCity = $event.target.value"
          placeholder="검색할 도시 이름 입력"
        />

        <button type="button" @click="selectedCity = searchCity">검색 도시 선택</button>
      </div>

      <p class="search-result">검색 중인 도시: {{ searchCity }}</p>
    </section>

    <!-- 즐겨찾기 -->
    <section class="weather-section favorite-section">
      <button type="button" class="favorite-toggle-button" @click="showFavorites = !showFavorites">
        {{
          showFavorites
            ? '⭐ 즐겨찾기 목록 닫기'
            : `⭐ 즐겨찾기 목록 보기 (${weatherList.filter((city) => city.favorite).length})`
        }}
      </button>

      <div v-if="showFavorites" class="favorite-content">
        <p v-if="weatherList.filter((city) => city.favorite).length === 0" class="favorite-empty">
          아직 즐겨찾기한 도시가 없습니다.
        </p>

        <div v-else class="favorite-list">
          <template v-for="city in weatherList" :key="`favorite-${city.id}`">
            <div v-if="city.favorite" class="favorite-item" @click="selectedCity = city.name">
              <span class="favorite-city"> {{ city.icon }} {{ city.name }} </span>

              <span class="favorite-weather"> {{ city.temp }}℃ · {{ city.status }} </span>

              <button
                type="button"
                class="favorite-remove-button"
                @click.stop="city.favorite = false"
              >
                즐겨찾기 해제
              </button>
            </div>
          </template>
        </div>
      </div>
    </section>

    <!-- 지역별 날씨 현황 -->
    <section class="weather-section">
      <h3>🏙️ 지역별 날씨 현황</h3>

      <div class="weather-grid">
        <div
          v-for="city in weatherList"
          :key="city.id"
          class="weather-card"
          :class="[
            city.temp >= 25 ? 'hot' : 'cool',
            {
              selected: selectedCity === city.name,
              searched: searchCity === city.name,
            },
          ]"
          @click="selectedCity = city.name"
        >
          <h4>{{ city.icon }} {{ city.name }} ({{ city.status }})</h4>

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

          <p v-if="searchCity === city.name">🔍 현재 검색한 도시입니다.</p>

          <div class="weather-actions">
            <button
              type="button"
              class="detail-button"
              @click.stop="showDetail(city.name, city.status)"
            >
              상세보기
            </button>

            <button
              type="button"
              class="favorite-button"
              @click.stop="city.favorite = !city.favorite"
            >
              {{ city.favorite ? '★ 즐겨찾기 해제' : '☆ 즐겨찾기' }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <p v-if="selectedCity" class="selected-message">{{ selectedCity }}이(가) 선택되었습니다.</p>

    <p v-else class="empty-message">카드를 클릭하거나 검색해 보세요.</p>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

/* =========================
   전체 페이지 및 컨테이너
========================= */

.weather-page {
  width: 100%;
  min-height: 100vh;
  padding: 40px clamp(24px, 5vw, 80px) 64px;
  transition:
    background-color 0.25s ease,
    color 0.25s ease;
}

.weather-container {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
}

/* =========================
   라이트 모드
========================= */

.weather-page.light-mode {
  background-color: #f5f7fb;
  color: #1f2937;
}

.light-mode h2,
.light-mode h3,
.light-mode h4 {
  color: #172033;
}

.light-mode .search-result {
  color: #64748b;
}

.light-mode .weather-card {
  border-color: #dbe3ee;
  background-color: #ffffff;
  color: #1f2937;
  box-shadow: 0 6px 18px rgb(15 23 42 / 8%);
}

.light-mode .weather-message {
  background-color: #f8fafc;
  color: #334155;
}

.light-mode .selected-message {
  background-color: #dcfce7;
  color: #166534;
}

.light-mode .empty-message {
  background-color: #e2e8f0;
  color: #475569;
}

/* =========================
   다크 모드
========================= */

.weather-page.dark-mode {
  background-color: #111827;
  color: #e5e7eb;
}

.dark-mode h2,
.dark-mode h3,
.dark-mode h4 {
  color: #f8fafc;
}

.dark-mode .search-result {
  color: #cbd5e1;
}

.dark-mode .weather-card {
  border-color: #374151;
  background-color: #1f2937;
  color: #f3f4f6;
  box-shadow: 0 8px 22px rgb(0 0 0 / 35%);
}

.dark-mode .weather-message {
  background-color: #111827;
  color: #d1d5db;
}

.dark-mode .selected-message {
  background-color: #14532d;
  color: #dcfce7;
}

.dark-mode .empty-message {
  background-color: #374151;
  color: #d1d5db;
}

/* =========================
   상단 헤더
========================= */

.page-header {
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 36px;
  padding-right: 150px;
}

.page-header h2 {
  margin: 0;
  font-size: clamp(26px, 3vw, 36px);
  line-height: 1.3;
}

.theme-button {
  flex: 0 0 auto;
  margin-left: auto;
  padding: 10px 16px;
  border: 1px solid transparent;
  border-radius: 999px;
  font: inherit;
  font-size: 15px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.theme-button:hover {
  transform: translateY(-1px);
}

.light-mode .theme-button {
  border-color: #cbd5e1;
  background-color: #172033;
  color: #ffffff;
}

.light-mode .theme-button:hover {
  background-color: #334155;
}

.dark-mode .theme-button {
  border-color: #64748b;
  background-color: #f8fafc;
  color: #172033;
}

.dark-mode .theme-button:hover {
  background-color: #e2e8f0;
}

/* =========================
   공통 섹션
========================= */

.weather-section {
  margin-bottom: 36px;
}

.weather-section h3 {
  margin: 0 0 18px;
  font-size: 24px;
  line-height: 1.4;
}

/* =========================
   검색 영역
========================= */

.search-box {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.search-box input {
  flex: 1;
  min-width: 0;
  padding: 13px 15px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background-color: #ffffff;
  color: #111827;
  font: inherit;
  outline: none;
}

.search-box input::placeholder {
  color: #94a3b8;
}

.dark-mode .search-box input {
  border-color: #4b5563;
  background-color: #1f2937;
  color: #f9fafb;
}

.dark-mode .search-box input::placeholder {
  color: #9ca3af;
}

.search-box input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgb(37 99 235 / 18%);
}

.search-box button {
  flex: 0 0 auto;
  padding: 12px 18px;
  border: 0;
  border-radius: 10px;
  background-color: #2563eb;
  color: #ffffff;
  font: inherit;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
}

.search-box button:hover {
  background-color: #1d4ed8;
}

.search-result {
  margin: 8px 0 0;
}

/* =========================
   즐겨찾기 토글 영역
========================= */

.favorite-section {
  margin-bottom: 36px;
}

.favorite-toggle-button {
  width: 100%;
  padding: 15px 18px;
  border: 1px solid;
  border-radius: 12px;
  font: inherit;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.light-mode .favorite-toggle-button {
  border-color: #fde68a;
  background-color: #fffbeb;
  color: #854d0e;
}

.light-mode .favorite-toggle-button:hover {
  border-color: #f59e0b;
  background-color: #fef3c7;
}

.dark-mode .favorite-toggle-button {
  border-color: #854d0e;
  background-color: #422006;
  color: #fef3c7;
}

.dark-mode .favorite-toggle-button:hover {
  border-color: #facc15;
  background-color: #713f12;
}

.favorite-content {
  margin-top: 12px;
  padding: 18px;
  border: 1px solid;
  border-radius: 12px;
}

.light-mode .favorite-content {
  border-color: #fde68a;
  background-color: #fffbeb;
}

.dark-mode .favorite-content {
  border-color: #854d0e;
  background-color: #29220f;
}

.favorite-list {
  display: grid;
  gap: 10px;
}

.favorite-item {
  display: grid;
  grid-template-columns: minmax(140px, 1fr) auto auto;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border: 1px solid;
  border-radius: 10px;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.favorite-item:hover {
  transform: translateY(-2px);
}

.light-mode .favorite-item {
  border-color: #fde68a;
  background-color: #ffffff;
  color: #1f2937;
}

.light-mode .favorite-item:hover {
  border-color: #f59e0b;
  background-color: #fffbeb;
}

.dark-mode .favorite-item {
  border-color: #854d0e;
  background-color: #1f2937;
  color: #f9fafb;
}

.dark-mode .favorite-item:hover {
  border-color: #facc15;
  background-color: #29220f;
}

.favorite-city {
  font-weight: 700;
}

.favorite-weather {
  font-size: 14px;
}

.light-mode .favorite-weather {
  color: #64748b;
}

.dark-mode .favorite-weather {
  color: #d1d5db;
}

.favorite-remove-button {
  padding: 8px 11px;
  border: 0;
  border-radius: 7px;
  font: inherit;
  cursor: pointer;
}

.light-mode .favorite-remove-button {
  background-color: #fee2e2;
  color: #b91c1c;
}

.light-mode .favorite-remove-button:hover {
  background-color: #fecaca;
}

.dark-mode .favorite-remove-button {
  background-color: #7f1d1d;
  color: #fee2e2;
}

.dark-mode .favorite-remove-button:hover {
  background-color: #991b1b;
}

.favorite-empty {
  margin: 0;
  padding: 18px;
  border-radius: 10px;
  text-align: center;
}

.light-mode .favorite-empty {
  background-color: #ffffff;
  color: #78716c;
}

.dark-mode .favorite-empty {
  background-color: #1f2937;
  color: #d1d5db;
}

/* =========================
   날씨 카드 목록
========================= */

.weather-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 22px;
}

.weather-card {
  min-width: 0;
  padding: 24px;
  border: 1px solid;
  border-radius: 16px;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.weather-card:hover {
  transform: translateY(-4px);
}

.light-mode .weather-card:hover {
  border-color: #93c5fd;
  box-shadow: 0 12px 28px rgb(15 23 42 / 12%);
}

.dark-mode .weather-card:hover {
  border-color: #60a5fa;
  box-shadow: 0 14px 30px rgb(0 0 0 / 45%);
}

.weather-card h4 {
  margin: 0 0 16px;
  font-size: 22px;
  line-height: 1.4;
}

.weather-card p {
  margin: 9px 0;
  line-height: 1.55;
}

.weather-card.hot {
  border-left: 7px solid #ef4444;
}

.weather-card.cool {
  border-left: 7px solid #3b82f6;
}

/* 선택된 카드 */

.light-mode .weather-card.selected {
  outline: 3px solid #22c55e;
  background-color: #f0fdf4;
}

.dark-mode .weather-card.selected {
  outline: 3px solid #4ade80;
  background-color: #163a2a;
}

/* 검색된 카드 */

.light-mode .weather-card.searched {
  background-color: #eff6ff;
}

.dark-mode .weather-card.searched {
  background-color: #172554;
}

/* 선택과 검색이 동시에 적용된 카드 */

.light-mode .weather-card.selected.searched {
  background-color: #ecfdf5;
}

.dark-mode .weather-card.selected.searched {
  background-color: #153b32;
}

/* =========================
   날씨 안내 문구
========================= */

.weather-message {
  min-height: 82px;
  margin-top: 16px;
  padding: 14px 16px;
  border-radius: 10px;
}

.weather-message p {
  margin: 0;
}

/* =========================
   카드 버튼
========================= */

.weather-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 18px;
}

.weather-actions button {
  width: 100%;
  min-height: 42px;
  padding: 9px 12px;
  border-radius: 8px;
  font: inherit;
  cursor: pointer;
}

.detail-button {
  border: 1px solid #2563eb;
  background-color: #334155;
  color: #ffffff;
}

.detail-button:hover {
  background-color: #1e293b;
}

.dark-mode .detail-button {
  border-color: #60a5fa;
  background-color: #2563eb;
}

.dark-mode .detail-button:hover {
  background-color: #1d4ed8;
}

.favorite-button {
  border: 1px solid #fde68a;
  background-color: #fef3c7;
  color: #92400e;
}

.favorite-button:hover {
  background-color: #fde68a;
}

.dark-mode .favorite-button {
  border-color: #facc15;
  background-color: #713f12;
  color: #fef9c3;
}

.dark-mode .favorite-button:hover {
  background-color: #854d0e;
}

/* =========================
   하단 선택 상태
========================= */

.selected-message,
.empty-message {
  margin-top: 28px;
  padding: 15px 18px;
  border-radius: 10px;
  font-weight: 700;
  text-align: center;
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
}

/* =========================
   모바일
========================= */

@media (max-width: 600px) {
  .weather-page {
    padding: 24px 16px 40px;
  }

  /*
   * 제목과 테마 버튼은 같은 줄을 유지합니다.
   * 버튼은 margin-left: auto로 오른쪽 끝에 배치됩니다.
   */
  .page-header {
    align-items: center;
    gap: 10px;
    margin-bottom: 28px;
  }

  .page-header h2 {
    font-size: 22px;
  }

  .theme-button {
    padding: 8px 11px;
    font-size: 13px;
  }

  .search-box {
    flex-direction: column;
  }

  .search-box button {
    width: 100%;
  }

  .favorite-item {
    grid-template-columns: 1fr;
    align-items: stretch;
  }

  .favorite-remove-button {
    width: 100%;
  }

  .weather-grid {
    grid-template-columns: 1fr;
  }

  .weather-actions {
    grid-template-columns: 1fr;
  }
}
</style>
