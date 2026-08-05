<script setup>
import { computed, ref, watch } from 'vue'

import { storeToRefs } from 'pinia'

import { useConfigStore } from '@/stores/configStore'

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  sunEvents: {
    type: Array,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: '',
  },
  updatedAt: {
    type: Date,
    default: null,
  },
})

const configStore = useConfigStore()

const { unit } = storeToRefs(configStore)

const selectedIndex = ref(0)

const CHART_WIDTH = 1120
const CHART_HEIGHT = 430
const CHART_LEFT = 82
const CHART_RIGHT = 28
const PLOT_WIDTH = CHART_WIDTH - CHART_LEFT - CHART_RIGHT

const chartBands = {
  temperature: {
    top: 30,
    height: 152,
  },
  humidity: {
    top: 220,
    height: 68,
  },
  precipitation: {
    top: 326,
    height: 54,
  },
}

const hasNumericValue = (value) => {
  return value !== null && value !== undefined && Number.isFinite(Number(value))
}

const getXPosition = (index) => {
  if (props.items.length <= 1) {
    return CHART_LEFT
  }

  return CHART_LEFT + (index / (props.items.length - 1)) * PLOT_WIDTH
}

const createSeriesPoints = (property, band, minimum, maximum) => {
  const range = maximum - minimum || 1

  return props.items.map((item, index) => {
    const value = item[property]

    if (!hasNumericValue(value)) {
      return {
        x: getXPosition(index),
        y: band.top + band.height,
        value: null,
      }
    }

    const numericValue = Number(value)

    return {
      x: getXPosition(index),
      y: band.top + ((maximum - numericValue) / range) * band.height,
      value: numericValue,
    }
  })
}

const createLinePath = (points) => {
  return points
    .filter((point) => point.value !== null)
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ')
}

const temperatureRange = computed(() => {
  const temperatures = props.items
    .map((item) => item.temperature)
    .filter(hasNumericValue)
    .map(Number)

  if (temperatures.length === 0) {
    return {
      minimum: 0,
      maximum: 1,
    }
  }

  return {
    minimum: Math.floor(Math.min(...temperatures) - 2),
    maximum: Math.ceil(Math.max(...temperatures) + 2),
  }
})

const precipitationMaximum = computed(() => {
  const precipitationValues = props.items
    .map((item) => item.precipitation)
    .filter(hasNumericValue)
    .map(Number)

  return Math.max(1, ...precipitationValues)
})

const temperaturePoints = computed(() => {
  return createSeriesPoints(
    'temperature',
    chartBands.temperature,
    temperatureRange.value.minimum,
    temperatureRange.value.maximum,
  )
})

const humidityPoints = computed(() => {
  return createSeriesPoints('humidity', chartBands.humidity, 0, 100)
})

const precipitationPoints = computed(() => {
  return createSeriesPoints(
    'precipitation',
    chartBands.precipitation,
    0,
    precipitationMaximum.value,
  )
})

const temperatureLinePath = computed(() => createLinePath(temperaturePoints.value))

const humidityLinePath = computed(() => createLinePath(humidityPoints.value))

const precipitationLinePath = computed(() => createLinePath(precipitationPoints.value))

const temperatureAreaPath = computed(() => {
  const points = temperaturePoints.value.filter((point) => point.value !== null)

  if (points.length === 0) {
    return ''
  }

  const bottom = chartBands.temperature.top + chartBands.temperature.height
  const linePath = createLinePath(points)

  return `${linePath} L ${points.at(-1).x.toFixed(2)} ${bottom} L ${points[0].x.toFixed(2)} ${bottom} Z`
})

const selectedItem = computed(() => {
  return props.items[selectedIndex.value] ?? props.items[0] ?? null
})

const selectedTemperaturePoint = computed(() => {
  return temperaturePoints.value[selectedIndex.value]
})

const selectedHumidityPoint = computed(() => {
  return humidityPoints.value[selectedIndex.value]
})

const selectedPrecipitationPoint = computed(() => {
  return precipitationPoints.value[selectedIndex.value]
})

const selectedXPosition = computed(() => {
  return getXPosition(selectedIndex.value)
})

const parseLocalDateTime = (dateTime) => {
  const match = dateTime?.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/)

  if (!match) {
    return null
  }

  const [, year, month, day, hour, minute, second = '0'] = match

  return Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  )
}

