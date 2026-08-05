<script setup>
import { computed, ref } from 'vue'

const sections = [
  {
    id: 'overview',
    number: '01',
    label: '프로젝트 개요',
    description: '무엇을 해결하고 어떤 경험을 만들었는지 설명합니다.',
  },
  {
    id: 'stack',
    number: '02',
    label: '기술과 API',
    description: '기술을 선택한 이유와 외부 데이터의 역할을 정리합니다.',
  },
  {
    id: 'flow',
    number: '03',
    label: '데이터 흐름',
    description: '검색부터 화면 렌더링까지 데이터가 이동하는 과정입니다.',
  },
  {
    id: 'structure',
    number: '04',
    label: '파일 구조',
    description: '폴더별 책임과 주요 파일의 연결 관계를 살펴봅니다.',
  },
  {
    id: 'features',
    number: '05',
    label: '구현 포인트',
    description: '검색 정확도부터 반응형 UI와 실패 처리까지 직접 개선한 지점입니다.',
  },
  {
    id: 'guide',
    number: '06',
    label: '실행과 확장',
    description: '프로젝트를 실행하고 다음 단계로 확장하는 방법입니다.',
  },
]

const activeSectionId = ref('overview')

const activeSection = computed(() => {
  return sections.find((section) => section.id === activeSectionId.value) || sections[0]
})

const stackGroups = [
  {
    title: 'Vue 애플리케이션',
    tags: ['Vue 3', 'Composition API', 'Vite'],
    description:
      '화면 상태와 파생값을 ref·computed로 분리하고, 기능 단위 컴포넌트와 composable을 조합했습니다.',
  },
  {
    title: '상태와 라우팅',
    tags: ['Pinia', 'Vue Router', 'Local · Session Storage'],
    description:
      '현재 위치·저장 지역·즐겨찾기·단위 설정을 중앙 상태로 관리하고, 지도 선택 날씨의 임시 등록과 동적 상세 URL 복원을 구현했습니다.',
  },
  {
    title: 'UI와 시각화',
    tags: ['Element Plus', 'Leaflet', 'SVG', 'CSS Grid'],
    description:
      '입력·알림·모달뿐 아니라 Card·Statistic·Descriptions로 지도 요약 정보를 구성하고, Leaflet 지도와 SVG 그래프를 목적에 맞게 조합했습니다.',
  },
  {
    title: '데이터 통신과 품질',
    tags: ['Axios', 'Promise.allSettled', '429 Cooldown', 'ESLint · Oxlint'],
    description:
      'API별 캐시·타임아웃·부분 실패와 재요청 대기를 분리하고, 사용자 오류 문장과 정적 검사로 안정성과 코드 품질을 함께 관리했습니다.',
  },
]

const apiRows = [
  {
    name: 'OpenWeather Current Weather',
    role: '현재 날씨',
    usage: '현재·체감 기온, 습도, 풍속, 가시거리, 날씨 상태와 아이콘을 좌표 기준으로 조회합니다.',
  },
  {
    name: 'Open-Meteo Forecast',
    role: '예보',
    usage: '오늘의 최저·최고 기온, 24시간 기온·습도·강수량, 일출·일몰 시각을 구성하고 30분간 독립 캐시합니다.',
  },
  {
    name: 'Open-Meteo Air Quality',
    role: '대기질',
    usage: 'PM10과 PM2.5를 조회·독립 캐시하고 에어코리아 기준의 좋음·보통·나쁨·매우 나쁨 등급으로 변환합니다.',
  },
  {
    name: 'kr-legal-dong',
    role: '국내 행정구역',
    usage: '시·도, 시·군·구, 읍·면·동의 마지막 지역 단위를 추출해 이름·부분 일치·초성 검색 후보를 만듭니다.',
  },
  {
    name: 'Nominatim / OpenStreetMap',
    role: '좌표와 지역명',
    usage: '행정구역 후보를 좌표로 확정하고 현재 좌표를 역지오코딩해 사용자에게 보여 줄 지역명을 얻습니다.',
  },
  {
    name: 'Leaflet + OSM Tiles',
    role: '전국 지도',
    usage:
      '독도를 포함한 14개 주요 지역 마커와 확대·축소 지도를 렌더링하고, 선택 날씨를 상세 페이지 이동과 연결합니다.',
  },
]

