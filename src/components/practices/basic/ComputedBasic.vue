<script setup>
import { ref, computed } from 'vue'

const count = ref(0)
const dummy = ref(0)

// 1. 일반함수: 화면이 조금이라도 변경되면 무조건 재실행
const getMethodResult = () => {
    console.log('❌ 일반 함수 실행됨!')
    return count.value * 2
}

// 2. computed: 화면이 변경되어도 count 값이 변경되지 않으면 재실행하지 않음 (dummy 값 변경 시에는 이전 값 재사용)
const doubleCount = computed(() => {
    console.log('✅ computed 연산 실행됨!')
    return count.value * 2
})
</script>

<template>
  <div class="practice-section">
    <h2>computed() 캐싱 동작 비교</h2>

    <p>count: {{ count }} | dummy: {{ dummy }}</p>

    <button @click="count++">count 증가 (의존성 변경)</button>
    <button @click="dummy++">dummy 증가 (무관한 변경)</button>

    <p>일반함수 결과: {{ getMethodResult() }}</p>
    <p>computed 결과: {{ doubleCount }}</p>
  </div>
</template>
