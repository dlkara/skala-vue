<script setup>
import { computed } from 'vue'

import { getWeatherIconUrl } from '@/utils/getWeatherIconUrl'

const props = defineProps({
  city: {
    type: Object,
    required: true,
  },

  selected: {
    type: Boolean,
    default: false,
  },

  searched: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select-card', 'click-detail', 'toggle-favorite'])

const cityTitleId = computed(() => {
  return `city-title-${props.city.id}`
})

/**
 * OpenWeatherMap 공식 아이콘 주소입니다.
 */
const weatherIconUrl = computed(() => {
  return getWeatherIconUrl(props.city.weather.icon, '2x')
})

/**
 * 기온 상태를 색상뿐 아니라 텍스트로 표시합니다.
 */
const temperatureStatus = computed(() => {
  const temperature = props.city.main.temp

  if (temperature === null) {
    return '기온 정보 없음'
  }

  if (temperature >= 30) {
    return '더운 날씨'
  }

  if (temperature <= 10) {
    return '쌀쌀한 날씨'
  }

  return '선선한 날씨'
})

const handleSelect = () => {
  emit('select-card', props.city)
}

const handleDetail = () => {
  emit('click-detail', props.city.id)
}

const handleFavorite = () => {
  emit('toggle-favorite', props.city)
}
</script>

<template>
  <article
    class="weather-card"
    :class="{
      selected,
      searched,
    }"
    :aria-labelledby="cityTitleId"
  >
    <header class="card-header">
      <div class="city-information">
        <div class="city-heading">
          <h2 :id="cityTitleId">
            {{ city.name }}
          </h2>

          <span v-if="selected" class="state-badge selected-badge"> 선택됨 </span>

          <span v-if="searched" class="state-badge searched-badge"> 검색 결과 </span>
        </div>

        <p class="region">
          {{ city.region }}
        </p>
      </div>

      <button
        type="button"
        class="favorite-button"
        :class="{
          active: city.favorite,
        }"
        :aria-pressed="city.favorite"
        :aria-label="city.favorite ? `${city.name} 즐겨찾기 해제` : `${city.name} 즐겨찾기 추가`"
        @click="handleFavorite"
      >
        <span class="favorite-icon" aria-hidden="true">
          {{ city.favorite ? '★' : '☆' }}
        </span>

        <span>
          {{ city.favorite ? '즐겨찾기 해제' : '즐겨찾기 추가' }}
        </span>
      </button>
    </header>

    <div class="weather-main">
      <!--
        바로 옆에 날씨 설명이 있으므로
        아이콘은 장식 이미지로 처리합니다.
      -->
      <img
        v-if="weatherIconUrl"
        :src="weatherIconUrl"
        alt=""
        class="weather-icon"
        aria-hidden="true"
      />

      <div v-else class="weather-icon-placeholder" aria-hidden="true" />

      <div class="weather-summary">
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
    </div>

    <!--
      최저·최고 기온, 습도, 풍속은
      상세 페이지에서만 제공합니다.
    -->

    <span
      class="temperature-badge"
      :class="{
        hot: city.main.temp >= 30,
        cold: city.main.temp !== null && city.main.temp <= 10,
      }"
    >
      {{ temperatureStatus }}
    </span>

    <footer class="card-actions">
      <button type="button" class="select-button" :aria-pressed="selected" @click="handleSelect">
        {{ selected ? '선택된 도시' : `${city.name} 선택` }}
      </button>

      <button
        type="button"
        class="detail-button"
        :aria-label="`${city.name} 상세 날씨 보기`"
        @click="handleDetail"
      >
        상세 날씨 보기
      </button>
    </footer>
  </article>
</template>

