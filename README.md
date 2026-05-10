# 🛒 쇼핑 리스트 앱

간단한 쇼핑 리스트 웹 앱입니다. **Supabase** 데이터베이스와 연동되어 데이터가 클라우드에 저장됩니다.

## 기능
- ✅ 아이템 추가 (Enter 키 또는 + 버튼)
- 🗑️ 개별 삭제 / 완료 항목 일괄 삭제
- ☑️ 체크(완료/미완료 토글) — 낙관적 업데이트 적용
- 🔍 전체 / 미완료 / 완료 필터
- ☁️ Supabase 실시간 DB 연동 (shopping_items 테이블)

## 실행 방법
```bash
# index.html 파일을 브라우저에서 바로 열기 (인터넷 연결 필요)
open index.html
```

## 데이터베이스 스키마
```sql
CREATE TABLE shopping_items (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  text       text        NOT NULL,
  done       boolean     NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

## 자동 테스트
```bash
npm install
node test.mjs
```

Playwright를 사용한 E2E 테스트 18개가 포함되어 있습니다.

## 기술 스택
- Vanilla HTML / CSS / JavaScript
- [Supabase](https://supabase.com) (PostgreSQL 클라우드 DB)
- Playwright (테스트)
