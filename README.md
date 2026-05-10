# 🛒 쇼핑 리스트 앱

간단한 쇼핑 리스트 웹 앱입니다. 별도 서버 없이 브라우저에서 바로 실행됩니다.

## 기능
- ✅ 아이템 추가 (Enter 키 또는 + 버튼)
- 🗑️ 개별 삭제 / 완료 항목 일괄 삭제
- ☑️ 체크(완료/미완료 토글)
- 🔍 전체 / 미완료 / 완료 필터
- 💾 localStorage 자동 저장 (새로고침 후에도 유지)

## 실행 방법
```bash
# index.html 파일을 브라우저에서 바로 열기
open index.html
```

## 자동 테스트
```bash
npm install
node test.mjs
```

Playwright를 사용한 E2E 테스트 18개가 포함되어 있습니다.

## 기술 스택
- Vanilla HTML / CSS / JavaScript
- localStorage (데이터 영속성)
- Playwright (테스트)
