'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function StudentLoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const res = await fetch('/api/auth/student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.get('name'), authCode: form.get('authCode') }),
    })
    if (res.ok) {
      const { group } = await res.json()
      router.push(`/dashboard/${group}`)
    } else {
      setLoading(false)
      setError('이름 또는 인증코드가 올바르지 않습니다.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-violet-600 mb-3">
          <span className="text-white font-bold text-lg">V</span>
        </div>
        <h1 className="text-lg font-semibold text-gray-900">Vibe Class</h1>
      </div>

      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-3"
          >
            ← 뒤로
          </button>
          <h2 className="text-base font-semibold text-gray-900">로그인</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" data-testid="student-login-form">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">이름</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="홍길동"
                required
                data-testid="student-name"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="authCode" className="text-sm font-medium text-gray-700">인증코드</label>
              <input
                id="authCode"
                name="authCode"
                type="text"
                placeholder="AB3X7K9M"
                required
                data-testid="student-auth-code"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 font-mono tracking-widest bg-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
              />
            </div>
            {error && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2" data-testid="student-login-error">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              data-testid="student-login-submit"
              className="w-full py-3 bg-violet-600 text-white text-sm font-medium rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-50 mt-1 flex items-center justify-center gap-2"
            >
              {loading && (
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
