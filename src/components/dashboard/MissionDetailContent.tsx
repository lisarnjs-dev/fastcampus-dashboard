import type { Mission } from '@/types/database'
import { CohortStartGate } from '@/components/ui/CohortStartGate'

interface StudentStatus {
  id: string
  name: string
  submitted: boolean
}

interface Props {
  mission: Mission
  group: string
  students: StudentStatus[]
  cohortStarted: boolean
  cohortStartedAt: string | null
}

export function MissionDetailContent({ mission, group, students, cohortStarted, cohortStartedAt }: Props) {
  const isPast = mission.due_at ? new Date(mission.due_at) < new Date() : false
  const submitted = students.filter(s => s.submitted)
  const notSubmitted = students.filter(s => !s.submitted)
  const pct = students.length > 0 ? Math.round((submitted.length / students.length) * 100) : 0

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-5 pr-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-brand-muted text-brand text-xs font-semibold px-2.5 py-1 rounded-lg">
            {mission.week}주차
          </span>
          {isPast && (
            <span className="bg-error-subtle text-error text-xs font-medium px-2 py-0.5 rounded-md">
              마감됨
            </span>
          )}
        </div>
        <h2 className="text-lg font-bold text-txt-primary leading-snug">{mission.title}</h2>
      </div>

      {/* Description */}
      {mission.description && (
        <p className="text-sm text-txt-secondary leading-relaxed mb-5 whitespace-pre-line">
          {mission.description}
        </p>
      )}

      {/* Due date */}
      {mission.due_at && (
        <p className={`text-xs mb-5 ${isPast ? 'text-error' : 'text-txt-muted'}`}>
          마감 {new Date(mission.due_at).toLocaleString('ko-KR')}
        </p>
      )}

      {/* Submit button */}
      {mission.google_form_url && (
        isPast ? (
          <button
            disabled
            data-testid="mission-submit-link"
            className="flex items-center justify-center w-full py-3 bg-brand text-brand-fg text-sm font-semibold rounded-xl opacity-40 cursor-not-allowed mb-6"
          >
            미션 제출하기 (마감)
          </button>
        ) : (
          <CohortStartGate
            started={cohortStarted}
            startedAt={cohortStartedAt}
            href={mission.google_form_url}
            external
            dataTestId="mission-submit-link"
            className="flex items-center justify-center w-full py-3 bg-brand text-brand-fg text-sm font-semibold rounded-xl hover:bg-brand-hover transition-colors mb-6"
          >
            미션 제출하기
          </CohortStartGate>
        )
      )}

      {/* Submission stats */}
      {students.length > 0 && (
        <div className="border-t border-bdr pt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-txt-primary">그룹 {group} 제출 현황</span>
            <span className="text-sm text-txt-muted">
              {submitted.length}/{students.length}명 ({pct}%)
            </span>
          </div>
          <div className="w-full bg-page rounded-full h-2 mb-5">
            <div
              className="bg-brand h-2 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="space-y-4">
            {submitted.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-success-fg mb-2">
                  제출 완료 ({submitted.length}명)
                </p>
                <div className="flex flex-wrap gap-2">
                  {submitted.map(s => (
                    <span
                      key={s.id}
                      className="text-xs px-2.5 py-1 bg-success-subtle border border-success-border text-success-fg rounded-full"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {notSubmitted.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-txt-muted mb-2">
                  미제출 ({notSubmitted.length}명)
                </p>
                <div className="flex flex-wrap gap-2">
                  {notSubmitted.map(s => (
                    <span
                      key={s.id}
                      className="text-xs px-2.5 py-1 bg-page border border-bdr text-txt-muted rounded-full"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
