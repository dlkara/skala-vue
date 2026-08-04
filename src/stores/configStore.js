import { defineStore } from 'pinia'

// ========================================
// localStorage 설정
// ========================================

/**
 * localStorage에 온도 단위를 저장할 때 사용하는 키입니다.
 *
 * 다른 프로젝트의 값과 충돌하지 않도록
 * 서비스 이름을 포함해 작성합니다.
 */
const UNIT_STORAGE_KEY = 'weather-now-unit'

/**
 * 이 Store에서 사용할 수 있는 온도 단위입니다.
 */
const VALID_UNITS = ['celsius', 'fahrenheit']

/**
 * localStorage에 저장된 온도 단위를 불러옵니다.
 *
 * 저장된 값이 없거나 유효하지 않으면
 * 기본값인 celsius를 반환합니다.
 */
const loadSavedUnit = () => {
  try {
    const savedUnit = localStorage.getItem(UNIT_STORAGE_KEY)

    if (VALID_UNITS.includes(savedUnit)) {
      return savedUnit
    }
  } catch (error) {
    /**
     * 브라우저 설정 등에 의해
     * localStorage 접근이 제한될 수 있습니다.
     *
     * 저장 기능이 실패해도 애플리케이션은
     * 기본 단위로 정상 실행되도록 합니다.
     */
    console.error('온도 단위 불러오기 실패:', error)
  }

  return 'celsius'
}

/**
 * 현재 온도 단위를 localStorage에 저장합니다.
 *
 * @param {'celsius' | 'fahrenheit'} unit
 */
const saveUnit = (unit) => {
  try {
    localStorage.setItem(UNIT_STORAGE_KEY, unit)
  } catch (error) {
    console.error('온도 단위 저장 실패:', error)
  }
}

// ========================================
// Config Store
// ========================================

/**
 * 애플리케이션의 화면 설정을 관리하는 Store입니다.
 *
 * 현재는 섭씨·화씨 단위를 관리합니다.
 */
export const useConfigStore = defineStore('config', {
  // ========================================
  // State
  // ========================================

  state: () => ({
    /**
     * localStorage에 저장된 값을 초기값으로 사용합니다.
     *
     * 저장된 값이 없다면 celsius로 시작합니다.
     */
    unit: loadSavedUnit(),
  }),

  // ========================================
  // Getters
  // ========================================

  getters: {
    /**
     * 현재 단위에 맞는 기호를 반환합니다.
     */
    unitSymbol: (state) => {
      return state.unit === 'celsius' ? '℃' : '℉'
    },

    /**
     * 현재 단위의 한글 이름을 반환합니다.
     */
    unitLabel: (state) => {
      return state.unit === 'celsius' ? '섭씨' : '화씨'
    },

    /**
     * 버튼을 누르면 변경될 다음 단위의
     * 한글 이름을 반환합니다.
     */
    nextUnitLabel: (state) => {
      return state.unit === 'celsius' ? '화씨' : '섭씨'
    },
  },

  // ========================================
  // Actions
  // ========================================

  actions: {
    /**
     * 섭씨와 화씨를 전환합니다.
     *
     * 상태를 변경한 직후 localStorage에도 저장하므로
     * 새로고침 후에도 선택한 단위가 유지됩니다.
     */
    toggleUnit() {
      this.unit = this.unit === 'celsius' ? 'fahrenheit' : 'celsius'

      saveUnit(this.unit)
    },

    /**
     * 온도 단위를 직접 지정합니다.
     *
     * 이후 설정 화면 등이 추가될 경우에도
     * 재사용할 수 있습니다.
     *
     * @param {'celsius' | 'fahrenheit'} unit
     */
    setUnit(unit) {
      if (!VALID_UNITS.includes(unit)) {
        console.warn(`지원하지 않는 온도 단위입니다: ${unit}`)

        return
      }

      this.unit = unit
      saveUnit(this.unit)
    },

    /**
     * 온도 단위를 기본값인 섭씨로 되돌립니다.
     */
    resetUnit() {
      this.unit = 'celsius'
      saveUnit(this.unit)
    },
  },
})
