import type { Mission, Student } from '@/types/database'

interface Props {
  students: Student[]
  missions: Mission[]
  submissions: { mission_id: string; student_id: string }[]
}

export function MissionSubmissionGrid({ students, missions, submissions }: Props) {
  if (missions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <p className="text-sm text-gray-400">등록된 미션이 없습니다.</p>
      </div>
    )
  }

  const submissionSet = new Set(submissions.map(s => `${s.mission_id}|${s.student_id}`))

  return (
    <div className="overflow-x-auto" data-testid="mission-submission-grid">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="text-left text-xs font-medium text-gray-500 pb-2 pr-4 whitespace-nowrap">이름</th>
            {missions.map(m => (
              <th
                key={m.id}
                title={m.title}
                className="text-center text-xs font-medium text-gray-500 pb-2 px-2 whitespace-nowrap"
              >
                W{m.week}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map(student => (
            <tr key={student.id} className="border-t border-gray-100">
              <td className="py-2 pr-4 text-xs text-gray-700 font-medium whitespace-nowrap">
                {student.name}
              </td>
              {missions.map(m => {
                const submitted = submissionSet.has(`${m.id}|${student.id}`)
                return (
                  <td key={m.id} className="py-2 px-2 text-center">
                    <span
                      className={[
                        'inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-medium',
                        submitted
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-600'
                          : 'text-gray-300',
                      ].join(' ')}
                      data-testid={`submission-cell-${student.id}-${m.id}`}
                    >
                      {submitted ? '✓' : '–'}
                    </span>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
