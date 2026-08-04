<script setup>
defineProps({
  searchQuery: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update-query'])

/**
 * 입력값이 변경될 때마다
 * 새로운 검색어를 부모 컴포넌트에 전달합니다.
 */
const handleInput = (event) => {
  emit('update-query', event.target.value)
}
</script>

<template>
  <div class="search-panel">
    <label for="city-search" class="search-label"> 검색할 도시 </label>

    <input
      id="city-search"
      :value="searchQuery"
      type="text"
      class="search-input"
      placeholder="도시명 또는 초성 입력 (예: 서울, ㅅㅇ)"
      autocomplete="off"
      @input="handleInput"
    />
  </div>
</template>

<style scoped>
.search-panel {
  padding: 18px;
  border: 1px solid #dbe3ee;
  border-radius: 12px;
  background-color: #f8fafc;
}

.search-label {
  display: block;
  margin-bottom: 9px;
  color: #334155;
  font-weight: 700;
}

.search-input {
  width: 100%;
  padding: 13px 15px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background-color: #ffffff;
  color: #111827;
  font: inherit;
  outline: none;
  box-sizing: border-box;
}

.search-input::placeholder {
  color: #94a3b8;
}

.search-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgb(37 99 235 / 18%);
}
</style>