const flowSteps = [
  {
    number: '01',
    title: '명시적인 사용자 입력',
    description:
      '두 글자 이상의 검색어를 Enter 또는 버튼으로 제출하거나, 브라우저 현재 위치 확인을 요청하면서 흐름이 시작됩니다.',
  },
  {
    number: '02',
    title: '로컬 결과와 새 지역 분리',
    description:
      '현재 위치·저장 지역은 즉시 필터링하고, 새 지역은 상위 경로를 제외한 마지막 법정 행정구역 단위에서 부분 문자열·초성을 비교해 최대 5개를 찾습니다.',
  },
  {
    number: '03',
    title: '좌표 확정',
    description: 'Nominatim 결과와 법정동 전체 경로를 대조해 같은 이름의 지역을 구분합니다.',
  },
  {
    number: '04',
    title: '현재 날씨 정규화',
    description: 'OpenWeather 응답을 모든 카드와 화면이 함께 사용하는 하나의 도시 객체로 변환합니다.',
  },
  {
    number: '05',
    title: '상세 데이터 결합',
    description:
      '상세 화면에서 Open-Meteo 예보·대기질을 좌표 기준으로 독립 요청하고, 한쪽 실패가 다른 데이터에 영향을 주지 않도록 결합합니다.',
  },
  {
    number: '06',
    title: '상태 저장과 상세 경로 복원',
    description:
      'Pinia 상태를 카드·목록·상세 화면이 공유합니다. 지도 날씨는 즉시 임시 등록하고, 도시 ID와 좌표 Query를 함께 전달해 상세 URL을 새로고침해도 복원합니다.',
  },
]

const responsibilityRows = [
  {
    path: 'views/',
    title: '페이지 조합',
    description: '홈, 저장 지역, 상세 날씨, 서비스·프로젝트 소개 화면의 데이터와 컴포넌트를 조합합니다.',
  },
  {
    path: 'components/exercise/',
    title: '재사용 UI',
    description:
      '날씨 카드, 검색창, Element Plus 선택 패널을 포함한 전국 지도, 시간별 그래프와 단위 전환 UI를 담당합니다.',
  },
  {
    path: 'stores/',
    title: '공유 상태와 도메인 로직',
    description: '날씨 조회, 국내 지역 검색, 현재 위치, 저장·즐겨찾기와 온도 단위를 관리합니다.',
  },
  {
    path: 'composables/',
    title: '화면 간 재사용 로직',
    description: '온도 단위 변환과 예보·대기질 조회처럼 UI에서 분리할 수 있는 반응형 로직을 제공합니다.',
  },
  {
    path: 'utils/ · data/ · assets/',
    title: '기준 데이터와 공통 표현',
    description:
      '마지막 행정구역 단위·초성 변환, 권역 분류, 한국어 조사, 독도 포함 14개 지역 좌표와 공통 UI 스타일을 보관합니다.',
  },
  {
    path: 'router/',
    title: '화면 이동',
    description:
      '정적 페이지와 /weather/:cityId 동적 상세 경로, 지도 좌표 Query 복원, 404 처리를 연결합니다.',
  },
]

