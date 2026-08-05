<script setup>
import { computed, onMounted, ref } from 'vue'

import { storeToRefs } from 'pinia'

import { ElMessage } from 'element-plus'
import { Loading, Location, Refresh, Setting } from '@element-plus/icons-vue'

import { useRouter } from 'vue-router'

import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import KoreaWeatherMap from '@/components/exercise/KoreaWeatherMap.vue'
import SearchBar from '@/components/exercise/SearchBar.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'

import { useWeatherStore } from '@/stores/weatherStore'

import { withObjectParticle } from '@/utils/formatKoreanParticle'
import { getChosung } from '@/utils/getChosung'
import { getRepresentativeLocationName } from '@/utils/getRepresentativeLocationName'

const router = useRouter()
const weatherStore = useWeatherStore()

const {
  weatherList,
  searchResults,
  currentLocationStatus,
  currentLocationMessage,
  isLocatingCurrentPosition,
  isLoading,
  isSearching,
  errorMessage,
  searchErrorMessage,
  formattedLastUpdatedAt,
  isCurrentLocationSaved,
} = storeToRefs(weatherStore)

const searchQuery = ref('')
const selectedCityId = ref(null)
const actionMessage = ref('')
const actionMessageType = ref('success')
const favoriteMessage = ref('')
const addingLocationId = ref('')
const isAllSavedCitiesVisible = ref(false)

const currentLocationCity = computed(() => {
  return weatherList.value.find((city) => city.isCurrentLocation) || null
})

const favoriteSavedWeatherList = computed(() => {
  return weatherList.value.filter((city) => {
    const isKoreanLocation = city.countryCode?.trim().toUpperCase() === 'KR'

    return city.favorite && (city.isCurrentLocation || isKoreanLocation)
  })
})

const visibleFavoriteWeatherList = computed(() => {
  return isAllSavedCitiesVisible.value
    ? favoriteSavedWeatherList.value
    : favoriteSavedWeatherList.value.slice(0, 4)
})

const hiddenFavoriteCityCount = computed(() => {
  return Math.max(
    0,
    favoriteSavedWeatherList.value.length - visibleFavoriteWeatherList.value.length,
  )
})

const normalizedSearchQuery = computed(() => searchQuery.value.trim().toLowerCase())

const canSearch = computed(() => {
  return searchQuery.value.trim().length >= 2
})

const matchingDashboardWeather = computed(() => {
  const query = normalizedSearchQuery.value

  if (!query) {
    return []
  }

  return weatherList.value.filter((city) => {
    const representativeName = getRepresentativeLocationName(city.name || '')
    const searchableName = representativeName.toLowerCase()
    const cityChosung = getChosung(representativeName)

    return searchableName.includes(query) || cityChosung.includes(query)
  })
})

const selectedCity = computed(() => {
  return weatherList.value.find((city) => city.id === selectedCityId.value) || null
})

const currentLocationAlertType = computed(() => {
  if (currentLocationStatus.value === 'ready') {
    return 'success'
  }

  if (currentLocationStatus.value === 'fallback') {
    return 'warning'
  }

  return 'info'
})

const getAdministrativeArea = (result) => {
  return result.administrativeArea || [result.state, result.countryCode].filter(Boolean).join(' · ')
}

const formatCoordinate = (coordinate) => {
  const numberCoordinate = Number(coordinate)

  return Number.isFinite(numberCoordinate) ? numberCoordinate.toFixed(4) : '-'
}

const handleSearchQuery = (newQuery) => {
  searchQuery.value = newQuery
  actionMessage.value = ''
  weatherStore.clearSearchResults()
}

const handleSearch = async () => {
  if (!canSearch.value) {
    return
  }

  actionMessage.value = ''
  await weatherStore.searchLocation(searchQuery.value.trim())
}

