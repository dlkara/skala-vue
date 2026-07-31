# SKALA Vue.js 실습

SKALA Full-Stack Engineering 과정에서 진행한 Vue.js 실습 프로젝트입니다.

Vue 3와 Vite를 기반으로 프로젝트를 구성했으며, Vue Router, Pinia, Linter, Prettier를 사용합니다.

---

## 개발 환경

| 항목 | 버전 및 설정 |
| --- | --- |
| OS | macOS |
| Homebrew | 6.0.10 |
| Node.js | v26.5.0 |
| npm | 11.17.0 |
| Vue 프로젝트 생성 도구 | create-vue 3.23.0 |
| Vite | 8.2.0 |
| 언어 | JavaScript |
| 패키지 관리자 | npm |

---

## 프로젝트 주요 기술

- Vue.js 3
- Vite
- Vue Router
- Pinia
- ESLint
- Oxlint
- Prettier

### 주요 도구의 역할

| 도구 | 역할 |
| --- | --- |
| Vue.js | 사용자 인터페이스를 구성하는 프론트엔드 프레임워크 |
| Vite | 개발 서버 실행 및 프로덕션 빌드 |
| Vue Router | SPA의 URL과 페이지 컴포넌트 관리 |
| Pinia | 여러 컴포넌트가 공유하는 전역 상태 관리 |
| ESLint | JavaScript와 Vue 코드의 오류 및 규칙 검사 |
| Oxlint | 빠른 정적 코드 검사 |
| Prettier | 들여쓰기, 줄바꿈 등 코드 형식 정리 |

---

## 1. Node.js 설치

Homebrew 설치 여부를 확인합니다.

```bash
brew -v
```

Node.js를 설치하거나 기존 버전을 업그레이드합니다.

```bash
brew install node
```

설치 완료 후 Node.js와 npm 버전을 확인합니다.

```bash
node -v
npm -v
```

실습 환경에서 확인한 버전은 다음과 같습니다.

```text
Node.js: v26.5.0
npm: 11.17.0
```

---

## 2. Vue 프로젝트 생성

프로젝트를 생성할 작업 디렉터리로 이동합니다.

```bash
cd /Users/hjlee/skala-workspace
```

Vue 공식 프로젝트 생성 도구를 실행합니다.

```bash
npm create vue@latest
```

처음 실행하면 `create-vue` 설치 여부를 묻습니다.

```text
Need to install the following packages:
create-vue@3.23.0

Ok to proceed? (y)
```

`y`를 입력하여 진행합니다.

### 프로젝트 생성 옵션

```text
Project name: skala-vue

Use TypeScript?
No

Select features:
- Router
- Pinia
- Linter
- Prettier

Select experimental features:
- none

Skip all example code and start with a blank Vue project?
No
```

### 선택한 기능

- Vue Router
- Pinia
- Linter
- Prettier
- Vue 기본 예제 코드

### 선택하지 않은 기능

- TypeScript
- 실험 기능
- Vue 3.6 Release Candidate
- Oxfmt
- 빈 프로젝트 시작

프로젝트 생성 후 다음 경로에 프로젝트가 만들어집니다.

```text
/Users/hjlee/skala-workspace/skala-vue
```

---

## 3. 프로젝트 설치

프로젝트 폴더로 이동합니다.

```bash
cd skala-vue
```

의존 패키지를 설치합니다.

```bash
npm install
```

---

## 4. Oxlint 의존성 충돌 해결

최초 `npm install` 실행 시 다음 의존성 충돌이 발생했습니다.

```text
npm error code ERESOLVE
npm error ERESOLVE unable to resolve dependency tree
```

### 오류 원인

프로젝트에 설정된 패키지 버전은 다음과 같았습니다.

```text
oxlint: ~1.74.0
eslint-plugin-oxlint: ~1.73.0
```

`eslint-plugin-oxlint@1.73.0`은 다음 버전의 `oxlint`를 요구합니다.

```text
oxlint: ~1.73.0
```

그러나 프로젝트에는 `oxlint@1.74.0`이 설정되어 있어 의존성 충돌이 발생했습니다.

### 해결 방법

두 패키지의 버전을 `1.73.0`으로 통일했습니다.

```bash
npm install -D oxlint@1.73.0 eslint-plugin-oxlint@1.73.0
```

`-D` 옵션은 해당 패키지를 `devDependencies`에 설치한다는 뜻입니다.

이 명령은 단순히 같은 패키지를 다시 설치한 것이 아니라, 충돌하던 패키지의 버전을 호환 가능한 버전으로 맞춘 것입니다.

이후 다시 전체 패키지를 설치합니다.

```bash
npm install
```

설치 결과:

```text
added 255 packages
found 0 vulnerabilities
```