const featureItems = [
  {
    index: '01',
    title: '입력 의도에 맞춘 국내 행정구역 검색',
    description:
      '일반 지오코딩 결과를 그대로 노출하지 않고 법정동 목록과 결합했습니다. 건물·학교·도로는 제외하고 읍·면·동 이상의 행정구역만 최대 5개 보여 줍니다.',
    detail:
      '후보 이름에서 마지막 행정구역 단위만 추출해 부분 일치·초성 검색하고 상위 행정구역부터 정렬합니다. 한글 조합 중에도 두 번째 글자부터 검색 버튼 상태가 정확히 갱신됩니다.',
  },
  {
    index: '02',
    title: '항상 유지되는 현재 위치 카드',
    description:
      'Geolocation 권한이 허용되면 좌표를 역지오코딩해 실제 동네 이름을 표시합니다. 거부·미지원 환경에서는 서울 날씨를 명확한 안내와 함께 제공합니다.',
    detail:
      '현재 위치는 고정 카드로 유지하면서 상세 보기·저장·즐겨찾기를 각각 제공합니다. 저장 시 현재 확인된 지역을 일반 저장 지역으로 복사하므로 이후 위치가 바뀌어도 별도로 관리할 수 있습니다.',
  },
  {
    index: '03',
    title: '목적에 따라 나눈 홈 대시보드',
    description:
      'PC에서는 검색·전국 지도를 왼쪽에, 현재 위치·즐겨찾기를 오른쪽에 두어 탐색과 비교 영역을 분리했습니다. 태블릿과 모바일에서는 한 열로 자연스럽게 재배치합니다.',
    detail:
      '홈에는 현재 위치와 즐겨찾기만 노출하고, 즐겨찾기 개수·전체 관리·새로고침을 제목 영역에 모아 카드 길이를 줄였습니다.',
  },
  {
    index: '04',
    title: '저장 지역 관리와 안전한 삭제',
    description:
      '저장한 모든 지역은 즐겨찾기를 먼저 보여 주고, 권역 필터와 가나다순·추가순, 오름차순·내림차순을 조합해 정렬할 수 있습니다.',
    detail:
      '삭제 시에는 Element Plus 확인 모달을 서비스 카드 스타일로 재구성하고 50% 검정 오버레이와 명확한 위험 버튼으로 실수를 방지합니다.',
  },
  {
    index: '05',
    title: '관측과 예보를 연결한 상세 화면',
    description:
      '선택한 동네 이름과 상위 행정구역을 함께 표시하고, 현재·체감·최저·최고 기온과 PM10·PM2.5 값 및 등급을 좌표 기준으로 결합합니다.',
    detail:
      '24시간 추이는 SVG 그래프로 표현합니다. Forecast·대기질은 각각 30분 캐시하고, 429 시 재요청을 멈추며 최대 6시간 이내의 이전 성공 데이터를 안내와 함께 사용합니다.',
  },
  {
    index: '06',
    title: '상세 화면과 연결되는 전국 날씨 지도',
    description:
      'IntersectionObserver로 지도가 화면 근처에 왔을 때만 독도를 포함한 14개 주요 지역의 날씨를 요청합니다. 일부 요청이 실패해도 성공한 지역은 계속 표시합니다.',
    detail:
      '선택 결과는 Element Plus Card·Statistic·Descriptions로 구성합니다. 상세 이동 시 기존 날씨를 Pinia에 재사용하고 도시 ID·이름·상위 지역·좌표를 URL에 전달해 새로고침도 지원하며, Leaflet과 버튼의 포인터 이벤트는 분리했습니다.',
  },
  {
    index: '07',
    title: 'Element Plus 기반의 일관된 피드백',
    description:
      'Input·Button·Select·Tag·Alert·Skeleton·MessageBox뿐 아니라 Card·Statistic·Descriptions까지 적용하고 회색·파란색 디자인 토큰에 맞게 조정했습니다.',
    detail:
      '명시적인 버튼 문구와 aria-label, 키보드 제출, 페이지 이동 후 본문 초점 이동으로 마우스 외 입력 방식도 고려했습니다.',
  },
  {
    index: '08',
    title: '공개 API 정책과 캐시 고려',
    description:
      'Nominatim 요청은 큐에서 약 1.1초 간격으로 실행하고, 검색·역지오코딩 결과는 Local Storage에 저장해 같은 요청을 반복하지 않습니다.',
    detail:
      '동일 좌표의 진행 중 요청을 합치고 Open-Meteo 429 응답에는 Retry-After 또는 기본 2분 대기를 적용해 실패가 추가 호출로 이어지지 않게 했습니다.',
  },
]

const improvementItems = [
  {
    title: '서버 프록시 도입',
    description: '운영 환경에서는 OpenWeather 키를 브라우저에 노출하지 않도록 서버 함수나 BFF에서 요청합니다.',
  },
  {
    title: '테스트 자동화',
    description: '검색 정렬·중복 제거·대기질 등급은 단위 테스트로, 저장·상세 이동은 E2E 테스트로 보호할 수 있습니다.',
  },
  {
    title: '캐시 계층 확장',
    description: '메모리·브라우저 캐시를 서버 캐시로 확장하면 여러 사용자가 같은 날씨 요청 결과를 공유할 수 있습니다.',
  },
  {
    title: '접근성 회귀 점검',
    description: '키보드 탐색, 그래프 대체 텍스트와 명암 대비를 CI에서 자동 검사하는 단계로 발전시킬 수 있습니다.',
  },
]

const selectSection = (sectionId) => {
  activeSectionId.value = sectionId
}
</script>

