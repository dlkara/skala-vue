/**
 * 전국 날씨 지도에 표시할 대표 관측 지역입니다.
 * 좌표는 각 지역의 중심부를 기준으로 하며 OpenWeather 현재 날씨 조회에 사용합니다.
 */
export const KOREA_WEATHER_LOCATIONS = [
  { id: 'seoul', name: '서울', state: '서울특별시', lat: 37.5665, lon: 126.978 },
  { id: 'chuncheon', name: '춘천', state: '강원특별자치도', lat: 37.8813, lon: 127.7298 },
  { id: 'gangneung', name: '강릉', state: '강원특별자치도', lat: 37.7519, lon: 128.8761 },
  { id: 'daejeon', name: '대전', state: '대전광역시', lat: 36.3504, lon: 127.3845 },
  { id: 'andong', name: '안동', state: '경상북도', lat: 36.5684, lon: 128.7294 },
  { id: 'jeonju', name: '전주', state: '전북특별자치도', lat: 35.8242, lon: 127.148 },
  { id: 'gwangju', name: '광주', state: '광주광역시', lat: 35.1595, lon: 126.8526 },
  { id: 'daegu', name: '대구', state: '대구광역시', lat: 35.8714, lon: 128.6014 },
  { id: 'ulsan', name: '울산', state: '울산광역시', lat: 35.5384, lon: 129.3114 },
  { id: 'busan', name: '부산', state: '부산광역시', lat: 35.1796, lon: 129.0756 },
  { id: 'yeosu', name: '여수', state: '전라남도', lat: 34.7604, lon: 127.6622 },
  { id: 'jeju', name: '제주', state: '제주특별자치도', lat: 33.4996, lon: 126.5312 },
  { id: 'ulleung', name: '울릉도', state: '경상북도', lat: 37.4845, lon: 130.9057 },
  { id: 'dokdo', name: '독도', state: '경상북도', lat: 37.2411, lon: 131.8653 },
]
