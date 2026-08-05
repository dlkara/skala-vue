<script setup>
import { computed, nextTick, watch } from 'vue'

import { useRoute, useRouter } from 'vue-router'

import UnitToggle from '@/components/exercise/UnitToggle.vue'

const route = useRoute()
const router = useRouter()

const menuRouteNames = {
  '/': 'weather-home',
  '/saved': 'weather-saved',
  '/about': 'weather-about',
  '/project': 'weather-project',
}

const activeMenuPath = computed(() => {
  if (route.path.startsWith('/weather/')) {
    return '/'
  }

  return route.path
})

const handleMenuSelect = async (menuPath) => {
  const routeName = menuRouteNames[menuPath]

  if (!routeName || route.name === routeName) {
    return
  }

  await router.push({ name: routeName })
}

/**
 * 페이지가 변경되면 본문으로 초점을 이동합니다.
 */
watch(
  () => route.fullPath,
  async () => {
    await nextTick()

    document.querySelector('#main-content')?.focus()
  },
)
</script>

<template>
  <div class="app">
    <!-- 본문 바로가기 -->
    <a href="#main-content" class="skip-link"> 본문으로 바로가기 </a>

    <!-- 공통 헤더 -->
    <header class="app-header">
      <div class="header-inner">
        <!-- 서비스 로고 -->
        <RouterLink to="/" class="app-logo" aria-label="WeatherNow 날씨 홈으로 이동">
          Weather<span>Now</span>
        </RouterLink>

        <!-- 주요 메뉴 -->
        <el-menu
          class="navigation"
          mode="horizontal"
          :default-active="activeMenuPath"
          :ellipsis="false"
          aria-label="주요 메뉴"
          @select="handleMenuSelect"
        >
          <el-menu-item index="/">날씨 홈</el-menu-item>

          <el-menu-item index="/saved">저장한 지역</el-menu-item>

          <el-menu-item index="/about">서비스 소개</el-menu-item>

          <el-menu-item index="/project" class="project-menu-item">
            <span>프로젝트 소개</span>
          </el-menu-item>
        </el-menu>

        <!-- 온도 단위 변경 -->
        <UnitToggle class="header-unit-toggle" />
      </div>
    </header>

    <!-- 공통 본문 -->
    <main id="main-content" class="main-content" tabindex="-1">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
/* ========================================
   전체 애플리케이션
======================================== */

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
  PC 기본 구조:
  로고 | 메뉴 | 단위 변경
*/
.header-inner {
  display: grid;
  grid-template-columns:
    auto
    minmax(0, 1fr)
    auto;
  align-items: center;
  gap: 24px;

  box-sizing: border-box;

  width: 100%;
  max-width: 1440px;
  min-height: 76px;
  margin: 0 auto;
  padding: 10px clamp(24px, 5vw, 80px);
}

/* ========================================
   로고
======================================== */

.app-logo {
  flex-shrink: 0;

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
   내비게이션
======================================== */

.navigation {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;

  min-width: 0;

  border-bottom: 0;
  background: transparent;
}

.navigation :deep(.project-menu-item) {
  position: relative;
  margin-left: 18px;
}

.navigation :deep(.project-menu-item::before) {
  position: absolute;
  top: 50%;
  left: -12px;
  width: 1px;
  height: 24px;
  background-color: #dbe3ee;
  content: '';
  pointer-events: none;
  transform: translateY(-50%);
}

.navigation :deep(.el-menu-item) {
  --el-menu-horizontal-height: 44px;

  flex: 0 0 auto;
  height: 44px;
  padding: 0 14px;
  border-bottom: 0 !important;
  border-radius: 9px;
  color: #475569;
  font-size: 14px;
  font-weight: 800;
  line-height: 44px;
  white-space: nowrap;
}

.navigation :deep(.el-menu-item:hover),
.navigation :deep(.el-menu-item:focus) {
  background-color: #f1f5f9;
  color: #172033;
}

.navigation :deep(.el-menu-item.is-active) {
  background-color: #eff6ff;
  color: #1d4ed8;
}

/* ========================================
   본문
======================================== */

.main-content {
  min-width: 0;
  min-height: calc(100vh - 76px);
}

.main-content:focus {
  outline: none;
}

/* ========================================
   태블릿
======================================== */

/*
  태블릿에서는 다음처럼 2행으로 구성합니다.

  1행: 로고 / 단위 설정
  2행: 내비게이션 전체

  기존처럼 로고, 메뉴, 단위 버튼이
  각각 별도 행에 놓이는 문제를 방지합니다.
*/
@media (min-width: 651px) and (max-width: 1000px) {
  .header-inner {
    grid-template-columns:
      minmax(0, 1fr)
      auto;
    grid-template-areas:
      'logo unit'
      'navigation navigation';
    gap: 8px 20px;

    padding: 12px 28px 14px;
  }

  .app-logo {
    grid-area: logo;
  }

  .header-unit-toggle {
    grid-area: unit;
  }

  .navigation {
    grid-area: navigation;

    justify-content: flex-start;

    width: 100%;
    padding-top: 6px;

    border-top: 1px solid #e2e8f0;
  }

}

/* ========================================
   모바일
======================================== */

@media (max-width: 650px) {
  .header-inner {
    display: flex;
    align-items: stretch;
    flex-direction: column;
    gap: 10px;

    padding: 15px 16px 13px;
  }

  .app-logo {
    align-self: flex-start;
  }

  .navigation {
    justify-content: flex-start;
    order: 2;

    width: 100%;
    overflow-x: auto;
  }

  .header-unit-toggle {
    order: 3;
  }

}

@media (max-width: 430px) {
  .navigation :deep(.el-menu-item) {
    padding-right: 8px;
    padding-left: 8px;

    font-size: 12px;
  }
}
</style>
