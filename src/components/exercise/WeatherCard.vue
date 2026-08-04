<script setup>
import { computed } from 'vue'

import { useTemperature } from '@/composables/useTemperature'

import { getWeatherIconUrl } from '@/utils/getWeatherIconUrl'

// ========================================
// Props
// ========================================

const props = defineProps({
  city: {
    type: Object,
    required: true,
  },

  selected: {
    type: Boolean,
    default: false,
  },
})

// ========================================
// Emits
// ========================================

const emit = defineEmits(['select', 'click-detail', 'toggle-favorite', 'remove'])

// ========================================
// 온도 및 아이콘
// ========================================

const rawTemperature = computed(() => {
  return props.city.main?.temp
})

const { formattedTemperature } = useTemperature(rawTemperature)

const weatherIconUrl = computed(() => {
  if (!props.city.weather?.icon) {
    return ''
  }

  return getWeatherIconUrl(props.city.weather.icon, '2x')
})

// ========================================
// 이벤트
// ========================================

const handleSelect = () => {
  emit('select', props.city)
}

const handleDetail = () => {
  /**
   * 상세 페이지에는 도시 객체 전체가 아니라
   * 도시 ID만 전달합니다.
   */
  emit('click-detail', props.city.id)
}

const handleFavorite = () => {
  emit('toggle-favorite', props.city)
}

const handleRemove = () => {
  emit('remove', props.city)
}
</script>

<template>
  <article
    class="weather-card"
    :class="{
      selected,
    }"
  >
    <!-- 카드의 날씨 정보 선택 영역 -->
    <button type="button" class="card-main-button" :aria-pressed="selected" @click="handleSelect">
      <div class="card-header">
        <div class="city-heading">
          <p class="city-region">
            {{ city.region }}
          </p>

          <h3 class="city-name">
            {{ city.name }}
          </h3>

          <p v-if="city.state || city.countryCode" class="city-location">
            <span v-if="city.state">
              {{ city.state }}
            </span>

            <span v-if="city.state && city.countryCode" aria-hidden="true"> · </span>

            <span>
              {{ city.countryCode }}
            </span>
          </p>
        </div>

        <img
          v-if="weatherIconUrl"
          :src="weatherIconUrl"
          :alt="
            city.weather?.description ? `${city.weather.description} 날씨 아이콘` : '날씨 아이콘'
          "
          class="weather-icon"
        />
      </div>

      <div class="weather-summary">
        <p class="temperature">
          {{ formattedTemperature }}
        </p>

        <p class="weather-description">
          {{ city.weather?.description || '날씨 정보 없음' }}
        </p>
      </div>
    </button>

    <!-- 카드 내부 기능 버튼 -->
    <div class="card-actions">
      <button type="button" class="detail-button" @click.stop="handleDetail">상세 날씨 보기</button>

      <button
        type="button"
        class="favorite-button"
        :class="{
          'favorite-button-active': city.favorite,
        }"
        :aria-pressed="city.favorite"
        :aria-label="city.favorite ? `${city.name} 즐겨찾기 해제` : `${city.name} 즐겨찾기 추가`"
        @click.stop="handleFavorite"
      >
        <span aria-hidden="true">
          {{ city.favorite ? '★' : '☆' }}
        </span>

        {{ city.favorite ? '즐겨찾기 해제' : '즐겨찾기 추가' }}
      </button>

      <button
        type="button"
        class="remove-button"
        :aria-label="`${city.name}을 대시보드에서 삭제`"
        @click.stop="handleRemove"
      >
        대시보드에서 삭제
      </button>
    </div>
  </article>
</template>

<style scoped>
.weather-card {
  overflow: hidden;

  width: 100%;

  border: 1px solid #dbe3ee;
  border-radius: 16px;

  background-color: #ffffff;

  box-shadow: 0 8px 22px rgb(15 23 42 / 6%);

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.weather-card:hover {
  border-color: #bfdbfe;

  box-shadow: 0 12px 28px rgb(15 23 42 / 9%);
}

.weather-card.selected {
  border-color: #2563eb;

  box-shadow: 0 0 0 3px rgb(37 99 235 / 14%);
}

.card-main-button {
  display: block;

  box-sizing: border-box;

  width: 100%;

  padding: 22px;

  border: 0;

  background-color: transparent;
  color: inherit;

  font: inherit;
  text-align: left;

  cursor: pointer;
}

.card-main-button:focus-visible {
  outline: 3px solid rgb(37 99 235 / 28%);

  outline-offset: -3px;
}

.card-header {
  display: flex;

  align-items: flex-start;
  justify-content: space-between;

  gap: 16px;
}

.city-heading {
  min-width: 0;
}

.city-region,
.city-name,
.city-location,
.temperature,
.weather-description {
  margin: 0;
}

.city-region {
  color: #2563eb;

  font-size: 12px;
  font-weight: 850;
}

.city-name {
  margin-top: 5px;

  overflow-wrap: anywhere;

  color: #0f172a;

  font-size: 22px;
  line-height: 1.3;
}

.city-location {
  margin-top: 5px;

  color: #64748b;

  font-size: 12px;
  line-height: 1.5;
}

.weather-icon {
  flex: 0 0 auto;

  width: 72px;
  height: 72px;

  object-fit: contain;
}

.weather-summary {
  margin-top: 22px;
}

.temperature {
  color: #172033;

  font-size: 38px;
  font-weight: 900;
  line-height: 1;
}

.weather-description {
  margin-top: 8px;

  color: #64748b;

  font-size: 14px;
  font-weight: 700;
}

.card-actions {
  display: grid;

  grid-template-columns: repeat(2, minmax(0, 1fr));

  gap: 9px;

  padding: 0 22px 22px;
}

.detail-button,
.favorite-button,
.remove-button {
  min-height: 42px;

  padding: 9px 12px;

  border-radius: 9px;

  font: inherit;
  font-size: 13px;
  font-weight: 800;

  cursor: pointer;
}

.detail-button {
  border: 1px solid #2563eb;

  background-color: #2563eb;
  color: #ffffff;
}

.detail-button:hover {
  background-color: #1d4ed8;
}

.favorite-button {
  border: 1px solid #cbd5e1;

  background-color: #ffffff;
  color: #334155;

  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
}

/* 즐겨찾기되지 않은 상태 */
.favorite-button:hover {
  border-color: #f59e0b;

  background-color: #fffbeb;
  color: #b45309;
}

/* 즐겨찾기된 상태 */
.favorite-button-active {
  border-color: #f59e0b;

  background-color: #fef3c7;
  color: #92400e;

  box-shadow: inset 0 0 0 1px rgb(245 158 11 / 10%);
}

.favorite-button-active:hover {
  border-color: #d97706;

  background-color: #fde68a;
  color: #78350f;
}

.remove-button {
  grid-column: 1 / -1;

  border: 1px solid #fecaca;

  background-color: #ffffff;
  color: #b91c1c;
}

.remove-button:hover {
  background-color: #fef2f2;
}

.detail-button:focus-visible,
.favorite-button:focus-visible,
.remove-button:focus-visible {
  outline: 3px solid rgb(37 99 235 / 24%);

  outline-offset: 2px;
}

@media (max-width: 420px) {
  .card-actions {
    grid-template-columns: 1fr;
  }

  .remove-button {
    grid-column: auto;
  }
}
</style>
