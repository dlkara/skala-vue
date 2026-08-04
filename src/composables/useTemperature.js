import { computed, unref } from 'vue'

import { storeToRefs } from 'pinia'

import { useConfigStore } from '@/stores/configStore'

/**
 * 섭씨 온도를 현재 설정된 단위에 맞게 변환하고
 * 화면에 출력할 문자열을 반환하는 composable입니다.
 *
 * temperatureSource에는 다음 값을 전달할 수 있습니다.
 *
 * 1. ref
 * 2. computed
 * 3. 일반 숫자
 *
 * 사용 예시:
 *
 * const temperature = computed(() => city.value?.main?.temp)
 *
 * const {
 *   formattedTemperature,
 * } = useTemperature(temperature)
 */
export const useTemperature = (temperatureSource) => {
  // ========================================
  // 온도 단위 Store
  // ========================================

  const configStore = useConfigStore()

  /**
   * configStore의 반응성을 유지한 상태로
   * 현재 온도 단위를 가져옵니다.
   */
  const { unit } = storeToRefs(configStore)

  // ========================================
  // 원본 온도
  // ========================================

  /**
   * unref()를 사용하면 전달받은 값이
   * ref 또는 computed일 때는 .value를 꺼내고,
   * 일반 값일 때는 해당 값을 그대로 반환합니다.
   */
  const rawTemperature = computed(() => {
    return unref(temperatureSource)
  })

  // ========================================
  // 온도 유효성
  // ========================================

  /**
   * 온도 데이터가 실제로 존재하는지 확인합니다.
   *
   * 주의:
   * if (!rawTemperature.value)처럼 검사하면
   * 정상적인 온도인 0℃도 false로 처리됩니다.
   *
   * 따라서 null, undefined, NaN만 검사합니다.
   */
  const hasValidTemperature = computed(() => {
    const value = rawTemperature.value

    if (value === null || value === undefined) {
      return false
    }

    return !Number.isNaN(Number(value))
  })

  // ========================================
  // 온도 변환
  // ========================================

  /**
   * API에서는 섭씨 단위로 데이터를 받아옵니다.
   *
   * 사용자가 화씨를 선택한 경우에만
   * 섭씨 값을 화씨로 변환합니다.
   */
  const convertedTemperature = computed(() => {
    if (!hasValidTemperature.value) {
      return null
    }

    const celsiusTemperature = Number(rawTemperature.value)

    if (unit.value === 'fahrenheit') {
      return (celsiusTemperature * 9) / 5 + 32
    }

    return celsiusTemperature
  })

  // ========================================
  // 화면 표시용 문자열
  // ========================================

  /**
   * 변환한 온도를 반올림하고
   * 현재 단위 기호를 함께 반환합니다.
   */
  const formattedTemperature = computed(() => {
    if (convertedTemperature.value === null) {
      return '정보 없음'
    }

    const roundedTemperature = Math.round(convertedTemperature.value)

    const unitSymbol = unit.value === 'fahrenheit' ? '℉' : '℃'

    return `${roundedTemperature}` + unitSymbol
  })

  return {
    rawTemperature,
    hasValidTemperature,
    convertedTemperature,
    formattedTemperature,
  }
}
