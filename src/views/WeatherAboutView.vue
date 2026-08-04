<script setup>
/**
 * About 페이지에 표시할 개발자 정보입니다.
 *
 * 화면에 직접 문자열을 반복해서 작성하는 대신,
 * 객체와 배열로 분리해 관리합니다.
 */
const developer = {
  name: '이현정',
  major: '융합보안공학과',
  course: 'Full-stack Engineering',
  role: 'Frontend Developer',
}

/**
 * 현재 프로젝트에서 학습하거나 활용한 기술입니다.
 */
const technologyList = [
  'Vue 3',
  'Composition API',
  'Vue Router',
  'Props',
  'Emits',
  'Slots',
  'Computed',
  'Watch',
  'WatchEffect',
]

/**
 * 날씨 대시보드에 구현한 주요 기능입니다.
 */
const featureList = [
  {
    title: '도시 검색',
    description: '도시 이름과 한글 초성을 이용해 원하는 도시를 검색할 수 있습니다.',
  },
  {
    title: '지역 필터',
    description: '수도권, 강원권, 충청권, 전라권, 경상권, 제주권으로 도시를 구분합니다.',
  },
  {
    title: '도시 상세 페이지',
    description: 'Vue Router의 동적 경로를 이용해 도시별 상세 날씨 정보를 표시합니다.',
  },
  {
    title: '즐겨찾기',
    description: '관심 있는 도시를 저장하고 즐겨찾기 페이지에서 모아 볼 수 있습니다.',
  },
  {
    title: '반응형 화면',
    description: '데스크톱, 태블릿, 모바일 화면 크기에 맞춰 카드 배치를 변경합니다.',
  },
]

/**
 * 향후 개선할 기능입니다.
 */
const futurePlanList = [
  '공공데이터포털 기상청 API 연동',
  'Pinia를 이용한 전역 상태 관리',
  'Local Storage를 이용한 즐겨찾기 유지',
  '로딩 및 API 오류 상태 처리',
]
</script>

<template>
  <div class="about-page">
    <main class="about-container">
      <!-- 서비스 소개 -->
      <section class="intro-card">
        <div class="intro-content">
          <p class="eyebrow">Weather Now</p>

          <h1>지역별 날씨 대시보드</h1>
          <p class="intro-description">
            국내 주요 도시의 날씨를 검색하고, 지역별로 비교할 수 있도록 제작한 Vue 기반 웹
            애플리케이션입니다.
          </p>

          <div class="intro-actions">
            <RouterLink to="/" class="primary-link"> 날씨 홈 </RouterLink>
            <RouterLink to="/favorites" class="secondary-link"> 즐겨찾기 </RouterLink>
          </div>
        </div>
      </section>

      <!-- 개발자 정보 -->
      <section class="content-card">
        <div class="section-heading">
          <p class="section-number">01</p>

          <div>
            <h2>개발자 정보</h2>

            <p>이 프로젝트를 구현한 개발자 정보입니다.</p>
          </div>
        </div>

        <dl class="profile-list">
          <div>
            <dt>이름</dt>
            <dd>{{ developer.name }}</dd>
          </div>

          <div>
            <dt>전공</dt>
            <dd>{{ developer.major }}</dd>
          </div>

          <div>
            <dt>교육 과정</dt>
            <dd>{{ developer.course }}</dd>
          </div>

          <div>
            <dt>역할</dt>
            <dd>{{ developer.role }}</dd>
          </div>
        </dl>
      </section>

      <!-- 프로젝트 소개 -->
      <section class="content-card">
        <div class="section-heading">
          <p class="section-number">02</p>

          <div>
            <h2>프로젝트 소개</h2>

            <p>Vue의 핵심 기능과 컴포넌트 구조를 학습하기 위해 제작했습니다.</p>
          </div>
        </div>

        <div class="project-description">
          <p>
            지역별 날씨 대시보드는 도시 검색, 지역 필터, 상세 페이지 이동, 즐겨찾기 기능을 제공하는
            프론트엔드 실습 프로젝트입니다.
          </p>

          <p>
            현재는 Mock Data를 사용하고 있으며, 이후 공공데이터포털의 기상청 API를 연동할 수 있도록
            도시 좌표와 날씨 데이터 구조를 분리해 구성했습니다.
          </p>
        </div>
      </section>

      <!-- 학습 기술 -->
      <section class="content-card">
        <div class="section-heading">
          <p class="section-number">03</p>

          <div>
            <h2>사용 기술</h2>

            <p>프로젝트에서 학습하고 활용한 기술입니다.</p>
          </div>
        </div>

        <ul class="technology-list">
          <li v-for="technology in technologyList" :key="technology">
            {{ technology }}
          </li>
        </ul>
      </section>

      <!-- 주요 기능 -->
      <section class="content-card">
        <div class="section-heading">
          <p class="section-number">04</p>

          <div>
            <h2>주요 구현 기능</h2>

            <p>기본 과제 외에 사용성과 확장성을 고려한 기능을 추가했습니다.</p>
          </div>
        </div>

        <ul class="feature-grid">
          <li v-for="feature in featureList" :key="feature.title" class="feature-item">
            <h3>
              {{ feature.title }}
            </h3>

            <p>
              {{ feature.description }}
            </p>
          </li>
        </ul>
      </section>

      <!-- 향후 개선 -->
      <section class="content-card">
        <div class="section-heading">
          <p class="section-number">05</p>

          <div>
            <h2>향후 개선 계획</h2>

            <p>API 및 상태 관리 수업 이후 다음 기능을 적용할 예정입니다.</p>
          </div>
        </div>

        <ul class="plan-list">
          <li v-for="plan in futurePlanList" :key="plan">
            <span aria-hidden="true"> ✓ </span>

            {{ plan }}
          </li>
        </ul>
      </section>

      <!-- 하단 이동 버튼 -->
      <div class="bottom-actions">
        <RouterLink to="/" class="primary-link"> 메인 대시보드로 돌아가기 </RouterLink>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* ========================================
   전체 페이지
