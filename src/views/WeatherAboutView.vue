<template>
  <section class="about-page">
    <div class="about-container">
      <header class="about-hero">
        <div class="hero-content">
          <p class="eyebrow">ABOUT WEATHER NOW</p>

          <h1>
            <span>필요한 지역의 날씨를</span>
            <span>한눈에 확인하세요.</span>
          </h1>

          <p class="hero-description">
            Weather Now는 국내 지역을 검색하고, 현재 날씨부터 대기질과 24시간 예보까지 간편하게
            확인할 수 있는 날씨 대시보드입니다.
          </p>

          <div class="hero-actions">
            <RouterLink to="/" class="primary-link">날씨 확인하기</RouterLink>

            <RouterLink to="/saved" class="secondary-link">저장한 지역 보기</RouterLink>
          </div>
        </div>

        <div class="hero-visual" aria-hidden="true">
          <span class="sun-symbol">☀️</span>
          <span class="cloud-symbol">☁️</span>

          <div class="temperature-preview">
            <strong>24°</strong>
            <span>맑고 쾌적해요</span>
          </div>
        </div>
      </header>

      <section class="feature-section" aria-labelledby="feature-title">
        <div class="section-heading">
          <p>WHAT YOU CAN DO</p>
          <h2 id="feature-title">Weather Now에서 할 수 있는 일</h2>
        </div>

        <ul class="feature-grid">
          <li>
            <span class="feature-icon" aria-hidden="true">⌕</span>
            <h3>국내 지역 검색</h3>
            <p>시·군·구부터 읍·면·동까지 원하는 지역을 찾아 대시보드에 추가할 수 있습니다.</p>
          </li>

          <li>
            <span class="feature-icon" aria-hidden="true">⌖</span>
            <h3>전국 날씨 한눈에 보기</h3>
            <p>전국 지도와 지역별 카드를 통해 주요 도시의 현재 날씨를 빠르게 비교할 수 있습니다.</p>
          </li>

          <li>
            <span class="feature-icon" aria-hidden="true">↗</span>
            <h3>상세 날씨 추이</h3>
            <p>최고·최저 기온, 대기질, 일출·일몰과 앞으로 24시간의 변화를 확인할 수 있습니다.</p>
          </li>
        </ul>
      </section>

      <aside class="service-note" aria-labelledby="service-note-title">
        <div>
          <p class="note-label">DATA & NOTICE</p>
          <h2 id="service-note-title">날씨 정보 안내</h2>
        </div>

        <div class="note-content">
          <p>
            현재 날씨는 OpenWeather, 예보와 대기질은 Open-Meteo 데이터를 사용합니다. 지도와 지역
            검색에는 OpenStreetMap 데이터를 활용합니다.
          </p>

          <p>
            날씨와 대기질은 관측 지점 및 예보 모델에 따라 실제 지역의 상태와 차이가 있을 수 있으니
            참고 정보로 이용해 주세요.
          </p>
        </div>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.about-page {
  min-height: calc(100vh - 70px);
  padding: 48px clamp(20px, 5vw, 72px) 72px;
  background: radial-gradient(circle at 85% 12%, rgb(147 197 253 / 20%), transparent 28%), #f5f7fb;
}

.about-container {
  width: min(1120px, 100%);
  margin: 0 auto;
}

.about-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.65fr);
  align-items: center;
  gap: clamp(36px, 7vw, 80px);
  min-height: 420px;
  padding: clamp(36px, 6vw, 64px);
  overflow: hidden;
  border: 1px solid #dbe3ee;
  border-radius: 26px;
  background: linear-gradient(135deg, #ffffff 35%, #eff6ff 100%);
  box-shadow: 0 14px 38px rgb(15 23 42 / 8%);
}

.eyebrow,
.about-hero h1,
.hero-description,
.section-heading p,
.section-heading h2,
.feature-grid,
.feature-grid h3,
.feature-grid p,
.note-label,
.service-note h2,
.note-content p {
  margin: 0;
}

.eyebrow,
.section-heading p,
.note-label {
  color: #2563eb;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.1em;
}

.about-hero h1 {
  margin-top: 12px;
  color: #172033;
  font-size: clamp(38px, 6vw, 62px);
  font-weight: 900;
  letter-spacing: -0.045em;
  line-height: 1.15;
  word-break: keep-all;
}

.about-hero h1 span {
  display: block;
}

.hero-description {
  max-width: 650px;
  margin-top: 22px;
  color: #64748b;
  font-size: 16px;
  line-height: 1.8;
  word-break: keep-all;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 28px;
}

