<script setup></script>

<template>
  <div class="about-page">
    <main class="about-container">
      <section class="about-card">
        <p class="eyebrow">SERVICE INFORMATION</p>

        <h1>지역별 날씨 대시보드</h1>

        <p>
          국내 주요 도시의 날씨를 지역별로 검색하고 비교할 수 있는 Vue 기반 날씨 대시보드입니다.
        </p>

        <h2>주요 기능</h2>

        <ul>
          <li>도시명 및 초성 검색</li>
          <li>지역권별 날씨 필터</li>
          <li>도시별 상세 날씨 페이지</li>
          <li>즐겨찾기 상태 변경</li>
          <li>날씨 조건별 안내 문구</li>
        </ul>

        <RouterLink to="/" class="home-link"> 메인 대시보드로 돌아가기 </RouterLink>
      </section>
    </main>
  </div>
</template>

<style scoped>
.about-page {
  min-height: calc(100vh - 70px);
  padding: 48px 24px;
  background-color: #f5f7fb;
}

.about-container {
  width: min(760px, 100%);
  margin: 0 auto;
}

.about-card {
  padding: 36px;

  border: 1px solid #dbe3ee;
  border-radius: 20px;

  background-color: #ffffff;
  box-shadow: 0 10px 30px rgb(15 23 42 / 8%);
}

.eyebrow {
  margin: 0 0 8px;
  color: #2563eb;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.about-card h1 {
  margin: 0;
  color: #172033;
  font-size: 34px;
}

.about-card > p:not(.eyebrow) {
  color: #64748b;
  line-height: 1.8;
}

.about-card h2 {
  margin-top: 30px;
  color: #172033;
}

.about-card li {
  margin: 8px 0;
  color: #475569;
}

.home-link {
  display: inline-block;
  margin-top: 24px;
  padding: 11px 16px;

  border-radius: 9px;

  background-color: #2563eb;
  color: #ffffff;

  font-weight: 800;
  text-decoration: none;
}
</style>
