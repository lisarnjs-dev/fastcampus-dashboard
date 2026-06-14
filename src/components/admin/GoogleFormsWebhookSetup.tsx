'use client'

import { useState } from 'react'
import { Cohort } from '@/types/database'

interface Props {
  activeCohort: Cohort
}

export function GoogleFormsWebhookSetup({ activeCohort }: Props) {
  const [secret, setSecret] = useState('')
  const [copied, setCopied] = useState(false)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  const webhookUrl = `${siteUrl}/api/webhook/google-forms?cohort_id=${activeCohort.id}`

  const appsScript = `// ───────────────────────────────────────────
// Vibe Class — Google Forms 미션 제출 웹훅 v2
//
// 사용법 (Apps Script 편집기에서):
//  ① 코드 저장 후 함수 선택에서 setupTrigger 선택 → 실행 (최초 1회, 권한 승인)
//  ② 이미 쌓여 있는 응답이 있다면 syncAllResponses 실행 → 일괄 반영
//  ③ 이후 폼 제출 시 자동으로 대시보드에 반영됩니다
// ───────────────────────────────────────────
var WEBHOOK_URL = '${webhookUrl}';
var WEBHOOK_SECRET = '${secret || 'YOUR_WEBHOOK_SECRET'}';

// 질문 제목이 정확히 일치하지 않아도, 아래 키워드가 포함되어 있으면 인식합니다.
var NAME_KEYWORDS = ['성함', '이름'];
var WEEK_KEYWORDS = ['주차'];
var TIME_KEYWORDS = ['타임스탬프', 'timestamp'];

// ① 트리거 설치 — 이 함수를 한 번 실행하세요 (수동 트리거 설정 불필요)
function setupTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'onFormSubmit') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  ScriptApp.newTrigger('onFormSubmit')
    .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
    .onFormSubmit()
    .create();
  Logger.log('✅ 트리거 설치 완료 — 이제 폼 제출 시 자동으로 전송됩니다.');
}

// ② 이미 쌓인 응답 일괄 동기화 — 누락분이 있을 때 실행하세요
function syncAllResponses() {
  var sheet = findResponseSheet_();
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) { Logger.log('응답 데이터가 없습니다.'); return; }

  var headers = data[0];
  var nameIdx = findColumn_(headers, NAME_KEYWORDS);
  var weekIdx = findColumn_(headers, WEEK_KEYWORDS);
  var timeIdx = findColumn_(headers, TIME_KEYWORDS);

  if (nameIdx === -1 || weekIdx === -1) {
    Logger.log('❌ 헤더에서 이름/주차 열을 찾지 못했습니다: ' + headers.join(', '));
    return;
  }

  var ok = 0, fail = 0;
  for (var r = 1; r < data.length; r++) {
    var name = String(data[r][nameIdx] || '').trim();
    var week = String(data[r][weekIdx] || '').trim();
    if (!name || !week) continue;
    var ts = timeIdx !== -1 ? toIso_(data[r][timeIdx]) : new Date().toISOString();
    var code = sendToWebhook_(name, week, ts);
    if (code >= 200 && code < 300) { ok++; } else { fail++; }
  }
  Logger.log('동기화 완료 — 성공 ' + ok + '건 / 실패 ' + fail + '건 (실패 상세는 위 로그 참고)');
}

// ③ 폼 제출 시 자동 실행 (setupTrigger가 설치)
function onFormSubmit(e) {
  try {
    var name = '', week = '', timestamp = new Date().toISOString();

    if (e && e.namedValues) {
      var keys = Object.keys(e.namedValues);
      var nameIdx = findColumn_(keys, NAME_KEYWORDS);
      var weekIdx = findColumn_(keys, WEEK_KEYWORDS);
      var timeIdx = findColumn_(keys, TIME_KEYWORDS);
      if (nameIdx === -1 || weekIdx === -1) {
        Logger.log('❌ 질문 제목에서 이름/주차를 찾지 못했습니다: ' + keys.join(', '));
        return;
      }
      name = String((e.namedValues[keys[nameIdx]] || [''])[0]).trim();
      week = String((e.namedValues[keys[weekIdx]] || [''])[0]).trim();
      if (timeIdx !== -1 && (e.namedValues[keys[timeIdx]] || [''])[0]) {
        timestamp = toIso_((e.namedValues[keys[timeIdx]])[0]);
      }
    } else if (e && e.response) {
      var items = e.response.getItemResponses();
      for (var i = 0; i < items.length; i++) {
        var title = items[i].getItem().getTitle();
        if (matches_(title, NAME_KEYWORDS)) name = String(items[i].getResponse()).trim();
        if (matches_(title, WEEK_KEYWORDS)) week = String(items[i].getResponse()).trim();
      }
    }

    if (!name || !week) {
      Logger.log('❌ 이름/주차 질문을 찾지 못했습니다. 질문 제목에 "성함(또는 이름)"과 "주차"가 포함되어야 합니다.');
      return;
    }
    sendToWebhook_(name, week, timestamp);
  } catch (err) {
    Logger.log('Webhook error: ' + err.toString());
  }
}

// ─── 내부 헬퍼 ───
function sendToWebhook_(name, week, timestamp) {
  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ name: name, week: week, timestamp: timestamp }),
    headers: { 'Authorization': 'Bearer ' + WEBHOOK_SECRET },
    muteHttpExceptions: true
  };
  var response = UrlFetchApp.fetch(WEBHOOK_URL, options);
  Logger.log('[' + name + ' / ' + week + '] → ' + response.getResponseCode() + ' ' + response.getContentText());
  return response.getResponseCode();
}

function findResponseSheet_() {
  var sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  for (var i = 0; i < sheets.length; i++) {
    var n = sheets[i].getName();
    if (n.indexOf('설문지 응답') !== -1 || n.indexOf('Form Responses') !== -1) return sheets[i];
  }
  return sheets[0];
}

function findColumn_(headers, keywords) {
  for (var i = 0; i < headers.length; i++) {
    if (matches_(headers[i], keywords)) return i;
  }
  return -1;
}

function matches_(text, keywords) {
  var t = String(text).toLowerCase();
  for (var i = 0; i < keywords.length; i++) {
    if (t.indexOf(keywords[i].toLowerCase()) !== -1) return true;
  }
  return false;
}

function toIso_(value) {
  if (value instanceof Date) return value.toISOString();
  var d = new Date(value);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}`

  async function handleCopy() {
    await navigator.clipboard.writeText(appsScript)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const inputClass = [
    'w-full px-3.5 py-2.5 border border-bdr rounded-lg text-sm text-txt-primary',
    'placeholder:text-txt-placeholder bg-surface font-mono',
    'focus:outline-none focus:border-bdr-focus focus:ring-2 focus:ring-brand-subtle transition-all',
  ].join(' ')

  return (
    <div className="bg-surface border border-bdr rounded-2xl p-6 space-y-6">
      <div>
        <h2 className="text-base font-semibold text-txt-primary">Google Forms 자동 연동</h2>
        <p className="text-sm text-txt-muted mt-1">
          폼에 응답이 들어오면 즉시 미션 제출 현황에 반영됩니다.
        </p>
      </div>

      {/* 설정 순서 */}
      <ol className="space-y-4 text-sm text-txt-secondary">
        <li className="flex gap-3">
          <span className="shrink-0 w-5 h-5 rounded-full bg-brand-muted text-brand text-xs font-semibold flex items-center justify-center mt-0.5">1</span>
          <span>Google Forms 응답이 기록되는 <strong>Google 스프레드시트</strong>를 엽니다.</span>
        </li>
        <li className="flex gap-3">
          <span className="shrink-0 w-5 h-5 rounded-full bg-brand-muted text-brand text-xs font-semibold flex items-center justify-center mt-0.5">2</span>
          <span>상단 메뉴 <strong>확장 프로그램 → Apps Script</strong>를 클릭합니다.</span>
        </li>
        <li className="flex gap-3">
          <span className="shrink-0 w-5 h-5 rounded-full bg-brand-muted text-brand text-xs font-semibold flex items-center justify-center mt-0.5">3</span>
          <span>
            아래 시크릿 입력칸에 <code className="px-1 py-0.5 bg-page rounded text-xs font-mono">.env.local</code>의{' '}
            <code className="px-1 py-0.5 bg-page rounded text-xs font-mono">WEBHOOK_SECRET</code> 값을 붙여넣으면 코드에 자동으로 반영됩니다.
          </span>
        </li>
        <li className="flex gap-3">
          <span className="shrink-0 w-5 h-5 rounded-full bg-brand-muted text-brand text-xs font-semibold flex items-center justify-center mt-0.5">4</span>
          <span>아래 코드를 복사해 Apps Script 편집기에 붙여넣고 저장합니다.</span>
        </li>
        <li className="flex gap-3">
          <span className="shrink-0 w-5 h-5 rounded-full bg-brand-muted text-brand text-xs font-semibold flex items-center justify-center mt-0.5">5</span>
          <span>
            <strong>트리거 설치</strong>: 편집기 상단 함수 선택에서{' '}
            <code className="px-1 py-0.5 bg-page rounded text-xs font-mono">setupTrigger</code>를 선택하고{' '}
            <strong>실행</strong>을 클릭합니다. (최초 실행 시 권한 승인 필요 — 수동 트리거 설정은 하지 않아도 됩니다)
          </span>
        </li>
        <li className="flex gap-3">
          <span className="shrink-0 w-5 h-5 rounded-full bg-brand-muted text-brand text-xs font-semibold flex items-center justify-center mt-0.5">6</span>
          <span>
            <strong>누락분 반영</strong>: 시트에 이미 쌓인 응답이 있다면{' '}
            <code className="px-1 py-0.5 bg-page rounded text-xs font-mono">syncAllResponses</code>를 한 번 실행해
            기존 응답을 모두 대시보드에 반영합니다.
          </span>
        </li>
      </ol>

      {/* 시크릿 입력 */}
      <div>
        <label className="block text-sm font-medium text-txt-secondary mb-1.5">
          WEBHOOK_SECRET 입력 (코드에 자동 반영)
        </label>
        <input
          type="text"
          value={secret}
          onChange={e => setSecret(e.target.value)}
          placeholder="2267fae73c4794da..."
          className={inputClass}
          data-testid="webhook-secret-input"
        />
      </div>

      {/* 코드 박스 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-txt-secondary">Apps Script 코드</label>
          <button
            onClick={handleCopy}
            data-testid="copy-script-btn"
            className="text-xs px-3 py-1.5 rounded-lg border border-bdr hover:border-brand hover:text-brand transition-all text-txt-muted"
          >
            {copied ? '✓ 복사됨' : '복사'}
          </button>
        </div>
        <pre className="w-full p-4 bg-page border border-bdr rounded-xl text-xs font-mono text-txt-secondary overflow-x-auto leading-relaxed whitespace-pre">
          {appsScript}
        </pre>
      </div>

      {/* 주의사항 */}
      <div className="px-4 py-3 bg-warning-subtle border border-warning-fg/20 rounded-xl text-xs text-warning-fg space-y-1">
        <p className="font-medium">주의사항 · 문제 해결</p>
        <p>• 질문 제목에 <strong>성함(또는 이름)</strong>, <strong>주차</strong> 키워드만 포함되어 있으면 자동 인식됩니다. (정확히 일치하지 않아도 됨)</p>
        <p>• 주차 값은 <strong>1주차 미션</strong>처럼 숫자가 포함된 형식이면 자동 파싱됩니다.</p>
        <p>• 배포 후에는 <code className="font-mono">NEXT_PUBLIC_SITE_URL</code>을 실제 도메인으로 변경하고 코드를 다시 복사하세요. (localhost 주소는 Google 서버에서 접근 불가)</p>
        <p>• 제출이 반영되지 않으면 Apps Script 왼쪽 <strong>실행</strong>(시계 아이콘 아래) 메뉴에서 onFormSubmit 실행 기록과 로그를 확인하세요. 학생 이름이 대시보드 수강생 명단과 다르면 404로 기록됩니다.</p>
        <p>• 웹훅 시크릿이나 URL을 변경했다면 코드를 다시 붙여넣은 뒤 <code className="font-mono">setupTrigger</code>를 다시 실행하세요.</p>
      </div>
    </div>
  )
}
