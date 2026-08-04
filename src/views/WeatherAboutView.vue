<script setup>
import profileImage from '@/assets/profile/hjlee-profile.jpg'

/**
 * 개발자 소개 정보
 */
const developer = {
  name: '이현정',
  englishName: 'Kara Lee',
  username: 'hjlee',
  major: '융합보안공학',

  description:
    '사용자가 필요한 정보를 빠르게 확인할 수 있는 화면과 유지보수하기 쉬운 데이터 구조를 고민하며 웹 개발을 학습하고 있습니다.',

  projectGoal:
    '이번 프로젝트에서는 Vue 컴포넌트 간 데이터 흐름과 Vue Router를 이용한 페이지 구조를 직접 구현하는 데 중점을 두었습니다.',

  profileImage,
}

/**
 * 현재 프로젝트에서 사용한 기술
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
  'Responsive CSS',
]

/**
 * 프로젝트 주요 구현 기능
 */
const featureList = [
  {
    title: '도시 및 초성 검색',
    description:
      '도시 이름뿐 아니라 ㅅㅇ, ㄷㅈ과 같은 한글 초성으로도 원하는 도시를 검색할 수 있습니다.',
  },
  {
    title: '지역별 필터',
    description:
      '도시를 수도권, 강원권, 충청권, 전라권, 경상권, 제주권으로 구분해 조회할 수 있습니다.',
  },
  {
    title: '도시 상세 페이지',
    description:
      'Vue Router의 동적 경로 파라미터를 활용해 도시별 상세 날씨 정보를 별도 페이지에서 제공합니다.',
  },
  {
    title: '즐겨찾기',
    description: '관심 있는 도시를 즐겨찾기로 설정하고 전용 페이지에서 모아 확인할 수 있습니다.',
  },
  {
    title: '상태별 화면 처리',
    description:
      '선택된 카드와 검색 결과를 강조하고, 결과가 없을 때는 별도의 안내 화면을 표시합니다.',
  },
  {
    title: '반응형 레이아웃',
    description:
      '데스크톱, 태블릿, 모바일 화면 크기에 따라 날씨 카드의 배치가 자동으로 변경됩니다.',
  },
]

/**
 * 향후 개선 계획
 */
const futurePlanList = [
  {
    title: '공공데이터포털 API 연동',
    description: '기상청 단기예보 데이터를 불러와 현재 Mock Data를 실제 날씨 데이터로 교체합니다.',
  },
  {
    title: 'Pinia Store 적용',
    description: '날씨 목록과 즐겨찾기 상태를 Store에서 통합 관리하도록 구조를 변경합니다.',
  },
  {
    title: '즐겨찾기 영구 저장',
    description:
      'Local Storage를 적용해 페이지를 새로고침해도 즐겨찾기 상태가 유지되도록 개선합니다.',
  },
  {
    title: '비동기 상태 처리',
    description: 'API 요청 중 로딩 상태와 오류 메시지, 재시도 기능을 추가합니다.',
  },
]
</script>

