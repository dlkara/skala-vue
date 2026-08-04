<script setup>
/**
 * Weather Now에서 제공하는 주요 기능입니다.
 */
const featureList = [
  {
    title: '실시간 날씨 조회',

    description:
      'OpenWeather API를 이용해 서울, 대전, 제주와 사용자가 추가한 지역의 현재 날씨를 조회합니다.',
  },

  {
    title: '통합 도시 검색 및 추가',

    description:
      '등록된 도시는 이름이나 초성으로 검색하고, 등록되지 않은 지역은 검색 버튼을 눌러 새로운 날씨 카드로 추가할 수 있습니다.',
  },

  {
    title: '지역별 날씨 필터',

    description:
      '수도권, 충청권, 제주권과 검색으로 추가한 지역을 구분해 원하는 날씨 카드만 확인할 수 있습니다.',
  },

  {
    title: '도시 상세 날씨',

    description:
      '상세 페이지에서 현재 기온, 체감 기온, 최저·최고 기온, 습도, 기압, 풍속, 가시거리, 일출과 일몰 정보를 확인할 수 있습니다.',
  },

  {
    title: '즐겨찾기 도시 관리',

    description:
      '자주 확인하는 도시를 즐겨찾기에 추가하고 즐겨찾기 전용 페이지에서 모아 볼 수 있습니다.',
  },

  {
    title: '섭씨·화씨 단위 변경',

    description:
      '화면 상단의 단위 전환 버튼을 이용해 기온 표시를 섭씨와 화씨 사이에서 변경할 수 있습니다.',
  },

  {
    title: '상태 유지',

    description:
      '추가한 지역, 즐겨찾기 도시와 온도 단위를 Local Storage에 저장해 새로고침 후에도 유지합니다.',
  },

  {
    title: '반응형 및 접근성 고려',

    description:
      '화면 크기에 따라 카드와 메뉴 배치를 조정하고, 키보드 초점 표시와 상태 안내용 ARIA 속성을 적용했습니다.',
  },
]

/**
 * 프로젝트에서 사용한 주요 기술입니다.
 */
const technologyList = [
  'Vue 3',
  'Composition API',
  'Vue Router',
  'Pinia',
  'Axios',
  'JavaScript',
  'Props',
  'Emits',
  'Computed',
  'Watch',
  'WatchEffect',
  'Local Storage',
  'OpenWeather API',
  'Semantic HTML',
  'ARIA',
  'Responsive CSS',
]

/**
 * 날씨 데이터가 처리되는 과정을 설명합니다.
 */
const dataFlowList = [
  {
    step: '01',

    title: '지역 정보 준비',

    description:
      '기본 지역과 Local Storage에서 복원한 추가 지역의 이름, 국가 코드, 위도와 경도를 준비합니다.',
  },

  {
    step: '02',

    title: '날씨 API 요청',

    description:
      'Pinia Store에서 Axios를 이용해 각 지역의 좌표로 OpenWeather Current Weather API를 호출합니다.',
  },

  {
    step: '03',

    title: '응답 데이터 변환',

    description: 'API 응답을 프로젝트에서 사용하는 동일한 날씨 객체 구조로 변환합니다.',
  },

  {
    step: '04',

    title: '화면 출력',

    description: '변환된 데이터를 날씨 카드, 즐겨찾기 페이지와 상세 페이지에서 함께 사용합니다.',
  },
]

/**
 * 브라우저에 저장하는 항목입니다.
 */
const storageList = [
  {
    title: '추가 지역',

    description: '사용자가 검색으로 추가한 지역의 이름, 국가 코드와 좌표를 저장합니다.',
  },

  {
    title: '즐겨찾기',

    description: '즐겨찾기로 설정한 도시의 ID 목록을 저장합니다.',
  },

  {
    title: '온도 단위',

    description: '사용자가 선택한 섭씨 또는 화씨 설정을 저장합니다.',
  },
]

