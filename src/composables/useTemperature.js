import { computed, unref } from 'vue'

import { useConfigStore } from '@/stores/configStore'

/**
 * 섭씨 원본 온도를 현재 설정된 단위로 변환합니다.
 *
 * 원본 데이터는 항상 섭씨로 유지하고,
 * 화면에 표시할 때만 화씨로 변환합니다.
 *
 * @param {
 *   number |
 *   null |
 *   undefined |
 *   import('vue').Ref |
 *   import('vue').ComputedRef
 * } temperatureSource
 */
export const useTemperature = (temperatureSource) => {
  const configStore = useConfigStore()

  /**
   * 현재 단위에 맞게 변환된 숫자입니다.
   *
   * 섭씨 → 원본 숫자를 반올림
   * 화씨 → 섭씨 × 9 / 5 + 32
   */
  const displayTemperature = computed(() => {
    const rawTemperature = unref(temperatureSource)

    if (
      rawTemperature === null ||
      rawTemperature === undefined ||
      Number.isNaN(Number(rawTemperature))
    ) {
      return null
    }

    const celsiusTemperature = Number(rawTemperature)

    if (configStore.unit === 'fahrenheit') {
      return Math.round((celsiusTemperature * 9) / 5 + 32)
    }

    return Math.round(celsiusTemperature)
  })

  /**
   * 숫자와 단위 기호를 합친 표시 문자열입니다.
   *
   * 예:
   * 28℃
   * 82℉
   */
  const formattedTemperature = computed(() => {
    if (displayTemperature.value === null) {
      return '기온 정보 없음'
    }

    return `${displayTemperature.value}` + `${configStore.unitSymbol}`
  })

  return {
    displayTemperature,
    formattedTemperature,
  }
}