const sunEventPositions = computed(() => {
  const startTime = parseLocalDateTime(props.items[0]?.time)
  const endTime = parseLocalDateTime(props.items.at(-1)?.time)

  if (startTime === null || endTime === null || startTime === endTime) {
    return []
  }

  return props.sunEvents
    .map((event) => {
      const eventTime = parseLocalDateTime(event.time)

      if (eventTime === null || eventTime < startTime || eventTime > endTime) {
        return null
      }

      return {
        ...event,
        x: CHART_LEFT + ((eventTime - startTime) / (endTime - startTime)) * PLOT_WIDTH,
        icon: event.type === 'sunrise' ? '☀️' : '🌙',
        label: event.type === 'sunrise' ? '일출' : '일몰',
        timeText: event.time?.split('T')?.[1]?.slice(0, 5) ?? '',
      }
    })
    .filter(Boolean)
})

const weatherCodeInformation = (weatherCode, isDay) => {
  const code = Number(weatherCode)
  const isNight = Number(isDay) === 0

  if (code === 0) {
    return isNight ? { icon: '🌙', label: '맑은 밤' } : { icon: '☀️', label: '맑음' }
  }

  if ([1, 2].includes(code)) {
    return isNight ? { icon: '🌙', label: '구름 조금' } : { icon: '🌤️', label: '대체로 맑음' }
  }

  if (code === 3) return { icon: '☁️', label: '흐림' }
  if ([45, 48].includes(code)) return { icon: '🌫️', label: '안개' }
  if ([51, 53, 55, 56, 57].includes(code)) return { icon: '🌦️', label: '이슬비' }
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return { icon: '🌧️', label: '비' }
  }
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { icon: '🌨️', label: '눈' }
  if ([95, 96, 99].includes(code)) return { icon: '⛈️', label: '뇌우' }

  return { icon: '–', label: '정보 없음' }
}

const convertTemperature = (temperature) => {
  if (!hasNumericValue(temperature)) {
    return null
  }

  const numericTemperature = Number(temperature)

  return unit.value === 'fahrenheit' ? (numericTemperature * 9) / 5 + 32 : numericTemperature
}

const formatTemperature = (temperature, includeUnit = false) => {
  const convertedTemperature = convertTemperature(temperature)

  if (convertedTemperature === null) {
    return '–'
  }

  const unitSymbol = unit.value === 'fahrenheit' ? '℉' : '℃'

  return `${Math.round(convertedTemperature)}${includeUnit ? unitSymbol : '°'}`
}

const formatHour = (time, index) => {
  if (index === 0) {
    return '지금'
  }

  const hour = time?.split('T')?.[1]?.slice(0, 2)
  const isNextDay = time?.slice(0, 10) !== props.items[0]?.time?.slice(0, 10)

  if (!hour) {
    return '–'
  }

  if (isNextDay && hour === '00') {
    return '내일 0시'
  }

  return `${Number(hour)}시`
}

const formatPrecipitation = (precipitation) => {
  if (!hasNumericValue(precipitation)) {
    return '–'
  }

  return `${Number(precipitation).toFixed(1)} mm`
}

const formatHumidity = (humidity) => {
  if (!hasNumericValue(humidity)) {
    return '–'
  }

  return `${Math.round(Number(humidity))}%`
}

const selectedWeather = computed(() => {
  return weatherCodeInformation(selectedItem.value?.weatherCode, selectedItem.value?.isDay)
})

const updatedAtText = computed(() => {
  if (!props.updatedAt) {
    return ''
  }

  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(props.updatedAt)
})

const selectHour = (index) => {
  selectedIndex.value = index
}

watch(
  () => props.items,
  () => {
    selectedIndex.value = 0
  },
)
</script>