const handleAddLocation = async (candidate) => {
  actionMessage.value = ''
  addingLocationId.value = candidate.id

  try {
    const result = await weatherStore.addLocation(candidate)

    actionMessage.value = result.message
    actionMessageType.value = result.success ? 'success' : 'warning'

    if (result.success) {
      selectedCityId.value = result.locationId || candidate.id
      ElMessage.success(result.message)
    } else {
      ElMessage.warning(result.message)
    }
  } finally {
    addingLocationId.value = ''
  }
}

const handleSelectCity = (city) => {
  selectedCityId.value = city.id
}

const moveToDetail = (cityId) => {
  if (!cityId) {
    return
  }

  router.push({
    name: 'weather-detail',
    params: { cityId },
  })
}

const moveToSavedLocations = () => {
  router.push({ name: 'weather-saved' })
}

const handleToggleFavorite = (city) => {
  const willBeFavorite = !city.favorite

  weatherStore.toggleFavorite(city.id)
  favoriteMessage.value = willBeFavorite
    ? `${withObjectParticle(city.name)} 즐겨찾기에 추가했습니다.`
    : `${withObjectParticle(city.name)} 즐겨찾기에서 해제했습니다.`
  ElMessage.success(favoriteMessage.value)
}

const handleSaveCurrentLocation = () => {
  const result = weatherStore.saveCurrentLocation()

  actionMessage.value = result.message
  actionMessageType.value = result.success ? 'success' : 'warning'

  if (result.success) {
    ElMessage.success(result.message)
  } else {
    ElMessage.warning(result.message)
  }
}

onMounted(async () => {
  weatherStore.preloadKoreanAdministrativeAreaList()
  await weatherStore.fetchAllWeather()
  weatherStore.refreshCurrentLocation()
})
</script>

