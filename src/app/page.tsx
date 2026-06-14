'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Cohort } from '@/types/database'
import { MagneticText } from '@/components/ui/MagneticText'

type Step = 'cohort' | 'group' | 'login'

export default function HomePage() {
  const router = useRouter()

  const [step, setStep] = useState<Step>('cohort')
  const [cohorts, setCohorts] = useState<Cohort[]>([])
  const [groups, setGroups] = useState<string[]>([])
  const [selectedCohort, setSelectedCohort] = useState<Cohort | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [loginError, setLoginError] = useState('')
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [authCode, setAuthCode] = useState('')

  useEffect(() => {
    fetch('/api/cohorts').then(r => r.json()).then(setCohorts)
  }, [])

  async function selectCohort(cohort: Cohort) {
    setSelectedCohort(cohort)
    setLoading(true)
    const res = await fetch(`/api/cohorts/${cohort.id}/groups`)
    const data = await res.json()
    setGroups(data)
    setLoading(false)
    setStep('group')
  }

  function selectGroup(group: string) {
    setSelectedGroup(group)
    setStep('login')
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoginError('')
    setLoading(true)
    const res = await fetch('/api/auth/student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, authCode, cohortId: selectedCohort?.id, group: selectedGroup }),
    })
    setLoading(false)
    if (res.ok) {
      const { group } = await res.json()
      router.push(`/dashboard/${group}`)
    } else {
      setLoginError('이름 또는 인증코드가 올바르지 않습니다.')
    }
  }

  const stepNumber = step === 'cohort' ? 1 : step === 'group' ? 2 : 3

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      {/* Brand */}
      <div className="mb-8 text-center">
        <MagneticText
          text={<>Welcome to <span className="text-violet-600">LISA</span>&apos;s vibe study</>}
          hoverText="Welcome to LISA's vibe study"
          className="text-gray-900"
        />
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          {step !== 'cohort' && (
            <button
              onClick={() => setStep(step === 'login' ? 'group' : 'cohort')}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-3 -ml-0.5"
            >
              <span>←</span>
              <span>뒤로</span>
            </button>
          )}

          {/* Step breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <span className={step === 'cohort' ? 'text-violet-600 font-medium' : 'text-gray-300'}>기수</span>
            <span>›</span>
            <span className={step === 'group' ? 'text-violet-600 font-medium' : step === 'login' ? 'text-gray-300' : 'text-gray-300'}>그룹</span>
            <span>›</span>
            <span className={step === 'login' ? 'text-violet-600 font-medium' : 'text-gray-300'}>로그인</span>
          </div>

          <h2 className="text-base font-semibold text-gray-900">
            {step === 'cohort' && '기수를 선택하세요'}
            {step === 'group' && `${selectedCohort?.name}`}
            {step === 'login' && `그룹 ${selectedGroup} 로그인`}
          </h2>
          {step === 'group' && (
            <p className="text-sm text-gray-500 mt-0.5">본인의 그룹을 선택하세요</p>
          )}
        </div>

        {/* Card Body */}
        <div className="p-6">
          {/* STEP 1: Cohort selection */}
          {step === 'cohort' && (
            <div className="flex flex-col gap-3">
              {cohorts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400">현재 진행 중인 기수가 없습니다.</p>
                </div>
              ) : (
                cohorts.map(cohort => (
                  <button
                    key={cohort.id}
                    onClick={() => selectCohort(cohort)}
                    disabled={loading}
                    data-testid={`cohort-btn-${cohort.id}`}
                    className="w-full flex items-center justify-between px-4 py-4 bg-white border border-gray-200 rounded-xl hover:border-violet-400 hover:bg-violet-50 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="font-medium text-gray-800 group-hover:text-violet-700">{cohort.name}</span>
                    <span className="text-gray-300 group-hover:text-violet-400 transition-colors">→</span>
                  </button>
                ))
              )}
            </div>
          )}

          {/* STEP 2: Group selection */}
          {step === 'group' && (
            <div>
              {groups.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400">등록된 수강생이 없습니다.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {groups.map(group => (
                    <button
                      key={group}
                      onClick={() => selectGroup(group)}
                      data-testid={`group-btn-${group}`}
                      className="flex flex-col items-center justify-center py-8 bg-white border-2 border-gray-200 rounded-xl hover:border-violet-400 hover:bg-violet-50 transition-all group"
                    >
                      <span className="text-2xl font-bold text-gray-800 group-hover:text-violet-700">{group}</span>
                      <span className="text-xs text-gray-400 mt-1 group-hover:text-violet-500">그룹</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Login */}
          {step === 'login' && (
            <form onSubmit={handleLogin} className="flex flex-col gap-4" data-testid="student-login-form">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className="text-sm font-medium text-gray-700">이름</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
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
                  value={authCode}
                  onChange={e => setAuthCode(e.target.value.toUpperCase())}
                  placeholder="AB3X7K9M"
                  required
                  data-testid="student-auth-code"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 font-mono tracking-widest bg-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                />
              </div>
              {loginError && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2" data-testid="student-login-error">
                  {loginError}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                data-testid="student-login-submit"
                className="w-full py-3 bg-violet-600 text-white text-sm font-medium rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
              >
                {loading ? '로그인 중...' : '로그인'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1.5 mt-6">
        {[1, 2, 3].map(n => (
          <div
            key={n}
            className={`h-1.5 rounded-full transition-all ${
              n === stepNumber ? 'w-6 bg-violet-500' : n < stepNumber ? 'w-1.5 bg-violet-300' : 'w-1.5 bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
