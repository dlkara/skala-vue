<template>
  <!--
    공통 대시보드 카드입니다.

    부모 컴포넌트가 전달한 내용을 slot으로 표시합니다.
    카드 자체에는 위치 이동이나 음수 여백을 적용하지 않아
    위아래 요소와 겹치지 않도록 구성합니다.
  -->
  <section class="dashboard-card">
    <slot />
  </section>
</template>

<style scoped>
.dashboard-card {
  position: relative;

  min-width: 0;
  width: 100%;
  padding: 28px;

  border: 1px solid #dbe3ee;
  border-radius: 18px;

  background-color: #ffffff;

  box-shadow: 0 8px 24px rgb(15 23 42 / 6%);
}

/* 태블릿 및 모바일 */
@media (max-width: 700px) {
  .dashboard-card {
    padding: 22px;
  }
}
</style>
