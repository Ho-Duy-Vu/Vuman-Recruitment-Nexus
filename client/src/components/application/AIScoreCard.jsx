const getColor = (score) => {
  if (score >= 70) return '#22c55e'
  if (score >= 40) return '#eab308'
  return '#ef4444'
}

const ScoreRing = ({ score, color }) => {
  const r = 38
  const circumference = 2 * Math.PI * r
  const offset = circumference - (score / 100) * circumference

  return (
    <svg width={96} height={96} viewBox="0 0 96 96">
      <circle cx={48} cy={48} r={r} fill="none" stroke="#e2e8f0" strokeWidth={10} />
      <circle
        cx={48}
        cy={48}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={10}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 48 48)"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      <text x={48} y={53} textAnchor="middle" fontSize={20} fontWeight={700} fill={color}>
        {score}
      </text>
    </svg>
  )
}

const Chip = ({ label, color, bg }) => (
  <span
    style={{
      display: 'inline-block',
      background: bg,
      color,
      borderRadius: 99,
      padding: '2px 10px',
      fontSize: 12,
      fontWeight: 600,
      margin: '2px 3px'
    }}
  >
    {label}
  </span>
)

export const AIScoreCard = ({ aiEvaluation, aiStatus }) => {
  if (aiStatus === 'manual_review') {
    return (
      <div
        style={{
          padding: '14px 16px',
          background: '#fefce8',
          border: '1px solid #fde047',
          borderRadius: 10,
          color: '#713f12',
          fontSize: 14
        }}
      >
        ⚠️ CV cần xem xét thủ công — AI không đọc được nội dung
      </div>
    )
  }

  if (aiStatus === 'ai_failed') {
    return (
      <div
        style={{
          padding: '14px 16px',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 10,
          color: '#7f1d1d',
          fontSize: 14
        }}
      >
        ❌ AI xử lý thất bại — Vui lòng xem xét thủ công
      </div>
    )
  }

  if (!aiEvaluation) {
    return (
      <div style={{ padding: '14px 16px', color: '#94a3b8', fontSize: 14 }}>
        Chưa có kết quả phân tích AI
      </div>
    )
  }

  const { matchingScore, matchedSkills = [], missingSkills = [], aiSummary } = aiEvaluation
  const color = getColor(matchingScore)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
        <ScoreRing score={matchingScore} color={color} />
        <div>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 2 }}>Điểm phù hợp</div>
          <div style={{ fontSize: 22, fontWeight: 700, color }}>{matchingScore}/100</div>
        </div>
      </div>

      {matchedSkills.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
            Kỹ năng phù hợp
          </div>
          <div>
            {matchedSkills.map((s) => (
              <Chip key={s} label={s} color="#166534" bg="#dcfce7" />
            ))}
          </div>
        </div>
      )}

      {missingSkills.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
            Kỹ năng còn thiếu
          </div>
          <div>
            {missingSkills.map((s) => (
              <Chip key={s} label={s} color="#991b1b" bg="#fee2e2" />
            ))}
          </div>
        </div>
      )}

      {aiSummary && (
        <div style={{ marginTop: 12, padding: '10px 14px', background: '#f8fafc', borderRadius: 8, fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
          <div style={{ fontWeight: 600, marginBottom: 4, color: '#1e293b' }}>Nhận xét của AI</div>
          {aiSummary}
        </div>
      )}
    </div>
  )
}