<template>
  <section class="project-page page-container">
    <header class="project-hero">
      <div class="project-hero-copy">
        <p class="page-eyebrow">Project Documentation</p>
        <h1>
          <span>WeatherNow를</span>
          <span>어떻게 설계하고 구현했는지 소개합니다.</span>
        </h1>
        <p>
          국내 지역 검색부터 현재 위치, 저장·즐겨찾기, 전국 지도와 상세 예보까지 여러 데이터와
          화면을 하나의 경험으로 연결하기 위해 사용한 구조와 UI 판단을 정리했습니다.
        </p>

        <div class="project-tags" aria-label="주요 기술">
          <el-tag effect="plain">Vue 3</el-tag>
          <el-tag effect="plain">Pinia</el-tag>
          <el-tag effect="plain">Element Plus</el-tag>
          <el-tag effect="plain">Leaflet</el-tag>
          <el-tag effect="plain">OpenWeather · Open-Meteo</el-tag>
        </div>
      </div>

      <aside class="project-hero-note" aria-label="문서 활용 안내">
        <span>FINAL IMPLEMENTATION</span>
        <strong>과제 요구사항 + 확장 기능 완료</strong>
        <p>목차별로 최종 구조와 구현 판단을 확인할 수 있으며 Lint·Build와 주요 사용자 흐름 검증을 마쳤습니다.</p>
      </aside>
    </header>

    <div class="document-layout">
      <aside class="document-navigation">
        <div class="navigation-heading">
          <span>CONTENTS</span>
          <strong>{{ sections.length }}개 주제</strong>
        </div>

        <nav aria-label="프로젝트 소개 목차">
          <button
            v-for="section in sections"
            :key="section.id"
            type="button"
            class="document-navigation-button"
            :class="{ 'is-active': activeSectionId === section.id }"
            :aria-current="activeSectionId === section.id ? 'page' : undefined"
            @click="selectSection(section.id)"
          >
            <span>{{ section.number }}</span>
            <strong>{{ section.label }}</strong>
          </button>
        </nav>
      </aside>

      <Transition name="document-section" mode="out-in">
        <article :key="activeSection.id" class="document-content">
          <header class="document-content-heading">
            <p>{{ activeSection.number }} · PROJECT STORY</p>
            <h2>{{ activeSection.label }}</h2>
            <span>{{ activeSection.description }}</span>
          </header>

          <template v-if="activeSectionId === 'overview'">
            <section class="story-highlight" aria-labelledby="project-problem-title">
              <div>
                <span>PROJECT QUESTION</span>
                <h3 id="project-problem-title">
                  이름이 비슷한 국내 지역을 정확히 찾고, 필요한 날씨를 한 화면에서 비교하려면?
                </h3>
              </div>
              <p>
                WeatherNow는 단순 도시명 검색에서 출발해 법정동 검색, 현재 위치, 저장·즐겨찾기,
                전국 지도, 상세 예보와 대기질을 하나의 흐름으로 연결한 Vue 기반 날씨
                대시보드입니다.
              </p>
            </section>

            <div class="overview-grid">
              <section>
                <span class="card-index">01</span>
                <h3>정확한 국내 검색</h3>
                <p>법정동 데이터와 지오코딩을 결합해 같은 이름의 지역과 세부 POI를 구분합니다.</p>
              </section>
              <section>
                <span class="card-index">02</span>
                <h3>역할이 분명한 화면 구성</h3>
                <p>홈은 빠른 비교, 저장 지역은 관리, 상세 화면은 시간별 분석에 집중합니다.</p>
              </section>
              <section>
                <span class="card-index">03</span>
                <h3>설명 가능한 데이터 상태</h3>
                <p>로딩·권한 거부·부분 API 실패·빈 결과를 숨기지 않고 사용자 문장으로 안내합니다.</p>
              </section>
            </div>

            <section class="project-scope">
              <div>
                <h3>사용자 흐름</h3>
                <p>검색 또는 위치 확인부터 저장과 상세 분석까지 한 서비스 안에서 이어집니다.</p>
              </div>
              <ol>
                <li><span>1</span>현재 위치 확인</li>
                <li><span>2</span>국내 지역 검색</li>
                <li><span>3</span>대시보드에 저장</li>
                <li><span>4</span>홈에서 즐겨찾기</li>
                <li><span>5</span>정렬·삭제 관리</li>
                <li><span>6</span>카드·지도에서 상세 확인</li>
              </ol>
            </section>
          </template>

          <template v-else-if="activeSectionId === 'stack'">
            <div class="stack-grid">
              <section v-for="group in stackGroups" :key="group.title">
                <h3>{{ group.title }}</h3>
                <div>
                  <el-tag v-for="tag in group.tags" :key="tag" size="small" effect="plain">
                    {{ tag }}
                  </el-tag>
                </div>
                <p>{{ group.description }}</p>
              </section>
            </div>

            <section class="api-section" aria-labelledby="api-role-title">
              <div class="subsection-heading">
                <span>EXTERNAL DATA</span>
                <h3 id="api-role-title">API와 데이터 소스의 역할</h3>
                <p>하나의 API에 모든 책임을 맡기지 않고 각 데이터 소스의 강점을 조합했습니다.</p>
              </div>

              <div class="api-table" role="table" aria-label="API 및 데이터 소스">
                <div class="api-table-header" role="row">
                  <span role="columnheader">서비스</span>
                  <span role="columnheader">역할</span>
                  <span role="columnheader">적용 내용</span>
                </div>
                <div v-for="api in apiRows" :key="api.name" class="api-table-row" role="row">
                  <strong role="cell">{{ api.name }}</strong>
                  <span role="cell">{{ api.role }}</span>
                  <p role="cell">{{ api.usage }}</p>
                </div>
              </div>
            </section>
          </template>

          <template v-else-if="activeSectionId === 'flow'">
            <div class="flow-list">
              <section v-for="step in flowSteps" :key="step.number" class="flow-step">
                <span>{{ step.number }}</span>
                <div>
                  <h3>{{ step.title }}</h3>
                  <p>{{ step.description }}</p>
                </div>
              </section>
            </div>

            <section class="flow-detail">
              <div class="subsection-heading">
                <span>STATE BOUNDARY</span>
                <h3>데이터마다 다른 저장 전략</h3>
              </div>
              <dl>
                <div>
                  <dt>Pinia</dt>
                  <dd>현재 화면에서 공유하는 날씨 목록, 로딩·오류, 검색 결과와 단위 설정</dd>
                </div>
                <div>
                  <dt>Local Storage</dt>
                  <dd>추가 지역, 즐겨찾기 ID, 단위 설정, 검색·역지오코딩 캐시</dd>
                </div>
                <div>
                  <dt>Session Storage</dt>
                  <dd>전국 14개 지역 날씨 10분 캐시, Forecast·대기질 각각 30분 캐시와 429 대기 시각</dd>
                </div>
                <div>
                  <dt>Route Param · Query</dt>
                  <dd>도시 ID와 지도 좌표·지역명을 함께 전달해 상세 URL 직접 접근과 새로고침 복원</dd>
                </div>
              </dl>
            </section>
          </template>

          <template v-else-if="activeSectionId === 'structure'">
            <div class="structure-layout">
              <pre class="file-tree" aria-label="주요 파일 구조"><code>src/