.primary-link,
.secondary-link {
  display: inline-flex;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  padding: 11px 17px;
  border: 1px solid transparent;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 900;
  text-decoration: none;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.primary-link {
  background: #2563eb;
  color: #ffffff;
}

.secondary-link {
  border-color: #cbd5e1;
  background: #ffffff;
  color: #334155;
}

.primary-link:hover,
.secondary-link:hover {
  transform: translateY(-2px);
}

.primary-link:hover {
  background: #1d4ed8;
}

.secondary-link:hover {
  border-color: #93c5fd;
  background: #eff6ff;
}

.primary-link:focus-visible,
.secondary-link:focus-visible {
  outline: 3px solid rgb(37 99 235 / 24%);
  outline-offset: 3px;
}

.hero-visual {
  position: relative;
  display: grid;
  min-height: 280px;
  place-items: center;
  border: 1px solid rgb(255 255 255 / 80%);
  border-radius: 50%;
  background: linear-gradient(145deg, #bfdbfe, #f0f9ff);
  box-shadow:
    inset 0 0 0 18px rgb(255 255 255 / 32%),
    0 24px 50px rgb(37 99 235 / 16%);
}

.sun-symbol,
.cloud-symbol {
  position: absolute;
  font-size: 72px;
  line-height: 1;
}

.sun-symbol {
  top: 38px;
  right: 34px;
}

.cloud-symbol {
  top: 72px;
  left: 24px;
  color: #ffffff;
  filter: drop-shadow(0 8px 12px rgb(15 23 42 / 10%));
}

.temperature-preview {
  z-index: 1;
  display: grid;
  gap: 6px;
  margin-top: 72px;
  text-align: center;
}

.temperature-preview strong {
  color: #172033;
  font-size: 64px;
  font-weight: 900;
  letter-spacing: -0.06em;
  line-height: 1;
}

.temperature-preview span {
  color: #475569;
  font-size: 13px;
  font-weight: 800;
}

.feature-section {
  padding: 64px 0 24px;
}

.section-heading {
  margin-bottom: 22px;
}

.section-heading h2 {
  margin-top: 6px;
  color: #172033;
  font-size: clamp(25px, 4vw, 34px);
  font-weight: 900;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  padding: 0;
  list-style: none;
}

.feature-grid li {
  min-width: 0;
  padding: 26px;
  border: 1px solid #dbe3ee;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 8px 22px rgb(15 23 42 / 5%);
}

.feature-icon {
  display: inline-flex;
  width: 43px;
  height: 43px;
  align-items: center;
  justify-content: center;
  border-radius: 13px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 25px;
  font-weight: 900;
}

.feature-grid h3 {
  margin-top: 18px;
  color: #172033;
  font-size: 17px;
  font-weight: 900;
}

.feature-grid p {
  margin-top: 9px;
  color: #64748b;
  font-size: 14px;
  line-height: 1.7;
}

.service-note {
  display: grid;
  grid-template-columns: minmax(190px, 0.35fr) minmax(0, 1fr);
  gap: 36px;
  margin-top: 16px;
  padding: 28px 30px;
  border: 1px solid #dbe3ee;
  border-radius: 18px;
  background: #ffffff;
}

.service-note h2 {
  margin-top: 6px;
  color: #172033;
  font-size: 20px;
  font-weight: 900;
}

.note-content {
  display: grid;
  gap: 9px;
}

.note-content p {
  color: #64748b;
  font-size: 13px;
  line-height: 1.7;
}

@media (max-width: 820px) {
  .about-hero {
    grid-template-columns: 1fr;
  }

  .hero-visual {
    min-height: 240px;
  }

  .feature-grid {
    grid-template-columns: 1fr;
  }

  .service-note {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

@media (max-width: 520px) {
  .about-page {
    padding: 28px 16px 48px;
  }

  .about-hero {
    gap: 30px;
    min-height: auto;
    padding: 28px 22px;
    border-radius: 20px;
  }

  .about-hero h1 {
    font-size: 36px;
  }

  .hero-description {
    font-size: 14px;
  }

  .hero-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .hero-visual {
    min-height: 210px;
  }

  .sun-symbol,
  .cloud-symbol {
    font-size: 58px;
  }

  .temperature-preview strong {
    font-size: 52px;
  }

  .feature-section {
    padding-top: 46px;
  }

  .feature-grid li,
  .service-note {
    padding: 22px;
  }
}
</style>
