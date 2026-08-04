<script setup>
// ========================================
// 주요 기능
// ========================================

/**
 * Weather Now에서 제공하는 주요 기능입니다.
 *
 * 과제에서 요구한 기본 기능과
 * 추가로 구현한 기능을 함께 설명합니다.
 */
const featureList = [
  {
    title: '실시간 날씨 조회',

    description:
      'OpenWeather Current Weather API를 이용해 대시보드에 등록된 지역의 최신 기온과 날씨 상태를 불러옵니다.',
  },

  {
    title: '도시 이름 및 초성 검색',

    description:
      '현재 대시보드에 등록된 도시는 전체 이름뿐 아니라 ㅅㅇ, ㄷㅈ과 같은 한글 초성으로도 검색할 수 있습니다.',
  },

  {
    title: '지역 자동 API 검색',

    description:
      '등록되지 않은 지역명을 두 글자 이상 입력하면 별도의 검색 버튼 없이 OpenWeather Geocoding API를 자동으로 호출합니다.',
  },

  {
    title: '검색과 지역 추가 분리',

    description:
      'API 검색 결과는 바로 저장되지 않으며, 사용자가 대시보드에 추가 버튼을 눌러야 날씨 카드로 등록됩니다.',
  },

  {
    title: '검색 결과 상세 구분',

    description:
      '동일하거나 비슷한 이름의 지역을 구분할 수 있도록 행정구역, 국가 코드와 위도·경도를 함께 표시합니다.',
  },

  {
    title: '검색 결과 중복 제거',

    description:
      '이름이 다르더라도 Current Weather API가 반환한 국가 코드와 좌표가 같으면 동일한 지역으로 판단해 하나만 표시합니다.',
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
      '자주 확인하는 도시를 즐겨찾기에 추가하고 별도의 즐겨찾기 페이지에서 모아 볼 수 있습니다.',
  },

  {
    title: '즐겨찾기 상태 표시',

    description:
      '즐겨찾기된 도시는 노란색 버튼과 채워진 별 아이콘으로 표시해 현재 상태를 쉽게 구분할 수 있습니다.',
  },

  {
    title: '대시보드 카드 삭제',

    description:
      '검색으로 추가한 지역뿐 아니라 기본 지역인 서울, 대전과 제주도 카드 내부의 삭제 버튼으로 제거할 수 있습니다.',
  },

  {
    title: '섭씨·화씨 단위 변경',

    description:
      '화면 상단의 단위 전환 기능을 이용해 모든 기온 표시를 섭씨와 화씨 사이에서 변경할 수 있습니다.',
  },

  {
    title: '반응형 및 접근성 고려',

    description:
      '화면 크기에 따라 카드와 메뉴 배치를 변경하고, 키보드 초점 표시, 상태 안내와 ARIA 속성을 적용했습니다.',
  },
]

// ========================================
// 추가 구현 기능
// ========================================

/**
 * 과제의 기본 요구사항 외에
 * 추가로 구현한 핵심 기능입니다.
 */
const additionalFeatureList = [
  {
    number: '01',

    title: '디바운스를 적용한 자동 검색',

    description:
      '검색어 입력이 멈춘 뒤 600ms가 지난 시점에 API를 호출하여, 글자를 입력할 때마다 불필요한 요청이 발생하지 않도록 처리했습니다.',
  },

  {
    number: '02',

    title: '검색과 저장 동작 분리',

    description:
      '검색 결과를 먼저 확인하고 사용자가 직접 추가 버튼을 눌러야 대시보드와 Local Storage에 저장되도록 구성했습니다.',
  },

  {
    number: '03',

    title: '동명 지역 식별 정보 제공',

    description:
      '일산처럼 같은 이름을 가진 지역이 여러 개 반환될 수 있으므로 행정구역, 국가 코드와 좌표를 함께 표시했습니다.',
  },

  {
    number: '04',

    title: '좌표 기반 중복 결과 제거',

    description:
      'Geocoding API의 후보 이름이 서로 달라도 최종 날씨 좌표가 같으면 중복 지역으로 판단하여 첫 번째 결과만 유지합니다.',
  },

  {
    number: '05',

    title: '기본 도시 삭제 상태 유지',

    description:
      '서울, 대전과 제주를 삭제한 경우 원본 배열을 직접 수정하지 않고 숨긴 도시 ID를 저장해 새로고침 후에도 다시 나타나지 않도록 했습니다.',
  },

  {
    number: '06',

    title: '일부 API 요청 실패 처리',

    description:
      '여러 도시 중 일부 지역의 요청이 실패하더라도 성공한 지역의 날씨는 계속 화면에 표시하도록 Promise.allSettled를 사용했습니다.',
  },
]