├── views/
│   ├── WeatherHomeView.vue
│   ├── WeatherFavoritesView.vue
│   ├── WeatherDetailView.vue
│   ├── WeatherAboutView.vue
│   └── WeatherProjectView.vue
├── components/exercise/
│   ├── SearchBar.vue
│   ├── WeatherCard.vue
│   ├── BaseDashboardCard.vue
│   ├── KoreaWeatherMap.vue
│   ├── HourlyWeatherForecast.vue
│   └── UnitToggle.vue
├── stores/
│   ├── weatherStore.js
│   └── configStore.js
├── composables/
│   ├── useTemperature.js
│   └── useWeatherSupplement.js
├── utils/
│   ├── getChosung.js
│   ├── getRepresentativeLocationName.js
│   └── getWeatherRegion.js
├── data/koreaWeatherLocations.js
├── assets/common.css
└── router/</code></pre>

              <div class="responsibility-list">
                <section v-for="item in responsibilityRows" :key="item.path">
                  <code>{{ item.path }}</code>
                  <h3>{{ item.title }}</h3>
                  <p>{{ item.description }}</p>
                </section>
              </div>
            </div>

            <el-alert
              title="분리 기준: 화면 모양은 component, 화면 조합은 view, 공유 상태와 도메인 규칙은 store, 재사용 가능한 반응형 로직은 composable에 둡니다."
              type="info"
              :closable="false"
              show-icon
            />
          </template>

          <template v-else-if="activeSectionId === 'features'">
            <div class="feature-story-list">
              <section v-for="feature in featureItems" :key="feature.index">
                <span>{{ feature.index }}</span>
                <div>
                  <h3>{{ feature.title }}</h3>
                  <p>{{ feature.description }}</p>
                  <small>{{ feature.detail }}</small>
                </div>
              </section>
            </div>
          </template>

          <template v-else>
            <section class="setup-section" aria-labelledby="setup-title">
              <div class="subsection-heading">
                <span>GET STARTED</span>
                <h3 id="setup-title">로컬에서 실행하기</h3>
                <p>Node.js와 OpenWeather API 키가 있으면 동일한 개발 환경을 구성할 수 있습니다.</p>
              </div>

              <ol class="setup-steps">
                <li>
                  <span>1</span>
                  <div><strong>의존성 설치</strong><code>npm install</code></div>
                </li>
                <li>
                  <span>2</span>
                  <div><strong>환경 변수 설정</strong><code>VITE_OPENWEATHER_API_KEY=your_api_key</code></div>
                </li>
                <li>
                  <span>3</span>
                  <div><strong>개발 서버 실행</strong><code>npm run dev</code></div>
                </li>
                <li>
                  <span>4</span>
                  <div><strong>품질과 빌드 확인</strong><code>npm run lint · npm run build</code></div>
                </li>
              </ol>
            </section>

            <el-alert
              title="최종 검증 완료: npm run lint와 npm run build를 통과했으며 검색·저장·상세·독도 지도와 지도 상세 이동 흐름을 브라우저에서 확인했습니다."
              type="success"
              :closable="false"
              show-icon
            />

            <el-alert
              title="현재 구조는 프런트엔드 과제용입니다. 실제 운영 서비스에서는 API 키 보호와 호출량 제어를 위해 서버 프록시를 두는 것이 안전합니다."
              type="warning"
              :closable="false"
              show-icon
              style="margin-top: 10px"
            />

            <section class="improvement-section" aria-labelledby="improvement-title">
              <div class="subsection-heading">
                <span>NEXT STEP</span>
                <h3 id="improvement-title">다음 단계에서 개선할 수 있는 것</h3>
              </div>
              <div class="improvement-grid">
                <section v-for="item in improvementItems" :key="item.title">
                  <h3>{{ item.title }}</h3>
                  <p>{{ item.description }}</p>
                </section>
              </div>
            </section>
          </template>
        </article>
      </Transition>
    </div>
  </section>