<style scoped>
.weather-card {
  display: flex;
  flex-direction: column;

  min-width: 0;
  min-height: 300px;
  padding: 22px;

  border: 2px solid transparent;
  border-radius: 17px;

  background-color: #ffffff;

  box-shadow: 0 6px 18px rgb(15 23 42 / 7%);

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

/*
  카드를 위로 움직이지 않습니다.
  따라서 위아래 카드와 겹쳐 보이지 않습니다.
*/
.weather-card:hover {
  border-color: #bfdbfe;

  box-shadow: 0 10px 26px rgb(15 23 42 / 10%);
}

.weather-card.selected {
  border-color: #2563eb;
}

.weather-card.searched {
  box-shadow:
    0 0 0 3px rgb(245 158 11 / 22%),
    0 6px 18px rgb(15 23 42 / 7%);
}

/* ========================================
   카드 상단
======================================== */

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.city-information {
  min-width: 0;
}

.city-heading {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 7px;
}

.city-heading h2 {
  margin: 0;

  color: #172033;
  font-size: 21px;
}

.region {
  margin: 5px 0 0;

  color: #64748b;
  font-size: 14px;
}

/* ========================================
   상태 배지
======================================== */

.state-badge {
  display: inline-flex;
  align-items: center;

  min-height: 25px;
  padding: 3px 8px;

  border-radius: 999px;

  font-size: 12px;
  font-weight: 850;
}

.selected-badge {
  background-color: #dbeafe;
  color: #1d4ed8;
}

.searched-badge {
  background-color: #fef3c7;
  color: #92400e;
}

/* ========================================
   즐겨찾기
======================================== */

.favorite-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  flex-shrink: 0;

  min-height: 44px;
  padding: 8px 11px;

  border: 1px solid #cbd5e1;
  border-radius: 10px;

  background-color: #ffffff;
  color: #475569;

  font: inherit;
  font-size: 13px;
  font-weight: 800;

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
  line-height: 1;
}

/* ========================================
   현재 날씨
======================================== */

.weather-main {
  display: flex;
  align-items: center;
  gap: 16px;

  margin-top: 28px;
}

.weather-icon,
.weather-icon-placeholder {
  flex-shrink: 0;

  width: 82px;
  height: 82px;
}

.weather-icon {
  object-fit: contain;
}

.weather-summary {
  min-width: 0;
}

.temperature {
  margin: 0;

  color: #172033;
  font-size: 36px;
  font-weight: 900;
  line-height: 1.1;
}

.weather-status {
  margin: 7px 0 0;

  color: #334155;
  font-size: 16px;
  font-weight: 800;
}

.temperature-badge {
  align-self: flex-start;

  margin-top: 18px;
  padding: 6px 10px;

  border-radius: 999px;

  background-color: #ecfdf5;
  color: #047857;

  font-size: 13px;
  font-weight: 850;
}

.temperature-badge.hot {
  background-color: #fff1f2;
  color: #be123c;
}

.temperature-badge.cold {
  background-color: #eff6ff;
  color: #1d4ed8;
}

/* ========================================
   카드 버튼
======================================== */

.card-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;

  margin-top: auto;
  padding-top: 28px;
}

.select-button,
.detail-button {
  min-height: 44px;
  padding: 9px 12px;

  border-radius: 9px;

  font: inherit;
  font-size: 14px;
  font-weight: 850;

  cursor: pointer;
}

.select-button {
  border: 1px solid #cbd5e1;

  background-color: #ffffff;
  color: #334155;
}

.select-button:hover {
  background-color: #f8fafc;
}

.select-button[aria-pressed='true'] {
  border-color: #2563eb;

  background-color: #eff6ff;
  color: #1d4ed8;
}

.detail-button {
  border: 1px solid #2563eb;

  background-color: #2563eb;
  color: #ffffff;
}

.detail-button:hover {
  background-color: #1d4ed8;
}

@media (max-width: 480px) {
  .card-header {
    flex-direction: column;
  }

  .favorite-button {
    width: 100%;
  }

  .card-actions {
    grid-template-columns: 1fr;
  }
}
</style>