<template>
  <section class="weather-home page-container">
    <header class="page-header home-page-header">
      <div class="page-heading-copy">
        <p class="page-eyebrow">Weather Dashboard</p>
        <h1 class="page-title">실시간 날씨 대시보드</h1>
        <p class="page-description">
          현재 위치의 날씨를 확인하고, 국내 지역을 검색해 나만의 대시보드를 구성해 보세요.
        </p>
      </div>

      <el-alert
        v-if="
          !isLocatingCurrentPosition &&
          currentLocationStatus === 'fallback' &&
          currentLocationMessage
        "
        class="header-location-alert"
        :title="currentLocationMessage"
        :type="currentLocationAlertType"
        :closable="false"
        show-icon
      />
    </header>

    <div class="home-dashboard-layout">
      <BaseDashboardCard class="current-location-panel" title="현재 위치 날씨">
        <div class="current-location-heading">
          <h2 class="panel-title current-location-title">현재 위치 날씨</h2>

          <el-button
            plain
            size="small"
            type="primary"
            class="inline-location-button"
            :icon="Location"
            :loading="isLocatingCurrentPosition"
            :disabled="isLocatingCurrentPosition"
            @click="weatherStore.refreshCurrentLocation()"
          >
            위치 확인
          </el-button>
        </div>

        <article
          v-if="isLocatingCurrentPosition"
          class="location-loading-card"
          role="status"
          aria-live="polite"
        >
          <el-icon class="location-loading-icon is-loading" aria-hidden="true">
            <Loading />
          </el-icon>
          <p>위치 확인 중</p>
        </article>

        <el-skeleton v-else-if="isLoading && !currentLocationCity" :rows="4" animated />

        <WeatherCard
          v-else-if="currentLocationCity"
          :city="currentLocationCity"
          :selected="selectedCityId === currentLocationCity.id"
          saveable
          :saved="isCurrentLocationSaved"
          icon-only-actions
          @select="handleSelectCity"
          @click-detail="moveToDetail"
          @save="handleSaveCurrentLocation"
          @toggle-favorite="handleToggleFavorite"
        />
      </BaseDashboardCard>

      <BaseDashboardCard class="search-panel" title="도시 검색">
        <h2 class="panel-title">지역 찾기</h2>

        <SearchBar
          :query="searchQuery"
          :is-searching="isSearching"
          :can-search="canSearch"
          @update-query="handleSearchQuery"
          @search="handleSearch"
        />

        <p v-if="searchQuery.trim().length === 1" class="input-guide">
          새 지역 검색은 이름 또는 초성을 두 글자 이상 입력해야 합니다.
        </p>

        <section v-if="normalizedSearchQuery" class="grouped-result-section">
          <div class="search-result-heading">
            <div>
              <h2>현재 위치·저장한 지역</h2>
              <p>API 호출 없이 이름과 초성으로 바로 찾았습니다.</p>
            </div>
            <el-tag effect="light" round>{{ matchingDashboardWeather.length }}개</el-tag>
          </div>

          <div v-if="matchingDashboardWeather.length" class="saved-quick-list">
            <button
              v-for="city in matchingDashboardWeather"
              :key="city.id"
              type="button"
              class="saved-quick-item"
              @click="moveToDetail(city.id)"
            >
              <span>
                <strong>{{ city.name }}</strong>
                <small>{{ city.isCurrentLocation ? '현재 위치' : city.region }}</small>
              </span>
              <span class="quick-temperature">{{ Math.round(city.main?.temp) }}℃</span>
            </button>
          </div>

          <p v-else class="empty-inline-result">일치하는 대시보드 지역이 없습니다.</p>
        </section>

        <el-alert
          v-if="isSearching"
          class="inline-search-status"
          title="새 지역을 검색하고 있습니다."
          type="info"
          :closable="false"
          show-icon
        />

        <el-alert
          v-else-if="searchErrorMessage"
          class="message"
          :title="searchErrorMessage"
          type="error"
          :closable="false"
          show-icon
        />

        <section
          v-else-if="searchResults.length"
          class="grouped-result-section api-search-section"
          aria-labelledby="new-location-result-title"
        >
          <div class="search-result-heading">
            <div>
              <h2 id="new-location-result-title">새 지역 검색 결과</h2>
              <p>상위 행정구역부터 최대 5개를 표시합니다.</p>
            </div>
            <el-tag type="primary" effect="light" round>{{ searchResults.length }}개</el-tag>
          </div>

          <div class="api-result-list">
            <article v-for="result in searchResults" :key="result.id" class="api-result-item">
              <div class="result-location">
                <div class="result-name-row">
                  <h3>{{ result.name }}</h3>
                  <el-tag v-if="result.administrativeLevelLabel" size="small" effect="plain">
                    {{ result.administrativeLevelLabel }}
                  </el-tag>
                </div>
                <p class="result-administrative-area">{{ getAdministrativeArea(result) }}</p>
                <p v-if="result.coord" class="result-coordinate">
                  위도 {{ formatCoordinate(result.coord.lat) }} · 경도
                  {{ formatCoordinate(result.coord.lon) }}
                </p>
                <p v-else class="result-coordinate">좌표와 날씨는 추가할 때 조회합니다.</p>
              </div>

              <el-button
                type="primary"
                class="add-location-button"
                :loading="addingLocationId === result.id"
                :disabled="result.isAdded || Boolean(addingLocationId)"
                @click="handleAddLocation(result)"
              >
                {{ result.isAdded ? '추가됨' : '추가' }}
              </el-button>
            </article>
          </div>
        </section>

        <el-alert
          v-if="actionMessage"
          class="message"
          :title="actionMessage"
          :type="actionMessageType"
          :closable="false"
          show-icon
        />

        <p class="geocoding-attribution">
          행정구역: KR LEGAL DONG · 좌표: © OpenStreetMap contributors
        </p>
      </BaseDashboardCard>

      <BaseDashboardCard class="saved-cities-panel" title="즐겨찾기 지역">
        <div class="favorite-panel-heading">
          <h2 class="panel-title">
            즐겨찾기
            <span class="favorite-count" role="status">
              ({{ favoriteSavedWeatherList.length }})
            </span>
          </h2>

          <div class="favorite-panel-actions">
            <el-button plain size="small" :icon="Setting" @click="moveToSavedLocations">
              전체 관리
            </el-button>

            <el-button
              type="primary"
              plain
              size="small"
              :icon="Refresh"
              :loading="isLoading"
              :disabled="isLoading"
              @click="weatherStore.refreshWeather()"
            >
              새로고침
            </el-button>
          </div>
        </div>

        <div v-if="formattedLastUpdatedAt" class="saved-summary">
          <p class="updated-at">
            마지막 갱신 {{ formattedLastUpdatedAt }}
          </p>
        </div>

        <el-alert
          v-if="errorMessage"
          class="message"
          :title="errorMessage"
          type="error"
          :closable="false"
          show-icon
        />

        <div v-if="favoriteSavedWeatherList.length" class="saved-weather-list">
          <WeatherCard
            v-for="city in visibleFavoriteWeatherList"
            :key="city.id"
            :city="city"
            compact
            :removable="false"
            :selected="selectedCityId === city.id"
            @select="handleSelectCity"
            @click-detail="moveToDetail"
            @toggle-favorite="handleToggleFavorite"
          />

          <el-button
            v-if="favoriteSavedWeatherList.length > 4"
            plain
            class="saved-list-toggle"
            @click="isAllSavedCitiesVisible = !isAllSavedCitiesVisible"
          >
            {{ isAllSavedCitiesVisible ? '간단히 보기' : `${hiddenFavoriteCityCount}개 더 보기` }}
          </el-button>
        </div>

        <el-empty
          v-else-if="!isLoading"
          :image-size="92"
          description="즐겨찾기한 지역이 없습니다. 저장한 지역에서 별표를 추가해 보세요."
        >
          <el-button plain @click="moveToSavedLocations">저장한 지역 보기</el-button>
        </el-empty>

        <p class="sr-only" role="status" aria-live="polite">{{ favoriteMessage }}</p>
        <p v-if="selectedCity" class="selected-message">
          선택한 도시 <strong>{{ selectedCity.name }}</strong>
        </p>
      </BaseDashboardCard>

      <KoreaWeatherMap class="national-map-panel" />
    </div>
  </section>