// ========================================
// 데이터 처리 흐름
// ========================================

/**
 * 지역 정보가 화면의 날씨 카드로
 * 표시되는 과정을 설명합니다.
 */
const dataFlowList = [
  {
    step: '01',

    title: '표시할 지역 목록 구성',

    description:
      '기본 지역과 Local Storage에서 복원한 추가 지역을 합친 뒤, 사용자가 삭제한 기본 지역은 숨김 ID 목록을 기준으로 제외합니다.',
  },

  {
    step: '02',

    title: '현재 날씨 API 요청',

    description:
      'Pinia Store에서 Axios를 사용해 각 지역의 위도와 경도를 OpenWeather Current Weather API로 전달합니다.',
  },

  {
    step: '03',

    title: '응답 데이터 정규화',

    description:
      'API마다 사용하기 불편한 원본 응답을 카드, 상세 페이지와 즐겨찾기 페이지에서 공통으로 사용할 수 있는 도시 객체로 변환합니다.',
  },

  {
    step: '04',

    title: 'Pinia 상태 저장',

    description:
      '변환된 날씨 객체를 weatherList에 저장하고, 각 Vue 컴포넌트는 Store의 반응형 데이터를 전달받아 화면을 갱신합니다.',
  },

  {
    step: '05',

    title: '화면 출력',

    description:
      'WeatherCard는 현재 날씨를 표시하고, 상세 보기, 즐겨찾기와 삭제 이벤트를 부모 View에 전달합니다.',
  },
]

// ========================================
// 검색 데이터 흐름
// ========================================

/**
 * 등록되지 않은 지역을 검색하고
 * 대시보드에 추가하는 과정입니다.
 */
const searchFlowList = [
  {
    step: '01',

    title: '검색어 입력',

    description: '사용자가 도시명을 입력하면 현재 대시보드의 카드 목록은 즉시 필터링됩니다.',
  },

  {
    step: '02',

    title: '디바운스 대기',

    description:
      '두 글자 이상의 일반 검색어를 입력한 뒤 600ms 동안 추가 입력이 없으면 API 검색을 시작합니다.',
  },

  {
    step: '03',

    title: 'Geocoding API 호출',

    description:
      '검색어를 OpenWeather Geocoding API에 전달해 최대 5개의 지역명, 행정구역, 국가 코드와 좌표 후보를 가져옵니다.',
  },

  {
    step: '04',

    title: '후보별 날씨 조회',

    description:
      '각 좌표 후보에 대해 Current Weather API를 호출하여 현재 기온, 날씨 상태와 아이콘을 가져옵니다.',
  },

  {
    step: '05',

    title: '중복 결과 제거',

    description: '최종 국가 코드와 날씨 좌표가 동일한 결과는 같은 지역으로 판단해 하나만 남깁니다.',
  },

  {
    step: '06',

    title: '사용자 선택 후 추가',

    description:
      '사용자가 원하는 검색 결과의 대시보드에 추가 버튼을 눌러야 위치 정보가 저장되고 실제 날씨 카드가 생성됩니다.',
  },
]

// ========================================
// Local Storage
// ========================================

/**
 * 브라우저에 저장하는 사용자 설정입니다.
 *
 * 변경되는 날씨 값 자체는 저장하지 않습니다.
 */
const storageList = [
  {
    title: '검색으로 추가한 지역',

    description: '지역명, 행정구역, 국가 코드와 좌표를 저장해 새로고침 후 다시 날씨를 조회합니다.',
  },

  {
    title: '삭제한 기본 지역',

    description: '서울, 대전과 제주 중 사용자가 삭제한 도시 ID를 숨김 목록으로 저장합니다.',
  },

  {
    title: '즐겨찾기 도시',

    description: '즐겨찾기로 지정한 도시 ID를 저장해 페이지를 다시 열어도 상태가 유지됩니다.',
  },

  {
    title: '온도 표시 단위',

    description: '사용자가 선택한 섭씨 또는 화씨 단위를 저장합니다.',
  },
]

// ========================================
// 사용 기술
// ========================================

