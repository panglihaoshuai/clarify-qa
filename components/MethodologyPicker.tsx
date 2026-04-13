const METHODOLOGIES = [
  { id: 'brainstorming', label: '通用分析' },
  { id: 'musk', label: '马斯克' },
  { id: 'jobs', label: '乔布斯' },
  { id: 'paul-graham', label: 'Paul Graham' },
  { id: 'munger', label: '芒格' },
]

export { METHODOLOGIES }

export default function MethodologyPicker({ selected, onChange }: {
  selected: string
  onChange: (id: string) => void
}) {
  return (
    <div>
      <p style={{ fontSize: '0.875rem', color: '#6B6B6B', marginBottom: '0.5rem' }}>选择分析框架：</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {METHODOLOGIES.map((m) => (
          <button key={m.id} onClick={() => onChange(m.id)}
            style={{
              padding: '0.375rem 0.875rem',
              borderRadius: '9999px',
              border: selected === m.id ? '1.5px solid #2563EB' : '1px solid #E5E5E0',
              background: selected === m.id ? '#EFF6FF' : '#fff',
              color: selected === m.id ? '#2563EB' : '#1A1A1A',
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}>
            {m.label}
          </button>
        ))}
      </div>
    </div>
  )
}
