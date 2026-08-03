<script setup>
defineProps({
  searchQuery: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update-query'])

const handleInput = (event) => {
  emit('update-query', event.target.value)
}
</script>

<template>
  <div class="search-panel">
    <div class="search-area">
      <label for="city-search" class="search-label"> 검색할 도시 </label>

      <input
        id="city-search"
        :value="searchQuery"
        type="text"
        class="search-input"
        placeholder="도시 이름 또는 초성 입력 (예: 대전, ㄷㅈ)"
        @input="handleInput"
        @compositionupdate="handleInput"
      />
    </div>
  </div>
</template>

<style scoped>
.search-panel {
  padding: 18px;
  border: 1px solid #dbe3ee;
  border-radius: 12px;
  background-color: #f8fafc;
  transition:
    background-color 0.25s ease,
    border-color 0.25s ease;
}

.search-area {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.search-label {
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
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
}

.search-input::placeholder {
  color: #94a3b8;
}

.search-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgb(37 99 235 / 18%);
}

:global(.dark-mode) .search-panel {
  border-color: #334155;
  background-color: #0f172a;
}

:global(.dark-mode) .search-label {
  color: #e2e8f0;
}

:global(.dark-mode) .search-input {
  border-color: #475569;
  background-color: #1e293b;
  color: #f8fafc;
}

:global(.dark-mode) .search-input::placeholder {
  color: #94a3b8;
}
</style>