</template>

<style scoped>
.project-page {
  gap: 28px;
}

.project-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(280px, 0.55fr);
  align-items: end;
  gap: 36px;
  padding: clamp(30px, 5vw, 56px);
  overflow: hidden;
  border: 1px solid #dbe3ee;
  border-radius: 24px;
  background:
    radial-gradient(circle at 88% 10%, rgb(147 197 253 / 30%), transparent 28%),
    linear-gradient(135deg, #ffffff 30%, #f8fbff 100%);
  box-shadow: 0 14px 34px rgb(15 23 42 / 7%);
}

.project-hero-copy h1,
.project-hero-copy > p,
.project-hero-note p,
.project-hero-note strong,
.document-content-heading p,
.document-content-heading h2,
.document-content-heading span,
.story-highlight h3,
.story-highlight p,
.overview-grid h3,
.overview-grid p,
.project-scope h3,
.project-scope p,
.stack-grid h3,
.stack-grid p,
.subsection-heading h3,
.subsection-heading p,
.api-table p,
.flow-step h3,
.flow-step p,
.responsibility-list h3,
.responsibility-list p,
.feature-story-list h3,
.feature-story-list p,
.feature-story-list small,
.improvement-grid h3,
.improvement-grid p {
  margin: 0;
}

.project-hero-copy h1 {
  max-width: 820px;
  margin-top: 10px;
  color: #0f172a;
  font-size: clamp(32px, 5vw, 52px);
  letter-spacing: -0.045em;
  line-height: 1.18;
  word-break: keep-all;
}

.project-hero-copy h1 span {
  display: block;
}

.project-hero-copy > p:not(.page-eyebrow) {
  max-width: 760px;
  margin-top: 18px;
  color: #64748b;
  font-size: 15px;
  line-height: 1.8;
  word-break: keep-all;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 24px;
}

.project-hero-note {
  display: grid;
  gap: 8px;
  padding: 22px;
  border: 1px solid #bfdbfe;
  border-radius: 16px;
  background: rgb(255 255 255 / 78%);
}

.project-hero-note span,
.navigation-heading span,
.document-content-heading p,
.story-highlight > div > span,
.subsection-heading > span {
  color: #2563eb;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.1em;
}

.project-hero-note strong {
  color: #172033;
  font-size: 18px;
}

.project-hero-note p {
  color: #64748b;
  font-size: 13px;
  line-height: 1.65;
}

.document-layout {
  display: grid;
  grid-template-columns: 230px minmax(0, 1fr);
  align-items: start;
  gap: 22px;
}

.document-navigation,
.document-content {
  border: 1px solid #dbe3ee;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 9px 26px rgb(15 23 42 / 5%);
}

.document-navigation {
  position: sticky;
  top: 100px;
  overflow: hidden;
  padding: 18px;
}

.navigation-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 2px 3px 14px;
  border-bottom: 1px solid #e2e8f0;
}

