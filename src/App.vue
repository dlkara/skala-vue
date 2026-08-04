<script setup></script>

<template>
  <div class="app">
    <header class="app-header">
      <div class="header-inner">
        <RouterLink to="/" class="app-logo"> Weather Now </RouterLink>

        <nav class="navigation" aria-label="주요 메뉴">
          <RouterLink to="/" class="nav-link"> 날씨 홈 </RouterLink>
          <RouterLink to="/favorites" class="nav-link"> 즐겨찾기 </RouterLink>
          <RouterLink to="/about" class="nav-link"> 서비스 소개 </RouterLink>
        </nav>
      </div>
    </header>

    <!-- 현재 URL에 대응하는 페이지 컴포넌트 출력 -->
    <RouterView />
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background-color: #f5f7fb;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 100;

  border-bottom: 1px solid #dbe3ee;
  background-color: rgb(255 255 255 / 94%);
  backdrop-filter: blur(10px);
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;

  width: min(1440px, 100%);
  min-height: 70px;
  margin: 0 auto;
  padding: 0 clamp(24px, 5vw, 80px);
}

.app-logo {
  color: #172033;
  font-size: 20px;
  font-weight: 900;
  text-decoration: none;
}

.navigation {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-link {
  padding: 9px 13px;
  border-radius: 8px;

  color: #64748b;
  font-weight: 700;
  text-decoration: none;
}

.nav-link:hover {
  background-color: #f1f5f9;
  color: #1e293b;
}

/*
  현재 경로와 일치하는 RouterLink에는
  router-link-active 클래스가 자동 적용됩니다.
*/
.nav-link.router-link-active {
  background-color: #dbeafe;
  color: #1d4ed8;
}

@media (max-width: 600px) {
  .header-inner {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
    padding-top: 14px;
    padding-bottom: 14px;
  }
}
</style>
