export default function FilePreviewList({ files, onRemove }: {
  files: File[]
  onRemove: (index: number) => void
}) {
  if (files.length === 0) return null

  return (
    <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      {files.map((file, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', background: '#f5f5f3', borderRadius: '4px', fontSize: '0.75rem' }}>
          <span>{file.name}</span>
          <button onClick={() => onRemove(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6B6B', fontSize: '1rem', lineHeight: 1 }}>×</button>
        </div>
      ))}
    </div>
  )
}