.navigation-heading strong {
  color: #64748b;
  font-size: 11px;
}

.document-navigation nav {
  display: grid;
  gap: 5px;
  margin-top: 12px;
}

.document-navigation-button {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 44px;
  padding: 9px 10px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #64748b;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.document-navigation-button > span {
  color: #94a3b8;
  font-size: 11px;
  font-weight: 900;
}

.document-navigation-button strong {
  font-size: 13px;
}

.document-navigation-button:hover {
  background: #f8fafc;
  color: #172033;
}

.document-navigation-button.is-active {
  background: #eff6ff;
  color: #1d4ed8;
}

.document-navigation-button.is-active > span {
  color: #2563eb;
}

.document-navigation-button:focus-visible {
  outline: 3px solid rgb(37 99 235 / 24%);
  outline-offset: 2px;
}

.document-content {
  min-width: 0;
  min-height: 700px;
  padding: clamp(24px, 4vw, 44px);
}

.document-content-heading {
  padding-bottom: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.document-content-heading h2 {
  margin-top: 6px;
  color: #172033;
  font-size: clamp(28px, 4vw, 38px);
  letter-spacing: -0.035em;
}

.document-content-heading > span {
  display: block;
  margin-top: 9px;
  color: #64748b;
  font-size: 14px;
  line-height: 1.65;
}

.story-highlight {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: 28px;
  margin-top: 26px;
  padding: 24px;
  border-radius: 16px;
  background: #f8fafc;
}

.story-highlight h3 {
  margin-top: 7px;
  color: #172033;
  font-size: 21px;
  line-height: 1.45;
  word-break: keep-all;
}

.story-highlight > p {
  align-self: center;
  color: #475569;
  font-size: 14px;
  line-height: 1.8;
}

.overview-grid,
.stack-grid,
.improvement-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 20px;
}

.overview-grid section,
.stack-grid section,
.improvement-grid section {
  min-width: 0;
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #ffffff;
}

.card-index {
  color: #2563eb;
  font-size: 11px;
  font-weight: 900;
}

.overview-grid h3,
.stack-grid h3,
.improvement-grid h3 {
  margin-top: 10px;
  color: #172033;
  font-size: 16px;
}

.overview-grid p,
.stack-grid p,
.improvement-grid p {
  margin-top: 8px;
  color: #64748b;
  font-size: 13px;
  line-height: 1.7;
}

.project-scope {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 22px;
  margin-top: 20px;
  padding: 22px;
  border: 1px solid #dbe3ee;
  border-radius: 14px;
}

.project-scope h3 {
  color: #172033;
  font-size: 17px;
}

.project-scope p {
  margin-top: 7px;
  color: #64748b;
  font-size: 12px;
  line-height: 1.65;
}

.project-scope ol {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 7px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.project-scope li {
  display: grid;
  justify-items: center;
  gap: 6px;
  color: #475569;
  font-size: 11px;
  font-weight: 800;
  text-align: center;
}

.project-scope li span {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border-radius: 50%;
  background: #eff6ff;
  color: #1d4ed8;
}

.stack-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 26px;
}

.stack-grid section > div {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.api-section,
.flow-detail,
.setup-section,
.improvement-section {
  margin-top: 30px;
}

.subsection-heading h3 {
  margin-top: 5px;
  color: #172033;
  font-size: 21px;
}

.subsection-heading p {
  margin-top: 7px;
  color: #64748b;
  font-size: 13px;
  line-height: 1.65;
}

.api-table {
  overflow: hidden;
  margin-top: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
}

.api-table-header,
.api-table-row {
  display: grid;
  grid-template-columns: minmax(170px, 0.75fr) minmax(90px, 0.35fr) minmax(0, 1.4fr);
  gap: 14px;
  align-items: center;
  padding: 13px 16px;
}

.api-table-header {
  background: #f1f5f9;
  color: #475569;
  font-size: 11px;
  font-weight: 900;
}

.api-table-row + .api-table-row {
  border-top: 1px solid #e2e8f0;
}

.api-table-row strong {
  color: #172033;
  font-size: 13px;
}

.api-table-row > span {
  color: #2563eb;
  font-size: 12px;
  font-weight: 800;
}

.api-table-row p {
  color: #64748b;
  font-size: 12px;
  line-height: 1.6;
}

.flow-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 26px;
}

.flow-step {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 13px;
  padding: 18px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
}

.flow-step > span {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 12px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 12px;
  font-weight: 900;
}

.flow-step h3 {
  color: #172033;
  font-size: 15px;
}

