<script setup>
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

const selectCard = () => {
  emit('select-card', props.city)
}

const clickDetail = () => {
  emit('click-detail', props.city)
}

const clickFavorite = () => {
  emit('toggle-favorite', props.city)
}

const getWeatherAdvice = () => {
  if (props.city.status === '비' || props.city.status === '소나기') {
    return '우산을 챙기고 미끄러운 길을 조심하세요.'
  }

  if (props.city.status === '폭염') {
    return '야외 활동을 줄이고 수분을 충분히 섭취하세요.'
  }

  if (props.city.status === '강풍') {
    return '강한 바람에 날릴 수 있는 물건을 주의하세요.'
  }

  if (props.city.status === '맑음' && props.city.temp >= 25) {
    return '자외선 차단제를 준비하고 물을 자주 마시세요.'
  }

  return '가벼운 외출이나 산책을 하기 좋은 날씨입니다.'
}
</script>

<template>
  <article
    class="weather-card"
    :class="[
      city.temp >= 25 ? 'hot' : 'cool',
      {
        selected,
        searched,
      },
    ]"
    @click="selectCard"
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
      <p>
        {{ getWeatherAdvice() }}
      </p>
    </div>

    <p v-if="searched" class="searched-message">🔍 현재 검색 조건과 일치하는 도시입니다.</p>

    <div class="weather-actions">
      <button type="button" class="detail-button" @click.stop="clickDetail">상세보기</button>

      <button type="button" class="favorite-button" @click.stop="clickFavorite">
        {{ city.favorite ? '★ 즐겨찾기 해제' : '☆ 즐겨찾기' }}
      </button>
    </div>
  </article>
</template>

<style scoped>
.weather-card {
  min-width: 0;
  padding: 24px;
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

.weather-card h4 {
  margin: 0 0 16px;
  color: #172033;
  font-size: 22px;
  line-height: 1.4;
}

.weather-card p {
  margin: 9px 0;
  line-height: 1.55;
}

/* 기온에 따른 카드 구분 */

.weather-card.hot {
  border-left: 7px solid #ef4444;
}

.weather-card.cool {
  border-left: 7px solid #3b82f6;
}

/* 선택된 카드 */

.weather-card.selected {
  outline: 3px solid #22c55e;
  background-color: #f0fdf4;
}

/* 검색 결과 카드 */

.weather-card.searched {
  background-color: #eff6ff;
}

.weather-card.selected.searched {
  background-color: #ecfdf5;
}

/* 날씨 안내 문구 */

.weather-message {
  min-height: 82px;
  margin-top: 16px;
  padding: 14px 16px;
  border-radius: 10px;
  background-color: #f8fafc;
  color: #334155;
}

.weather-message p {
  margin: 0;
}

.searched-message {
  color: #1d4ed8;
  font-weight: 700;
}

/* 버튼 */

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
  font-weight: 700;
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
