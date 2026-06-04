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
// Vibe Class — Google Forms 미션 제출 웹훅
// 스프레드시트 / 폼 편집기 양쪽에서 동작
// ───────────────────────────────────────────
const WEBHOOK_URL = '${webhookUrl}';
const WEBHOOK_SECRET = '${secret || 'YOUR_WEBHOOK_SECRET'}';

function onFormSubmit(e) {
  try {
    var name = '';
    var week = '';
    var timestamp = new Date().toISOString();

    if (e.namedValues) {
      // 스프레드시트에 Apps Script를 추가한 경우
      name      = (e.namedValues['수강생 성함']    || [''])[0].trim();
      week      = (e.namedValues['제출 주차 선택'] || [''])[0].trim();
      timestamp = (e.namedValues['타임스탬프']     || [''])[0] || timestamp;
    } else if (e.response) {
      // 폼 편집기에 Apps Script를 추가한 경우
      var items = e.response.getItemResponses();
      for (var i = 0; i < items.length; i++) {
        var title  = items[i].getItem().getTitle();
        var answer = items[i].getResponse();
        if (title === '수강생 성함')    name = answer;
        if (title === '제출 주차 선택') week = answer;
      }
    }

    if (!name || !week) {
      Logger.log('이름 또는 주차 정보 없음 — 스킵');
      return;
    }

    var payload = JSON.stringify({ name: name, week: week, timestamp: timestamp });
    var options = {
      method: 'post',
      contentType: 'application/json',
      payload: payload,
      headers: { 'Authorization': 'Bearer ' + WEBHOOK_SECRET },
      muteHttpExceptions: true
    };

    var response = UrlFetchApp.fetch(WEBHOOK_URL, options);
    Logger.log('Status: ' + response.getResponseCode());
    Logger.log('Body: '   + response.getContentText());
  } catch (err) {
    Logger.log('Webhook error: ' + err.toString());
  }
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
            <strong>트리거 추가</strong>: 왼쪽 시계 아이콘 → <strong>트리거 추가</strong> →{' '}
            함수: <code className="px-1 py-0.5 bg-page rounded text-xs font-mono">onFormSubmit</code>,
            이벤트: <strong>양식 제출 시</strong> 선택 후 저장.
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
        <p className="font-medium">주의사항</p>
        <p>• 폼의 질문 제목이 정확히 <strong>수강생 성함</strong>, <strong>제출 주차 선택</strong>, <strong>타임스탬프</strong>와 일치해야 합니다.</p>
        <p>• 주차 값은 <strong>1주차 미션</strong>처럼 숫자가 포함된 형식이면 자동 파싱됩니다.</p>
        <p>• 배포 후에는 <code className="font-mono">NEXT_PUBLIC_SITE_URL</code>을 실제 도메인으로 변경하고 코드를 다시 복사하세요.</p>
      </div>
    </div>
  )
}