.flow-step p {
  margin-top: 6px;
  color: #64748b;
  font-size: 12px;
  line-height: 1.65;
}

.flow-detail dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin: 16px 0 0;
}

.flow-detail dl > div {
  padding: 16px;
  border-radius: 12px;
  background: #f8fafc;
}

.flow-detail dt {
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 900;
}

.flow-detail dd {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.6;
}

.structure-layout {
  display: grid;
  grid-template-columns: minmax(270px, 0.8fr) minmax(0, 1.2fr);
  gap: 16px;
  margin-top: 26px;
}

.file-tree {
  overflow-x: auto;
  margin: 0;
  padding: 22px;
  border-radius: 14px;
  background: #172033;
  color: #dbeafe;
  font-size: 12px;
  line-height: 1.75;
}

.responsibility-list {
  display: grid;
  gap: 8px;
}

.responsibility-list section {
  padding: 14px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.responsibility-list code {
  color: #2563eb;
  font-size: 11px;
  font-weight: 900;
}

.responsibility-list h3 {
  margin-top: 5px;
  color: #172033;
  font-size: 14px;
}

.responsibility-list p {
  margin-top: 5px;
  color: #64748b;
  font-size: 11px;
  line-height: 1.6;
}

.structure-layout + :deep(.el-alert) {
  margin-top: 16px;
}

.feature-story-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 13px;
  margin-top: 26px;
}

.feature-story-list section {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 12px;
  padding: 19px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
}

.feature-story-list section > span {
  color: #2563eb;
  font-size: 12px;
  font-weight: 900;
}

.feature-story-list h3 {
  color: #172033;
  font-size: 15px;
}

.feature-story-list p {
  margin-top: 7px;
  color: #475569;
  font-size: 12px;
  line-height: 1.65;
}

.feature-story-list small {
  display: block;
  margin-top: 9px;
  color: #64748b;
  font-size: 11px;
  line-height: 1.6;
}

.setup-steps {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 10px;
  margin: 16px 0 0;
  padding: 0;
  list-style: none;
}

.setup-steps li {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr);
  gap: 11px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.setup-steps li > span {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border-radius: 10px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 900;
}

.setup-steps div {
  display: grid;
  gap: 7px;
  min-width: 0;
}

.setup-steps strong {
  color: #172033;
  font-size: 13px;
}

.setup-steps code {
  overflow-x: auto;
  padding: 8px 10px;
  border-radius: 8px;
  background: #f1f5f9;
  color: #334155;
  font-size: 11px;
  white-space: nowrap;
}

.setup-section + :deep(.el-alert) {
  margin-top: 18px;
}

.improvement-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 16px;
}

.document-section-enter-active,
.document-section-leave-active {
  transition:
    opacity 0.16s ease,
    transform 0.16s ease;
}

.document-section-enter-from {
  opacity: 0;
  transform: translateY(5px);
}

.document-section-leave-to {
  opacity: 0;
  transform: translateY(-3px);
}

@media (max-width: 1050px) {
  .project-hero {
    grid-template-columns: 1fr;
    gap: 22px;
  }

  .document-layout {
    grid-template-columns: 1fr;
  }

  .document-navigation {
    position: static;
    padding: 14px;
  }

  .document-navigation nav {
    display: flex;
    overflow-x: auto;
    padding-bottom: 3px;
  }

  .document-navigation-button {
    grid-template-columns: auto auto;
    flex: 0 0 auto;
    width: auto;
    white-space: nowrap;
  }
}

@media (max-width: 760px) {
  .story-highlight,
  .project-scope,
  .structure-layout {
    grid-template-columns: 1fr;
  }

  .overview-grid,
  .feature-story-list {
    grid-template-columns: 1fr;
  }

  .api-table-header {
    display: none;
  }

  .api-table-row {
    grid-template-columns: 1fr;
    gap: 6px;
  }
}

@media (max-width: 560px) {
  .project-page {
    padding-right: 16px;
    padding-left: 16px;
  }

  .project-hero {
    padding: 26px 22px;
    border-radius: 20px;
  }

  .document-content {
    min-height: 640px;
    padding: 24px 20px;
  }

  .stack-grid,
  .flow-list,
  .flow-detail dl,
  .setup-steps,
  .improvement-grid {
    grid-template-columns: 1fr;
  }

  .project-scope ol {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: stretch;
  }

  .project-scope li {
    grid-template-columns: 28px minmax(0, 1fr);
    justify-items: start;
    text-align: left;
  }
}
</style>