<template>
  <section class="hourly-forecast" aria-labelledby="hourly-forecast-title">
    <div class="hourly-heading">
      <div>
        <p class="section-eyebrow">Next 24 Hours</p>

        <h2 id="hourly-forecast-title">시간별 날씨 추이</h2>

        <p>같은 시간축에서 기온·습도·강수량의 변화를 확인할 수 있습니다.</p>
      </div>

      <div class="chart-legend" aria-label="그래프 범례">
        <span class="temperature-legend">기온</span>
        <span class="humidity-legend">습도</span>
        <span class="precipitation-legend">강수량</span>
      </div>
    </div>

    <el-skeleton v-if="isLoading && items.length === 0" :rows="6" animated />

    <el-alert
      v-else-if="errorMessage && items.length === 0"
      :title="errorMessage"
      type="warning"
      :closable="false"
      show-icon
    />

    <template v-else-if="items.length">
      <div class="selected-weather-summary" aria-live="polite">
        <div class="selected-time-weather">
          <span class="selected-weather-icon" aria-hidden="true">{{ selectedWeather.icon }}</span>

          <div>
            <strong>{{ formatHour(selectedItem.time, selectedIndex) }}</strong>
            <span>{{ selectedWeather.label }}</span>
          </div>
        </div>

        <dl class="selected-values">
          <div>
            <dt>기온</dt>
            <dd>{{ formatTemperature(selectedItem.temperature, true) }}</dd>
          </div>

          <div>
            <dt>습도</dt>
            <dd>{{ formatHumidity(selectedItem.humidity) }}</dd>
          </div>

          <div>
            <dt>강수량</dt>
            <dd>{{ formatPrecipitation(selectedItem.precipitation) }}</dd>
          </div>
        </dl>
      </div>

      <p class="chart-guide">그래프의 시간 지점을 선택하면 상세값이 변경됩니다.</p>

      <div class="chart-scroll" tabindex="0">
        <svg
          class="weather-chart"
          :viewBox="`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`"
          role="img"
          aria-label="24시간 기온, 습도, 강수량 선 그래프"
        >
          <defs>
            <linearGradient id="temperature-area-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#fb923c" stop-opacity="0.28" />
              <stop offset="100%" stop-color="#fb923c" stop-opacity="0.02" />
            </linearGradient>
          </defs>

          <rect x="0" y="0" :width="CHART_WIDTH" :height="CHART_HEIGHT" rx="16" fill="#f8fafc" />

          <g class="chart-grid-lines" aria-hidden="true">
            <line
              v-for="lineIndex in 4"
              :key="`temperature-grid-${lineIndex}`"
              :x1="CHART_LEFT"
              :x2="CHART_WIDTH - CHART_RIGHT"
              :y1="
                chartBands.temperature.top + ((lineIndex - 1) / 3) * chartBands.temperature.height
              "
              :y2="
                chartBands.temperature.top + ((lineIndex - 1) / 3) * chartBands.temperature.height
              "
            />

            <line
              :x1="CHART_LEFT"
              :x2="CHART_WIDTH - CHART_RIGHT"
              :y1="chartBands.humidity.top + chartBands.humidity.height"
              :y2="chartBands.humidity.top + chartBands.humidity.height"
            />

            <line
              :x1="CHART_LEFT"
              :x2="CHART_WIDTH - CHART_RIGHT"
              :y1="chartBands.precipitation.top + chartBands.precipitation.height"
              :y2="chartBands.precipitation.top + chartBands.precipitation.height"
            />
          </g>

          <g class="axis-labels" aria-hidden="true">
            <text x="14" :y="chartBands.temperature.top + 8">기온</text>
            <text x="14" :y="chartBands.temperature.top + 26" class="axis-unit">
              {{ unit === 'fahrenheit' ? '℉' : '℃' }}
            </text>
            <text x="14" :y="chartBands.humidity.top + 8">습도</text>
            <text x="14" :y="chartBands.humidity.top + 26" class="axis-unit">%</text>
            <text x="14" :y="chartBands.precipitation.top + 8">강수량</text>
            <text x="14" :y="chartBands.precipitation.top + 26" class="axis-unit">mm</text>
          </g>

          <path :d="temperatureAreaPath" fill="url(#temperature-area-gradient)" />
          <path :d="temperatureLinePath" class="temperature-line" />
          <path :d="humidityLinePath" class="humidity-line" />
          <path :d="precipitationLinePath" class="precipitation-line" />

          <g class="sun-event-markers" aria-hidden="true">
            <g
              v-for="event in sunEventPositions"
              :key="`${event.type}-${event.time}`"
              :class="`sun-event-marker sun-event-marker-${event.type}`"
              :transform="`translate(${event.x} 0)`"
            >
              <line y1="34" :y2="chartBands.temperature.top + chartBands.temperature.height" />
              <rect x="-43" y="7" width="86" height="28" rx="10" />
              <text x="0" y="25" text-anchor="middle">{{ event.icon }} {{ event.timeText }}</text>
            </g>
          </g>

          <g aria-hidden="true">
            <circle
              v-for="(point, index) in temperaturePoints"
              :key="`temperature-point-${index}`"
              :cx="point.x"
              :cy="point.y"
              r="3.5"
              class="temperature-point"
            />
          </g>

          <g class="selected-marker" aria-hidden="true">
            <line
              :x1="selectedXPosition"
              :x2="selectedXPosition"
              y1="18"
              :y2="chartBands.precipitation.top + chartBands.precipitation.height"
            />

            <circle
              v-if="selectedTemperaturePoint"
              :cx="selectedTemperaturePoint.x"
              :cy="selectedTemperaturePoint.y"
              r="7"
              class="selected-temperature-point"
            />

            <circle
              v-if="selectedHumidityPoint"
              :cx="selectedHumidityPoint.x"
              :cy="selectedHumidityPoint.y"
              r="5"
              class="selected-humidity-point"
            />

            <circle
              v-if="selectedPrecipitationPoint"
              :cx="selectedPrecipitationPoint.x"
              :cy="selectedPrecipitationPoint.y"
              r="5"
              class="selected-precipitation-point"
            />
          </g>

          <g class="time-labels" aria-hidden="true">
            <template v-for="(item, index) in items" :key="`time-label-${item.time}`">
              <text
                v-if="index % 2 === 0 || index === items.length - 1"
                :x="getXPosition(index)"
                y="414"
                text-anchor="middle"
              >
                {{ formatHour(item.time, index) }}
              </text>
            </template>
          </g>

          <g
            v-for="(item, index) in items"
            :key="`hit-area-${item.time}`"
            class="hour-hit-area"
            role="button"
            :aria-label="`${formatHour(item.time, index)}, 기온 ${formatTemperature(item.temperature, true)}, 습도 ${formatHumidity(item.humidity)}, 강수량 ${formatPrecipitation(item.precipitation)}`"
            tabindex="0"
            @mouseenter="selectHour(index)"
            @focus="selectHour(index)"
            @click="selectHour(index)"
            @keydown.enter.prevent="selectHour(index)"
            @keydown.space.prevent="selectHour(index)"
          >
            <rect
              :x="getXPosition(index) - PLOT_WIDTH / Math.max(items.length - 1, 1) / 2"
              y="12"
              :width="PLOT_WIDTH / Math.max(items.length - 1, 1)"
              height="378"
              fill="transparent"
            />
          </g>
        </svg>
      </div>
    </template>

    <p v-else class="empty-message">표시할 시간별 예보가 없습니다.</p>

    <div class="forecast-meta">
      <span v-if="updatedAtText">{{ updatedAtText }} 업데이트</span>

      <span>
        예보 <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a>
      </span>
    </div>
  </section>
