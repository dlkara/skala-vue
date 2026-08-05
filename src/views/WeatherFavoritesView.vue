<script setup>
import { computed, onMounted, ref } from 'vue'

import { storeToRefs } from 'pinia'

import { ElMessage, ElMessageBox } from 'element-plus'

import { useRouter } from 'vue-router'

import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'

import { useWeatherStore } from '@/stores/weatherStore'

import { withObjectParticle } from '@/utils/formatKoreanParticle'
import { WEATHER_REGION_LABELS } from '@/utils/getWeatherRegion'

const router = useRouter()
const weatherStore = useWeatherStore()

const { weatherList, isLoading, errorMessage, formattedLastUpdatedAt } =
  storeToRefs(weatherStore)

const selectedRegion = ref('all')
const sortKey = ref('added')
const sortDirection = ref('asc')
const selectedCityId = ref(null)
const actionMessage = ref('')

const savedWeatherList = computed(() => {
  return weatherList.value.filter((city) => {
    return !city.isCurrentLocation && city.countryCode?.trim().toUpperCase() === 'KR'
  })
})

const regionOptions = computed(() => {
  const usedRegionCodes = new Set(savedWeatherList.value.map((city) => city.regionCode))

  return Object.entries(WEATHER_REGION_LABELS)
    .filter(([value]) => value === 'all' || usedRegionCodes.has(value))
    .map(([value, label]) => ({ value, label }))
})

const displayedWeatherList = computed(() => {
  const filteredCities =
    selectedRegion.value === 'all'
      ? [...savedWeatherList.value]
      : savedWeatherList.value.filter((city) => city.regionCode === selectedRegion.value)
  const addedOrderMap = new Map(savedWeatherList.value.map((city, index) => [city.id, index]))
  const direction = sortDirection.value === 'asc' ? 1 : -1

  return filteredCities.sort((firstCity, secondCity) => {
    if (firstCity.favorite !== secondCity.favorite) {
      return firstCity.favorite ? -1 : 1
    }

    if (sortKey.value === 'name') {
      return firstCity.name.localeCompare(secondCity.name, 'ko') * direction
    }

    return (addedOrderMap.get(firstCity.id) - addedOrderMap.get(secondCity.id)) * direction
  })
})

const resultMessage = computed(() => {
  if (selectedRegion.value === 'all') {
    return `저장한 지역 ${savedWeatherList.value.length}개`
  }

  return `${WEATHER_REGION_LABELS[selectedRegion.value]} ${displayedWeatherList.value.length}개`
})

const moveToDetail = (cityId) => {
  router.push({
    name: 'weather-detail',
    params: { cityId },
  })
}

const moveToHome = () => {
  router.push({ name: 'weather-home' })
}

const handleSelectCity = (city) => {
  selectedCityId.value = city.id
}

const handleToggleFavorite = (city) => {
  const willBeFavorite = !city.favorite

  weatherStore.toggleFavorite(city.id)
  actionMessage.value = willBeFavorite
    ? `${withObjectParticle(city.name)} 즐겨찾기에 추가했습니다.`
    : `${withObjectParticle(city.name)} 즐겨찾기에서 해제했습니다.`
  ElMessage.success(actionMessage.value)
}

const handleRemoveLocation = async (city) => {
  try {
    await ElMessageBox.confirm(
      `${withObjectParticle(city.name)} 저장 목록에서 삭제하시겠습니까?`,
      '저장 지역 삭제',
      {
        confirmButtonText: '삭제',
        cancelButtonText: '취소',
        confirmButtonType: 'danger',
        type: 'warning',
        customClass: 'weather-delete-confirm',
        modalClass: 'weather-delete-overlay',
        showClose: false,
        closeOnClickModal: false,
      },
    )
  } catch {
    return
  }

  const result = weatherStore.removeLocation(city.id)

  actionMessage.value = result.message

  if (result.success) {
    ElMessage.success(result.message)
  } else {
    ElMessage.error(result.message)
  }

  if (selectedCityId.value === city.id) {
    selectedCityId.value = null
  }

  if (
    selectedRegion.value !== 'all' &&
    !savedWeatherList.value.some((savedCity) => savedCity.regionCode === selectedRegion.value)
  ) {
    selectedRegion.value = 'all'
  }
}

onMounted(() => {
  weatherStore.fetchAllWeather()
})
</script>

