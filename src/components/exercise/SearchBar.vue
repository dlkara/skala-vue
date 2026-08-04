<script setup>
defineProps({
  searchQuery: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update-query'])

/**
 * 입력된 검색어를 부모 컴포넌트에 전달합니다.
 */
const handleInput = (event) => {
  emit('update-query', event.target.value)
}
</script>

<template>
  <div class="search-area">
    <label for="city-search" class="search-label"> 도시 검색 </label>

    <p id="city-search-help" class="search-help">
      도시 이름 또는 한글 초성을 입력하세요. 예: 서울, 대전, ㅅㅇ, ㄷㅈ
    </p>

    <div class="search-input-wrapper">
      <span class="search-icon" aria-hidden="true"> 🔍 </span>

      <input
        id="city-search"
        type="search"
        class="search-input"
        :value="searchQuery"
        placeholder="도시 이름 또는 초성 입력"
        aria-describedby="city-search-help"
        autocomplete="off"
        @input="handleInput"
      />
    </div>
  </div>
</template>

<style scoped>
.search-area {
  width: 100%;
}

.search-label {
  display: block;

  margin-bottom: 6px;

  color: #334155;
  font-weight: 700;
}

.search-help {
  margin: 0 0 10px;

  color: #64748b;
  font-size: 13px;
  line-height: 1.6;
}

.search-input-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 15px;

  font-size: 18px;

  transform: translateY(-50%);
  pointer-events: none;
}

.search-input {
  width: 100%;
  min-height: 48px;
  padding: 10px 14px 10px 46px;

  border: 1px solid #cbd5e1;
  border-radius: 10px;

  background-color: #ffffff;
  color: #1e293b;

  font: inherit;
  font-size: 16px;
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
</style>
