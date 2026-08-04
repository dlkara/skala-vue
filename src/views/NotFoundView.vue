<script setup></script>

<template>
  <div class="not-found-page">
    <section class="not-found-card">
      <p class="error-code">???</p>

      <h1>페이지를 찾을 수 없습니다.</h1>

      <p>요청한 주소가 존재하지 않거나 아직 개발되지 않았습니다.</p>

      <RouterLink to="/" class="home-link"> 날씨 홈으로 이동 </RouterLink>
    </section>
  </div>
</template>

<style scoped>
.not-found-page {
  display: flex;
  align-items: center;
  justify-content: center;

  min-height: calc(100vh - 70px);
  padding: 24px;

  background-color: #f5f7fb;
}

.not-found-card {
  width: min(520px, 100%);
  padding: 50px 30px;

  border: 1px solid #dbe3ee;
  border-radius: 20px;

  background-color: #ffffff;
  text-align: center;
}

.error-code {
  margin: 0;
  color: #2563eb;
  font-size: 64px;
  font-weight: 900;
}

.not-found-card h1 {
  margin: 4px 0 0;
  color: #172033;
}

.not-found-card > p:not(.error-code) {
  margin: 14px 0 26px;
  color: #64748b;
}

.home-link {
  display: inline-block;
  padding: 11px 16px;

  border-radius: 9px;

  background-color: #2563eb;
  color: #ffffff;

  font-weight: 800;
  text-decoration: none;
}
</style>