<template>
  <section class="saved-locations-view page-container">
    <header class="page-header">
      <p class="page-eyebrow">Saved Locations</p>
      <h1 class="page-title">저장한 지역</h1>
      <p class="page-description">
        저장한 모든 지역을 정렬하고, 즐겨찾기와 삭제 상태를 관리할 수 있습니다.
      </p>
    </header>

    <BaseDashboardCard title="저장한 지역 관리">
      <div class="management-heading">
        <div>
          <h2>지역 관리</h2>
          <p role="status">{{ resultMessage }}</p>
          <p v-if="formattedLastUpdatedAt" class="updated-at">
            마지막 갱신 {{ formattedLastUpdatedAt }}
          </p>
        </div>

        <el-button
          type="primary"
          plain
          :loading="isLoading"
          :disabled="isLoading"
          @click="weatherStore.refreshWeather()"
        >
          새로고침
        </el-button>
      </div>

      <div class="management-controls">
        <div class="control-field region-control">
          <label for="saved-region-filter">지역 필터</label>
          <el-select
            id="saved-region-filter"
            v-model="selectedRegion"
            size="large"
            aria-label="저장한 지역 필터"
          >
            <el-option
              v-for="option in regionOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </div>

        <div class="control-field">
          <label for="saved-sort-key">정렬 기준</label>
          <el-select
            id="saved-sort-key"
            v-model="sortKey"
            size="large"
            aria-label="저장한 지역 정렬 기준"
          >
            <el-option label="추가순" value="added" />
            <el-option label="가나다순" value="name" />
          </el-select>
        </div>

        <div class="control-field">
          <label for="saved-sort-direction">정렬 방향</label>
          <el-select
            id="saved-sort-direction"
            v-model="sortDirection"
            size="large"
            aria-label="저장한 지역 정렬 방향"
          >
            <el-option label="오름차순" value="asc" />
            <el-option label="내림차순" value="desc" />
          </el-select>
        </div>
      </div>

      <el-skeleton v-if="isLoading && weatherList.length === 0" :rows="4" animated />

      <div v-else-if="errorMessage" class="error-box" role="alert">
        <el-alert :title="errorMessage" type="error" :closable="false" show-icon />
        <el-button type="primary" @click="weatherStore.refreshWeather()">
          다시 불러오기
        </el-button>
      </div>

      <div v-else-if="displayedWeatherList.length" class="saved-location-grid">
        <WeatherCard
          v-for="city in displayedWeatherList"
          :key="city.id"
          :city="city"
          compact
          :selected="selectedCityId === city.id"
          @select="handleSelectCity"
          @click-detail="moveToDetail"
          @toggle-favorite="handleToggleFavorite"
          @remove="handleRemoveLocation"
        />
      </div>

      <el-empty
        v-else
        :image-size="110"
        :description="
          savedWeatherList.length
            ? '선택한 권역에 저장한 지역이 없습니다.'
            : '아직 저장한 지역이 없습니다.'
        "
      >
        <el-button type="primary" @click="moveToHome">홈에서 지역 검색하기</el-button>
      </el-empty>

      <p class="sr-only" role="status" aria-live="polite">{{ actionMessage }}</p>
    </BaseDashboardCard>
  </section>
</template>

<style scoped>
.saved-locations-view {
  display: grid;
  gap: 24px;
  width: 100%;
}

.management-heading,
.error-box {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.management-heading h2,
.management-heading p {
  margin: 0;
}

.management-heading h2 {
  color: #172033;
  font-size: 21px;
}

.management-heading p {
  margin-top: 5px;
  color: #475569;
  font-size: 14px;
  font-weight: 750;
}

.management-heading .updated-at {
  color: #94a3b8;
  font-size: 11px;
  font-weight: 600;
}

.management-controls {
  display: grid;
  grid-template-columns: minmax(220px, 1.4fr) repeat(2, minmax(150px, 1fr));
  gap: 12px;
  margin: 22px 0;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #f8fafc;
}

.control-field {
  min-width: 0;
}

.control-field label {
  display: block;
  margin-bottom: 6px;
  color: #475569;
  font-size: 12px;
  font-weight: 800;
}

.control-field .el-select {
  width: 100%;
}

.saved-location-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.error-box {
  align-items: center;
}

.error-box .el-alert {
  flex: 1;
}

@media (max-width: 800px) {
  .management-controls {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .region-control {
    grid-column: 1 / -1;
  }

  .saved-location-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .management-heading,
  .error-box {
    align-items: stretch;
    flex-direction: column;
  }

  .management-controls {
    grid-template-columns: 1fr;
  }

  .region-control {
    grid-column: auto;
  }
}
</style>