/**
 * 향후 개선할 수 있는 기능입니다.
 */
const futurePlanList = [
  {
    title: '검색 결과 선택',

    description:
      '같은 이름을 가진 여러 지역이 검색되는 경우 사용자가 국가와 지역을 비교해 직접 선택할 수 있도록 개선할 수 있습니다.',
  },

  {
    title: '예보 정보 추가',

    description:
      '현재 날씨뿐 아니라 시간별 또는 일별 예보를 확인할 수 있도록 기능을 확장할 수 있습니다.',
  },

  {
    title: '일부 요청 실패 처리',

    description:
      '여러 지역 중 일부 API 요청만 실패하더라도 성공한 지역의 날씨는 계속 표시하도록 개선할 수 있습니다.',
  },
]
</script>

<template>
  <section class="about-page page-container">
    <!-- ======================================
         서비스 소개
    ======================================= -->

    <header class="intro-card">
      <p class="page-eyebrow">ABOUT WEATHER NOW</p>

      <h1 class="about-title">Weather Now 서비스 소개</h1>

      <p class="intro-description">
        Weather Now는 사용자가 원하는 지역의 실시간 날씨를 검색하고 관리할 수 있도록 제작한 Vue 기반
        날씨 대시보드입니다.
      </p>

      <p class="intro-sub-description">
        OpenWeather API를 통해 현재 날씨를 불러오며, 지역 검색과 즐겨찾기, 상세 날씨 확인, 섭씨·화씨
        단위 변경 기능을 제공합니다.
      </p>
    </header>

    <!-- ======================================
         주요 기능
    ======================================= -->

    <section class="content-card" aria-labelledby="feature-title">
      <div class="section-heading">
        <p class="section-number">01</p>

        <div>
          <h2 id="feature-title">주요 기능</h2>

          <p>Weather Now에서 사용할 수 있는 핵심 기능입니다.</p>
        </div>
      </div>

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

    <!-- ======================================
         데이터 처리 흐름
    ======================================= -->

    <section class="content-card" aria-labelledby="data-flow-title">
      <div class="section-heading">
        <p class="section-number">02</p>

        <div>
          <h2 id="data-flow-title">데이터 처리 흐름</h2>

          <p>지역 정보가 실제 날씨 카드로 표시되는 과정입니다.</p>
        </div>
      </div>

      <ol class="data-flow-list">
        <li v-for="flow in dataFlowList" :key="flow.step">
          <span class="flow-step" aria-hidden="true">
            {{ flow.step }}
          </span>

          <div>
            <h3>
              {{ flow.title }}
            </h3>

            <p>
              {{ flow.description }}
            </p>
          </div>
        </li>
      </ol>
    </section>

    <!-- ======================================
         사용 기술
    ======================================= -->

    <section class="content-card" aria-labelledby="technology-title">
      <div class="section-heading">
        <p class="section-number">03</p>

        <div>
          <h2 id="technology-title">사용 기술</h2>

          <p>프로젝트 구현에 사용한 주요 기술입니다.</p>
        </div>
      </div>

      <ul class="technology-list">
        <li v-for="technology in technologyList" :key="technology">
          {{ technology }}
        </li>
      </ul>
    </section>

    <!-- ======================================
         저장 데이터
    ======================================= -->

    <section class="content-card" aria-labelledby="storage-title">
      <div class="section-heading">
        <p class="section-number">04</p>

        <div>
          <h2 id="storage-title">Local Storage 사용</h2>

          <p>새로고침 후에도 사용자 설정을 유지하기 위해 다음 항목을 브라우저에 저장합니다.</p>
        </div>
      </div>

      <ul class="storage-grid">
        <li v-for="storage in storageList" :key="storage.title">
          <h3>
            {{ storage.title }}
          </h3>

          <p>
            {{ storage.description }}
          </p>
        </li>
      </ul>

      <p class="storage-notice">
        기온, 습도, 풍속과 같은 날씨 값은 Local Storage에 저장하지 않습니다. 날씨는 변경되는
        데이터이므로 페이지를 다시 불러올 때 OpenWeather API에서 최신 정보를 요청합니다.
      </p>
    </section>

    <!-- ======================================
         향후 개선 계획
    ======================================= -->

    <section class="content-card" aria-labelledby="future-title">
      <div class="section-heading">
        <p class="section-number">05</p>

        <div>
          <h2 id="future-title">향후 개선 계획</h2>

          <p>현재 구조에서 추가로 확장할 수 있는 기능입니다.</p>
        </div>
      </div>

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

    <!-- ======================================
     제작자
