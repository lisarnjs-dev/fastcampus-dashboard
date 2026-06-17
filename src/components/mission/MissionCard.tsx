import { Mission } from '@/types/database'
import { CohortStartGate } from '@/components/ui/CohortStartGate'

interface Props {
  mission: Mission
  submissionCount: number
  totalStudents: number
  cohortStarted: boolean
  cohortStartedAt: string | null
}

export function MissionCard({ mission, submissionCount, totalStudents, cohortStarted, cohortStartedAt }: Props) {
  const pct = totalStudents > 0 ? Math.round((submissionCount / totalStudents) * 100) : 0
  const isPast = mission.due_at ? new Date(mission.due_at) < new Date() : false

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 p-5"
      data-testid={`mission-card-${mission.id}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-violet-100 text-violet-700 text-xs font-medium">
              Week {mission.week}
            </span>
            {isPast && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-red-50 text-red-500 text-xs font-medium">
                마감됨
              </span>
            )}
          </div>
          <h3 className="font-semibold text-gray-900">{mission.title}</h3>
          {mission.description && (
            <p className="text-sm text-gray-500 mt-1.5 whitespace-pre-line leading-relaxed">{mission.description}</p>
          )}
          {mission.due_at && (
            <p className={`text-xs mt-2 ${isPast ? 'text-red-400' : 'text-gray-400'}`}>
              마감 {new Date(mission.due_at).toLocaleString('ko-KR')}
            </p>
          )}
        </div>
        {mission.google_form_url && (
          isPast ? (
            <button
              disabled
              data-testid={`mission-submit-${mission.id}`}
              className="shrink-0 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-xl opacity-40 cursor-not-allowed"
            >
              마감됨
            </button>
          ) : (
            <CohortStartGate
              started={cohortStarted}
              startedAt={cohortStartedAt}
              href={mission.google_form_url}
              external
              dataTestId={`mission-submit-${mission.id}`}
              className="shrink-0 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-xl hover:bg-violet-700 transition-colors"
            >
              제출하기
            </CohortStartGate>
          )
        )}
      </div>

      {totalStudents > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>제출 현황</span>
            <span>{submissionCount}/{totalStudents}명 ({pct}%)</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="bg-violet-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
