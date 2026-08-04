<script setup>
const featureList = [
  {
    title: '도시 이름 및 초성 검색',
    description: '도시 이름뿐 아니라 ㅅㅇ, ㄷㅈ과 같은 한글 초성으로도 도시를 검색할 수 있습니다.',
  },

  {
    title: '지역별 날씨 필터',
    description:
      '수도권, 강원권, 충청권, 전라권, 경상권, 제주권으로 도시를 구분해 확인할 수 있습니다.',
  },

  {
    title: '도시 상세 날씨',
    description:
      '상세 페이지에서 체감 기온, 최저·최고 기온, 습도, 기압, 풍속과 가시거리를 확인할 수 있습니다.',
  },

  {
    title: '즐겨찾기 도시 관리',
    description: '자주 확인하는 도시를 즐겨찾기에 추가하고 별도의 페이지에서 모아 볼 수 있습니다.',
  },

  {
    title: '접근성을 고려한 화면',
    description:
      '명확한 입력 설명, 키보드 초점 표시, 상태 안내와 스크린리더용 레이블을 적용했습니다.',
  },

  {
    title: '반응형 화면',
    description: '데스크톱, 태블릿, 모바일 화면 크기에 맞춰 카드와 메뉴 배치가 변경됩니다.',
  },
]

const technologyList = [
  'Vue 3',
  'Composition API',
  'Vue Router',
  'JavaScript',
  'Props',
  'Emits',
  'Slots',
  'Computed',
  'Watch',
  'WatchEffect',
  'Semantic HTML',
  'ARIA',
  'Responsive CSS',
  'OpenWeatherMap API Ready',
]

const futurePlanList = [
  {
    title: 'OpenWeatherMap API 연결',
    description: '현재 Mock Data를 실제 Current Weather API 응답으로 교체할 예정입니다.',
  },

  {
    title: '로딩 및 오류 상태',
    description: 'API 요청 중 로딩 화면, 오류 메시지와 다시 시도하기 기능을 추가할 예정입니다.',
  },
]
</script>

<template>
  <div class="about-page">
    <div class="about-container">
      <header class="intro-card">
        <p class="eyebrow">ABOUT WEATHER NOW</p>

        <h1>Weather Now 서비스 소개</h1>

        <p class="intro-description">
          Weather Now는 국내 주요 도시의 날씨를 검색하고 지역별로 확인할 수 있도록 제작한 Vue 기반
          날씨 대시보드입니다.
        </p>

        <p class="intro-sub-description">
          디지털 환경에 익숙하지 않은 사용자와 보조기기 사용자도 주요 기능을 이용할 수 있는 화면을
          만드는 것을 목표로 합니다.
        </p>
      </header>

      <section class="content-card">
        <h2>주요 기능</h2>

        <ul class="information-grid">
          <li v-for="feature in featureList" :key="feature.title">
            <h3>
              {{ feature.title }}
            </h3>

            <p>
              {{ feature.description }}
            </p>
          </li>
        </ul>
      </section>

      <section class="content-card">
        <h2>사용 기술</h2>

        <ul class="technology-list">
          <li v-for="technology in technologyList" :key="technology">
            {{ technology }}
          </li>
        </ul>
      </section>

      <section class="content-card">
        <h2>향후 개선 계획</h2>

        <ul class="plan-list">
          <li v-for="plan in futurePlanList" :key="plan.title">
            <h3>
              {{ plan.title }}
            </h3>

            <p>
              {{ plan.description }}
            </p>
          </li>
        </ul>
      </section>

      <footer class="creator-section">
        <div>
          <p class="creator-label">CREATOR</p>

          <h2>제작자</h2>
        </div>

        <div>
          <p class="creator-name">
            이현정
            <span aria-hidden="true">·</span>
            Kara Lee
          </p>

          <p class="creator-description">
            @hjlee · Vue 프론트엔드 학습 과정에서 제작한 개인 프로젝트입니다.
          </p>
        </div>
      </footer>

      <div class="bottom-actions">
        <RouterLink to="/" class="home-link"> 날씨 홈으로 돌아가기 </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-page {
  min-height: calc(100vh - 70px);
  padding: 48px clamp(24px, 5vw, 80px) 72px;

  background-color: #f5f7fb;
}

.about-container {
  width: min(1000px, 100%);
  margin: 0 auto;
}

.intro-card,
.content-card,
.creator-section {
  margin-bottom: 24px;
  padding: 32px;

  border: 1px solid #dbe3ee;
  border-radius: 20px;

  background-color: #ffffff;

  box-shadow: 0 8px 24px rgb(15 23 42 / 6%);
}

.intro-card {
  background: linear-gradient(135deg, #ffffff 0%, #eff6ff 100%);
}

.eyebrow {
  margin: 0 0 8px;

  color: #2563eb;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.1em;
}

.intro-card h1 {
  margin: 0;

  color: #172033;
  font-size: clamp(30px, 5vw, 46px);
}

.intro-description {
  margin: 18px 0 0;

  color: #334155;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.8;
}

.intro-sub-description {
  margin: 12px 0 0;

  color: #64748b;
  line-height: 1.8;
}

.content-card h2 {
  margin: 0 0 20px;

  color: #172033;
}

.information-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  margin: 0;
  padding: 0;

  list-style: none;
}

.information-grid li,
.plan-list li {
  padding: 20px;

  border: 1px solid #e2e8f0;
  border-radius: 14px;

  background-color: #f8fafc;
}

.information-grid h3,
.plan-list h3 {
  margin: 0;

  color: #172033;
  font-size: 17px;
}

.information-grid p,
.plan-list p {
  margin: 9px 0 0;

  color: #64748b;
  line-height: 1.75;
}

.technology-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  margin: 0;
  padding: 0;

  list-style: none;
}

.technology-list li {
  padding: 8px 13px;

  border: 1px solid #bfdbfe;
  border-radius: 999px;

  background-color: #eff6ff;
  color: #1d4ed8;

  font-size: 14px;
  font-weight: 800;
}

.plan-list {
  display: grid;
  gap: 14px;

  margin: 0;
  padding: 0;

  list-style: none;
}

.creator-section {
  display: grid;
  grid-template-columns:
    minmax(130px, 0.7fr)
    minmax(0, 2fr);
  gap: 28px;
}

.creator-label {
  margin: 0 0 5px;

  color: #2563eb;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.1em;
}

.creator-section h2 {
  margin: 0;

  color: #172033;
}

.creator-name {
  margin: 0;

  color: #172033;
  font-size: 18px;
  font-weight: 850;
}

.creator-description {
  margin: 10px 0 0;

  color: #64748b;
  line-height: 1.7;
}

.bottom-actions {
  text-align: center;
}

.home-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-height: 44px;
  padding: 10px 18px;

  border-radius: 10px;

  background-color: #2563eb;
  color: #ffffff;

  font-weight: 800;
  text-decoration: none;
}

@media (max-width: 700px) {
  .about-page {
    padding: 28px 16px 48px;
  }

  .intro-card,
  .content-card,
  .creator-section {
    padding: 24px;
  }

  .information-grid,
  .creator-section {
    grid-template-columns: 1fr;
  }
}
</style>
