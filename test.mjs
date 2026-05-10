import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE_URL = `file://${path.join(__dirname, 'index.html')}`;

const results = [];
let passed = 0;
let failed = 0;

function log(icon, label, detail = '') {
  const line = `${icon} ${label}${detail ? '  →  ' + detail : ''}`;
  results.push(line);
  console.log(line);
}

async function assert(label, condition, detail = '') {
  if (condition) {
    passed++;
    log('✅', label, detail);
  } else {
    failed++;
    log('❌', label, detail);
  }
}

async function run() {
  const browser = await chromium.launch({ headless: false, slowMo: 400 });
  const page = await browser.newPage();
  await page.goto(FILE_URL);
  await page.waitForLoadState('domcontentloaded');

  console.log('\n🧪 쇼핑 리스트 자동 테스트 시작\n' + '─'.repeat(50));

  // ── 테스트 1: 초기 상태 ──────────────────────────────
  console.log('\n[ 1. 초기 상태 확인 ]');
  const subtitle = await page.locator('#subtitle').textContent();
  await assert('초기 항목 수 0개', subtitle.includes('0개'), subtitle);

  const emptyMsg = await page.locator('.empty').isVisible();
  await assert('빈 상태 메시지 표시', emptyMsg);

  // ── 테스트 2: 아이템 추가 ────────────────────────────
  console.log('\n[ 2. 아이템 추가 ]');

  // Enter 키로 추가
  await page.fill('#input', '사과');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);

  let items = await page.locator('.item').count();
  await assert('Enter 키로 아이템 추가', items === 1, `${items}개`);

  // 버튼 클릭으로 추가
  await page.fill('#input', '바나나');
  await page.click('button[onclick="addItem()"]');
  await page.waitForTimeout(300);

  await page.fill('#input', '우유');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);

  items = await page.locator('.item').count();
  await assert('3개 아이템 추가됨', items === 3, `${items}개`);

  const sub2 = await page.locator('#subtitle').textContent();
  await assert('subtitle 카운트 갱신', sub2.includes('3개'), sub2);

  // 빈 입력 추가 시도 (추가 안 되어야 함)
  await page.fill('#input', '   ');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  items = await page.locator('.item').count();
  await assert('빈 입력은 추가되지 않음', items === 3, `${items}개`);

  // ── 테스트 3: 체크(완료) 기능 ───────────────────────
  console.log('\n[ 3. 체크(완료) 기능 ]');

  const firstCheck = page.locator('.check-btn').first();
  await firstCheck.click();
  await page.waitForTimeout(300);

  const firstItem = page.locator('.item').first();
  const isDone = await firstItem.evaluate(el => el.classList.contains('done'));
  await assert('첫 번째 아이템 체크 → done 클래스 추가', isDone);

  const isStruck = await firstItem.locator('.item-text').evaluate(
    el => getComputedStyle(el).textDecoration.includes('line-through')
  );
  await assert('완료 아이템 텍스트에 취소선 적용', isStruck);

  const sub3 = await page.locator('#subtitle').textContent();
  await assert('완료 1개 카운트 반영', sub3.includes('완료 1개'), sub3);

  // 다시 클릭해 체크 해제
  await firstCheck.click();
  await page.waitForTimeout(300);
  const isUndone = await firstItem.evaluate(el => !el.classList.contains('done'));
  await assert('재클릭 시 체크 해제', isUndone);

  // ── 테스트 4: 필터 기능 ──────────────────────────────
  console.log('\n[ 4. 필터 기능 ]');

  // 사과(첫 번째) 체크
  await page.locator('.check-btn').first().click();
  await page.waitForTimeout(300);

  // '완료' 필터
  await page.click('button[onclick="setFilter(\'done\', this)"]');
  await page.waitForTimeout(300);
  let visibleItems = await page.locator('.item').count();
  await assert('완료 필터: 1개만 표시', visibleItems === 1, `${visibleItems}개`);

  // '미완료' 필터
  await page.click('button[onclick="setFilter(\'active\', this)"]');
  await page.waitForTimeout(300);
  visibleItems = await page.locator('.item').count();
  await assert('미완료 필터: 2개만 표시', visibleItems === 2, `${visibleItems}개`);

  // '전체' 필터 복귀
  await page.click('button[onclick="setFilter(\'all\', this)"]');
  await page.waitForTimeout(300);
  visibleItems = await page.locator('.item').count();
  await assert('전체 필터: 3개 모두 표시', visibleItems === 3, `${visibleItems}개`);

  // ── 테스트 5: 아이템 삭제 ────────────────────────────
  console.log('\n[ 5. 아이템 삭제 ]');

  // 마지막 아이템(우유) 삭제
  await page.locator('.delete-btn').last().click();
  await page.waitForTimeout(300);
  items = await page.locator('.item').count();
  await assert('개별 삭제 후 2개 남음', items === 2, `${items}개`);

  const sub5 = await page.locator('#subtitle').textContent();
  await assert('삭제 후 카운트 갱신', sub5.includes('총 2개'), sub5);

  // ── 테스트 6: 완료 항목 일괄 삭제 ───────────────────
  console.log('\n[ 6. 완료 항목 일괄 삭제 ]');

  await page.click('button[onclick="clearDone()"]');
  await page.waitForTimeout(300);
  items = await page.locator('.item').count();
  await assert('완료 항목 일괄 삭제 후 1개 남음', items === 1, `${items}개`);

  const remaining = await page.locator('.item-text').first().textContent();
  await assert('남은 항목은 미완료 아이템', !remaining.includes('undefined'), remaining.trim());

  // ── 테스트 7: localStorage 유지 ──────────────────────
  console.log('\n[ 7. localStorage 데이터 유지 ]');

  await page.fill('#input', '새우깡');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);

  await page.reload();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(300);

  items = await page.locator('.item').count();
  await assert('새로고침 후 데이터 유지 (2개)', items === 2, `${items}개`);

  // ── 결과 요약 ────────────────────────────────────────
  console.log('\n' + '─'.repeat(50));
  console.log(`\n📊 테스트 결과: ${passed + failed}개 중 ✅ ${passed}개 통과 / ❌ ${failed}개 실패\n`);

  if (failed === 0) {
    console.log('🎉 모든 테스트 통과!\n');
  } else {
    console.log('⚠️  일부 테스트 실패. 위 로그를 확인하세요.\n');
  }

  await page.waitForTimeout(1500);
  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => {
  console.error('테스트 실행 오류:', err);
  process.exit(1);
});
