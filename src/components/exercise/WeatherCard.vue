<script setup>
const props = defineProps({
  // 도시 날씨 객체
  city: {
    type: Object,
    required: true,
  },

  // 현재 선택된 카드인지 여부
  selected: {
    type: Boolean,
    default: false,
  },

  // 현재 검색어와 일치하는 카드인지 여부
  searched: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select-card', 'click-detail', 'toggle-favorite'])

/**
 * 카드 전체를 클릭했을 때 실행됩니다.
 */
const selectCard = () => {
  emit('select-card', props.city)
}

/**
 * 상세정보 버튼을 클릭했을 때 실행됩니다.
 */
const clickDetail = () => {
  emit('click-detail', props.city)
}

/**
 * 즐겨찾기 버튼을 클릭했을 때 실행됩니다.
 */
const clickFavorite = () => {
  emit('toggle-favorite', props.city)
}

/**
 * OpenWeather 아이콘 코드로
 * 날씨 이미지 URL을 생성합니다.
 *
 * 현재는 고정 iconCode를 사용하지만,
 * 향후 API 응답의 icon 값을 그대로 사용할 수 있습니다.
 */
const getWeatherIconUrl = (iconCode) => {
  if (!iconCode) {
    return ''
  }

  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`
}
</script>

<template>
  <article
    class="weather-card"
    :class="{
      selected,
      searched,
    }"
    @click="selectCard"
  >
    <div class="card-header">
      <div class="city-heading">
        <img
          v-if="city.iconCode"
          :src="getWeatherIconUrl(city.iconCode)"
          :alt="`${city.description} 날씨 아이콘`"
          class="weather-icon"
        />

        <div>
          <h4>{{ city.name }}</h4>

          <!-- 도시가 소속된 지역을 표시 -->
          <p class="region-name">
            {{ city.region }}
          </p>
        </div>
      </div>

      <span class="weather-status">
        {{ city.status }}
      </span>
    </div>

    <p class="temperature">
      현재 기온

      <strong> {{ city.temp }}℃ </strong>
    </p>

    <!-- 과제 조건: 25℃를 기준으로 상태 구분 -->
    <span v-if="city.temp >= 25" class="temperature-badge hot-badge"> 더움 </span>

    <span v-else class="temperature-badge cool-badge"> 선선함 </span>

    <!-- 검색어가 입력된 경우에만 검색 결과 안내 표시 -->
    <p v-if="searched" class="searched-message">현재 검색 조건과 일치하는 도시입니다.</p>

    <div class="weather-actions">
      <!--
        .stop을 사용해 버튼 클릭 시
        카드 전체 클릭 이벤트가 함께 실행되지 않게 합니다.
      -->
      <button type="button" class="detail-button" @click.stop="clickDetail">상세정보</button>

      <button type="button" class="favorite-button" @click.stop="clickFavorite">
        {{ city.favorite ? '★ 즐겨찾기 해제' : '☆ 즐겨찾기' }}
      </button>
    </div>
  </article>
</template>

<style scoped>
.weather-card {
  min-width: 0;
  padding: 22px;
  border: 1px solid #dbe3ee;
  border-radius: 16px;
  background-color: #ffffff;
  color: #1f2937;
  cursor: pointer;
  box-shadow: 0 6px 18px rgb(15 23 42 / 8%);

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.weather-card:hover {
  transform: translateY(-4px);
  border-color: #93c5fd;
  box-shadow: 0 12px 28px rgb(15 23 42 / 12%);
}

/* 카드 헤더 */

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.city-heading {
  display: flex;
  align-items: center;
  min-width: 0;
}

.weather-icon {
  flex-shrink: 0;
  width: 62px;
  height: 62px;
  margin-left: -10px;
  object-fit: contain;
}

.city-heading h4 {
  margin: 0;
  color: #172033;
  font-size: 22px;
  line-height: 1.4;
}

.region-name {
  margin: 3px 0 0;
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
}

.weather-status {
  flex-shrink: 0;
  margin-left: auto;
  padding: 5px 9px;
  border-radius: 999px;
  background-color: #f1f5f9;
  color: #475569;
  font-size: 13px;
  font-weight: 700;
}

/* 현재 기온 */

.temperature {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 18px 0 12px;
  color: #475569;
  font-size: 16px;
}

.temperature strong {
  color: #172033;
  font-size: 25px;
}

/* 더움 / 선선함 상태 배지 */

.temperature-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  padding: 6px 13px;
  border: 1px solid;
  border-radius: 999px;
  font-size: 14px;
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

/* 선택 카드와 검색 카드 표시 */

.weather-card.selected {
  outline: 3px solid #22c55e;
  background-color: #f0fdf4;
}

.weather-card.searched {
  border-color: #60a5fa;
}

.weather-card.selected.searched {
  background-color: #ecfdf5;
}

.searched-message {
  margin: 15px 0 0;
  color: #1d4ed8;
  font-size: 13px;
  font-weight: 700;
}

/* 하단 버튼 */

.weather-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 20px;
}

.weather-actions button {
  width: 100%;
  min-height: 42px;
  padding: 9px 12px;
  border-radius: 8px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.detail-button {
  border: 1px solid #334155;
  background-color: #334155;
  color: #ffffff;
}

.detail-button:hover {
  background-color: #1e293b;
}

.favorite-button {
  border: 1px solid #fde68a;
  background-color: #fef3c7;
  color: #92400e;
}

.favorite-button:hover {
  background-color: #fde68a;
}

@media (max-width: 600px) {
  .weather-actions {
    grid-template-columns: 1fr;
  }
}
</style>