</template>

<style scoped>
.hourly-forecast {
  min-width: 0;
}

.hourly-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 18px;
}

.section-eyebrow,
.hourly-heading h2,
.hourly-heading p,
.forecast-meta,
.empty-message,
.chart-guide {
  margin: 0;
}

.section-eyebrow {
  color: #2563eb;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hourly-heading h2 {
  margin-top: 5px;
  color: #172033;
  font-size: 22px;
  font-weight: 900;
}

.hourly-heading p:not(.section-eyebrow) {
  margin-top: 6px;
  color: #64748b;
  font-size: 13px;
}

.chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  color: #475569;
  font-size: 12px;
  font-weight: 800;
}

.chart-legend span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.chart-legend span::before {
  width: 18px;
  height: 3px;
  border-radius: 999px;
  content: '';
}

.temperature-legend::before {
  background: #f97316;
}

.humidity-legend::before {
  background: #0d9488;
}

.precipitation-legend::before {
  background: #2563eb;
}

.selected-weather-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 10px;
  padding: 14px 16px;
  border: 1px solid #dbeafe;
  border-radius: 14px;
  background: linear-gradient(135deg, #eff6ff, #ffffff);
}

.selected-time-weather {
  display: flex;
  align-items: center;
  gap: 11px;
}

.selected-weather-icon {
  font-size: 34px;
  line-height: 1;
}

.selected-time-weather div {
  display: grid;
  gap: 2px;
}

.selected-time-weather strong {
  color: #172033;
  font-size: 17px;
  font-weight: 900;
}

