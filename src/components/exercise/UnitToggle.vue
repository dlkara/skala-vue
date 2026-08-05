<script setup>
import { ref } from 'vue'

import { useConfigStore } from '@/stores/configStore'

const configStore = useConfigStore()

/**
 * 단위 변경 결과를
 * 스크린리더에 전달하는 메시지입니다.
 */
const unitChangeMessage = ref('')

/**
 * 섭씨와 화씨를 전환합니다.
 */
const handleToggleUnit = () => {
  configStore.toggleUnit()

  unitChangeMessage.value = `날씨 단위를 ${configStore.unitLabel}로 변경했습니다.`
}
</script>

<template>
  <div class="unit-toggle">
    <p class="current-unit">
      <span class="unit-label"> 날씨 단위: </span>

      <strong>
        {{ configStore.unitLabel }}
        ({{ configStore.unitSymbol }})
      </strong>
    </p>

    <el-button
      type="primary"
      class="unit-button"
      :aria-label="`날씨 단위를 ${configStore.nextUnitLabel}로 변경`"
      @click="handleToggleUnit"
    >
      단위 변경
    </el-button>

    <p class="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {{ unitChangeMessage }}
    </p>
  </div>
</template>

<style scoped>
.unit-toggle {
  display: flex;
  align-items: center;
  gap: 10px;

  min-width: max-content;
}

.current-unit {
  margin: 0;

  color: #475569;
  font-size: 13px;
  white-space: nowrap;
}

.current-unit strong {
  color: #172033;
}

.unit-button {
  min-height: 44px;
  font-size: 13px;
  font-weight: 800;

  white-space: nowrap;
}

/*
  태블릿에서는 버튼과 단위 정보를
  한 줄로 간결하게 유지합니다.
*/
@media (min-width: 651px) and (max-width: 1000px) {
  .unit-toggle {
    justify-content: flex-end;
  }

  .unit-label {
    display: none;
  }
}

/*
  모바일에서는 전체 너비를 사용합니다.
*/
@media (max-width: 650px) {
  .unit-toggle {
    justify-content: space-between;

    width: 100%;
    min-width: 0;
  }
}
</style>