======================================= -->

    <footer class="creator-section">
      <div>
        <p class="creator-label">CREATOR</p>

        <h2>제작자</h2>
      </div>

      <div class="creator-content">
        <p class="creator-name">
          이현정

          <span aria-hidden="true"> · </span>

          Kara Lee
        </p>

        <p class="creator-description">
          Vue 프론트엔드 학습 과정에서 제작한 개인 날씨 대시보드 프로젝트입니다.
        </p>

        <a
          href="https://github.com/dlkara"
          class="github-link"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="이현정의 GitHub 프로필 새 창에서 열기"
        >
          <svg class="github-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.35 6.84 9.71.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.78.62-3.37-1.2-3.37-1.2-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .08 1.53 1.06 1.53 1.06.9 1.57 2.34 1.12 2.91.85.09-.66.35-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 6.95a9.3 9.3 0 0 1 2.5.35c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.8 0 .27.18.59.69.49A10.23 10.23 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z"
            />
          </svg>

          <span class="github-link-text"> github.com/dlkara </span>

          <svg class="external-link-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M14 5h5v5M19 5l-9 9M19 13v6H5V5h6"
            />
          </svg>
        </a>
      </div>
    </footer>

    <!-- ======================================
         홈 이동
    ======================================= -->

    <div class="bottom-actions">
      <RouterLink to="/" class="primary-button home-link"> 날씨 홈으로 돌아가기 </RouterLink>
    </div>
  </section>
</template>

<style scoped>
/* ========================================
   About 화면 전용 레이아웃
======================================== */

.about-page {
  align-content: start;
}

.intro-card,
.content-card,
.creator-section {
  padding: 32px;

  border: 1px solid #dbe3ee;
  border-radius: 20px;

  background-color: #ffffff;

  box-shadow: 0 8px 24px rgb(15 23 42 / 6%);
}

/* ========================================
   서비스 소개
======================================== */