const technologyList = [
  'Vue 3',
  'Composition API',
  'Vue Router',
  'Pinia',
  'Axios',
  'JavaScript',
  'Props',
  'Emits',
  'Slots',
  'Computed',
  'Watch',
  'WatchEffect',
  'Promise.allSettled',
  'Local Storage',
  'OpenWeather Current Weather API',
  'OpenWeather Geocoding API',
  'Semantic HTML',
  'ARIA',
  'Responsive CSS',
]

// ========================================
// 향후 개선 계획
// ========================================

const futurePlanList = [
  {
    title: '검색 결과 선택 정확도 개선',

    description:
      '행정구역이 없는 API 검색 결과에 대해 역지오코딩이나 별도의 지역 데이터로 보다 자세한 주소 정보를 제공할 수 있습니다.',
  },

  {
    title: '시간별 및 일별 예보',

    description:
      '현재 날씨뿐 아니라 시간별·일별 예보 데이터를 추가하여 향후 날씨 변화를 확인할 수 있도록 확장할 수 있습니다.',
  },

  {
    title: '도시 순서 변경',

    description:
      '사용자가 자주 확인하는 도시 카드를 드래그하여 원하는 순서로 배치할 수 있도록 개선할 수 있습니다.',
  },
]
</script>

<template>
  <div class="about-page">
    <div class="about-container">
      <!-- ======================================
           서비스 소개
      ======================================= -->

      <header class="intro-card">
        <p class="eyebrow">ABOUT WEATHER NOW</p>

        <h1>Weather Now 서비스 소개</h1>

        <p class="intro-description">
          Weather Now는 사용자가 원하는 지역의 실시간 날씨를 검색하고 관리할 수 있도록 제작한 Vue
          기반 날씨 대시보드입니다.
        </p>

        <p class="intro-sub-description">
          OpenWeather API를 이용해 실제 날씨를 조회하며, 지역 자동 검색, 선택적 카드 추가, 즐겨찾기,
          상세 날씨 확인과 사용자 설정 유지 기능을 제공합니다.
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

            <p>Weather Now에서 사용할 수 있는 전체 기능입니다.</p>
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
           추가 구현 기능
      ======================================= -->

      <section class="content-card" aria-labelledby="additional-feature-title">
        <div class="section-heading">
          <p class="section-number">02</p>

          <div>
            <h2 id="additional-feature-title">추가 구현 기능</h2>

            <p>
              기본적인 날씨 조회 기능 외에 사용자 경험과 데이터 안정성을 위해 추가한 기능입니다.
            </p>
          </div>
        </div>

        <ol class="additional-feature-list">
          <li v-for="feature in additionalFeatureList" :key="feature.number">
            <span class="feature-number" aria-hidden="true">
              {{ feature.number }}
            </span>

            <div>
              <h3>
                {{ feature.title }}
              </h3>

              <p>
                {{ feature.description }}
              </p>
            </div>
          </li>
        </ol>
      </section>

      <!-- ======================================
           전체 날씨 데이터 흐름
      ======================================= -->

      <section class="content-card" aria-labelledby="data-flow-title">
        <div class="section-heading">
          <p class="section-number">03</p>

          <div>
            <h2 id="data-flow-title">전체 날씨 데이터 흐름</h2>

            <p>대시보드 진입 후 지역의 실시간 날씨가 화면에 표시되는 과정입니다.</p>
          </div>
        </div>

        <ol class="flow-list">
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
           자동 검색 데이터 흐름
      ======================================= -->

      <section class="content-card" aria-labelledby="search-flow-title">
        <div class="section-heading">
          <p class="section-number">04</p>

          <div>
            <h2 id="search-flow-title">지역 자동 검색 흐름</h2>

            <p>저장되지 않은 지역을 검색하고 대시보드에 추가하는 과정입니다.</p>
          </div>
        </div>

        <ol class="flow-list">
          <li v-for="flow in searchFlowList" :key="flow.step">
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
           Local Storage
      ======================================= -->

      <section class="content-card" aria-labelledby="storage-title">
        <div class="section-heading">
          <p class="section-number">05</p>

          <div>
            <h2 id="storage-title">사용자 상태 저장</h2>

            <p>
              새로고침 후에도 사용자 설정을 유지하기 위해 다음 데이터를 Local Storage에 저장합니다.
            </p>
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
          현재 기온, 습도와 풍속 등 실제 날씨 값은 Local Storage에 저장하지 않습니다. 날씨는 계속
          변경되는 데이터이므로 페이지 진입과 새로고침 시 OpenWeather API에서 다시 조회합니다.
        </p>
      </section>

      <!-- ======================================
           사용 기술
      ======================================= -->

      <section class="content-card" aria-labelledby="technology-title">
        <div class="section-heading">
          <p class="section-number">06</p>

          <div>
            <h2 id="technology-title">사용 기술</h2>

            <p>상태 관리, 라우팅과 외부 API 연동에 사용한 기술입니다.</p>
          </div>
        </div>

        <ul class="technology-list">
          <li v-for="technology in technologyList" :key="technology">
            {{ technology }}
          </li>
        </ul>
      </section>

      <!-- ======================================
           향후 개선 계획
      ======================================= -->

      <section class="content-card" aria-labelledby="future-plan-title">
        <div class="section-heading">
          <p class="section-number">07</p>

          <div>
            <h2 id="future-plan-title">향후 개선 계획</h2>

            <p>현재 프로젝트 구조를 기반으로 확장할 수 있는 기능입니다.</p>
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
            Vue 프론트엔드 학습 과정에서 제작한 개인 실시간 날씨 대시보드 프로젝트입니다.
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
        <RouterLink to="/" class="home-link"> 날씨 홈으로 돌아가기 </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ========================================
   전체 레이아웃