.selected-time-weather span:not(.selected-weather-icon) {
  color: #64748b;
  font-size: 12px;
}

.selected-values {
  display: grid;
  grid-template-columns: repeat(3, minmax(82px, 1fr));
  gap: 10px;
  margin: 0;
}

.selected-values div {
  padding-left: 16px;
  border-left: 1px solid #dbeafe;
}

.selected-values dt,
.selected-values dd {
  margin: 0;
}

.selected-values dt {
  color: #64748b;
  font-size: 10px;
  font-weight: 800;
}

.selected-values dd {
  margin-top: 3px;
  color: #172033;
  font-size: 16px;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
}

.chart-guide {
  margin-bottom: 8px;
  color: #64748b;
  font-size: 11px;
  text-align: right;
}

.chart-scroll {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  border: 1px solid #dbe3ee;
  border-radius: 16px;
  background: #f8fafc;
  scrollbar-color: #93c5fd #eff6ff;
  scrollbar-width: thin;
}

.chart-scroll:focus-visible {
  outline: 3px solid rgb(37 99 235 / 20%);
  outline-offset: 2px;
}

.weather-chart {
  display: block;
  width: 100%;
  min-width: 900px;
  height: auto;
}

.chart-grid-lines line {
  stroke: #dbe3ee;
  stroke-dasharray: 4 6;
  stroke-width: 1;
}

.axis-labels text {
  fill: #334155;
  font-size: 12px;
  font-weight: 900;
}

.axis-labels .axis-unit {
  fill: #94a3b8;
  font-size: 10px;
  font-weight: 700;
}

.temperature-line,
.humidity-line,
.precipitation-line {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.temperature-line {
  stroke: #f97316;
  stroke-width: 4;
}

.humidity-line {
  stroke: #0d9488;
  stroke-width: 3;
}

.precipitation-line {
  stroke: #2563eb;
  stroke-width: 3;
}

.temperature-point {
  fill: #ffffff;
  stroke: #f97316;
  stroke-width: 2;
}

.sun-event-marker line {
  stroke-width: 1.5;
  stroke-dasharray: 4 5;
}

.sun-event-marker rect {
  fill: #ffffff;
  stroke-width: 1.5;
  filter: drop-shadow(0 3px 5px rgb(15 23 42 / 12%));
}

.sun-event-marker text {
  fill: #334155;
  font-size: 11px;
  font-weight: 900;
}

.sun-event-marker-sunrise line,
.sun-event-marker-sunrise rect {
  stroke: #f59e0b;
}

.sun-event-marker-sunset line,
.sun-event-marker-sunset rect {
  stroke: #6366f1;
}

.selected-marker line {
  stroke: #94a3b8;
  stroke-dasharray: 3 5;
  stroke-width: 1.5;
}

.selected-temperature-point,
.selected-humidity-point,
.selected-precipitation-point {
  fill: #ffffff;
  stroke-width: 4;
}

.selected-temperature-point {
  stroke: #f97316;
}

.selected-humidity-point {
  stroke: #0d9488;
}

.selected-precipitation-point {
  stroke: #2563eb;
}

.time-labels text {
  fill: #64748b;
  font-size: 10px;
  font-weight: 800;
}

.hour-hit-area {
  cursor: pointer;
  outline: none;
}

.hour-hit-area:focus-visible rect {
  fill: rgb(37 99 235 / 8%);
  stroke: #2563eb;
  stroke-width: 1;
}

.forecast-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px 18px;
  margin-top: 12px;
  color: #64748b;
  font-size: 11px;
}

.forecast-meta a {
  color: #2563eb;
  font-weight: 800;
  text-decoration: none;
}

.forecast-meta a:hover {
  text-decoration: underline;
}

.empty-message {
  padding: 32px 0;
  color: #64748b;
  text-align: center;
}

@media (max-width: 700px) {
  .hourly-heading,
  .selected-weather-summary {
    align-items: flex-start;
    flex-direction: column;
  }

  .selected-values {
    width: 100%;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .selected-values div {
    padding: 10px;
    border: 0;
    border-radius: 9px;
    background: #ffffff;
  }

  .selected-values dd {
    font-size: 14px;
  }

  .weather-chart {
    width: 900px;
  }

  .chart-guide {
    text-align: left;
  }
}
</style>
