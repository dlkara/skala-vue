<script setup>
/**
 * 부모 컴포넌트가 관리하는 검색어입니다.
 */
defineProps({
  query: {
    type: String,
    default: '',
  },

  /**
   * API로 새로운 지역을 검색하는 중인지 나타냅니다.
   *
   * 검색 중에는 검색 버튼을 비활성화합니다.
   */
  isSearching: {
    type: Boolean,
    default: false,
  },
})

/**
 * 부모에게 전달할 이벤트입니다.
 *
 * update-query
 * → 사용자가 입력한 검색어 전달
 *
 * search
 * → Enter 또는 검색 버튼 클릭 전달
 */
const emit = defineEmits(['update-query', 'search'])

/**
 * 입력값이 변경될 때
 * 부모 컴포넌트에 새 검색어를 전달합니다.
 */
const handleInput = (event) => {
  emit('update-query', event.target.value)
}

/**
 * form이 제출되면 부모에게
 * search 이벤트를 전달합니다.
 */
const handleSubmit = () => {
  emit('search')
}
</script>

<template>
  <form class="search-bar" @submit.prevent="handleSubmit">
    <label for="weather-city-search" class="search-label"> 도시 검색 </label>

    <div class="search-controls">
      <input
        id="weather-city-search"
        :value="query"
        type="search"
        class="search-input"
        placeholder="서울, 대전, ㅅㅇ, ㄷㅈ"
        autocomplete="off"
        aria-describedby="weather-search-help"
        @input="handleInput"
      />

      <button type="submit" class="search-button" :disabled="isSearching">
        {{ isSearching ? '검색 중' : '검색' }}
      </button>
    </div>

    <p id="weather-search-help" class="search-help">
      등록된 도시는 이름이나 초성으로 검색합니다. 등록되지 않은 지역명을 입력하고 검색하면 새 날씨
      카드가 추가됩니다. 예: 서울, 대전, ㅅㅇ, ㄷㅈ
    </p>
  </form>
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

.search-controls {
  display: grid;

  grid-template-columns:
    minmax(0, 1fr)
    auto;

  gap: 10px;
}

.search-input {
  box-sizing: border-box;

  width: 100%;
  min-width: 0;
  min-height: 48px;

  padding: 11px 14px;

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

.search-button {
  min-height: 48px;
  padding: 10px 18px;

  border: 1px solid #2563eb;
  border-radius: 10px;

  background-color: #2563eb;
  color: #ffffff;

  font: inherit;
  font-size: 14px;
  font-weight: 800;

  white-space: nowrap;

  cursor: pointer;
}

.search-button:hover {
  background-color: #1d4ed8;
}

.search-button:disabled {
  opacity: 0.55;

  cursor: not-allowed;
}

.search-help {
  margin: 7px 0 0;

  color: #64748b;

  font-size: 13px;
  line-height: 1.6;
}

@media (max-width: 600px) {
  .search-controls {
    grid-template-columns: 1fr;
  }

  .search-button {
    width: 100%;
  }
}
</style>
