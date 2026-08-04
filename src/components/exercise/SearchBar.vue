<script setup>
defineProps({
  query: {
    type: String,
    default: '',
  },

  isSearching: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update-query', 'clear'])

/**
 * 입력값이 변경될 때마다
 * 부모에게 검색어를 전달합니다.
 */
const handleInput = (event) => {
  emit('update-query', event.target.value)
}

/**
 * 검색어 삭제 버튼입니다.
 */
const handleClear = () => {
  emit('clear')
}
</script>

<template>
  <div class="search-bar">
    <label for="weather-city-search" class="search-label"> 도시 검색 </label>

    <div class="search-input-wrapper">
      <input
        id="weather-city-search"
        :value="query"
        type="search"
        class="search-input"
        placeholder="예: 부산, 광주, Tokyo"
        autocomplete="off"
        aria-describedby="weather-search-help"
        @input="handleInput"
      />

      <button
        v-if="query"
        type="button"
        class="clear-button"
        aria-label="검색어 삭제"
        @click="handleClear"
      >
        ×
      </button>
    </div>

    <p id="weather-search-help" class="search-help">
      지역명을 입력하면 잠시 후 자동으로 OpenWeather 검색 결과가 표시됩니다. 초성 검색은 현재
      대시보드의 도시 필터에만 적용됩니다.
    </p>

    <p v-if="isSearching" class="searching-message" role="status" aria-live="polite">
      지역과 현재 날씨를 검색하고 있습니다.
    </p>
  </div>
</template>

<style scoped>
.search-bar {
  width: 100%;
}

.search-label {
  display: block;

  margin-bottom: 7px;

  color: #334155;

  font-size: 14px;
  font-weight: 800;
}

.search-input-wrapper {
  position: relative;

  width: 100%;
}

.search-input {
  box-sizing: border-box;

  width: 100%;
  min-height: 48px;

  padding: 11px 46px 11px 14px;

  border: 1px solid #cbd5e1;
  border-radius: 10px;

  background-color: #ffffff;
  color: #1e293b;

  font: inherit;
}

.search-input::placeholder {
  color: #94a3b8;
}

.search-input:hover {
  border-color: #94a3b8;
}

.search-input:focus {
  border-color: #2563eb;

  outline: none;

  box-shadow: 0 0 0 3px rgb(37 99 235 / 18%);
}

/**
 * 브라우저 기본 search 취소 버튼을 숨기고
 * 프로젝트의 취소 버튼만 사용합니다.
 */
.search-input::-webkit-search-cancel-button {
  appearance: none;
}

.clear-button {
  position: absolute;
  top: 50%;
  right: 10px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 30px;
  height: 30px;

  padding: 0;

  border: 0;
  border-radius: 50%;

  background-color: #f1f5f9;
  color: #64748b;

  font-size: 22px;
  line-height: 1;

  cursor: pointer;

  transform: translateY(-50%);
}

.clear-button:hover {
  background-color: #e2e8f0;
  color: #0f172a;
}

.clear-button:focus-visible {
  outline: 3px solid rgb(37 99 235 / 25%);

  outline-offset: 2px;
}

.search-help {
  margin: 7px 0 0;

  color: #64748b;

  font-size: 13px;
  line-height: 1.6;
}

.searching-message {
  margin: 10px 0 0;

  color: #2563eb;

  font-size: 13px;
  font-weight: 800;
}
</style>