</template>

<style scoped>
.home-page-header {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(340px, 0.85fr);
  align-items: end;
  gap: 24px;
}

.page-heading-copy {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.header-location-alert {
  align-self: end;
}

.home-dashboard-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(340px, 0.85fr);
  grid-template-areas:
    'search current'
    'map saved';
  align-items: start;
  gap: 24px;
}

.current-location-panel {
  grid-area: current;
}

.search-panel {
  grid-area: search;
}

.saved-cities-panel {
  grid-area: saved;
}

.favorite-panel-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.favorite-panel-heading .panel-title {
  margin-bottom: 0;
}

.favorite-count {
  color: #64748b;
  font-size: 14px;
  font-weight: 800;
}

.favorite-panel-actions {
  display: flex;
  flex: 0 0 auto;
  gap: 7px;
}

.favorite-panel-actions :deep(.el-button) {
  margin-left: 0;
  font-weight: 800;
}

.saved-summary {
  margin-top: 5px;
}

.national-map-panel {
  grid-area: map;
  min-width: 0;
}

.panel-heading-row,
.search-result-heading,
.api-result-item,
.saved-quick-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.current-location-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.inline-location-button {
  flex: 0 0 auto;
  margin-top: 3px;
  font-weight: 800;
}

.current-location-panel :deep(.weather-card),
.location-loading-card {
  margin-top: 14px;
}

.location-loading-card {
  display: grid;
  place-content: center;
  gap: 10px;
  box-sizing: border-box;
  height: 268px;
  border: 1px solid #dbe3ee;
  border-radius: 16px;
  background: #f1f5f9;
  color: #64748b;
  text-align: center;
}

