export const WEATHER_REGION_LABELS = Object.freeze({
  all: '전체 지역',
  capital: '수도권',
  gangwon: '강원권',
  chungcheong: '충청권',
  jeolla: '전라권',
  gyeongsang: '경상권',
  jeju: '제주권',
  domesticOther: '국내 기타',
  overseas: '국외',
})

const KOREAN_REGION_RULES = [
  {
    code: 'jeju',
    stateKeywords: ['제주', 'jeju'],
    cityKeywords: ['제주', 'jeju'],
  },
  {
    code: 'capital',
    stateKeywords: ['서울', '인천', '경기', 'seoul', 'incheon', 'gyeonggi'],
    cityKeywords: [
      '서울',
      '인천',
      '수원',
      '고양',
      '용인',
      '성남',
      '부천',
      '화성',
      '안산',
      '남양주',
      '안양',
      '평택',
      '시흥',
      '파주',
      '의정부',
      '김포',
      'seoul',
      'incheon',
      'suwon',
      'goyang',
      'yongin',
      'seongnam',
    ],
  },
  {
    code: 'gangwon',
    stateKeywords: ['강원', 'gangwon'],
    cityKeywords: [
      '춘천',
      '원주',
      '강릉',
      '동해',
      '태백',
      '속초',
      '삼척',
      'chuncheon',
      'wonju',
      'gangneung',
      'sokcho',
    ],
  },
  {
    code: 'chungcheong',
    stateKeywords: ['대전', '세종', '충청', '충북', '충남', 'daejeon', 'sejong', 'chungcheong'],
    cityKeywords: [
      '대전',
      '세종',
      '청주',
      '충주',
      '제천',
      '천안',
      '공주',
      '보령',
      '아산',
      '서산',
      '논산',
      '당진',
      'daejeon',
      'sejong',
      'cheongju',
      'chungju',
      'cheonan',
    ],
  },
  {
    code: 'jeolla',
    stateKeywords: ['광주', '전라', '전북', '전남', 'gwangju', 'jeolla', 'jeonbuk', 'jeonnam'],
    cityKeywords: [
      '광주',
      '전주',
      '군산',
      '익산',
      '정읍',
      '남원',
      '김제',
      '목포',
      '여수',
      '순천',
      '나주',
      '광양',
      'gwangju',
      'jeonju',
      'gunsan',
      'mokpo',
      'yeosu',
      'suncheon',
    ],
  },
  {
    code: 'gyeongsang',
    stateKeywords: [
      '부산',
      '대구',
      '울산',
      '경상',
      '경북',
      '경남',
      'busan',
      'daegu',
      'ulsan',
      'gyeongsang',
    ],
    cityKeywords: [
      '부산',
      '대구',
      '울산',
      '포항',
      '경주',
      '김천',
      '안동',
      '구미',
      '영주',
      '영천',
      '상주',
      '문경',
      '경산',
      '창원',
      '진주',
      '통영',
      '사천',
      '김해',
      '밀양',
      '거제',
      '양산',
      'busan',
      'daegu',
      'ulsan',
      'pohang',
      'gyeongju',
      'andong',
      'gumi',
      'changwon',
      'jinju',
      'gimhae',
    ],
  },
]

const includesKeyword = (text, keywords) => {
  return keywords.some((keyword) => text.includes(keyword))
}

/**
 * 국가 코드와 OpenWeather 행정구역 정보를 기준으로 대시보드 권역을 반환합니다.
 */
export const getWeatherRegion = ({ countryCode, state, name, apiName } = {}) => {
  const normalizedCountryCode = countryCode?.trim().toUpperCase()

  if (normalizedCountryCode !== 'KR') {
    return {
      code: 'overseas',
      label: WEATHER_REGION_LABELS.overseas,
    }
  }

  const normalizedState = state?.trim().toLowerCase() || ''
  const normalizedCity = `${name || ''} ${apiName || ''}`.trim().toLowerCase()

  const stateRegion = KOREAN_REGION_RULES.find((region) => {
    return includesKeyword(normalizedState, region.stateKeywords)
  })

  const cityRegion = KOREAN_REGION_RULES.find((region) => {
    return includesKeyword(normalizedCity, region.cityKeywords)
  })

  const regionCode = stateRegion?.code || cityRegion?.code || 'domesticOther'

  return {
    code: regionCode,
    label: WEATHER_REGION_LABELS[regionCode],
  }
}
