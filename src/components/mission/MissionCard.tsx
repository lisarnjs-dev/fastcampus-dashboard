import { Mission } from '@/types/database'

interface Props {
  mission: Mission
  submissionCount: number
  totalStudents: number
}

export function MissionCard({ mission, submissionCount, totalStudents }: Props) {
  const pct = totalStudents > 0 ? Math.round((submissionCount / totalStudents) * 100) : 0
  const isPast = mission.due_at ? new Date(mission.due_at) < new Date() : false

  return (
    <div
      className="bg-white border border-neutral-200 rounded-lg p-4 space-y-3"
      data-testid={`mission-card-${mission.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-neutral-400 font-medium">Week {mission.week}</p>
          <h3 className="font-semibold text-neutral-900">{mission.title}</h3>
          {mission.description && (
            <p className="text-sm text-neutral-600 mt-1 whitespace-pre-line">{mission.description}</p>
          )}
        </div>
        {mission.google_form_url && (
          <a
            href={mission.google_form_url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-3 py-1.5 bg-neutral-900 text-white text-sm rounded-lg hover:bg-neutral-700 transition-colors"
          >
            제출하기
          </a>
        )}
      </div>

      {mission.due_at && (
        <p className={`text-xs ${isPast ? 'text-red-500' : 'text-neutral-500'}`}>
          마감: {new Date(mission.due_at).toLocaleString('ko-KR')}
          {isPast ? ' (마감됨)' : ''}
        </p>
      )}

      {totalStudents > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-neutral-500">
            <span>제출 현황</span>
            <span>{submissionCount}/{totalStudents}명 ({pct}%)</span>
          </div>
          <div className="w-full bg-neutral-100 rounded-full h-1.5">
            <div
              className="bg-green-500 h-1.5 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