<template>
  <div class="about-page">
    <main class="about-container">
      <!-- 서비스 소개 -->
      <section class="intro-card">
        <div class="intro-content">
          <p class="eyebrow">WEATHER NOW</p>

          <h1>지역별 날씨 대시보드</h1>

          <p class="intro-description">
            국내 주요 도시의 날씨를 검색하고 지역별로 비교할 수 있도록 제작한 Vue 기반 웹
            애플리케이션입니다.
          </p>

          <div class="intro-actions">
            <RouterLink to="/" class="primary-link"> 날씨 홈 </RouterLink>

            <RouterLink to="/favorites" class="secondary-link"> 즐겨찾기 </RouterLink>
          </div>
        </div>
      </section>

      <!-- 개발자 소개 -->
      <section class="content-card">
        <div class="section-heading">
          <p class="section-number">01</p>

          <div>
            <h2>개발자 소개</h2>

            <p>프로젝트를 제작한 개발자와 개발 방향을 소개합니다.</p>
          </div>
        </div>

        <div class="developer-card">
          <!-- 왼쪽 1/3: 프로필 사진 -->
          <div class="developer-image-area">
            <img
              :src="developer.profileImage"
              :alt="`${developer.name} 프로필 사진`"
              class="developer-image"
            />
          </div>

          <!-- 오른쪽 2/3: 개발자 정보 -->
          <div class="developer-content">
            <div class="developer-title">
              <div>
                <h3>
                  {{ developer.name }}
                </h3>

                <p class="english-name">
                  {{ developer.englishName }}
                </p>
              </div>

              <span class="username"> @{{ developer.username }} </span>
            </div>

            <p class="developer-major">{{ developer.major }} 전공</p>

            <div class="developer-description">
              <div>
                <strong>개발 방향</strong>

                <p>
                  {{ developer.description }}
                </p>
              </div>

              <div>
                <strong>프로젝트 목표</strong>

                <p>
                  {{ developer.projectGoal }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 프로젝트 소개 -->
      <section class="content-card">
        <div class="section-heading">
          <p class="section-number">02</p>

          <div>
            <h2>프로젝트 소개</h2>

            <p>Vue의 핵심 기능과 페이지 구조를 학습하기 위해 제작했습니다.</p>
          </div>
        </div>

        <div class="project-description">
          <p>
            Weather Now는 국내 주요 도시의 날씨를 검색하고 지역별로 비교할 수 있는 프론트엔드 실습
            프로젝트입니다.
          </p>

          <p>
            컴포넌트를 역할별로 분리하고 Props와 Emits를 사용해 부모·자식 간 데이터 흐름을
            구성했습니다.
          </p>

          <p>
            Vue Router를 적용해 홈, 즐겨찾기, 서비스 소개, 도시 상세 페이지를 각각 독립적인 View로
            분리했습니다.
          </p>

          <p>
            현재는 화면 구현과 데이터 흐름 학습에 집중하기 위해 Mock Data를 사용하고 있으며, 향후
            기상청 API 연동을 고려한 구조로 확장할 예정입니다.
          </p>
        </div>
      </section>

      <!-- 사용 기술 -->
      <section class="content-card">
        <div class="section-heading">
          <p class="section-number">03</p>

          <div>
            <h2>사용 기술</h2>

            <p>프로젝트에서 학습하고 활용한 Vue 기능과 웹 기술입니다.</p>
          </div>
        </div>

        <ul class="technology-list">
          <li v-for="technology in technologyList" :key="technology">
            {{ technology }}
          </li>
        </ul>
      </section>

      <!-- 주요 구현 기능 -->
      <section class="content-card">
        <div class="section-heading">
          <p class="section-number">04</p>

          <div>
            <h2>주요 구현 기능</h2>

            <p>기본 요구사항과 함께 사용성을 고려한 기능을 추가했습니다.</p>
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

      <!-- 향후 개선 계획 -->
      <section class="content-card">
        <div class="section-heading">
          <p class="section-number">05</p>

          <div>
            <h2>향후 개선 계획</h2>

            <p>API와 상태 관리 수업 이후 다음 기능을 적용할 예정입니다.</p>
          </div>
        </div>

        <ul class="plan-list">
          <li v-for="plan in futurePlanList" :key="plan.title" class="plan-item">
            <span class="check-icon" aria-hidden="true"> ✓ </span>

            <div>
              <strong>
                {{ plan.title }}
              </strong>

              <p>
                {{ plan.description }}
              </p>
            </div>
          </li>
        </ul>
      </section>

      <!-- 하단 이동 -->
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
   상단 서비스 소개
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

/* ========================================
   링크 버튼
======================================== */

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
   개발자 소개
======================================== */

.developer-card {
  display: grid;
  grid-template-columns:
    minmax(190px, 1fr)
    minmax(0, 2fr);
  gap: 28px;

  padding: 24px;

  border: 1px solid #dbe3ee;
  border-radius: 16px;

  background-color: #f8fafc;
}

/* 왼쪽 사진 영역 */
.developer-image-area {
  min-width: 0;
}

.developer-image {
  display: block;

  width: 100%;
  aspect-ratio: 3 / 4;

  border-radius: 14px;

  object-fit: cover;
  object-position: center top;

  box-shadow: 0 8px 20px rgb(15 23 42 / 12%);
}

/* 오른쪽 개발자 정보 */
.developer-content {
  display: flex;
  flex-direction: column;
  justify-content: center;

  min-width: 0;
}

.developer-title {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;

  padding-bottom: 16px;

  border-bottom: 1px solid #e2e8f0;
}

.developer-title h3 {
  margin: 0;

  color: #172033;
  font-size: 25px;
}

.english-name {
  margin: 5px 0 0;

  color: #475569;
  font-size: 15px;
  font-weight: 700;
}

.username {
  flex-shrink: 0;

  padding: 6px 10px;

  border: 1px solid #bfdbfe;
  border-radius: 999px;

  background-color: #eff6ff;
  color: #1d4ed8;

  font-size: 13px;
  font-weight: 800;
}

.developer-major {
  margin: 16px 0 0;

  color: #334155;
  font-size: 15px;
  font-weight: 800;
}

.developer-description {
  display: grid;
  gap: 18px;

  margin-top: 22px;
}

.developer-description div {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 16px;
}

.developer-description strong {
  color: #334155;
  font-size: 14px;
}

.developer-description p {
  margin: 0;

  color: #64748b;
  line-height: 1.75;
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
   사용 기술
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
   주요 구현 기능
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
  gap: 14px;

  margin: 0;
  padding: 0;

  list-style: none;
}

.plan-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;

  padding: 17px;

  border: 1px solid #e2e8f0;
  border-radius: 12px;

  background-color: #f8fafc;
}

.check-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  width: 25px;
  height: 25px;

  border-radius: 50%;

  background-color: #dcfce7;
  color: #15803d;

  font-size: 13px;
  font-weight: 900;
}

.plan-item strong {
  color: #172033;
  font-size: 15px;
}

.plan-item p {
  margin: 6px 0 0;

  color: #64748b;
  line-height: 1.65;
}

/* ========================================
   하단 이동
======================================== */

.bottom-actions {
  justify-content: center;
  margin-top: 32px;
}

/* ========================================
   태블릿
======================================== */

@media (max-width: 760px) {
  .developer-card {
    grid-template-columns:
      minmax(150px, 0.8fr)
      minmax(0, 1.7fr);
    gap: 22px;
  }

  .developer-description div {
    grid-template-columns: 1fr;
    gap: 6px;
  }
}

/* ========================================
   모바일
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

  .feature-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .developer-card {
    grid-template-columns: 1fr;
  }

  .developer-image-area {
    width: min(220px, 100%);
    margin: 0 auto;
  }

  .developer-title {
    align-items: flex-start;
    flex-direction: column;
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

  .developer-card {
    padding: 20px;
  }
}
</style>
