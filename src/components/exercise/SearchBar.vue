<script setup>
import { Search } from '@element-plus/icons-vue'

defineProps({
  query: {
    type: String,
    default: '',
  },

  isSearching: {
    type: Boolean,
    default: false,
  },

  canSearch: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update-query', 'search'])

/**
 * 입력값이 변경될 때마다
 * 부모에게 검색어를 전달합니다.
 */
const handleInput = (value) => {
  emit('update-query', value)
}

/**
 * Element Plus 입력창은 한글을 조합하는 동안 model-value 갱신을 미룹니다.
 * 조합 중인 실제 입력값도 전달해 두 번째 글자부터 검색 버튼이 바로 활성화되게 합니다.
 */
const handleCompositionInput = (event) => {
  const composingValue = event.target?.value

  if (typeof composingValue === 'string') {
    emit('update-query', composingValue)
  }
}

/**
 * Enter 키 또는 검색 버튼으로
 * 부모의 지역 검색을 실행합니다.
 */
const handleSubmit = () => {
  emit('search')
}
</script>

<template>
  <form class="search-bar" role="search" aria-label="도시 검색" @submit.prevent="handleSubmit">
    <div class="search-input-layout">
      <el-input
        id="weather-city-search"
        :model-value="query"
        type="text"
        size="large"
        class="city-search-input"
        placeholder="예: 판교, 발산, 내발산동"
        autocomplete="off"
        aria-describedby="weather-search-help"
        @update:model-value="handleInput"
        @compositionupdate="handleCompositionInput"
        @compositionend="handleCompositionInput"
        @keyup.enter.prevent="handleSubmit"
      />

      <el-button
        native-type="submit"
        type="primary"
        size="large"
        class="search-button"
        :icon="Search"
        :loading="isSearching"
        :disabled="isSearching || !canSearch"
      >
        새 지역 찾기
      </el-button>
    </div>

    <p id="weather-search-help" class="search-help">
      저장한 지역과 국내 행정구역을 이름·초성으로 찾을 수 있습니다.
      <br />
      두 글자 이상 입력한 뒤 Enter 또는 새 지역 찾기 버튼을 사용하세요.
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

.search-input-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
}

.city-search-input {
  width: 100%;
  --el-component-size-large: 48px;
}

.search-button {
  min-width: 116px;
  min-height: 48px;
  font-weight: 800;
  white-space: nowrap;
}

.search-help {
  margin: 7px 0 0;

  color: #64748b;

  font-size: 13px;
  line-height: 1.6;
}

@media (max-width: 480px) {
  .search-input-layout {
    grid-template-columns: 1fr;
  }

  .search-button {
    width: 100%;
  }
}
</style>
