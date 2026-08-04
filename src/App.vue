<script setup>
import { nextTick, watch } from 'vue'

import { useRoute } from 'vue-router'

const route = useRoute()

/**
 * 페이지가 변경되면 새로운 본문 영역으로
 * 키보드 초점을 이동합니다.
 */
watch(
  () => route.fullPath,
  async () => {
    await nextTick()

    const mainContent = document.querySelector('#main-content')

    mainContent?.focus()
  },
)
</script>

<template>
  <div class="app">
    <!--
      키보드 사용자가 반복되는 메뉴를 건너뛰고
      본문으로 바로 이동할 수 있습니다.
    -->
    <a href="#main-content" class="skip-link"> 본문으로 바로가기 </a>

    <header class="app-header">
      <div class="header-inner">
        <RouterLink to="/" class="app-logo" aria-label="Weather Now 날씨 홈으로 이동">
          Weather<span>Now</span>
        </RouterLink>

        <nav class="navigation" aria-label="주요 메뉴">
          <RouterLink to="/" class="nav-link"> 날씨 홈 </RouterLink>

          <RouterLink to="/favorites" class="nav-link"> 즐겨찾기 </RouterLink>

          <RouterLink to="/about" class="nav-link"> 서비스 소개 </RouterLink>
        </nav>
      </div>
    </header>

    <main id="main-content" class="main-content" tabindex="-1">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app {
  min-width: 0;
  min-height: 100vh;

  background-color: #f5f7fb;
  color: #1f2937;
}

/* ========================================
   본문 바로가기
======================================== */

.skip-link {
  position: fixed;
  top: 8px;
  left: 8px;
  z-index: 1000;

  padding: 11px 16px;

  border-radius: 8px;

  background-color: #172033;
  color: #ffffff;

  font-size: 15px;
  font-weight: 800;
  text-decoration: none;

  transform: translateY(-150%);
  transition: transform 0.2s ease;
}

.skip-link:focus {
  transform: translateY(0);
}

/* ========================================
   헤더
======================================== */

.app-header {
  position: sticky;
  top: 0;
  z-index: 100;

  width: 100%;

  border-bottom: 1px solid #dbe3ee;

  background-color: rgb(255 255 255 / 96%);
  backdrop-filter: blur(10px);
}

/*
  padding이 width 밖으로 더해지지 않도록
  border-box를 사용합니다.
*/
.header-inner {
  box-sizing: border-box;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;

  width: 100%;
  max-width: 1440px;
  min-height: 70px;
  margin: 0 auto;
  padding: 0 clamp(24px, 5vw, 80px);
}

/* ========================================
   로고
======================================== */

.app-logo {
  flex: 0 0 auto;

  color: #172033;
  font-size: 22px;
  font-weight: 850;
  letter-spacing: -0.03em;
  text-decoration: none;
  white-space: nowrap;
}

.app-logo span {
  color: #2563eb;
}

/* ========================================
   메뉴
======================================== */

.navigation {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;

  min-width: 0;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-height: 44px;
  padding: 8px 14px;

  border-radius: 9px;

  color: #475569;
  font-size: 14px;
  font-weight: 800;
  text-decoration: none;
  white-space: nowrap;

  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.nav-link:hover {
  background-color: #f1f5f9;
  color: #172033;
}

.nav-link.router-link-exact-active {
  background-color: #eff6ff;
  color: #1d4ed8;
}

/* ========================================
   본문
======================================== */

.main-content {
  min-width: 0;
  min-height: calc(100vh - 70px);
}

.main-content:focus {
  outline: none;
}

/* ========================================
   반응형
======================================== */

@media (max-width: 900px) {
  .header-inner {
    gap: 16px;
    padding-right: 24px;
    padding-left: 24px;
  }

  .navigation {
    gap: 3px;
  }

  .nav-link {
    padding-right: 11px;
    padding-left: 11px;
  }
}

@media (max-width: 650px) {
  .header-inner {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;

    padding-top: 15px;
    padding-bottom: 12px;
  }

  .navigation {
    justify-content: flex-start;

    width: 100%;
    overflow-x: auto;
  }

  .nav-link {
    flex: 1 0 auto;
  }
}

@media (max-width: 430px) {
  .header-inner {
    padding-right: 16px;
    padding-left: 16px;
  }

  .navigation {
    gap: 2px;
  }

  .nav-link {
    padding-right: 10px;
    padding-left: 10px;

    font-size: 13px;
  }
}
</style>