.intro-card {
  background: linear-gradient(135deg, #ffffff 0%, #eff6ff 100%);
}

.about-title {
  margin: 0;

  color: #172033;

  font-size: clamp(30px, 5vw, 46px);

  line-height: 1.2;
}

.intro-description {
  max-width: 780px;

  margin: 18px 0 0;

  color: #334155;

  font-size: 18px;
  font-weight: 700;
  line-height: 1.8;
}

.intro-sub-description {
  max-width: 780px;

  margin: 12px 0 0;

  color: #64748b;

  line-height: 1.8;
}

/* ========================================
   공통 섹션 제목
======================================== */

.section-heading {
  display: flex;
  align-items: flex-start;

  gap: 14px;

  margin-bottom: 22px;
}

.section-number {
  flex: 0 0 auto;

  margin: 3px 0 0;

  color: #2563eb;

  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.section-heading h2,
.section-heading p {
  margin: 0;
}

.section-heading h2 {
  color: #172033;
}

.section-heading div > p {
  margin-top: 6px;

  color: #64748b;

  line-height: 1.7;
}

/* ========================================
   주요 기능
======================================== */

.information-grid {
  display: grid;

  grid-template-columns: repeat(2, minmax(0, 1fr));

  gap: 16px;

  margin: 0;
  padding: 0;

  list-style: none;
}

.information-grid li,
.storage-grid li,
.plan-list li {
  padding: 20px;

  border: 1px solid #e2e8f0;
  border-radius: 14px;

  background-color: #f8fafc;
}

.information-grid h3,
.storage-grid h3,
.plan-list h3 {
  margin: 0;

  color: #172033;

  font-size: 17px;
}

.information-grid p,
.storage-grid p,
.plan-list p {
  margin: 9px 0 0;

  color: #64748b;

  line-height: 1.75;
}

/* ========================================
   데이터 처리 흐름
======================================== */

.data-flow-list {
  display: grid;
  gap: 14px;

  margin: 0;
  padding: 0;

  list-style: none;
}

.data-flow-list li {
  display: grid;

  grid-template-columns:
    48px
    minmax(0, 1fr);

  align-items: start;

  gap: 16px;

  padding: 18px 20px;

  border: 1px solid #e2e8f0;
  border-radius: 14px;

  background-color: #f8fafc;
}

.flow-step {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 42px;
  height: 42px;

  border-radius: 50%;

  background-color: #dbeafe;
  color: #1d4ed8;

  font-size: 13px;
  font-weight: 900;
}

.data-flow-list h3,
.data-flow-list p {
  margin: 0;
}

.data-flow-list h3 {
  color: #172033;

  font-size: 17px;
}

.data-flow-list p {
  margin-top: 7px;

  color: #64748b;

  line-height: 1.75;
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
   Local Storage
======================================== */

.storage-grid {
  display: grid;

  grid-template-columns: repeat(3, minmax(0, 1fr));

  gap: 14px;

  margin: 0;
  padding: 0;

  list-style: none;
}

.storage-notice {
  margin: 16px 0 0;

  padding: 16px 18px;

  border-left: 4px solid #2563eb;
  border-radius: 0 10px 10px 0;

  background-color: #eff6ff;
  color: #334155;

  line-height: 1.75;
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

/* ========================================
   제작자
======================================== */

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

.creator-content {
  min-width: 0;
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

/* ========================================
   GitHub 링크
======================================== */

.github-link {
  display: inline-flex;

  align-items: center;

  gap: 9px;

  max-width: 100%;

  margin-top: 18px;
  padding: 10px 14px;

  border: 1px solid #cbd5e1;
  border-radius: 10px;

  background-color: #f8fafc;
  color: #172033;

  font-size: 14px;
  font-weight: 800;

  text-decoration: none;

  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
}

.github-link:hover {
  border-color: #94a3b8;

  background-color: #f1f5f9;
  color: #0f172a;

  box-shadow: 0 6px 16px rgb(15 23 42 / 8%);
}

.github-link:focus-visible {
  border-color: #2563eb;

  outline: none;

  box-shadow: 0 0 0 3px rgb(37 99 235 / 20%);
}

.github-icon {
  flex: 0 0 auto;

  width: 22px;
  height: 22px;
}

.github-link-text {
  overflow: hidden;

  text-overflow: ellipsis;
  white-space: nowrap;
}

.external-link-icon {
  flex: 0 0 auto;

  width: 16px;
  height: 16px;

  color: #64748b;
}

/* ========================================
   홈 이동
======================================== */

.bottom-actions {
  text-align: center;
}

.home-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  text-decoration: none;
}

/* ========================================
   태블릿
======================================== */

@media (max-width: 900px) {
  .storage-grid {
    grid-template-columns: 1fr;
  }
}

/* ========================================
   모바일
======================================== */

@media (max-width: 700px) {
  .intro-card,
  .content-card,
  .creator-section {
    padding: 24px;
  }

  .information-grid,
  .creator-section {
    grid-template-columns: 1fr;
  }

  .section-heading {
    gap: 10px;
  }

  .data-flow-list li {
    grid-template-columns: 1fr;
  }
}
</style>