---

## 5. fsevents 경고

패키지 설치 후 다음 경고가 출력될 수 있습니다.

```text
npm warn allow-scripts
fsevents@2.3.3
```

`fsevents`는 macOS에서 파일 시스템 변경을 감지하는 데 사용되는 패키지입니다.

이 메시지는 설치 실패가 아니라 설치 스크립트 승인과 관련된 경고입니다. 개발 서버가 정상적으로 실행된다면 별도로 처리하지 않아도 됩니다.

필요한 경우 승인 대기 중인 패키지를 확인할 수 있습니다.

```bash
npm approve-scripts --allow-scripts-pending
```

특정 패키지만 승인하려면 다음 명령을 사용합니다.

```bash
npm approve-scripts fsevents
```

---

## 6. 프로젝트 실행

개발 서버를 실행합니다.

```bash
npm run dev
```

정상 실행 예시:

```text
VITE v8.2.0 ready

Local: http://localhost:5173/
```

브라우저에서 다음 주소로 접속합니다.

```text
http://localhost:5173/
```

개발 서버를 종료하려면 실행 중인 터미널에서 다음 키를 누릅니다.

```text
Ctrl + C
```

---

## 7. Vue DevTools

개발 서버 실행 후 Vue DevTools를 별도 창에서 열 수 있습니다.

```text
http://localhost:5173/__devtools__/
```

애플리케이션 화면에서 다음 단축키를 사용할 수도 있습니다.

```text
Option + Shift + D
```

---

## 8. 주요 명령어

### 패키지 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

### 코드 포맷 적용

```bash
npm run format
```

### 코드 검사

```bash
npm run lint
```

### 프로덕션 빌드

```bash
npm run build
```

### 빌드 결과 미리보기

```bash
npm run preview
```

---

## 9. 프로젝트 구조

```text
skala-vue/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── router/
│   ├── stores/
│   ├── views/
│   ├── App.vue
│   └── main.js
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

### 주요 디렉터리 및 파일

| 경로 | 역할 |
| --- | --- |
| `src/components/` | 재사용 가능한 Vue 컴포넌트 |
| `src/views/` | Router와 연결되는 페이지 컴포넌트 |
| `src/router/` | Vue Router 설정 |
| `src/stores/` | Pinia Store 정의 |
| `src/assets/` | CSS, 이미지 등 정적 리소스 |
| `src/App.vue` | 애플리케이션 최상위 컴포넌트 |
| `src/main.js` | Vue 애플리케이션 진입점 |
| `vite.config.js` | Vite 설정 |
| `package.json` | 프로젝트 정보, 스크립트 및 의존성 |

---

## 10. Git 저장소 설정

로컬 Git 저장소를 초기화합니다.

```bash
git init
git branch -M main
```

변경 파일을 확인합니다.

```bash
git status
```

전체 파일을 스테이징하고 최초 커밋을 생성합니다.

```bash
git add .
git commit -m "initial vue project setup"
```

GitHub 원격 저장소를 연결합니다.

```bash
git remote add origin https://github.com/사용자명/skala-vue.git
```

GitHub에 코드를 업로드합니다.

```bash
git push -u origin main
```

원격 저장소 연결 상태를 확인합니다.

```bash
git remote -v
```

---

## 11. Git 사용 시 주의사항

`node_modules`는 GitHub에 업로드하지 않습니다.

패키지 파일은 용량이 크고, `package.json`과 `package-lock.json`을 이용해 다시 설치할 수 있기 때문입니다.

다른 환경에서 프로젝트를 내려받은 뒤에는 다음 명령을 실행합니다.

```bash
npm install
npm run dev
```

`.gitignore`에 다음 항목이 포함되어 있는지 확인합니다.

```gitignore
node_modules
dist
.DS_Store
*.local
```

---

## 12. 프로젝트 실행 순서

저장소를 처음 내려받은 경우 다음 순서로 실행합니다.

```bash
git clone https://github.com/사용자명/skala-vue.git
cd skala-vue
npm install
npm run dev
```

브라우저 접속 주소:

```text
http://localhost:5173/
```

---

## 진행 상태

- [x] Homebrew 설치 확인
- [x] Node.js 설치 및 업그레이드
- [x] Node.js 및 npm 버전 확인
- [x] Vue 프로젝트 생성
- [x] JavaScript 선택
- [x] Vue Router 적용
- [x] Pinia 적용
- [x] Linter 적용
- [x] Prettier 적용
- [x] Oxlint 의존성 충돌 해결
- [x] npm 패키지 설치
- [x] 보안 취약점 0개 확인
- [x] Vite 개발 서버 실행
- [x] Vue DevTools 확인
- [x] GitHub 저장소 업로드