======================================== */

.about-page {
  min-height: calc(100vh - 70px);

  padding: 48px clamp(24px, 5vw, 80px) 72px;

  background-color: #f5f7fb;
}

.about-container {
  width: min(1100px, 100%);
  margin: 0 auto;
}

/* ========================================
   공통 카드
======================================== */

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

/* ========================================
   소개
======================================== */

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

  line-height: 1.2;
}

.intro-description {
  max-width: 820px;

  margin: 18px 0 0;

  color: #334155;

  font-size: 18px;
  font-weight: 700;
  line-height: 1.8;
}

.intro-sub-description {
  max-width: 820px;

  margin: 12px 0 0;

  color: #64748b;

  line-height: 1.8;
}

/* ========================================
   섹션 제목
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
   추가 구현 기능
======================================== */

.additional-feature-list {
  display: grid;

  grid-template-columns: repeat(2, minmax(0, 1fr));

  gap: 14px;

  margin: 0;
  padding: 0;

  list-style: none;
}

.additional-feature-list li {
  display: grid;

  grid-template-columns:
    46px
    minmax(0, 1fr);

  align-items: start;

  gap: 14px;

  padding: 20px;

  border: 1px solid #dbeafe;
  border-radius: 14px;

  background-color: #f8fbff;
}

.feature-number {
  display: inline-flex;

  align-items: center;
  justify-content: center;

  width: 42px;
  height: 42px;

  border-radius: 12px;

  background-color: #dbeafe;
  color: #1d4ed8;

  font-size: 13px;
  font-weight: 900;
}

.additional-feature-list h3,
.additional-feature-list p {
  margin: 0;
}

.additional-feature-list h3 {
  color: #172033;

  font-size: 17px;
}

.additional-feature-list p {
  margin-top: 8px;

  color: #64748b;

  line-height: 1.75;
}

/* ========================================
   데이터 흐름
======================================== */

.flow-list {
  display: grid;
  gap: 14px;

  margin: 0;
  padding: 0;

  list-style: none;
}

.flow-list li {
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

.flow-list h3,
.flow-list p {
  margin: 0;
}

.flow-list h3 {
  color: #172033;

  font-size: 17px;
}

.flow-list p {
  margin-top: 7px;

  color: #64748b;

  line-height: 1.75;
}

/* ========================================
   Local Storage
======================================== */

.storage-grid {
  display: grid;

  grid-template-columns: repeat(2, minmax(0, 1fr));

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
   GitHub
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

  min-height: 44px;
  padding: 10px 18px;

  border-radius: 10px;

  background-color: #2563eb;
  color: #ffffff;

  font-weight: 800;
  text-decoration: none;
}

.home-link:hover {
  background-color: #1d4ed8;
}

.home-link:focus-visible {
  outline: 3px solid rgb(37 99 235 / 30%);

  outline-offset: 3px;
}

/* ========================================
   태블릿
======================================== */

@media (max-width: 850px) {
  .additional-feature-list,
  .storage-grid {
    grid-template-columns: 1fr;
  }
}

/* ========================================
   모바일
======================================== */

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

  .section-heading {
    gap: 10px;
  }

  .additional-feature-list li,
  .flow-list li {
    grid-template-columns: 1fr;
  }

  .github-link {
    box-sizing: border-box;

    width: 100%;

    justify-content: center;
  }
}
</style>