======================================== */

.about-page {
  min-height: calc(100vh - 70px);
  padding: 48px clamp(24px, 5vw, 80px) 72px;

  background-color: #f5f7fb;
  color: #1f2937;
}

.about-page *,
.about-page *::before,
.about-page *::after {
  box-sizing: border-box;
}

.about-container {
  width: min(1000px, 100%);
  margin: 0 auto;
}

/* ========================================
   서비스 소개 영역
======================================== */

.intro-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;

  margin-bottom: 24px;
  padding: 42px;

  border: 1px solid #dbe3ee;
  border-radius: 24px;

  background: linear-gradient(135deg, #ffffff 0%, #eff6ff 100%);

  box-shadow: 0 12px 32px rgb(15 23 42 / 8%);
}

.intro-content {
  min-width: 0;
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
  line-height: 1.25;
}

.intro-description {
  max-width: 620px;
  margin: 16px 0 0;

  color: #64748b;
  font-size: 17px;
  line-height: 1.8;
}

.weather-symbol {
  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  width: 132px;
  height: 132px;

  border-radius: 50%;

  background-color: #dbeafe;
  font-size: 76px;
}

.intro-actions,
.bottom-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;

  margin-top: 26px;
}

.primary-link,
.secondary-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-height: 46px;
  padding: 10px 18px;

  border-radius: 10px;

  font-weight: 800;
  text-decoration: none;

  transition:
    transform 0.2s ease,
    background-color 0.2s ease;
}

.primary-link {
  border: 1px solid #2563eb;
  background-color: #2563eb;
  color: #ffffff;
}

.secondary-link {
  border: 1px solid #cbd5e1;
  background-color: #ffffff;
  color: #334155;
}

.primary-link:hover,
.secondary-link:hover {
  transform: translateY(-2px);
}

/* ========================================
   공통 콘텐츠 카드
======================================== */

.content-card {
  margin-bottom: 24px;
  padding: 32px;

  border: 1px solid #dbe3ee;
  border-radius: 20px;

  background-color: #ffffff;

  box-shadow: 0 8px 24px rgb(15 23 42 / 6%);
}

.section-heading {
  display: flex;
  align-items: flex-start;
  gap: 16px;

  margin-bottom: 24px;
}

.section-number {
  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  width: 42px;
  height: 42px;
  margin: 0;

  border-radius: 12px;

  background-color: #dbeafe;
  color: #1d4ed8;

  font-size: 14px;
  font-weight: 900;
}

.section-heading h2 {
  margin: 0;

  color: #172033;
  font-size: 23px;
}

.section-heading div > p {
  margin: 6px 0 0;

  color: #64748b;
  line-height: 1.6;
}

/* ========================================
   개발자 정보
======================================== */

.profile-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;

  margin: 0;
}

.profile-list div {
  padding: 17px;

  border: 1px solid #e2e8f0;
  border-radius: 12px;

  background-color: #f8fafc;
}

.profile-list dt {
  margin-bottom: 6px;

  color: #64748b;
  font-size: 13px;
  font-weight: 700;
}

.profile-list dd {
  margin: 0;

  color: #172033;
  font-size: 17px;
  font-weight: 800;
}

/* ========================================
   프로젝트 설명
======================================== */

.project-description {
  color: #475569;
  line-height: 1.8;
}

.project-description p {
  margin: 0;
}

.project-description p + p {
  margin-top: 14px;
}

/* ========================================
   기술 목록
======================================== */

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

/* ========================================
   주요 기능
======================================== */

.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  margin: 0;
  padding: 0;

  list-style: none;
}

.feature-item {
  padding: 20px;

  border: 1px solid #e2e8f0;
  border-radius: 14px;

  background-color: #f8fafc;
}

.feature-item h3 {
  margin: 0;

  color: #172033;
  font-size: 17px;
}

.feature-item p {
  margin: 9px 0 0;

  color: #64748b;
  line-height: 1.7;
}

/* ========================================
   개선 계획
======================================== */

.plan-list {
  display: grid;
  gap: 12px;

  margin: 0;
  padding: 0;

  list-style: none;
}

.plan-list li {
  display: flex;
  align-items: center;
  gap: 10px;

  padding: 14px 16px;

  border-radius: 10px;

  background-color: #f8fafc;
  color: #334155;

  font-weight: 700;
}

.plan-list span {
  color: #16a34a;
  font-weight: 900;
}

/* ========================================
   하단 버튼
======================================== */

.bottom-actions {
  justify-content: center;
  margin-top: 32px;
}

/* ========================================
   반응형
======================================== */

@media (max-width: 700px) {
  .about-page {
    padding: 28px 16px 48px;
  }

  .intro-card {
    align-items: flex-start;
    flex-direction: column;

    padding: 28px;
  }

  .weather-symbol {
    width: 92px;
    height: 92px;
    font-size: 54px;
  }

  .content-card {
    padding: 24px;
  }

  .profile-list,
  .feature-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .intro-actions,
  .bottom-actions {
    flex-direction: column;
  }

  .primary-link,
  .secondary-link {
    width: 100%;
  }

  .section-heading {
    flex-direction: column;
  }
}
</style>