.location-loading-card p {
  margin: 0;
  font-size: 14px;
  font-weight: 800;
}

.location-loading-icon {
  justify-self: center;
  color: #94a3b8;
  font-size: 30px;
}

.current-location-title {
  margin-bottom: 0;
}

.panel-title {
  margin: 0 0 16px;
  color: #172033;
  font-size: 20px;
}

.panel-description {
  margin-bottom: 20px;
}

.updated-at,
.input-guide,
.empty-inline-result,
.geocoding-attribution,
.result-location p {
  margin: 0;
}

.panel-description,
.updated-at,
.input-guide,
.empty-inline-result {
  color: #64748b;
  font-size: 13px;
  line-height: 1.55;
}

.saved-weather-list,
.grouped-result-section,
.inline-search-status,
.message {
  margin-top: 14px;
}

.saved-list-toggle {
  width: 100%;
  margin-top: 2px;
  font-weight: 800;
}

.input-guide {
  margin-top: 9px;
}

.grouped-result-section {
  padding-top: 14px;
  border-top: 1px solid #e2e8f0;
}

.search-result-heading {
  align-items: flex-start;
  margin-bottom: 10px;
}

.search-result-heading h2,
.search-result-heading p {
  margin: 0;
}

.search-result-heading h2 {
  color: #172033;
  font-size: 16px;
}

.search-result-heading p {
  margin-top: 4px;
  color: #64748b;
  font-size: 12px;
}

.saved-quick-list,
.api-result-list,
.saved-weather-list {
  display: grid;
  gap: 10px;
}

.saved-quick-item {
  width: 100%;
  padding: 11px 13px;
  border: 1px solid #dbe3ee;
  border-radius: 11px;
  background: #f8fafc;
  color: #172033;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.saved-quick-item:hover {
  border-color: #93c5fd;
  background: #eff6ff;
}

.saved-quick-item span:first-child {
  display: grid;
  gap: 3px;
}

.saved-quick-item small {
  color: #64748b;
}

.quick-temperature {
  color: #172033;
  font-size: 17px;
  font-weight: 900;
  white-space: nowrap;
}

.api-result-item {
  padding: 13px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
}

.result-location {
  min-width: 0;
}

.result-name-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 7px;
}

.result-name-row h3 {
  margin: 0;
  color: #172033;
  font-size: 15px;
  overflow-wrap: anywhere;
}

.result-administrative-area {
  margin-top: 4px !important;
  color: #475569;
  font-size: 12px;
  font-weight: 750;
}

.result-coordinate {
  margin-top: 3px !important;
  color: #94a3b8;
  font-size: 11px;
}

.add-location-button {
  flex: 0 0 auto;
  font-weight: 800;
}

.geocoding-attribution {
  margin-top: 14px;
  color: #94a3b8;
  font-size: 11px;
}

.updated-at {
  margin-top: 3px;
  font-size: 11px;
}

.selected-message {
  margin: 14px 0 0;
  padding: 11px 13px;
  border-radius: 10px;
  background: #f8fafc;
  color: #475569;
  font-size: 13px;
}

@media (max-width: 950px) {
  .home-page-header {
    grid-template-columns: minmax(0, 1fr);
    align-items: stretch;
  }

  .home-dashboard-layout {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      'current'
      'search'
      'saved'
      'map';
  }
}

@media (max-width: 520px) {
  .api-result-item {
    align-items: stretch;
    flex-direction: column;
  }

  .add-location-button {
    width: 100%;
  }

  .favorite-panel-heading {
    align-items: stretch;
    flex-direction: column;
  }

  .favorite-panel-actions :deep(.el-button) {
    flex: 1;
  }
}

@media (max-width: 420px) {
  .location-loading-card {
    height: 319px;
  }
}
</style>
